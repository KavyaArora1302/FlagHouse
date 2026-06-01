import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FooterTimeStrip from './FooterTimeStrip';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const footerRef = useRef(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };

    measure();
    window.addEventListener('resize', measure);

    const observer = new ResizeObserver(measure);
    if (footerRef.current) observer.observe(footerRef.current);

    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Scrolling page layer — no bg here (square white was covering the curve) */}
      <div
        className="relative z-10 min-h-screen"
        style={{ marginBottom: footerHeight || 480 }}
      >
        <Navbar />
        <main className={`w-full bg-white ${isHome ? '' : 'pt-[72px]'}`}>{children}</main>
        <FooterTimeStrip />
      </div>

      {/* Fixed footer — revealed as the page scrolls up */}
      <Footer ref={footerRef} />
    </>
  );
};

export default Layout;
