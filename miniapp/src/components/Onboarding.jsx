import { useState } from 'react';
import { useApp } from '../store';
import { haptic } from '../telegram';

/**
 * 3 ta slayddan iborat onboarding (faqat bir marta ko'rinadi).
 */
export default function Onboarding() {
  const { t, finishOnboarding } = useApp();
  const [step, setStep] = useState(0);

  const slides = t.onboarding;
  const isLast = step === slides.length - 1;
  const slide = slides[step];

  const next = () => {
    haptic('light');
    if (isLast) {
      finishOnboarding();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="intro">
      <div className="intro-top">
        {!isLast && (
          <button className="intro-skip" onClick={finishOnboarding}>
            {t.onbSkip}
          </button>
        )}
      </div>

      <div className="intro-body">
        <div className="intro-emoji" key={step}>
          {slide.emoji}
        </div>
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>
      </div>

      <div className="dots">
        {slides.map((_, index) => (
          <span key={index} className={`dot ${index === step ? 'active' : ''}`} />
        ))}
      </div>

      <button className="btn" onClick={next}>
        {isLast ? t.onbStart : t.onbNext}
      </button>
    </div>
  );
}
