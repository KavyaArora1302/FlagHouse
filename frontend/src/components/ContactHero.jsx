import { useEffect, useRef } from 'react';

// Drop your caricature at src/assets/contact-caricature.png and set to true
const USE_CUSTOM_IMAGE = false;
// import customCaricature from '../assets/contact-caricature.png';

const MAX_PUPIL_RATIO = 0.42;
const PUPIL_R = 11;

const calcPupilOffsetSvg = (eyeEl, clientX, clientY) => {
  if (!eyeEl) return { x: 0, y: 0 };

  const rect = eyeEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const dist = Math.hypot(dx, dy) || 1;

  const maxScreen = rect.width * 0.5 * MAX_PUPIL_RATIO;
  const clamped = Math.min(maxScreen, dist);
  const scale = (PUPIL_R * 2) / rect.width;

  return {
    x: (dx / dist) * clamped * scale,
    y: (dy / dist) * clamped * scale,
  };
};

const calcPupilOffsetPx = (eyeEl, clientX, clientY) => {
  if (!eyeEl) return { x: 0, y: 0 };

  const rect = eyeEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const dist = Math.hypot(dx, dy) || 1;

  const maxScreen = rect.width * 0.5 * MAX_PUPIL_RATIO;
  const clamped = Math.min(maxScreen, dist);

  return {
    x: (dx / dist) * clamped,
    y: (dy / dist) * clamped,
  };
};

const TrackingEye = ({ scleraRef, pupilRef, highlightRef, scleraR, pupilR, cx, cy }) => (
  <g ref={scleraRef}>
    <circle cx={cx} cy={cy} r={scleraR} fill="white" />
    <circle ref={pupilRef} cx={cx} cy={cy} r={pupilR} fill="#1a1a1a" />
    <circle
      ref={highlightRef}
      cx={cx}
      cy={cy}
      r={pupilR * 0.22}
      fill="white"
    />
  </g>
);

const SvgCaricature = ({
  leftEyeRef,
  rightEyeRef,
  leftPupilRef,
  rightPupilRef,
  leftHighlightRef,
  rightHighlightRef,
}) => (
  <svg
    viewBox="0 0 280 320"
    className="w-full max-w-[320px] md:max-w-[360px] h-auto drop-shadow-2xl"
    aria-hidden="true"
  >
    <ellipse cx="140" cy="268" rx="72" ry="48" fill="#2a2a2a" />
    <path
      d="M88 248 Q140 210 192 248 L192 290 Q140 310 88 290 Z"
      fill="#f5f5f5"
    />

    <line x1="210" y1="175" x2="210" y2="268" stroke="#888" strokeWidth="3" strokeLinecap="round" />
    <path d="M210 178 L248 192 L210 206 Z" fill="#ef4444" />
    <path d="M210 206 L248 218 L210 230 Z" fill="#ffffff" />
    <path d="M210 230 L248 242 L210 254 Z" fill="#2563eb" />

    <rect x="122" y="198" width="36" height="28" rx="8" fill="#f0c8a0" />
    <ellipse cx="140" cy="148" rx="78" ry="88" fill="#f0c8a0" />

    <path
      d="M68 148 Q62 90 100 68 Q140 48 180 68 Q218 90 212 148 Q200 108 140 98 Q80 108 68 148"
      fill="#1a1a1a"
    />
    <path
      d="M72 130 Q90 118 110 122 Q130 108 140 112 Q150 108 170 122 Q190 118 208 130"
      fill="none"
      stroke="#333"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <ellipse cx="66" cy="152" rx="12" ry="16" fill="#e8b890" />
    <ellipse cx="214" cy="152" rx="12" ry="16" fill="#e8b890" />

    <path d="M88 118 Q108 108 128 114" fill="none" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
    <path d="M152 114 Q172 108 192 118" fill="none" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />

    <TrackingEye
      scleraRef={leftEyeRef}
      pupilRef={leftPupilRef}
      highlightRef={leftHighlightRef}
      scleraR={22}
      pupilR={PUPIL_R}
      cx={108}
      cy={148}
    />
    <TrackingEye
      scleraRef={rightEyeRef}
      pupilRef={rightPupilRef}
      highlightRef={rightHighlightRef}
      scleraR={22}
      pupilR={PUPIL_R}
      cx={172}
      cy={148}
    />

    <path d="M140 162 Q148 178 134 180" fill="none" stroke="#d4956a" strokeWidth="3" strokeLinecap="round" />
    <path
      d="M108 192 Q140 218 172 192"
      fill="none"
      stroke="#1a1a1a"
      strokeWidth="4"
      strokeLinecap="round"
    />

    <ellipse cx="88" cy="178" rx="14" ry="8" fill="#f4a0a0" opacity="0.45" />
    <ellipse cx="192" cy="178" rx="14" ry="8" fill="#f4a0a0" opacity="0.45" />
  </svg>
);

