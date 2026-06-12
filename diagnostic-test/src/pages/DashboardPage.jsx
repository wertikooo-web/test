import { Download } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { mostCommonAiLevel } from '../lib/aiLevels';
import { downloadCsv, responsesToCsv } from '../lib/csv';
import {
  buildProfileDistribution,
  mostCommonProfile,
  topSelections,
} from '../lib/scoring';
import { fetchResponses } from '../lib/storage';

const shortProfileLabels = {
  Скептик: 'Скептик',
  Наблюдатель: 'Наблюдатель',
  Экспериментатор: 'Экспериментатор',
  Практик: 'Практик',
  Интегратор: 'Интегратор',
};

export default function DashboardPage() {
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadResponses = useCallback(async () => {
    try {
      const data = await fetchResponses();
      setResponses(data);
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Не удалось загрузить ответы.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResponses();
    const timer = window.setInterval(loadResponses, 2500);
    return () => window.clearInterval(timer);
  }, [loadResponses]);

  const profileData = useMemo(() => buildProfileDistribution(responses), [responses]);
  const barrierData = useMemo(
    () => topSelections(responses, 'barriers', 4, { exclude: ['Уже активно использую AI', 'Другое'] }),
    [responses],
  );
  const expectationData = useMemo(() => topSelections(responses, 'expectations', 4), [responses]);
  const commonProfile = useMemo(() => mostCommonProfile(responses), [responses]);
  const commonAiLevel = useMemo(() => mostCommonAiLevel(responses), [responses]);
  const maxProfileCount = Math.max(...profileData.map((item) => item.count), 1);
  const maxBarrierCount = Math.max(...barrierData.map((item) => item.count), 1);
  const maxExpectationCount = Math.max(...expectationData.map((item) => item.count), 1);

  function exportCsv() {
    downloadCsv('ai-for-psi-responses.csv', responsesToCsv(responses));
  }

  return (
    <section className="mx-auto min-h-screen max-w-3xl px-5 py-8 sm:px-8">
      <header>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Live-дашборд</h1>
        <p className="mt-1 text-base text-muted">AI и моя профессиональная практика</p>
      </header>

      {error ? (
        <div className="mt-5 rounded-lg border border-rose/30 bg-rose/5 p-4 text-rose">
          {error}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Всего ответов" value={responses.length} />
        <MetricCard label="Частый профиль" value={commonProfile} large />
        <AiLevelMetricCard level={commonAiLevel} />
      </div>

      <section className="mt-7">
        <h2 className="text-base font-semibold">Распределение по типам</h2>
        <div className="mt-5 flex h-32 items-end justify-between gap-3 sm:gap-4">
          {profileData.map((item) => (
            <div key={item.profile} className="flex h-full flex-1 flex-col items-center justify-end">
              <div className="mb-2 text-sm font-bold">{item.count}</div>
              <div
                className="w-full rounded-t-md bg-[#d5e4f6]"
                style={{ height: `${Math.max((item.count / maxProfileCount) * 92, item.count ? 18 : 6)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-5 gap-2 text-center text-[11px] leading-tight text-muted sm:text-xs">
          {profileData.map((item) => (
            <div key={item.profile}>{shortProfileLabels[item.profile]}</div>
          ))}
        </div>
      </section>

      <HorizontalList
        className="mt-8"
        title="Главные барьеры (топ-4)"
        data={barrierData}
        maxCount={maxBarrierCount}
      />

      <HorizontalList
        className="mt-7"
        title="Главные ожидания (топ-4)"
        data={expectationData}
        maxCount={maxExpectationCount}
      />

      <div className="mt-7 flex flex-wrap justify-center gap-2 print:hidden">
        <NavButton to="/test">Тест</NavButton>
        <NavButton to="/result">Результат</NavButton>
        <NavButton to="/dashboard" active>
          Дашборд
        </NavButton>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2 print:hidden">
        <Button variant="secondary" className="min-h-10 px-4 py-2" onClick={exportCsv} disabled={!responses.length}>
          <Download size={16} /> CSV
        </Button>
      </div>
    </section>
  );
}

function MetricCard({ label, value, large = false }) {
  return (
    <div className="flex min-h-32 flex-col justify-between rounded-lg bg-white/70 px-5 py-5">
      <div className="text-sm text-muted">{label}</div>
      <div className={`font-medium leading-none ${large ? 'text-2xl sm:text-3xl' : 'text-3xl'}`}>
        {value}
      </div>
    </div>
  );
}

function AiLevelMetricCard({ level }) {
  return (
    <div className="relative flex min-h-32 flex-col justify-between rounded-lg bg-white/70 px-5 py-5 pr-16">
      {level ? (
        <>
          <div className="text-sm text-muted">Общий уровень</div>
          <span className="absolute right-5 top-4 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-sm">
            {level.id}
          </span>
          <div className="text-2xl font-semibold leading-none sm:text-3xl">{level.shortTitle}</div>
        </>
      ) : (
        <>
          <div className="text-sm text-muted">Общий уровень</div>
          <div className="text-xl font-medium leading-tight">Пока нет данных</div>
        </>
      )}
    </div>
  );
}

function HorizontalList({ title, data, maxCount, className = '' }) {
  if (!data.length) {
    return (
      <section className={className}>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-3 text-sm text-muted">Пока нет данных.</p>
      </section>
    );
  }

  return (
    <section className={className}>
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-3 grid gap-3">
        {data.map((item) => (
          <div key={item.name}>
            <div className="flex items-start justify-between gap-4 text-sm">
              <span className="leading-snug">{item.name}</span>
              <span className="font-bold">{item.count}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-[#3268b8]"
                style={{ width: `${Math.max((item.count / maxCount) * 100, 6)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NavButton({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-10 min-w-24 items-center justify-center rounded-lg border px-4 py-2 text-sm transition ${
        active
          ? 'border-primary bg-white text-primary'
          : 'border-creamLine bg-white/70 text-ink hover:border-primary'
      }`}
    >
      {children}
    </Link>
  );
}
