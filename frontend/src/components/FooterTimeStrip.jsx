import { useEffect, useState } from 'react';

const timeZones = [
  { city: 'India',    tz: 'Asia/Kolkata' },
  { city: 'London',   tz: 'Europe/London' },
  { city: 'New York', tz: 'America/New_York' },
];

const formatTime = (timeZone) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());

const FooterTimeStrip = () => {
  const [times, setTimes] = useState(() =>
    timeZones.map((z) => formatTime(z.tz))
  );

  useEffect(() => {
    const tick = () => setTimes(timeZones.map((z) => formatTime(z.tz)));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      aria-label="World clocks"
      className="relative z-10 bg-white overflow-hidden rounded-b-[2.5rem] sm:rounded-b-[3rem] md:rounded-b-[3.5rem] lg:rounded-b-[4rem]"
    >
      <div className="px-8 pt-12 pb-14 sm:pb-16">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {timeZones.map((zone, i) => (
            <div
              key={zone.city}
              className="flex items-center gap-3 px-6 py-3 rounded-full border-2 border-gray-900 bg-white"
            >
              <span className="text-base md:text-lg font-bold text-gray-900">
                {zone.city}:
              </span>
              <span className="text-base md:text-lg text-gray-700 tabular-nums">
                {times[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FooterTimeStrip;