const ImageCaricature = ({ leftEyeRef, rightEyeRef, leftPupilRef, rightPupilRef, src }) => (
  <div className="relative w-full max-w-[280px]">
    <img src={src} alt="Flaghouse mascot" className="w-full h-auto rounded-2xl" draggable={false} />

    <div
      ref={leftEyeRef}
      className="absolute w-[44px] h-[44px] rounded-full bg-white overflow-hidden"
      style={{ top: '34%', left: '28%' }}
    >
      <div
        ref={leftPupilRef}
        className="absolute w-[22px] h-[22px] rounded-full bg-neutral-900 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
      />
    </div>

    <div
      ref={rightEyeRef}
      className="absolute w-[44px] h-[44px] rounded-full bg-white overflow-hidden"
      style={{ top: '34%', right: '28%' }}
    >
      <div
        ref={rightPupilRef}
        className="absolute w-[22px] h-[22px] rounded-full bg-neutral-900 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
      />
    </div>
  </div>
);

const ContactCaricature = () => {
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const leftHighlightRef = useRef(null);
  const rightHighlightRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);

  useEffect(() => {
    const updateSvgEye = (eyeRef, pupilRef, highlightRef, baseCx, baseCy) => {
      const { x, y } = calcPupilOffsetSvg(eyeRef.current, mouseRef.current.x, mouseRef.current.y);

      if (pupilRef.current) {
        pupilRef.current.setAttribute('cx', String(baseCx + x));
        pupilRef.current.setAttribute('cy', String(baseCy + y));
      }
      if (highlightRef.current) {
        highlightRef.current.setAttribute('cx', String(baseCx + x));
        highlightRef.current.setAttribute('cy', String(baseCy + y));
      }
    };

    const updateHtmlEye = (eyeRef, pupilRef) => {
      const { x, y } = calcPupilOffsetPx(eyeRef.current, mouseRef.current.x, mouseRef.current.y);

      if (pupilRef.current) {
        pupilRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      }
    };

    const tick = () => {
      if (USE_CUSTOM_IMAGE) {
        updateHtmlEye(leftEyeRef, leftPupilRef);
        updateHtmlEye(rightEyeRef, rightPupilRef);
      } else {
        updateSvgEye(leftEyeRef, leftPupilRef, leftHighlightRef, 108, 148);
        updateSvgEye(rightEyeRef, rightPupilRef, rightHighlightRef, 172, 148);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative shrink-0 animate-[float_4s_ease-in-out_infinite]">
      {USE_CUSTOM_IMAGE ? (
        <ImageCaricature
          src=""
          leftEyeRef={leftEyeRef}
          rightEyeRef={rightEyeRef}
          leftPupilRef={leftPupilRef}
          rightPupilRef={rightPupilRef}
        />
      ) : (
        <SvgCaricature
          leftEyeRef={leftEyeRef}
          rightEyeRef={rightEyeRef}
          leftPupilRef={leftPupilRef}
          rightPupilRef={rightPupilRef}
          leftHighlightRef={leftHighlightRef}
          rightHighlightRef={rightHighlightRef}
        />
      )}
    </div>
  );
};

const ContactHero = () => (
  <section className="relative w-full bg-black px-6 md:px-10 py-12 md:py-16 overflow-hidden flex items-center justify-center min-h-[420px] md:min-h-[480px]">
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
      }}
    />

    <ContactCaricature />
  </section>
);

export default ContactHero;
