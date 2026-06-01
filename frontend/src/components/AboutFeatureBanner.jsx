import { Link } from 'react-router-dom';

const AboutFeatureBanner = () => (
  <section className="relative w-full overflow-hidden">
    <div className="absolute inset-0 flex flex-col" aria-hidden="true">
      <div className="h-[42%] min-h-[140px] bg-white" />
      <div className="flex-1 bg-black" />
    </div>

    <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-16">
      <div className="bg-white border border-gray-200 rounded-4xl md:rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col md:flex-row md:min-h-[340px]">
        <div className="relative md:w-[46%] min-h-[240px] md:min-h-0 bg-gray-100 overflow-hidden">
          <img
            src="/gifs/sports.gif"
            alt="FlagHouse lifestyle"
            className="absolute inset-0 w-full h-full object-cover grayscale"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-8xl md:text-9xl select-none opacity-30" aria-hidden="true">
              🚩
            </span>
          </div>
        </div>

        <div className="md:w-[54%] flex flex-col justify-center gap-5 px-8 py-10 md:px-12 md:py-14 bg-white">
          <h2 className="text-3xl md:text-[2.15rem] font-bold text-gray-900 leading-tight tracking-tight">
            Not just for empty walls
          </h2>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-md">
            Premium wall flags built for modern rooms — vibrant prints, lasting fabric, and designs for every passion you live by.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center w-fit bg-black text-white font-semibold text-base px-8 py-3.5 rounded-full hover:bg-neutral-800 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default AboutFeatureBanner;
