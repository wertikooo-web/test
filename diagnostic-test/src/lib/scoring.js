import { NO_AI_TOOLS, NO_WORK_USE, profileOrder } from './questions.js';

const singleScoreQuestions = new Set(['q3', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10']);

export function calculateScore(answers) {
  let score = 0;

  for (const [questionId, value] of Object.entries(answers)) {
    if (singleScoreQuestions.has(questionId)) {
      score += questionId === 'q10' ? Math.min(Number(value ?? 0), 4) : Number(value ?? 0);
    }
  }

  const q1 = answers.q1 ?? [];
  if (!q1.includes(NO_AI_TOOLS)) {
    score += Math.min(q1.length, 8);
  }

  const q2 = answers.q2 ?? [];
  score += Math.min(q2.length * 0.5, 8);

  const q4 = answers.q4 ?? [];
  if (!q4.includes(NO_WORK_USE)) {
    score += Math.min(q4.length, 10);
  }

  return Math.round(score);
}

export function getProfileType(score) {
  if (score <= 8) return 'Скептик';
  if (score <= 18) return 'Наблюдатель';
  if (score <= 31) return 'Экспериментатор';
  if (score <= 43) return 'Практик';
  return 'Интегратор';
}

export function buildProfileDistribution(responses) {
  return profileOrder.map((profile) => ({
    profile,
    count: responses.filter((item) => item.profile_type === profile).length,
  }));
}

export function mostCommonProfile(responses) {
  if (!responses.length) return 'Пока нет данных';
  const distribution = buildProfileDistribution(responses);
  return distribution.reduce((best, item) => (item.count > best.count ? item : best)).profile;
}

export function topSelections(responses, field, limit = 7, { exclude = [] } = {}) {
  const counts = new Map();
  for (const response of responses) {
    for (const value of response[field] ?? []) {
      if (exclude.some((excluded) => value.includes(excluded))) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ru'))
    .slice(0, limit);
}
