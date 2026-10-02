/**
 * Every word and photo the landing page shows lives here.
 *
 * The copy is the owner's final text, transferred verbatim — do not reword,
 * shorten or add to it. Components under src/components/ only decide layout.
 *
 * Where the original sets a bold lead-in inside a sentence ("**Title** — rest"),
 * it is stored as { strong, rest } with `rest` keeping its own leading
 * separator, so rendering `<strong>{strong}</strong>{rest}` reproduces the
 * original sentence character for character.
 */

import type { ImageMetadata } from 'astro';

import heroPhoto from '../assets/hero.jpg';
import coachingPhoto from '../assets/coaching.jpg';
import aboutPhoto from '../assets/about.jpg';
import contactPhoto from '../assets/contact.jpg';

export interface Emphasized {
  strong: string;
  /** Includes its own leading separator (" — " or " "). */
  rest: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Job {
  company: string;
  period: string;
  role: string;
  text: string;
}

export interface EducationItem {
  /** Institution and year, set in the serif. */
  title: string;
  text: string;
}

export interface EducationGroup {
  /** Small caps group label ("Высшее", "Дополнительное"). */
  title: string;
  items: EducationItem[];
}

export interface ContactLink {
  label: string;
  value: string;
  href: string;
}

const telegramUrl = 'https://t.me/kononenko_curtis';

export const site = {
  name: 'Кирилл Кононенко',
  telegramUrl,

  seo: {
    title: 'Кирилл Кононенко — консалтинг для онлайн-школ и коучинг для руководителей',
    description:
      '15+ лет в образовании. Помогаю онлайн-школам и образовательным проектам расти и выходить в прибыль. Коучинг для предпринимателей и руководителей по стандартам ICF.',
  },

  photos: {
    hero: heroPhoto,
    coaching: coachingPhoto,
    about: aboutPhoto,
    contact: contactPhoto,
  } satisfies Record<string, ImageMetadata>,

  hero: {
    eyebrow: 'Консалтинг для образовательных проектов · Коучинг для руководителей',
    title: 'Кирилл Кононенко',
    lead: '15+ лет в образовании — офлайн-центры, онлайн-школы, B2B и работа с государством. Помогаю образовательным проектам расти и зарабатывать, а их руководителям — выдерживать этот рост.',
    primaryCta: 'Записаться на знакомство',
    // Scrolls to the consulting section rather than opening Telegram.
    moreCta: 'Узнать подробнее ↓',
  },

  stats: {
    title: 'Цифры',
    // Short values only; the meaning lives in the label (owner's revision).
    items: [
      { value: '15+', label: 'лет в образовании' },
      { value: '1,5 года', label: 'чтобы вывести Лектариум из убытка в прибыль' },
      // Non-breaking space keeps "к 2025-му" from splitting across lines.
      { value: '×2', label: 'выручка Лектариума в 2026 году к\u00a02025-му' },
      { value: '10 → 200', label: 'человек в команде направления, которое мы запускали в Тетрике' },
      { value: 'Сотни млн ₽', label: 'годовой выручки B2B/B2G-направления Фоксфорда' },
    ] satisfies Stat[],
  },

  consulting: {
    label: 'Консалтинг',
    title: 'Для основателей и руководителей онлайн-школ и образовательных проектов',
    intro:
      'Я не консультант со стороны — я управляю онлайн-школой прямо сейчас. Смотрю на ваш бизнес глазами того, кто сам принимает эти решения и отвечает за результат.',
    listTitle: 'С чем работаю:',
    items: [
      {
        strong: 'Юнит-экономика и ценообразование',
        rest: ' — тарифы, форматы, цены, точки, где школа теряет деньги.',
      },
      {
        strong: 'Маркетинг и продажи',
        rest: ' — каналы привлечения, воронки, работа отдела продаж, CAC.',
      },
      {
        strong: 'B2B и B2G',
        rest: ' — продажи госучреждениям, тендеры, работа с министерствами и муниципалитетами.',
      },
      {
        strong: 'Команда и управление',
        rest: ' — структура, KPI, найм, пересборка команды под новые задачи.',
      },
      {
        strong: 'Антикризис',
        rest: ' — когда школа работает в минус и нужно понять, что менять первым.',
      },
    ] satisfies Emphasized[],
    format: {
      strong: 'Формат:',
      rest: ' от одной стратегической встречи до нескольких сессий или сопровождения.',
    } satisfies Emphasized,
  },

  coaching: {
    label: 'Коучинг',
    title: 'Коучинг для предпринимателей и руководителей',
    intro:
      'Иногда вопрос не в стратегии, а в самом руководителе: где взять время, как отпустить контроль, как договориться с партнёром. Коучинг — это пространство, где вы находите свои ответы, а я помогаю задать правильные вопросы.',
    listTitle: 'С чем приходят:',
    items: [
      'как масштабировать бизнес и не утонуть в операционке;',
      'как делегировать и перестать делать всё самому;',
      'как выстроить отношения с партнёром по бизнесу и командой;',
      'как успевать больше — и при этом высыпаться;',
      'как провести сложный разговор — на работе или дома.',
    ],
    format: {
      strong: 'Формат:',
      rest: ' сессия 60 минут, онлайн или очно в Москве. Работаю по стандартам ICF.',
    } satisfies Emphasized,
  },

  // These four sections have no heading beyond their name, so the name is shown
  // as the small caps label alone (owner's revision), not repeated as an h2.
  experience: {
    label: 'Опыт',
    items: [
      {
        company: 'Лектариум (VK)',
        period: 'с 2025',
        role: 'Директор',
        text: 'После M&A-сделки взял школу под управление. Пересобрали юнит-экономику, оздоровили продукт, протестировали новые тарифы, форматы и цены, поменяли маркетинговые каналы и воронки продаж, пересобрали команду и сервисы. Итог: из убытка в прибыль, выручка ×2.',
      },
      {
        company: 'Тетрика (VK)',
        period: '2023–2025',
        role: 'Руководитель регионального развития и HR-маркетинга',
        text: 'Запустили с нуля канал привлечения учеников через государственные школы и работу с органами власти. За 2 года он стал одним из крупнейших платных каналов и эффективным по экономике. Команда выросла с 10 до 200 человек.',
      },
      {
        company: 'Фоксфорд',
        period: '2020–2023',
        role: 'Руководитель офлайн-маркетинга, B2B и B2G',
        text: 'Вырастил выручку B2B/B2G-направления до сотен миллионов рублей в год.',
      },
      {
        company: 'Юниум',
        period: '2016–2019',
        role: 'Директор по рекламе и маркетингу',
        text: 'Федеральная сеть образовательных центров.',
      },
    ] satisfies Job[],
  },

  about: {
    label: 'О себе',
    paragraphs: [
      'Больше пятнадцати лет я работаю в образовании: начинал в офлайн-сети образовательных центров, потом строил направления в крупнейших онлайн-школах, теперь управляю одной из них. Прошёл весь путь руками — маркетинг, продажи, работа с государством, финансы, команды от десяти до двухсот человек. По первому образованию — инженер: до сих пор начинаю с цифр.',
      'В коучинг пришёл из управления. За годы руководства через меня прошли сотни разговоров с сотрудниками, коллегами и партнёрами — и люди раз за разом говорили, что со мной легко найти общий язык и что мне можно доверять. Я решил сделать это профессией: прошёл обучение по международным стандартам и теперь помогаю руководителям разбираться не только с цифрами, но и с собой.',
    ],
  },

  start: {
    label: 'Как начать',
    steps: [
      {
        strong: 'Знакомство — 20 минут, без оплаты.',
        rest: ' Сверяем запрос и понимаем, подходим ли друг другу. Ни к чему не обязывает.',
      },
      {
        strong: 'Выбираем формат',
        rest: ' — одна встреча, несколько или сопровождение.',
      },
      {
        strong: 'Работаем',
        rest: ' — консалтинг над цифрами и процессами, коучинг над вашими задачами как руководителя.',
      },
    ] satisfies Emphasized[],
  },

  education: {
    label: 'Образование',
    // Order within each group is the owner's, not chronological — keep it.
    groups: [
      {
        title: 'Высшее',
        items: [
          {
            title: 'Санкт-Петербургский политехнический университет, 2012',
            text: 'Инженер, специальность «Гидротехническое строительство».',
          },
        ],
      },
      {
        title: 'Дополнительное',
        items: [
          {
            title: 'МГИМО МИД России, 2021',
            text: 'Повышение квалификации «GR и лоббистская деятельность в бизнесе и НКО».',
          },
          {
            title: 'Нетология, 2018',
            text: 'Профессиональная переподготовка «Директор по онлайн-маркетингу», 268 академических часов.',
          },
          {
            title: 'Академия профессионального коучинга 5 Prism, 2023–2024',
            text: 'Программа International Level Coaching, Level 1 (аккредитована ICF). Повышение квалификации «Коучинг международного уровня», 110 часов.',
          },
        ],
      },
    ] satisfies EducationGroup[],
  },

  contacts: {
    label: 'Контакты',
    title: 'Давайте познакомимся',
    text: 'Напишите пару строк о своём запросе — отвечу и предложу время для знакомства.',
    // Originally the hero's second button; kept here when the hero's changed.
    cta: 'Написать в Telegram',
    links: [
      { label: 'Telegram', value: '@kononenko_curtis', href: telegramUrl },
      { label: 'Почта', value: 'ks.kononenko@gmail.com', href: 'mailto:ks.kononenko@gmail.com' },
    ] satisfies ContactLink[],
  },

  footer: '© 2026 Кирилл Кононенко',
};
