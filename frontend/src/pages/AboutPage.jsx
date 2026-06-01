import { Link } from 'react-router-dom';
import AboutPillStripes from '../components/AboutPillStripes';
import AboutStoryGrid from '../components/AboutStoryGrid';
import AboutFeatureBanner from '../components/AboutFeatureBanner';

const team = [
  { name: 'Kavya Arora',   role: 'Founder & CEO',        emoji: '👩‍💼' },
  { name: 'Rahul Sharma',  role: 'Head of Design',        emoji: '🎨' },
  { name: 'Priya Mehta',   role: 'Customer Experience',   emoji: '💬' },
  { name: 'Arjun Singh',   role: 'Logistics & Operations', emoji: '🚚' },
];

const AboutPage = () => {
  return (
    <div className="w-full">

      {/* ── Hero ── */}
      <section className="w-full bg-black px-8 py-24 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 border border-white/20 rounded-full px-4 py-1.5">
          Our Story
        </span>
        <h1 className="text-5xl font-bold text-white mt-5 mb-5 leading-tight max-w-2xl mx-auto">
          We Believe Every Wall<br />
          <span className="text-gray-400 font-normal">Deserves a Story</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
          FlagHouse started with one simple idea — your room should reflect who you are. We make that possible with premium, vibrant wall flags for every passion.
        </p>
      </section>

      <AboutPillStripes />

      <AboutStoryGrid />

      <AboutFeatureBanner />

      {/* ── Team ── */}
      <section className="w-full px-8 pt-8 pb-20 bg-black">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Meet the Team</h2>
          <p className="text-base text-gray-400">The people behind every flag you love</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-4xl">
                {member.emoji}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{member.name}</h4>
                <p className="text-sm text-gray-400 mt-0.5">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="w-full px-8 py-20 bg-black text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Decorate Your Space?</h2>
        <p className="text-base text-gray-400 mb-8 max-w-md mx-auto">
          Browse 500+ designs and find the flag that feels like you.
        </p>
        <Link
          to="/shop"
          className="bg-white text-gray-900 font-semibold text-base px-10 py-3.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Shop Now
        </Link>
      </section>

    </div>
  );
};

export default AboutPage;
