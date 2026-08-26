#!/usr/bin/env bash
# Prepares the target server to serve the landing page over HTTP.
# Piped into `bash -s` over SSH by .github/workflows/deploy.yml on every deploy,
# so it must stay idempotent.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/landing}"
SERVER_NAME="${SERVER_NAME:-kononenko.duckdns.org}"

if ! command -v apt-get >/dev/null 2>&1; then
    echo "provision: expected a Debian/Ubuntu server, apt-get not found" >&2
    exit 1
fi

export DEBIAN_FRONTEND=noninteractive

if ! command -v nginx >/dev/null 2>&1; then
    echo "provision: nginx not installed, installing"
    apt-get update -qq
    apt-get install -y -qq nginx
else
    echo "provision: nginx already installed"
fi

mkdir -p "$DEPLOY_PATH"

# Unquoted heredoc: SERVER_NAME/DEPLOY_PATH expand here, nginx's own $uri does not.
cat > /etc/nginx/sites-available/landing <<CONF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name ${SERVER_NAME};
    root ${DEPLOY_PATH};
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
CONF

ln -sf /etc/nginx/sites-available/landing /etc/nginx/sites-enabled/landing
# Ships enabled on Debian/Ubuntu and also claims default_server, which would
# make `nginx -t` fail on a duplicate.
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx >/dev/null 2>&1 || true
systemctl restart nginx

echo "provision: nginx serves ${SERVER_NAME} from ${DEPLOY_PATH}"
