import { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 119;

// Preload all frames as Image objects
const preloadFrames = () => {
  const images = [];
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = `/frames/frame${String(i).padStart(3, '0')}.jpg`;
    images.push(img);
  }
  return images;
};

const ScrollVideoSection = () => {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const imagesRef    = useRef([]);
  const rafRef       = useRef(null);
  const currentFrameRef = useRef(0);
  const targetFrameRef  = useRef(0);

  const [progress, setProgress]   = useState(0);
  const [loaded, setLoaded]       = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  // ── Preload all frames ───────────────────────────────────────────────────
  useEffect(() => {
    const images = preloadFrames();
    imagesRef.current = images;

    let count = 0;
    images.forEach((img) => {
      if (img.complete) {
        count++;
        setLoadedCount(count);
        if (count === TOTAL_FRAMES) setLoaded(true);
      } else {
        img.onload = () => {
          count++;
          setLoadedCount(count);
          if (count === TOTAL_FRAMES) setLoaded(true);
        };
      }
    });
  }, []);

  // ── Draw a specific frame to canvas ─────────────────────────────────────
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[index];
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext('2d');
    const w   = canvas.offsetWidth;
    const h   = canvas.offsetHeight;
    canvas.width  = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Cover fit
    const imgRatio    = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let sx, sy, sw, sh;
    if (imgRatio > canvasRatio) {
      sh = img.naturalHeight;
      sw = sh * canvasRatio;
      sx = (img.naturalWidth - sw) / 2;
      sy = 0;
    } else {
      sw = img.naturalWidth;
      sh = sw / canvasRatio;
      sx = 0;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  };

  // ── rAF loop — smooth lerp toward target frame ───────────────────────────
  useEffect(() => {
    if (!loaded) return;

    const loop = () => {
      const target  = targetFrameRef.current;
      const current = currentFrameRef.current;

      if (Math.round(current) !== Math.round(target)) {
        // Lerp smoothly toward target
        const next = current + (target - current) * 0.12;
        currentFrameRef.current = next;
        drawFrame(Math.round(next));
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    drawFrame(0);
    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded]);

  // ── Scroll handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const totalScroll = container.offsetHeight - window.innerHeight;
      const scrolled    = Math.max(0, -container.getBoundingClientRect().top);
      const prog        = Math.min(1, Math.max(0, scrolled / totalScroll));

      setProgress(prog);
      targetFrameRef.current = prog * (TOTAL_FRAMES - 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Redraw on resize ──────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => drawFrame(Math.round(currentFrameRef.current));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [loaded]);

  const loadPercent = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <div ref={containerRef} style={{ height: '400vh' }}>
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black">

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            display: loaded ? 'block' : 'none',
          }}
        />

        {/* Loading screen */}
        {!loaded && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4">
            <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full transition-all duration-200"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 tracking-widest uppercase">
              Loading {loadPercent}%
            </span>
          </div>
        )}

        {/* Scroll hint */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-500"
          style={{ opacity: progress < 0.04 ? 1 : 0 }}
        >
          <span className="text-xs font-medium tracking-widest uppercase text-white/40">Scroll</span>
          <div className="w-px h-8 bg-white/25 animate-pulse" />
        </div>

      </div>
    </div>
  );
};

export default ScrollVideoSection;
