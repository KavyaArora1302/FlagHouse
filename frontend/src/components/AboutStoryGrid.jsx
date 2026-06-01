import { Link } from 'react-router-dom';

const ArrowButton = ({ variant = 'light', size = 'md' }) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-[4.5rem] h-[4.5rem]',
  };

  const isLight = variant === 'light';

  return (
    <span
      className={`${sizes[size]} rounded-full flex items-center justify-center shrink-0 ${
        isLight ? 'bg-white text-black' : 'bg-black text-white'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-[38%] h-[38%] transition-transform duration-300 ease-out group-hover:rotate-45"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5 19.5 4.5M19.5 4.5H9.75M19.5 4.5V14.25" />
      </svg>
    </span>
  );
};

const BentoCard = ({
  title,
  to,
  className = '',
  variant = 'dark',
  btnSize = 'md',
  alignBtn = 'end',
  bordered = false,
}) => {
  const isDark = variant === 'dark';

  return (
    <Link
      to={to}
      className={`group rounded-2xl md:rounded-3xl p-6 md:p-7 flex flex-col justify-between min-h-[148px] transition-colors ${
        isDark
          ? 'bg-neutral-900 border border-white/10 hover:border-white/20'
          : 'bg-white border border-gray-200 hover:border-gray-300'
      } ${bordered && isDark ? 'border-white/25' : ''} ${className}`}
    >
      <h3
        className={`text-lg md:text-xl font-semibold leading-snug pr-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        {title}
      </h3>
      <div className={`flex mt-6 ${alignBtn === 'end' ? 'justify-end' : 'justify-start'}`}>
        <ArrowButton variant={isDark ? 'light' : 'dark'} size={btnSize} />
      </div>
    </Link>
  );
};

const AboutStoryGrid = () => (
  <section className="w-full bg-black px-6 md:px-10 py-16 md:py-20">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5">
      {/* Intro */}
      <div className="lg:col-span-5 lg:row-span-2 flex flex-col gap-5 pb-2 lg:pb-0 lg:pr-4">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Our Journey
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-[2.65rem] font-bold text-white leading-[1.12] tracking-tight">
          Built for every passion
        </h2>
        <p className="text-base md:text-lg font-semibold text-gray-300 leading-snug">
          From a dorm room idea to 10,000+ customers
        </p>
        <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-md">
          It started in 2023 when our founder Kavya couldn&apos;t find a wall flag that felt personal.
          She partnered with local printers, sourced premium fabric, and grew FlagHouse into a community
          of people who believe their space should reflect who they are.
        </p>
      </div>

      <BentoCard
        title="Sports"
        to="/shop"
        variant="dark"
        className="lg:col-span-2 lg:row-span-2 min-h-[200px] lg:min-h-[340px]"
        btnSize="lg"
      />

      <BentoCard
        title="Gaming"
        to="/shop"
        variant="light"
        className="lg:col-span-2 lg:row-span-2 min-h-[200px] lg:min-h-[340px]"
        btnSize="lg"
      />

      <BentoCard
        title="Music"
        to="/shop"
        variant="dark"
        bordered
        className="lg:col-span-3 min-h-[158px]"
        btnSize="md"
        alignBtn="start"
      />

      <BentoCard
        title="Travel"
        to="/shop"
        variant="dark"
        className="lg:col-span-3 min-h-[158px]"
        btnSize="md"
      />

      <BentoCard
        title="Premium Quality"
        to="/shop"
        variant="light"
        className="lg:col-span-5 min-h-[148px]"
        btnSize="md"
      />

      <BentoCard
        title="Made in India"
        to="/shop"
        variant="dark"
        className="lg:col-span-4 min-h-[148px]"
        btnSize="md"
      />

      <BentoCard
        title="Shop the collection"
        to="/shop"
        variant="light"
        className="lg:col-span-3 min-h-[148px]"
        btnSize="sm"
        alignBtn="start"
      />
    </div>
  </section>
);

export default AboutStoryGrid;
