/**
 * Every word the landing page says lives here.
 *
 * This is the file to edit when the content changes — the components under
 * src/components/ only decide how these values are laid out. Anything still
 * marked TODO is placeholder text written without knowing the real details.
 */

export interface Link {
  label: string;
  href: string;
  /** Shown next to the label on the contact card. */
  note?: string;
}

export interface Project {
  name: string;
  description: string;
  /** Short technology labels rendered as chips. */
  stack: string[];
  href?: string;
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface SiteContent {
  /** Used in <title>, the header and structured data. */
  name: string;
  role: string;
  /** One or two sentences under the name. Keep it short. */
  tagline: string;
  /** Meta description; falls back to the tagline when empty. */
  description: string;
  location: string;
  about: string[];
  skills: SkillGroup[];
  projects: Project[];
  links: Link[];
}

export const site: SiteContent = {
  // TODO: real name
  name: 'Кононенко',
  // TODO: real title
  role: 'Backend & frontend разработчик',
  tagline:
    // TODO: replace with a real pitch — what you build and who for.
    'Проектирую и собираю веб-сервисы целиком: от схемы базы и API до интерфейса, который этим API пользуется.',
  description: '',
  // TODO
  location: '',

  about: [
    // TODO: rewrite in your own words. Two or three short paragraphs read best.
    'Здесь короткий рассказ о себе: чем занимаешься, какие задачи любишь, какой опыт за плечами. Два-три абзаца — этого достаточно, длинные полотна на лендинге не читают.',
    'Второй абзац можно отдать под то, что отличает тебя от других: специализация, отрасль, подход к работе.',
  ],

  skills: [
    // TODO: prune to what you actually want to advertise.
    { title: 'Backend', items: ['Python', 'Node.js', 'PostgreSQL', 'Redis', 'REST', 'gRPC'] },
    { title: 'Frontend', items: ['TypeScript', 'React', 'Astro', 'CSS'] },
    { title: 'Инфраструктура', items: ['Linux', 'Docker', 'nginx', 'CI/CD', 'GitHub Actions'] },
  ],

  projects: [
    // TODO: replace with real work. Three to six entries is the sweet spot.
    {
      name: 'Название проекта',
      description:
        'Одно-два предложения: какую задачу проект решает и какая была твоя роль. Конкретика убедительнее прилагательных.',
      stack: ['TypeScript', 'PostgreSQL'],
    },
    {
      name: 'Ещё один проект',
      description:
        'Если есть публичная ссылка — добавь href, и карточка станет кликабельной.',
      stack: ['Python', 'Docker'],
    },
    {
      name: 'Этот сайт',
      description:
        'Статика на Astro, деплой через GitHub Actions на собственный VDS: rsync в web root, nginx и сертификат Let’s Encrypt выписываются автоматически.',
      stack: ['Astro', 'nginx', 'GitHub Actions'],
      href: 'https://github.com/kononenko-curtis/landing',
    },
  ],

  links: [
    { label: 'GitHub', href: 'https://github.com/kononenko-curtis' },
    // TODO: put your real address here, then uncomment.
    // { label: 'Email', href: 'mailto:you@example.com' },
    // { label: 'Telegram', href: 'https://t.me/username' },
  ],
};
