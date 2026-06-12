import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { LanguageSwitcher, t, useLanguage } from '../lib/i18n.jsx';

export default function StartPage() {
  const { language } = useLanguage();

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-6 text-center sm:px-8">
      <div className="w-full rounded-2xl border border-creamLine bg-white/92 px-5 py-10 shadow-soft ring-1 ring-white/70 sm:px-10 sm:py-12">
        <LanguageSwitcher className="mb-7" />
        <h1 className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl">
          {t(language, 'startTitle')}
        </h1>
        <p className="mt-6 text-xl leading-relaxed text-muted">
          {t(language, 'startSubtitle')}
        </p>
        <p className="mt-4 text-lg leading-relaxed">
          {t(language, 'startLead')}
        </p>
        <div className="mt-8">
          <Button as={Link} to="/test" className="text-base uppercase tracking-wide">
            {t(language, 'startButton')} <ArrowRight size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
}
