import { CheckCircle2, Download } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { aiLevels, getAiLevel, getNextAiLevel } from '../lib/aiLevels';
import {
  getLocalizedAiLevel,
  getLocalizedNextAiLevel,
  getLocalizedProfileGuide,
  getLocalizedProfileSentence,
  humanizeLocalizedBarriers,
  humanizeLocalizedExpectations,
  LanguageSwitcher,
  profileLabel,
  t,
  useLanguage,
} from '../lib/i18n.jsx';
import {
  humanizeBarriers,
  humanizeExpectations,
} from '../lib/resultInsights';

export default function ResultPage() {
  const location = useLocation();
  const { language } = useLanguage();
  const stored = localStorage.getItem('ai-for-psi-submitted-result');
  const result = location.state ?? (stored ? JSON.parse(stored) : null);
  const profileType = result?.profileType ?? 'Наблюдатель';
  const guide = getLocalizedProfileGuide(language, profileType, result?.answers);
  const aiLevelBase = getAiLevel(result?.score ?? 0, result?.answers);
  const nextAiLevelBase = getNextAiLevel(aiLevelBase);
  const aiLevel = getLocalizedAiLevel(language, aiLevelBase);
  const nextAiLevel = getLocalizedNextAiLevel(language, nextAiLevelBase);
  const personalBarriers = (result?.barriers ?? result?.answers?.q11 ?? []).filter(
    (item) => !item.includes('Уже активно использую AI') && !item.includes('Другое'),
  );
  const personalExpectations = result?.expectations ?? result?.answers?.q12 ?? [];
  const readableBarriers = humanizeLocalizedBarriers(language, personalBarriers) ?? humanizeBarriers(personalBarriers);
  const readableExpectations =
    humanizeLocalizedExpectations(language, personalExpectations) ?? humanizeExpectations(personalExpectations);
  const personalProfileSentence = getLocalizedProfileSentence(language, profileType, result?.answers);

  function savePdf() {
    window.print();
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-4xl items-start px-3 py-4 sm:items-center sm:px-5 sm:py-8">
      <div className="w-full rounded-2xl border border-creamLine bg-white/94 p-4 shadow-soft ring-1 ring-white/70 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-teal text-white">
            <CheckCircle2 size={30} />
          </div>
          <LanguageSwitcher />
        </div>
        <div className="mt-6 rounded-lg border border-teal/20 bg-teal/5 p-4 text-base leading-relaxed">
          {t(language, 'thanks')}
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm">
          {t(language, 'yourProfile')}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
          {profileLabel(language, profileType)}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
          {guide.summary}
        </p>
        <p className="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-4 text-base font-medium leading-relaxed text-ink">
          {personalProfileSentence}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ResultCard title={t(language, 'whatGood')} text={guide.strength} />
          <ResultCard title={t(language, 'tryNext')} text={guide.nextStep} />
        </div>

        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {t(language, 'currentLevel')}
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {t(language, 'level')} {aiLevel.id}. {aiLevel.title}
          </h2>
          <AiLevelSpiral currentLevel={aiLevel.id} language={language} />
          <p className="mt-3 leading-relaxed text-muted">{aiLevel.description}</p>
          <div className="mt-4 rounded-lg bg-white p-4">
            <h3 className="font-bold text-ink">
              {t(language, 'nextLevel')} {nextAiLevel.id}. {nextAiLevel.title}
            </h3>
            <p className="mt-2 leading-relaxed text-muted">{aiLevel.nextStep}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PersonalList
            title={t(language, 'personalBarriers')}
            emptyText={t(language, 'noBarriers')}
            items={readableBarriers}
          />
          <PersonalList
            title={t(language, 'personalExpectations')}
            emptyText={t(language, 'noExpectations')}
            items={readableExpectations}
          />
        </div>

        <div className="print:hidden mt-7 flex flex-col gap-3 sm:flex-row">
          <Button className="w-full sm:w-auto" onClick={savePdf}>
            <Download size={18} /> {t(language, 'savePdf')}
          </Button>
          <Button className="w-full sm:w-auto" variant="secondary">
            <Link to="/">{t(language, 'toStart')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function AiLevelSpiral({ currentLevel, language }) {
  const visualLevelsRu = [
    {
      id: 7,
      title: 'Команда AI-агентов',
      example: 'AI-агенты работают параллельно',
      color: '#8b5cf6',
    },
    {
      id: 6,
      title: 'Свои решения и продукты',
      example: 'Сервисы, генераторы тестов, боты',
      color: '#db4f9a',
    },
    {
      id: 5,
      title: 'Автоматизация рутины',
      example: 'Процессы, формы, уведомления',
      color: '#f2854d',
    },
    {
      id: 4,
      title: 'Набор инструментов',
      example: 'Анализ, материалы, презентации',
      color: '#f0b92f',
    },
    {
      id: 3,
      title: 'AI помнит контекст',
      example: 'Проекты, GPTs, инструкции, база знаний',
      color: '#54b98f',
    },
    {
      id: 2,
      title: 'Умение спрашивать',
      example: 'Правильные вопросы, лучшие ответы',
      color: '#329bd1',
    },
    {
      id: 1,
      title: 'Поиск ответов',
      example: 'Разовые запросы, быстрые ответы',
      color: '#3b63ad',
    },
  ];
  const visualLevelsRo = [
    {
      id: 7,
      title: 'Echipa de agenti AI',
      example: 'Agenti AI lucreaza in paralel',
      color: '#8b5cf6',
    },
    {
      id: 6,
      title: 'Solutii si produse proprii',
      example: 'Servicii, generatoare de teste, boti',
      color: '#db4f9a',
    },
    {
      id: 5,
      title: 'Automatizarea rutinei',
      example: 'Procese, formulare, notificari',
      color: '#f2854d',
    },
    {
      id: 4,
      title: 'Set de instrumente',
      example: 'Analiza, materiale, prezentari',
      color: '#f0b92f',
    },
    {
      id: 3,
      title: 'AI tine minte contextul',
      example: 'Proiecte, GPTs, instructiuni, baza de cunostinte',
      color: '#54b98f',
    },
    {
      id: 2,
      title: 'Abilitatea de a intreba',
      example: 'Intrebari mai bune, raspunsuri mai precise',
      color: '#329bd1',
    },
    {
      id: 1,
      title: 'Cautare de raspunsuri',
      example: 'Cerere ocazionala, raspuns rapid',
      color: '#3b63ad',
    },
  ];
  const visualLevels = language === 'ro' ? visualLevelsRo : visualLevelsRu;

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-primary/10 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-2xl font-extrabold tracking-normal text-ink sm:text-3xl">
          7 уровней <span className="text-violet">AI</span>
        </h3>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t(language, 'examples')}</p>
      </div>

      <div className="relative mt-5">
        <svg
          className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[66%] overflow-visible opacity-80 sm:block"
          viewBox="0 0 560 560"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {visualLevels.map((level, index) => {
            const y = 44 + index * 78;
            const sweep = 88 + index * 6;
            return (
              <path
                key={level.id}
                d={`M ${30 + index * 7} ${y + 34} C ${130 + sweep} ${y - 32}, ${300 - sweep / 2} ${y + 84}, 500 ${y + 22}`}
                fill="none"
                stroke={level.color}
                strokeLinecap="round"
                strokeWidth={level.id === currentLevel ? 9 : 6}
                opacity={level.id === currentLevel ? 0.95 : 0.62}
              />
            );
          })}
        </svg>

        <div className="relative grid gap-3">
          {visualLevels.map((level) => {
            const isCurrent = level.id === currentLevel;
            const levelMeta = getLocalizedAiLevel(language, aiLevels[level.id - 1]);

            return (
              <div
                key={level.id}
                className={`grid gap-3 rounded-xl border p-3 transition sm:grid-cols-[1fr_0.95fr] sm:items-center sm:p-4 ${
                  isCurrent
                    ? 'border-primary bg-primary/5 shadow-soft ring-2 ring-primary/15'
                    : 'border-line bg-white/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white shadow-sm"
                    style={{ backgroundColor: level.color }}
                  >
                    {level.id}
                  </div>
                  <div>
                    <div className="text-base font-extrabold uppercase leading-tight text-ink">
                      {level.title}
                    </div>
                    <div className="mt-1 text-sm leading-snug text-muted">{levelMeta.title}</div>
                  </div>
                </div>

                <div
                  className="rounded-lg border bg-white px-4 py-3 text-sm leading-snug text-ink"
                  style={{ borderColor: `${level.color}55` }}
                >
                  {isCurrent ? (
                    <span className="font-bold text-primary">{t(language, 'yourLevel')}</span>
                  ) : null}
                  {level.example}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        {t(language, 'levelsNote')}
      </p>
    </div>
  );
}

function PersonalList({ title, items, emptyText }) {
  return (
    <div className="rounded-lg border border-primary/15 bg-primary/5 p-4 sm:p-5">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {items.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-primary/20 bg-white px-3 py-2 text-sm leading-snug text-ink"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 leading-relaxed text-muted">{emptyText}</p>
      )}
    </div>
  );
}

function ResultCard({ title, text, compact = false }) {
  return (
    <div className={`rounded-lg border border-line bg-wash ${compact ? 'p-4' : 'p-4 sm:p-5'}`}>
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <p className="mt-2 leading-relaxed text-muted">{text}</p>
    </div>
  );
}
