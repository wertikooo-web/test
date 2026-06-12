import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ChoiceButton from '../components/ChoiceButton';
import { LanguageSwitcher, t, translateOption, translateQuestion, useLanguage } from '../lib/i18n.jsx';
import { questions } from '../lib/questions';
import { calculateScore, getProfileType } from '../lib/scoring';
import { saveResponse } from '../lib/storage';

export default function TestPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const question = questions[step];
  const currentAnswer = answers[question.id] ?? (question.type === 'multiple' ? [] : null);
  const currentAnswerCount = Array.isArray(currentAnswer) ? currentAnswer.length : 0;
  const progress = ((step + 1) / questions.length) * 100;
  const alreadySubmitted = Boolean(localStorage.getItem('ai-for-psi-submitted-result'));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const selectedCountText = useMemo(() => {
    if (!question.maxChoices) return null;
    return t(language, 'selectedCount')
      .replace('{max}', question.maxChoices)
      .replace('{count}', currentAnswerCount);
  }, [currentAnswerCount, language, question.maxChoices]);

  function selectOption(option, optionIndex) {
    setError('');
    if (question.type === 'single') {
      setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
      return;
    }

    setAnswers((prev) => {
      const selected = prev[question.id] ?? [];
      const isSelected = selected.includes(option);
      let next;

      if (question.exclusiveOption === option) {
        next = isSelected ? [] : [option];
      } else {
        next = selected.filter((item) => item !== question.exclusiveOption);
        if (isSelected) {
          next = next.filter((item) => item !== option);
        } else if (!question.maxChoices || next.length < question.maxChoices) {
          next = [...next, option];
        } else {
          setError(t(language, 'maxChoicesError').replace('{max}', question.maxChoices));
          return prev;
        }
      }

      return { ...prev, [question.id]: next };
    });
  }

  function isAnswered() {
    if (question.type === 'single') return currentAnswer !== null && currentAnswer !== undefined;
    return currentAnswer.length > 0;
  }

  function goNext() {
    if (!isAnswered()) {
      setError(t(language, 'chooseAtLeastOne'));
      return;
    }
    setError('');
    setStep((value) => Math.min(value + 1, questions.length - 1));
  }

  async function submit() {
    if (!isAnswered()) {
      setError(t(language, 'chooseAtLeastOne'));
      return;
    }

    const stored = localStorage.getItem('ai-for-psi-submitted-result');
    if (stored) {
      navigate('/result', { state: JSON.parse(stored) });
      return;
    }

    const score = calculateScore(answers);
    const profileType = getProfileType(score);
    const payload = {
      answers,
      score,
      profile_type: profileType,
      barriers: answers.q11 ?? [],
      expectations: answers.q12 ?? [],
    };

    setSubmitting(true);
    try {
      await saveResponse(payload);
      const result = {
        score,
        profileType,
        answers,
        barriers: payload.barriers,
        expectations: payload.expectations,
      };
      localStorage.setItem('ai-for-psi-submitted-result', JSON.stringify(result));
      navigate('/result', { state: result });
    } catch (submitError) {
      setError(submitError.message || t(language, 'submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  if (alreadySubmitted) {
    function restartLocalTest() {
      localStorage.removeItem('ai-for-psi-submitted-result');
      setAnswers({});
      setStep(0);
      setError('');
    }

    return (
      <section className="mx-auto flex min-h-screen max-w-2xl items-center px-3 py-4 sm:px-5 sm:py-8">
        <div className="w-full rounded-2xl border border-creamLine bg-white/94 p-5 text-center shadow-soft ring-1 ring-white/70 sm:p-6">
          <LanguageSwitcher className="mb-5" />
          <h1 className="text-2xl font-bold">{t(language, 'alreadySentTitle')}</h1>
          <p className="mt-3 text-muted">
            {t(language, 'alreadySentText')}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button className="w-full sm:w-auto" onClick={() => navigate('/result')}>
              {t(language, 'goToResult')}
            </Button>
            <Button className="w-full sm:w-auto" variant="secondary" onClick={restartLocalTest}>
              {t(language, 'restart')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-3xl items-start px-3 py-4 sm:items-center sm:px-5 sm:py-8">
      <div className="w-full rounded-2xl border border-creamLine bg-white/94 p-4 shadow-soft ring-1 ring-white/70 sm:p-8">
        <div className="mb-6">
          <div className="mb-4 flex justify-center sm:justify-end">
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col gap-2 text-sm font-semibold text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span>
              {t(language, 'question')} {step + 1} {t(language, 'of')} {questions.length}
            </span>
            {selectedCountText ? <span>{selectedCountText}</span> : null}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <h1 className="text-xl font-bold leading-tight sm:text-3xl">
          {translateQuestion(language, question.title)}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {question.type === 'single' ? t(language, 'chooseOne') : t(language, 'chooseSeveral')}
        </p>

        <div className="mt-6 grid gap-3">
          {question.options.map((option, index) => (
            <ChoiceButton
              key={option}
              multiple={question.type === 'multiple'}
              selected={
                question.type === 'single'
                  ? currentAnswer === index
                  : currentAnswer.includes(option)
              }
              onClick={() => selectOption(option, index)}
            >
              {translateOption(language, option)}
            </ChoiceButton>
          ))}
        </div>

        {error ? (
          <div className="mt-5 rounded-lg border border-rose/30 bg-rose/5 px-4 py-3 text-sm font-medium text-rose">
            {error}
          </div>
        ) : null}

        <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-creamLine bg-white/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none"
            disabled={step === 0 || submitting}
            onClick={() => {
              setError('');
              setStep((value) => Math.max(value - 1, 0));
            }}
          >
            <ArrowLeft size={18} /> {t(language, 'back')}
          </Button>
          {step === questions.length - 1 ? (
            <Button className="flex-1 sm:flex-none" disabled={submitting} onClick={submit}>
              <Send size={18} /> {submitting ? t(language, 'sending') : t(language, 'send')}
            </Button>
          ) : (
            <Button className="flex-1 sm:flex-none" onClick={goNext}>
              {t(language, 'next')} <ArrowRight size={18} />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
