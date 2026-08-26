#!/usr/bin/env bash
# Prepares the target server to serve the landing page over HTTPS.
# Piped into `bash -s` over SSH by .github/workflows/deploy.yml on every deploy,
# so it must stay idempotent.
#
# Certbot is used in `certonly` mode on purpose: it issues certificates and
# nothing else. The nginx config below is the single source of truth for how the
# site is served — letting `certbot --nginx` edit it would mean the next deploy
# overwrites that edit and drops the site back to plain HTTP.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/landing}"
SERVER_NAME="${SERVER_NAME:-kononenko.duckdns.org}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

ACME_ROOT=/var/www/certbot
CONF=/etc/nginx/sites-available/landing
LIVE_DIR="/etc/letsencrypt/live/${SERVER_NAME}"

if ! command -v apt-get >/dev/null 2>&1; then
    echo "provision: expected a Debian/Ubuntu server, apt-get not found" >&2
    exit 1
fi

export DEBIAN_FRONTEND=noninteractive

install_missing() {
    local pkg
    local missing=()
    for pkg in "$@"; do
        if ! dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q 'install ok installed'; then
            missing+=("$pkg")
        fi
    done
    if [ "${#missing[@]}" -gt 0 ]; then
        echo "provision: installing ${missing[*]}"
        apt-get update -qq
        apt-get install -y -qq "${missing[@]}"
    else
        echo "provision: packages already present"
    fi
}

install_missing nginx certbot python3-certbot-nginx

mkdir -p "$DEPLOY_PATH" "$ACME_ROOT/.well-known/acme-challenge"

# nginx 1.25.1 replaced the `http2` listen parameter with its own directive.
nginx_version=$(nginx -v 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo '0.0.0')
if printf '%s\n%s\n' '1.25.1' "$nginx_version" | sort -V -C; then
    http2_line='    http2 on;'
    listen_http2=''
else
    http2_line=''
    listen_http2=' http2'
fi
echo "provision: nginx ${nginx_version}"

# Certbot's recommended TLS settings ship with python3-certbot-nginx. Treat them
# as optional so a missing file can never break `nginx -t`.
tls_include_lines() {
    [ -f /etc/letsencrypt/options-ssl-nginx.conf ] &&
        printf '    include /etc/letsencrypt/options-ssl-nginx.conf;\n'
    [ -f /etc/letsencrypt/ssl-dhparams.pem ] &&
        printf '    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;\n'
    return 0
}

# $1: "http" while no certificate exists yet, "https" once one does.
render_conf() {
    local tls_includes
    tls_includes=$(tls_include_lines)

    if [ "$1" = http ]; then
        cat > "$CONF" <<CONF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${SERVER_NAME};

    location /.well-known/acme-challenge/ {
        root ${ACME_ROOT};
    }

    root ${DEPLOY_PATH};
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
CONF
    else
        cat > "$CONF" <<CONF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${SERVER_NAME};

    # Renewals are served over port 80, so this must stay ahead of the redirect.
    location /.well-known/acme-challenge/ {
        root ${ACME_ROOT};
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl${listen_http2} default_server;
    listen [::]:443 ssl${listen_http2} default_server;
${http2_line}
    server_name ${SERVER_NAME};

    ssl_certificate     ${LIVE_DIR}/fullchain.pem;
    ssl_certificate_key ${LIVE_DIR}/privkey.pem;
${tls_includes}
    root ${DEPLOY_PATH};
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
CONF
    fi
}

ln -sf "$CONF" /etc/nginx/sites-enabled/landing
# Ships enabled on Debian/Ubuntu and also claims default_server, which would
# make `nginx -t` fail on a duplicate.
rm -f /etc/nginx/sites-enabled/default

# Start from plain HTTP: the http-01 challenge is answered on port 80, and
# pointing at a certificate that does not exist yet would fail `nginx -t`.
render_conf http
nginx -t
systemctl enable nginx >/dev/null 2>&1 || true
systemctl restart nginx

if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q 'Status: active'; then
    echo "provision: ufw is active, allowing Nginx Full"
    ufw allow 'Nginx Full' >/dev/null 2>&1 || true
fi

if [ -f "${LIVE_DIR}/fullchain.pem" ]; then
    echo "provision: certificate already present for ${SERVER_NAME}"
else
    echo "provision: requesting a certificate for ${SERVER_NAME}"
    email_args=(--register-unsafely-without-email)
    if [ -n "$CERTBOT_EMAIL" ]; then
        email_args=(--email "$CERTBOT_EMAIL")
    fi
    # A failure here must leave the site up on HTTP rather than take it down;
    # the workflow's verify step is what reports the missing HTTPS.
    certbot certonly --webroot -w "$ACME_ROOT" -d "$SERVER_NAME" \
        --non-interactive --agree-tos --keep-until-expiring "${email_args[@]}" ||
        echo "provision: certbot failed, staying on HTTP" >&2
fi

if [ -f "${LIVE_DIR}/fullchain.pem" ]; then
    # certbot may have just dropped in the recommended TLS options, so the
    # config is rendered again only now that they are on disk.
    render_conf https
    nginx -t
    systemctl reload nginx

    # certbot's systemd timer renews unattended, but nginx keeps serving the
    # old certificate from memory until something reloads it.
    mkdir -p /etc/letsencrypt/renewal-hooks/deploy
    cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'HOOK'
#!/bin/sh
systemctl reload nginx
HOOK
    chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

    echo "provision: nginx serves https://${SERVER_NAME} from ${DEPLOY_PATH}"
else
    echo "provision: nginx serves http://${SERVER_NAME} from ${DEPLOY_PATH} (no certificate)"
fi
