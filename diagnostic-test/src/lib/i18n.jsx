import { createContext, useContext, useMemo, useState } from 'react';
import { aiLevels } from './aiLevels';
import { buildPersonalizedProfileGuide, buildProfilePersonalSentence } from './resultInsights';

const STORAGE_KEY = 'ai-for-psi-language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'ru');

  function setLanguage(nextLanguage) {
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  }

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}

export function t(language, key) {
  return ui[language]?.[key] ?? ui.ru[key] ?? key;
}

export function translateQuestion(language, text) {
  if (language !== 'ro') return text;
  return roQuestions[text] ?? text;
}

export function translateOption(language, text) {
  if (language !== 'ro') return text;
  return roOptions[text] ?? text;
}

export function profileLabel(language, profile) {
  if (language !== 'ro') return profile;
  return roProfiles[profile] ?? profile;
}

export function getLocalizedProfileGuide(language, profileType, answers) {
  if (language !== 'ro') return buildPersonalizedProfileGuide(profileType, answers);
  return buildRomanianProfileGuide(profileType, answers);
}

export function getLocalizedProfileSentence(language, profileType, answers) {
  if (language !== 'ro') return buildProfilePersonalSentence(profileType, answers);
  return buildRomanianProfileSentence(profileType, answers);
}

export function getLocalizedAiLevel(language, level) {
  if (language !== 'ro') return level;
  return roAiLevels[level.id - 1] ?? level;
}

export function getLocalizedNextAiLevel(language, level) {
  if (language !== 'ro') return level;
  return roAiLevels[level.id - 1] ?? level;
}

export function humanizeLocalizedBarriers(language, items = []) {
  if (language !== 'ro') return null;
  return items.map((item) => roBarrierLabels[item] ?? translateOption(language, item));
}

export function humanizeLocalizedExpectations(language, items = []) {
  if (language !== 'ro') return null;
  return items.map((item) => roExpectationLabels[item] ?? translateOption(language, item));
}

