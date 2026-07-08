import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react';
import { Search, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import LoginModal from './LoginModal';

/* ─── Brand orange — sampled from fashion1 dress ─── */
const BRAND_ORANGE = '#E8712A';
const BRAND_ORANGE_LIGHT = '#F2863D';
const BRAND_ORANGE_GLOW = 'rgba(232, 113, 42, 0.35)';

/* ─── Image data ─── */
const IMAGES = [
  { src: '/images/fashion1.png', bg: '#0B1120', panel: '#111d3a' },
  { src: '/images/fashion2.png', bg: '#0d1528', panel: '#142040' },
  { src: '/images/fashion3.png', bg: '#10192e', panel: '#162244' },
  { src: '/images/fashion4.png', bg: '#0e1626', panel: '#131e38' },
];

const TRANSITION_MS = 650;
const EASE = 'cubic-bezier(0.4,0,0.2,1)';
const AUTO_ROTATE_MS = 5000;

/* ─── Grain overlay SVG as data URI ─── */
const GRAIN_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#g)" opacity="0.08"/></svg>`
)}`;

/* ─── Quick occasion suggestions for the hero search ─── */
const HERO_SUGGESTIONS = [
  'Wedding in Lagos',
  'Date Night',
  'Job Interview',
  'Owambe Party',
];

/* ─── Carousel role logic ─── */
type Role = 'center' | 'left' | 'right' | 'back';

function getRole(index: number, activeIndex: number): Role {
  if (index === activeIndex) return 'center';
  if (index === (activeIndex + 3) % 4) return 'left';
  if (index === (activeIndex + 1) % 4) return 'right';
  return 'back';
}

function getRoleStyle(role: Role, isMobile: boolean): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    aspectRatio: '0.6 / 1',
    transition: `transform ${TRANSITION_MS}ms ${EASE}, filter ${TRANSITION_MS}ms ${EASE}, opacity ${TRANSITION_MS}ms ${EASE}, left ${TRANSITION_MS}ms ${EASE}, height ${TRANSITION_MS}ms ${EASE}, bottom ${TRANSITION_MS}ms ${EASE}`,
    willChange: 'transform, filter, opacity',
  };

  switch (role) {
    case 'center':
      return {
        ...base,
        /* ── Scale adjusted to fit head: 1.75 (desktop), 1.35 (mobile) ── */
        transform: `translateX(-50%) scale(${isMobile ? 1.35 : 1.75})`,
        transformOrigin: 'bottom center',
        filter: 'blur(0px)',
        opacity: 1,
        zIndex: 20,
        left: '50%',
        height: isMobile ? '62%' : '90%',
        bottom: isMobile ? '8%' : '-2%',
      };
    case 'left':
      return {
        ...base,
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.7,
        zIndex: 10,
        left: isMobile ? '12%' : '26%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '38%' : '16%',
      };
    case 'right':
      return {
        ...base,
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.7,
        zIndex: 10,
        left: isMobile ? '88%' : '74%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '38%' : '16%',
      };
    case 'back':
      return {
        ...base,
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(4px)',
        opacity: 0.5,
        zIndex: 5,
        left: '50%',
        height: isMobile ? '13%' : '22%',
        bottom: isMobile ? '38%' : '16%',
      };
  }
}

/* ═══════════════════════════════════════════════════
   APP COMPONENT
   ═══════════════════════════════════════════════════ */
export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [heroQuery, setHeroQuery] = useState('');
  const [isHeroFocused, setIsHeroFocused] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const isAnimating = useRef(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef(0);

  /* ─── Preload images ─── */
  useEffect(() => {
    IMAGES.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  /* ─── Responsive breakpoint ─── */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ─── Navigate carousel ─── */
  const navigateCarousel = useCallback((dir: 'next' | 'prev') => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setActiveIndex((prev) =>
      dir === 'next' ? (prev + 1) % 4 : (prev + 3) % 4
    );
    setTimeout(() => {
      isAnimating.current = false;
    }, TRANSITION_MS);
  }, []);

  /* ─── Auto-rotate carousel (arrows removed, so auto-advance keeps it alive) ─── */
  useEffect(() => {
    const interval = setInterval(() => {
      navigateCarousel('next');
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [navigateCarousel]);

  /* ─── Keyboard navigation ─── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigateCarousel('next');
      else if (e.key === 'ArrowLeft') navigateCarousel('prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigateCarousel]);

  /* ─── Touch swipe support (replaces arrow buttons on mobile) ─── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      navigateCarousel(delta < 0 ? 'next' : 'prev');
    }
  };

  /* ─── Hero search submit → Style Me wizard ─── */
  const handleHeroSearch = () => {
    const q = heroQuery.trim();
    if (q) {
      navigate(`/style-me?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/style-me');
    }
  };

  return (
    <div
      style={{
        backgroundColor: IMAGES[activeIndex].bg,
        transition: `background-color ${TRANSITION_MS}ms ${EASE}`,
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
      className="relative w-full min-h-screen overflow-hidden"
    >
      <div
        className="relative w-full"
        style={{ height: '100vh', overflow: 'hidden' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >

        {/* ── Header ── */}
        <header style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: isMobile ? '24px 20px' : '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: 'white', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            B4U-GO
          </div>
          <div>
            {user ? (
              <button onClick={() => navigate('/closet')} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: 100, color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              >
                My Closet
              </button>
            ) : (
              <button onClick={() => setLoginModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = BRAND_ORANGE}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
              >
                <User size={16} /> Log In
              </button>
            )}
          </div>
        </header>

        {/* ── 1. Grain overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 40,
            opacity: 0.3,
            backgroundImage: `url("${GRAIN_SVG}")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
            mixBlendMode: 'overlay',
          }}
        />

        {/* ── 2. Giant ghost text — B4U-GO — with subtle parallax ── */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 2, top: isMobile ? '22%' : '18%' }}
        >
          <span
            className="hero-parallax"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(90px, 28vw, 380px)',
              fontWeight: 900,
              color: 'white',
              opacity: 0.12,
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            B4U-GO
          </span>
        </div>

        {/* ── 3. Top-left brand label ── */}
        <div
          className="absolute top-6 left-4 sm:left-8 fade-in-up"
          style={{ zIndex: 60 }}
        >
          <span
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 14,
              fontWeight: 400,
              color: 'white',
              opacity: 0.9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            B4U-GO
          </span>
        </div>

        {/* ── 4. Carousel — all images with motion ── */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {IMAGES.map((item, index) => {
            const role = getRole(index, activeIndex);
            const style = getRoleStyle(role, isMobile);
            /* Each role gets its own animation class */
            const animClass =
              role === 'center'
                ? 'hero-float'
                : role === 'back'
                ? 'bg-figure-sway-slow'
                : 'bg-figure-sway';
            return (
              <div key={index} style={style}>
                <div
                  className={animClass}
                  style={{ width: '100%', height: '100%' }}
                >
                  <img
                    src={item.src}
                    alt={`B4U-Go look ${index + 1}`}
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'bottom center',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 5. Dot indicators (orange active) ── */}
        <div
          className="absolute flex gap-2"
          style={{
            zIndex: 60,
            bottom: isMobile ? 14 : 28,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!isAnimating.current) setActiveIndex(i);
              }}
              className="dot-indicator"
              aria-label={`View look ${i + 1}`}
              style={{
                width: i === activeIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background:
                  i === activeIndex
                    ? BRAND_ORANGE
                    : 'rgba(255,255,255,0.25)',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* ── 6. Bottom content — brand + tagline + interactive search ── */}
        <div
          className="absolute"
          style={{
            zIndex: 60,
            bottom: isMobile ? 44 : 80,
            left: isMobile ? 16 : 96,
            right: isMobile ? 16 : 'auto',
            maxWidth: isMobile ? undefined : 440,
          }}
        >
          {/* Brand name */}
          <p
            className="fade-in-up"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: isMobile ? 18 : 22,
              fontWeight: 400,
              color: 'white',
              opacity: 0.95,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              marginBottom: isMobile ? 4 : 8,
            }}
          >
            B4U-GO
          </p>

          {/* Tagline — short, punchy, communicates what the product does */}
          <p
            className="fade-in-up-delay-1"
            style={{
              fontSize: isMobile ? 12 : 14,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.65,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 300,
              marginBottom: isMobile ? 14 : 20,
              maxWidth: 380,
            }}
          >
            Going somewhere special? Tell us the occasion and we'll{' '}
            <span style={{ color: BRAND_ORANGE, fontWeight: 500 }}>
              style you in seconds
            </span>
            .
          </p>

          {/* ── Interactive "Where are you going?" search ── */}
          <div
            className="fade-in-up-delay-2"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isHeroFocused
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(255,255,255,0.06)',
              border: `1.5px solid ${
                isHeroFocused ? BRAND_ORANGE : 'rgba(255,255,255,0.12)'
              }`,
              borderRadius: 14,
              padding: '4px 5px 4px 16px',
              transition: 'all 0.25s ease',
              boxShadow: isHeroFocused
                ? `0 0 24px ${BRAND_ORANGE_GLOW}`
                : 'none',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <Search
              size={18}
              style={{
                color: isHeroFocused
                  ? BRAND_ORANGE
                  : 'rgba(255,255,255,0.35)',
                transition: 'color 0.2s',
                flexShrink: 0,
              }}
            />
            <input
              ref={heroInputRef}
              id="hero-search-input"
              type="text"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              onFocus={() => setIsHeroFocused(true)}
              onBlur={() => setIsHeroFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
              placeholder="Where are you going today?"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: isMobile ? 13 : 14,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 400,
                padding: '11px 10px',
                minWidth: 0,
              }}
            />
            <button
              id="hero-style-me-btn"
              onClick={handleHeroSearch}
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              className="hero-cta-btn"
              style={{
                background: ctaHovered ? BRAND_ORANGE_LIGHT : BRAND_ORANGE,
                border: 'none',
                borderRadius: 10,
                padding: isMobile ? '9px 16px' : '10px 22px',
                color: '#fff',
                fontSize: isMobile ? 12 : 13,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: ctaHovered
                  ? `0 4px 20px ${BRAND_ORANGE_GLOW}`
                  : 'none',
                transform: ctaHovered ? 'scale(1.04)' : 'scale(1)',
                transition: 'all 0.25s ease',
              }}
            >
              Style Me
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Quick occasion pills */}
          <div
            className="fade-in-up-delay-3"
            style={{
              marginTop: 12,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {HERO_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setHeroQuery(s);
                  heroInputRef.current?.focus();
                }}
                className="hero-pill"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 100,
                  padding: '5px 14px',
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 11,
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.22s ease',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

      </div>
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} onLoginSuccess={() => navigate('/closet')} />
    </div>
  );
}
