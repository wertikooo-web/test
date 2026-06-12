export const aiLevels = [
  {
    id: 1,
    title: 'AI как поисковик',
    shortTitle: 'Поисковик',
    description:
      'AI пока используется как быстрый способ спросить что-то один раз и получить ответ. Это стартовая ступень: главное сейчас - научиться давать больше контекста.',
    nextStep:
      'Попробуйте к любому запросу добавить три вещи: кто вы, зачем вам этот ответ и как должен выглядеть хороший результат.',
  },
  {
    id: 2,
    title: 'Осознанный промптинг',
    shortTitle: 'Промптинг',
    description:
      'Вы уже начинаете понимать: качество ответа зависит от качества вопроса. Сейчас главный рост - не в новых сервисах, а в умении ясно ставить задачу.',
    nextStep:
      'Перед ответом попросите AI задать вам 3-5 уточняющих вопросов. Это быстро делает результат точнее.',
  },
  {
    id: 3,
    title: 'AI помнит контекст',
    shortTitle: 'Контекст',
    description:
      'На этом уровне вы уже не начинаете каждый диалог с нуля. AI знает вашу роль, задачи, аудиторию, стиль работы и может опираться на заранее заданные инструкции или материалы.',
    nextStep:
      'Соберите один рабочий контекст: ваша роль, аудитория, частые задачи, требования к тону и формату ответа.',
  },
  {
    id: 4,
    title: 'Экосистема инструментов',
    shortTitle: 'Экосистема',
    description:
      'Появляется понимание, что один чат не обязан решать всё. Для документов, презентаций, визуалов, встреч и анализа больших материалов могут быть разные AI-инструменты.',
    nextStep:
      'Выберите один инструмент под конкретную задачу: NotebookLM для материалов, Gamma для презентаций, Canva AI для визуалов.',
  },
  {
    id: 5,
    title: 'Частичная автоматизация',
    shortTitle: 'Автоматизация',
    description:
      'Фокус смещается с “сделать быстрее” на “сделать так, чтобы часть процесса выполнялась почти без ручной рутины”.',
    nextStep:
      'Найдите один повторяемый процесс и опишите цепочку: от входных данных до готового черновика или материала.',
  },
  {
    id: 6,
    title: 'Свои решения и продукты',
    shortTitle: 'Системы',
    description:
      'AI помогает уже не только с отдельными задачами, а с проектированием своих решений: сервисов, генераторов тестов, ботов, помощников и рабочих систем.',
    nextStep:
      'Выберите один полезный сценарий и превратите его в отдельный инструмент, GPT или мини-продукт.',
  },
  {
    id: 7,
    title: 'Команда AI-агентов',
    shortTitle: 'Автономно',
    description:
      'Это уровень, где разные AI-агенты и инструменты работают вместе: собирают данные, готовят черновики, помогают с материалами, аналитикой и повторяемыми процессами.',
    nextStep:
      'Не пытайтесь прыгнуть сюда сразу. Сначала закрепите предыдущие уровни: хорошие запросы, контекст, инструменты и простые автоматизации.',
  },
];

export function getAiLevel(score = 0, answers = null) {
  if (!answers) return aiLevels[levelFromScore(score) - 1];

  const signals = [
    { value: levelFromScore(score), weight: 2 },
    { value: levelFromSelfAssessment(answers), weight: 2.5 },
    { value: levelFromWorkStyle(answers), weight: 2 },
    { value: levelFromTools(answers), weight: 1.5 },
    { value: levelFromTasks(answers), weight: 1.5 },
  ].filter((signal) => Number.isFinite(signal.value));

  const weightedSum = signals.reduce((sum, signal) => sum + signal.value * signal.weight, 0);
  const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const level = Math.round(weightedSum / totalWeight);

  return aiLevels[clamp(level, 1, 7) - 1];
}

function levelFromScore(score) {
  if (score <= 8) return 1;
  if (score <= 16) return 2;
  if (score <= 25) return 3;
  if (score <= 33) return 4;
  if (score <= 41) return 5;
  if (score <= 48) return 6;
  return 7;
}

function levelFromSelfAssessment(answers) {
  if (!Number.isInteger(answers.q10)) return Number.NaN;
  return clamp(answers.q10 + 1, 1, 7);
}

function levelFromWorkStyle(answers) {
  const values = [answers.q3, answers.q5, answers.q7, answers.q8, answers.q9].filter(Number.isInteger);
  if (!values.length) return Number.NaN;

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return clamp(1 + average * 0.85, 1, 5);
}

function levelFromTools(answers) {
  const knownTools = answers.q2 ?? [];
  if (!knownTools.length) return 1;

  let level = 1 + Math.min(knownTools.length / 2, 4);
  const advancedTools = knownTools.filter((tool) =>
    ['NotebookLM', 'Gamma', 'Canva AI', 'GPTs'].some((marker) => tool.includes(marker)) ||
    tool.includes('Инструменты'),
  );

  if (advancedTools.length >= 2) level += 0.5;
  return clamp(level, 1, 5);
}

function levelFromTasks(answers) {
  const tasks = answers.q4 ?? [];
  if (!tasks.length || tasks.some((task) => task.includes('Не использовал'))) return 1;
  if (tasks.length <= 2) return 2;
  if (tasks.length <= 5) return 3;
  if (tasks.length <= 8) return 4;
  return 5;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getNextAiLevel(level) {
  return aiLevels.find((item) => item.id === Math.min(level.id + 1, 7)) ?? level;
}

export function mostCommonAiLevel(responses = []) {
  if (!responses.length) return null;
  const counts = new Map();
  for (const response of responses) {
    const levelFromAnswers = getAiLevel(response.score, response.answers);
    counts.set(levelFromAnswers.id, (counts.get(levelFromAnswers.id) ?? 0) + 1);
  }
  const [levelId] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
  return aiLevels.find((level) => level.id === levelId) ?? aiLevels[0];
}
