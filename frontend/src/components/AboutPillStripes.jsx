import { forwardRef, useEffect, useRef } from 'react';

const topPills = [
  '500+ Flag Designs',
  '10K+ Happy Customers',
  '4.8★ Average Rating',
  '3–5 Days Delivery',
  'Premium Polyester',
  'Vibrant Print Quality',
  'Sports · Gaming · Music',
  'Pan India Shipping',
];

const bottomPills = [
  'Made in India',
  '7-Day Easy Returns',
  'Custom Printing Available',
  'Ships Within 24 Hours',
  'Eco-Friendly Inks',
  'Room Décor Essentials',
  'Trusted by 10K+ Fans',
  'Designed with Passion',
];

const Pill = ({ label, dark = false }) => (
  <span
    className={`inline-flex items-center shrink-0 px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
      dark
        ? 'bg-black text-white border-black'
        : 'bg-white text-gray-800 border-gray-200'
    }`}
  >
    {label}
  </span>
);

const PillRow = forwardRef(function PillRow({ pills, direction = 'left' }, ref) {
  const doubled = [...pills, ...pills, ...pills];

  return (
    <div className="overflow-hidden w-full">
      <div
        ref={ref}
        className="flex items-center gap-3 w-max will-change-transform"
      >
        {doubled.map((label, i) => (
          <Pill
            key={`${direction}-${label}-${i}`}
            label={label}
            dark={i % 4 === 0}
          />
        ))}
      </div>
    </div>
  );
});

const getScrollProgress = (el) => {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const range = rect.height + vh;
  if (range <= 0) return 0;
  return Math.min(1, Math.max(0, (vh - rect.top) / range));
};

const AboutPillStripes = () => {
  const sectionRef = useRef(null);
  const topRowRef = useRef(null);
  const bottomRowRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const section = sectionRef.current;
      if (section && topRowRef.current && bottomRowRef.current) {
        const progress = getScrollProgress(section);
        const shift = Math.min(window.innerWidth * 0.28, 480);
        const topX = -shift + progress * shift * 2;
        const bottomX = shift - progress * shift * 2;

        topRowRef.current.style.transform = `translate3d(${topX}px, 0, 0)`;
        bottomRowRef.current.style.transform = `translate3d(${bottomX}px, 0, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-8 md:py-10 overflow-hidden border-b border-gray-100"
    >
      <div className="flex flex-col gap-3 md:gap-4">
        <PillRow ref={topRowRef} pills={topPills} direction="top" />
        <PillRow ref={bottomRowRef} pills={bottomPills} direction="bottom" />
      </div>
    </section>
  );
};

export default AboutPillStripes;