export function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex rounded-full border border-creamLine bg-white/80 p-1 ${className}`}>
      {[
        ['ru', 'RU'],
        ['ro', 'RO'],
      ].map(([code, label]) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            language === code ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const ui = {
  ru: {
    startTitle: 'AI и моя профессиональная практика',
    startSubtitle: 'Тест для психологов, логопедов, дефектологов и педагогов.',
    startLead: 'Ответьте на 12 вопросов и получите свой AI-профиль',
    startButton: 'Начать тест',
    question: 'Вопрос',
    of: 'из',
    chooseOne: 'Выберите один вариант.',
    chooseSeveral: 'Можно выбрать несколько вариантов.',
    chooseAtLeastOne: 'Выберите хотя бы один вариант.',
    selectedCount: 'Можно выбрать до {max}: выбрано {count}',
    maxChoicesError: 'Можно выбрать не больше {max} вариантов.',
    back: 'Назад',
    next: 'Далее',
    send: 'Отправить',
    sending: 'Отправка...',
    alreadySentTitle: 'Ответ уже отправлен',
    alreadySentText: 'Повторная отправка с этой страницы не создаст дубль в общем результате.',
    goToResult: 'Перейти к результату',
    restart: 'Пройти заново для проверки',
    submitError: 'Не удалось отправить ответ. Проверьте настройки Supabase.',
    thanks:
      'Спасибо за участие! Ваш ответ добавлен в общий срез аудитории и будет учитываться на экране ведущего в общей диаграмме.',
    yourProfile: 'Ваш AI-профиль',
    whatGood: 'Что у вас уже хорошо',
    tryNext: 'Что попробовать дальше',
    currentLevel: 'Ваш текущий уровень использования AI',
    level: 'Уровень',
    nextLevel: 'Следующий шаг: уровень',
    personalBarriers: 'Что вам сейчас больше всего мешает',
    noBarriers: 'Вы не отметили отдельные барьеры.',
    personalExpectations: 'Что вы хотите забрать с этой встречи',
    noExpectations: 'Вы не отметили отдельные ожидания.',
    savePdf: 'Сохранить PDF',
    toStart: 'На стартовую страницу',
    examples: 'Примеры',
    yourLevel: 'Ваш уровень: ',
    levelsNote:
      'Ваш уровень подсвечен отдельно. Эта шкала показывает путь от разовых запросов к собственной AI-системе, но двигаться по ней лучше постепенно: каждый следующий шаг опирается на предыдущий.',
  },
  ro: {
    startTitle: 'AI si practica mea profesionala',
    startSubtitle: 'Test pentru psihologi, logopezi, psihopedagogi si cadre didactice.',
    startLead: 'Raspundeti la 12 intrebari si primiti profilul dvs. AI',
    startButton: 'Incepe testul',
    question: 'Intrebarea',
    of: 'din',
    chooseOne: 'Alegeti un singur raspuns.',
    chooseSeveral: 'Puteti alege mai multe raspunsuri.',
    chooseAtLeastOne: 'Alegeti cel putin un raspuns.',
    selectedCount: 'Puteti alege pana la {max}: selectate {count}',
    maxChoicesError: 'Puteti alege cel mult {max} variante.',
    back: 'Inapoi',
    next: 'Mai departe',
    send: 'Trimite',
    sending: 'Se trimite...',
    alreadySentTitle: 'Raspunsul a fost deja trimis',
    alreadySentText: 'Trimiterea repetata de pe aceasta pagina nu va crea un duplicat in rezultatul comun.',
    goToResult: 'Mergi la rezultat',
    restart: 'Refa testul pentru verificare',
    submitError: 'Nu s-a putut trimite raspunsul. Verificati setarile Supabase.',
    thanks:
      'Va multumim pentru participare! Raspunsul dvs. a fost adaugat in imaginea de ansamblu a grupului si va fi luat in calcul pe ecranul moderatorului.',
    yourProfile: 'Profilul dvs. AI',
    whatGood: 'Ce va reuseste deja',
    tryNext: 'Ce puteti incerca mai departe',
    currentLevel: 'Nivelul dvs. actual de utilizare AI',
    level: 'Nivelul',
    nextLevel: 'Pasul urmator: nivelul',
    personalBarriers: 'Ce va incurca cel mai mult acum',
    noBarriers: 'Nu ati bifat bariere separate.',
    personalExpectations: 'Ce vreti sa luati cu dvs. dupa aceasta intalnire',
    noExpectations: 'Nu ati bifat asteptari separate.',
    savePdf: 'Salveaza PDF',
    toStart: 'La pagina de start',
    examples: 'Exemple',
    yourLevel: 'Nivelul dvs.: ',
    levelsNote:
      'Nivelul dvs. este evidentiat separat. Scala arata drumul de la intrebari ocazionale la un sistem AI propriu, dar e mai bine sa avansati treptat: fiecare pas se sprijina pe cel anterior.',
  },
};

const roProfiles = {
  Скептик: 'Sceptic',
  Наблюдатель: 'Observator',
  Экспериментатор: 'Experimentator',
  Практик: 'Practic',
  Интегратор: 'Integrator',
};

const roQuestions = {
  'Какими типами AI-инструментов вы пользовались за последние 30 дней?':
    'Ce tipuri de instrumente AI ati folosit in ultimele 30 de zile?',
  'Какие AI-сервисы вы знаете или использовали?': 'Ce servicii AI cunoasteti sau ati folosit?',
  'Какое утверждение лучше всего описывает вас?': 'Care afirmatie va descrie cel mai bine?',
  'Для каких профессиональных задач вы уже использовали AI?':
    'Pentru ce sarcini profesionale ati folosit deja AI?',
  'Что вы обычно делаете после получения ответа AI?': 'Ce faceti de obicei dupa ce primiti un raspuns de la AI?',
  'Сколько времени AI реально экономит вам в неделю?': 'Cat timp va economiseste AI intr-o saptamana?',
  'Вам нужно подготовить характеристику ребёнка. Что вы сделаете?':
    'Trebuie sa pregatiti o caracterizare a copilului. Ce veti face?',
  'Вы нашли новую интересную методику для работы. Документ занимает около 70 страниц. Что вы сделаете?':
    'Ati gasit o metodica noua si interesanta. Documentul are aproximativ 70 de pagini. Ce veti face?',
  'Через час нужно провести занятие по эмоциям для детей 5-6 лет. Что вы сделаете?':
    'Peste o ora trebuie sa tineti o activitate despre emotii pentru copii de 5-6 ani. Ce veti face?',
  'Какой вариант лучше всего описывает ваш текущий способ работы с AI?':
    'Care varianta descrie cel mai bine modul dvs. actual de lucru cu AI?',
  'Что сегодня больше всего мешает вам использовать AI в работе?':
    'Ce va impiedica cel mai mult acum sa folositi AI in munca?',
  'Что вы больше всего хотели бы получить после сегодняшней встречи?':
    'Ce ati vrea cel mai mult sa obtineti dupa intalnirea de astazi?',
};

const roOptions = {
  'Текстовые AI (ChatGPT, Claude, Gemini и др.)': 'AI pentru texte (ChatGPT, Claude, Gemini etc.)',
  'AI-поиск и исследования': 'Cautare si cercetare cu AI',
  'Анализ документов и книг': 'Analiza documentelor si cartilor',
  'Создание визуальных материалов и презентаций': 'Crearea materialelor vizuale si a prezentarilor',
  'Создание аудио или видео': 'Crearea de audio sau video',
  'Персональные AI-помощники (GPTs)': 'Asistenti AI personali (GPTs)',
  'Не пользовался(ась)': 'Nu am folosit',
  'Инструменты для изображений, аудио или видео': 'Instrumente pentru imagini, audio sau video',
  Другое: 'Altceva',
  'Никогда не использую AI в работе': 'Nu folosesc niciodata AI in munca',
  'Иногда экспериментирую': 'Experimentez uneori',
  'Использую для отдельных задач': 'Folosesc pentru sarcini separate',
  'Использую регулярно': 'Folosesc regulat',
  'AI стал частью моих рабочих процессов': 'AI a devenit parte din felul meu de lucru',
  'Поиск информации': 'Cautare de informatii',
  'Подготовка занятий': 'Pregatirea activitatilor',
  'Характеристики и заключения': 'Caracterizari si concluzii',
  'Рекомендации клиентам (родителям)': 'Recomandari pentru clienti (parinti)',
  'Создание упражнений': 'Crearea exercitiilor',
  'Карточки и раздаточные материалы': 'Fise si materiale de lucru',
  'Анализ статей и книг': 'Analiza articolelor si cartilor',
  'Создание презентаций': 'Crearea prezentarilor',
  'Создание изображений': 'Crearea imaginilor',
  'Планирование мероприятий': 'Planificarea evenimentelor',
  'Не использовал(а) в работе': 'Nu am folosit in munca',
  'Просто читаю ответ': 'Doar citesc raspunsul',
  'Копирую результат': 'Copiez rezultatul',
  'Немного редактирую': 'Editez putin',
  'Использую как черновик': 'Folosesc drept ciorna',
  'Веду диалог и постепенно улучшаю результат': 'Continui dialogul si imbunatatesc treptat rezultatul',
  Нисколько: 'Deloc',
  'До 30 минут': 'Pana la 30 de minute',
  '30-60 минут': '30-60 de minute',
  '1-3 часа': '1-3 ore',
  'Более 3 часов': 'Mai mult de 3 ore',
  'Напишу полностью самостоятельно': 'Voi scrie complet singur(a)',
  'Возьму старый шаблон и адаптирую': 'Voi lua un sablon vechi si il voi adapta',
  'Попрошу AI написать черновик': 'Voi cere AI sa scrie o ciorna',
  'Передам AI свои наблюдения и попрошу оформить текст':
    'Voi da AI observatiile mele si il voi ruga sa formuleze textul',
  'Использую свою систему: шаблон + наблюдения + AI':
    'Voi folosi propriul sistem: sablon + observatii + AI',
  'Буду читать полностью': 'Voi citi tot documentul',
  'Просмотрю выборочно наиболее важные разделы': 'Voi parcurge selectiv sectiunile importante',
  'Поищу отзывы коллег': 'Voi cauta opiniile colegilor',
  'Попрошу AI сделать краткий конспект': 'Voi cere AI un rezumat scurt',
  'Попрошу AI оценить методику с точки зрения практического применения, преимуществ, ограничений и возможностей использования в моей работе':
    'Voi cere AI sa evalueze metodica din perspectiva aplicarii practice, avantajelor, limitarilor si folosirii in munca mea',
  'Использую старые материалы': 'Voi folosi materiale vechi',
  'Найду идеи в интернете': 'Voi cauta idei pe internet',
  'Попрошу AI предложить упражнения': 'Voi cere AI sa propuna exercitii',
  'Попрошу AI составить занятие': 'Voi cere AI sa construiasca activitatea',
  'Попрошу AI адаптировать занятие под конкретную группу детей и цель занятия':
    'Voi cere AI sa adapteze activitatea pentru un grup concret de copii si pentru scopul activitatii',
  'Задаю разовые вопросы, когда нужно быстро что-то узнать':
    'Pun intrebari ocazionale cand trebuie sa aflu rapid ceva',
  'Стараюсь подробнее описывать задачу, контекст и формат ответа':
    'Incerc sa descriu mai clar sarcina, contextul si formatul raspunsului',
  'Использую сохранённые промпты или шаблоны для повторяющихся задач':
    'Folosesc prompturi salvate sau sabloane pentru sarcini repetate',
  'Использую проекты, GPTs или постоянные инструкции под свою работу':
    'Folosesc proiecte, GPTs sau instructiuni permanente pentru munca mea',
  'Подбираю разные AI-инструменты под разные задачи':
    'Aleg instrumente AI diferite pentru sarcini diferite',
  'Настраиваю цепочки, где часть работы выполняется автоматически':
    'Configurez lanturi in care o parte din munca se face automat',
  'Создаю собственные AI-инструменты, помощников или продукты':
    'Creez propriile instrumente AI, asistenti sau produse',
  'Не знаю, с чего начать': 'Nu stiu de unde sa incep',
  'Не хватает времени разобраться': 'Nu am timp sa ma lamuresc',
  'Не понимаю, как применять AI в своей профессии': 'Nu inteleg cum sa aplic AI in profesia mea',
  'Не доверяю качеству ответов или боюсь ошибок': 'Nu am incredere in calitatea raspunsurilor sau ma tem de greseli',
  'Есть вопросы конфиденциальности данных': 'Am intrebari legate de confidentialitatea datelor',
  'Сложно формулировать запросы': 'Imi este greu sa formulez cereri',
  'Не хватает реальных примеров': 'Imi lipsesc exemple reale',
  'Уже активно использую AI': 'Folosesc deja activ AI',
  'Понять возможности современных AI': 'Sa inteleg posibilitatile AI moderne',
  'Научиться правильно ставить задачи и писать запросы':
    'Sa invat sa formulez corect sarcini si cereri',
  'Экономить время на документах и отчётах': 'Sa economisesc timp la documente si rapoarte',
  'Быстрее готовить занятия, упражнения и материалы':
    'Sa pregatesc mai repede activitati, exercitii si materiale',
  'Использовать AI в работе с клиентами': 'Sa folosesc AI in lucrul cu clientii',
  'Анализировать книги, статьи и методики': 'Sa analizez carti, articole si metodici',
  'Создать собственного AI-помощника (GPT)': 'Sa creez propriul asistent AI (GPT)',
  'Лучше понимать риски и ограничения AI': 'Sa inteleg mai bine riscurile si limitele AI',
};

const roAiLevels = aiLevels.map((level) => {
  const data = {
    1: ['AI ca motor de cautare', 'Cautare', 'AI este folosit mai ales pentru intrebari rapide si raspunsuri punctuale. Urmatorul pas este sa oferiti mai mult context.', 'Adaugati la o cerere simpla trei lucruri: cine sunteti, pentru ce va trebuie raspunsul si cum arata un rezultat bun.'],
    2: ['Prompting constient', 'Prompting', 'Incepeti sa vedeti ca raspunsul depinde mult de felul in care formulati intrebarea.', 'Inainte de raspuns, cereti AI sa va puna 3-5 intrebari de clarificare.'],
    3: ['AI tine minte contextul', 'Context', 'Nu porniti fiecare discutie de la zero: rolul, publicul, stilul si materialele devin parte din context.', 'Creati un context de lucru: rol, public, sarcini frecvente, ton si formatul raspunsului.'],
    4: ['Ecosistem de instrumente', 'Ecosistem', 'Apare intelegerea ca un singur chat nu trebuie sa rezolve totul. Alegeti instrumente diferite pentru sarcini diferite.', 'Alegeti un instrument pentru o sarcina concreta: analiza, prezentari, materiale vizuale sau documente.'],
    5: ['Automatizare partiala', 'Automatizare', 'Treceti de la “cum fac mai repede” la “cum reduc rutina repetitiva”.', 'Alegeti un proces repetitiv si descrieti-l pas cu pas, de la informatie la ciorna finala.'],
    6: ['Solutii si produse proprii', 'Sisteme', 'AI ajuta deja la proiectarea unor instrumente, asistenti, teste, servicii sau sisteme de lucru.', 'Transformati un scenariu util intr-un instrument separat, GPT sau mini-produs.'],
    7: ['Echipa de agenti AI', 'Autonom', 'Mai multe instrumente si agenti AI pot lucra impreuna: colecteaza date, pregatesc ciorne si ajuta la procese repetate.', 'Nu sariti direct aici: consolidati mai intai intrebarile bune, contextul, instrumentele si automatizarile simple.'],
  }[level.id];

  return { ...level, title: data[0], shortTitle: data[1], description: data[2], nextStep: data[3] };
});

const roBarrierLabels = {
  'Не хватает времени разобраться': 'Aveti nevoie sa intelegeti rapid, fara prea multa teorie.',
  'Сложно формулировать запросы': 'V-ar ajuta sabloane simple de cereri, cu care sa puteti incepe usor.',
  'Не доверяю качеству ответов или боюсь ошибок':
    'Este important sa invatati cum sa verificati raspunsurile AI si sa reduceti riscul de erori.',
  'Есть вопросы конфиденциальности данных':
    'Aveti nevoie de reguli clare pentru lucrul sigur cu datele copiilor, clientilor si familiilor.',
  'Не знаю, с чего начать': 'Aveti nevoie de un prim pas clar, fara supraincarcare.',
  'Не понимаю, как применять AI в своей профессии':
    'Aveti nevoie de exemple din practica dvs. profesionala, nu de explicatii abstracte.',
  'Не хватает реальных примеров': 'V-ar ajuta mai multe exemple vii, aplicate in situatii reale.',
};

const roExpectationLabels = {
  'Понять возможности современных AI': 'Sa vedeti clar ce poate face AI si unde poate fi util in practica.',
  'Научиться правильно ставить задачи и писать запросы':
    'Sa formulati cereri mai clare, ca raspunsurile sa fie mai precise si mai utile.',
  'Экономить время на документах и отчётах':
    'Sa gasiti moduri prin care documentele, caracterizarile si rapoartele sa se pregateasca mai rapid.',
  'Быстрее готовить занятия, упражнения и материалы':
    'Sa pregatiti mai repede activitati, exercitii si materiale practice.',
  'Использовать AI в работе с клиентами':
    'Sa faceti explicatiile pentru clienti mai clare, calme si structurate.',
  'Анализировать книги, статьи и методики':
    'Sa analizati mai repede materiale mari si sa extrageti din ele idei utile pentru practica.',
  'Создать собственного AI-помощника (GPT)':
    'Sa intelegeti cum ar putea arata un asistent AI personal pentru sarcini repetitive.',
  'Лучше понимать риски и ограничения AI':
    'Sa intelegeti calm riscurile, limitele si regulile de lucru sigur.',
};

function buildRomanianProfileGuide(profileType, answers = {}) {
  const focus = detectRomanianFocus(answers);
  const barrier = detectRomanianBarrier(answers);

  const base = {
    Скептик: {
      summary:
        'Se pare ca deocamdata priviti AI cu prudenta si nu va grabiti sa il introduceti in munca. Este o pozitie fireasca: in profesia dvs. conteaza siguranta, sensul profesional si verificarea atenta.',
      strength:
        'Punctul dvs. puternic este prudenta profesionala. Nu luati instrumentele noi pe incredere, iar acest lucru este foarte valoros cand lucrati cu copii, clienti si familii.',
      nextStep: barrier
        ? `Incepeti cu o incercare mica, legata de intrebarea care va preocupa: ${barrier}. Alegeti o sarcina fara date personale si comparati ce propune AI cu ce ati pastra sau ati corecta.`
        : 'Alegeti o sarcina foarte mica, fara date personale: 5 idei pentru un exercitiu, un plan scurt de activitate sau variante de formulare pentru client.',
    },
    Наблюдатель: {
      summary:
        'Sunteti deja aproape de AI: poate ati incercat unele servicii, dar ele nu au devenit inca un instrument obisnuit de lucru.',
      strength: focus
        ? `Aveti deja un punct bun de intrare: ${focus}. E mai usor sa invatati AI pe o sarcina cunoscuta decat “in general”.`
        : 'Aveti interes si deschidere pentru a incerca. Acum conteaza mai mult claritatea primului pas decat numarul de servicii.',
      nextStep: focus
        ? `Luati o sarcina din zona “${focus}” si parcurgeti-o cu AI: descrieti situatia, cereti o ciorna, apoi cereti sa fie facuta mai clara si mai umana.`
        : 'Alegeti o sarcina frecventa si incercati sa o faceti cu AI de doua ori. Asa apare nu doar curiozitate, ci un mod de lucru.',
    },
    Экспериментатор: {
      summary:
        'Deja incercati AI in practica. Uneori va ajuta bine, alteori raspunsul este prea general sau trebuie serios refacut. Este o etapa normala de experimentare.',
      strength: focus
        ? `Sunteti gata sa verificati AI pe sarcini reale, mai ales in zona: ${focus}.`
        : 'Sunteti gata sa testati AI in practica, nu doar sa ascultati despre el in teorie.',
      nextStep: barrier
        ? `Urmatorul pas este sa nu incercati totul la intamplare. Luati un exemplu de lucru si imbunatatiti-l, tinand cont de bariera dvs.: ${barrier}.`
        : 'Alegeti un scenariu care v-a iesit deja si repetati-l de cateva ori. Asa veti vedea ce formulari dau stabil o ciorna buna.',
    },
    Практик: {
      summary:
        'AI este deja un ajutor real in munca dvs. Probabil il folositi pentru texte, idei, materiale sau pregatire.',
      strength: focus
        ? `AI este deja legat de sarcini reale din practica dvs. Cel mai clar se vede in zona: ${focus}.`
        : 'AI nu mai este doar o curiozitate pentru dvs., ci un ajutor pentru ciorne, idei si materiale.',
      nextStep: focus
        ? `Alegeti o sarcina reala din zona “${focus}”. Dati AI cateva notite scurte si cereti o prima ciorna. Apoi editati-o cu privirea dvs. profesionala.`
        : 'Alegeti o sarcina pe care o faceti des: o caracterizare, un plan de activitate sau o explicatie pentru parinti. Cereti AI o ciorna si editati-o ca specialist.',
    },
    Интегратор: {
      summary:
        'Se pare ca AI este deja integrat in felul dvs. de lucru. Ganditi nu doar in intrebari separate, ci in scenarii si instrumente.',
      strength:
        'Priviti AI sistemic: nu doar ca pe un chat cu raspunsuri, ci ca pe o parte a organizarii muncii.',
      nextStep: focus
        ? `Incercati sa construiti un scenariu stabil in jurul zonei “${focus}”: ce dati de obicei AI, ce ciorna asteptati si cum verificati rezultatul.`
        : 'Alegeti un proces repetitiv si faceti pentru el un asistent AI separat sau un sablon stabil, ca sa nu explicati totul de la zero de fiecare data.',
    },
  };

  return base[profileType] ?? base.Наблюдатель;
}

function buildRomanianProfileSentence(profileType, answers = {}) {
  const focus = detectRomanianFocus(answers);
  const barrier = detectRomanianBarrier(answers);

  if (profileType === 'Скептик') {
    return barrier
      ? `Din raspunsuri se vede ca abordati AI cu prudenta si vreti mai intai sa clarificati: ${barrier}.`
      : 'Din raspunsuri se vede ca aveti nevoie de exemple simple, sigure si apropiate de practica dvs.';
  }

  if (profileType === 'Наблюдатель') {
    return focus
      ? `Interesul pentru AI exista deja, iar prima zona logica de incercare este: ${focus}.`
      : 'Interesul pentru AI exista deja, dar aveti nevoie de o trecere calma spre folosirea regulata.';
  }

  if (profileType === 'Экспериментатор') {
    return focus
      ? `Raspunsurile dvs. arata ca deja testati AI in practica si puteti construi un mod de lucru in jurul zonei: ${focus}.`
      : 'Raspunsurile dvs. arata ca deja testati AI, dar deocamdata mai mult prin experimente separate.';
  }

  if (profileType === 'Практик') {
    return focus
      ? `Aveti deja contact real cu AI si cautati folos practic intr-o zona concreta: ${focus}.`
      : 'Aveti deja contact real cu AI; urmatorul pas este sa transformati intrebarile separate in scenarii de lucru mai stabile.';
  }

  return focus
    ? `Raspunsurile arata ca ganditi deja in scenarii de lucru, mai ales in zona: ${focus}.`
    : 'Raspunsurile arata ca ganditi deja in scenarii de lucru, nu doar in intrebari separate.';
}

function detectRomanianFocus(answers = {}) {
  const all = [...(answers.q4 ?? []), ...(answers.q12 ?? [])].join(' ').toLowerCase();
  if (all.includes('документ') || all.includes('отчёт') || all.includes('характеристик')) {
    return 'documente, caracterizari si rapoarte';
  }
  if (all.includes('занят') || all.includes('упражнен') || all.includes('материал')) {
    return 'pregatirea activitatilor, exercitiilor si materialelor';
  }
  if (all.includes('клиент') || all.includes('родител') || all.includes('рекомендац')) {
    return 'comunicarea clara cu clientii si parintii';
  }
  if (all.includes('книг') || all.includes('стат') || all.includes('методик')) {
    return 'analiza cartilor, articolelor si metodicilor';
  }
  if (all.includes('презентац') || all.includes('визуаль') || all.includes('изображен')) {
    return 'materiale vizuale si prezentari';
  }
  if (all.includes('gpt') || all.includes('помощник')) return 'crearea unui asistent AI propriu';
  return '';
}

function detectRomanianBarrier(answers = {}) {
  const all = (answers.q11 ?? []).join(' ').toLowerCase();
  if (all.includes('времени')) return 'nu aveti timp sa va lamuriti';
  if (all.includes('конфиденциаль')) return 'confidentialitatea datelor este importanta';
  if (all.includes('качеств') || all.includes('ошиб')) return 'vreti sa stiti cum sa verificati raspunsurile';
  if (all.includes('запрос')) return 'este greu sa formulati cereri';
  if (all.includes('пример')) return 'aveti nevoie de exemple reale din practica';
  if (all.includes('начать')) return 'nu este clar de unde sa incepeti';
  return '';
}
