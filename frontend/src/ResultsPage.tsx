import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, RefreshCcw, Bookmark, ShoppingBag, Scissors } from 'lucide-react';
import type { OutfitRecommendation } from './lib/gemini';
import { useAuth, useCloset } from './lib/auth';
import LoginModal from './LoginModal';

const BRAND_ORANGE = '#E8712A';
const BRAND_ORANGE_GLOW = 'rgba(232, 113, 42, 0.35)';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const { user } = useAuth();
  const { saveLook } = useCloset();
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const data = location.state?.recommendation as OutfitRecommendation | undefined;

  const handleSave = () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    if (data && !isSaved) {
      saveLook({
        vibe: data.vibe,
        imageUrl: data.imageUrl,
        top: data.top.name,
        bottom: data.bottom.name,
      });
      setIsSaved(true);
    }
  };

  // If someone lands here directly without data, send them back to start
  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1120', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 20, marginBottom: 20 }}>No outfit data found.</p>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '12px 24px', background: BRAND_ORANGE, border: 'none', borderRadius: 8, color: 'white', fontWeight: 600, cursor: 'pointer' }}
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const renderCard = (title: string, item: { name: string; description: string }, icon: string) => (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '24px',
      height: '100%',
      transition: 'transform 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', color: BRAND_ORANGE, fontWeight: 600 }}>{title}</h3>
      </div>
      <h4 style={{ margin: '0 0 8px 0', fontSize: 22, color: 'white', fontWeight: 600, lineHeight: 1.2 }}>{item.name}</h4>
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.5 }}>{item.description}</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B1120', color: 'white', fontFamily: "'Outfit', sans-serif", padding: '20px 16px 60px' }}>
      
      {/* ── Header ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <button
          onClick={() => navigate('/style-me')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
        >
          <ArrowLeft size={18} />
          Back to Stylist
        </button>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color: BRAND_ORANGE, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          B4U-GO
        </span>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 32 : 48, alignItems: 'flex-start' }}>
        
        {/* Left Side: Image (Hero Visual) */}
        <div style={{ 
          flex: isMobile ? 'none' : '1', 
          width: '100%', 
          position: 'sticky', 
          top: 24,
          borderRadius: 24, 
          overflow: 'hidden', 
          boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#151A2A',
          aspectRatio: isMobile ? '4/5' : 'auto',
          height: isMobile ? 'auto' : 'calc(100vh - 120px)'
        }}>
          <img 
            src={data.imageUrl} 
            alt={data.vibe} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
          />
          {/* Subtle gradient overlay at the bottom for polish */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top, rgba(11,17,32,0.8) 0%, transparent 100%)' }} />
        </div>

        {/* Right Side: Content Breakdown */}
        <div style={{ flex: isMobile ? 'none' : '1.2', width: '100%' }}>
          
          {/* Title Section */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232, 113, 42, 0.1)', border: `1px solid rgba(232, 113, 42, 0.2)`, padding: '8px 16px', borderRadius: 100, color: BRAND_ORANGE, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              <Sparkles size={16} />
              AI Stylist Recommendation
            </div>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(32px, 5vw, 56px)', textTransform: 'uppercase', margin: '0 0 16px 0', lineHeight: 1.1 }}>
              Your Custom Look
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>
              {data.vibe}
            </p>
          </div>

          {/* Grid Layout for Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {renderCard('The Top', data.top, '👕')}
            {renderCard('The Bottom', data.bottom, '👖')}
            {renderCard('Footwear', data.footwear, '👟')}

            {/* Accessories */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>⌚</span>
                <h3 style={{ margin: 0, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', color: BRAND_ORANGE, fontWeight: 600 }}>Accessories</h3>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.accessories.map((acc, i) => (
                  <li key={i}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 18, color: 'white', fontWeight: 600 }}>{acc.name}</h4>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{acc.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Color Palette */}
          <div style={{ marginTop: 40, padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Color Palette</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {data.colorPalette.map((hex, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 48, height: 48, borderRadius: '50%', backgroundColor: hex, 
                    border: '2px solid rgba(255,255,255,0.1)',
                    boxShadow: `0 0 20px ${hex}40`
                  }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <button
              onClick={handleSave}
              disabled={isSaved}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 32px', background: isSaved ? 'rgba(255,255,255,0.1)' : BRAND_ORANGE,
                border: 'none', borderRadius: 100,
                color: 'white', fontSize: 15, fontWeight: 600, cursor: isSaved ? 'default' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSaved ? 'none' : `0 8px 24px ${BRAND_ORANGE_GLOW}`
              }}
              onMouseEnter={(e) => { if (!isSaved) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { if (!isSaved) e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Bookmark size={18} fill={isSaved ? "white" : "none"} />
              {isSaved ? "Saved to Closet" : "Save to My Closet"}
            </button>

            <button
              onClick={() => alert("Shopping integration coming soon!")}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 32px', background: 'white',
                border: 'none', borderRadius: 100,
                color: 'black', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <ShoppingBag size={18} />
              Shop the Look
            </button>
            
            <button
              onClick={() => alert("Tailor matching coming soon!")}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 32px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100,
                color: 'white', fontSize: 15, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <Scissors size={18} />
              Find a Tailor
            </button>

            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 32px', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100,
                color: 'white', fontSize: 15, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <RefreshCcw size={16} />
              New Look
            </button>
          </div>

        </div>
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        onLoginSuccess={() => {
          setLoginModalOpen(false);
          handleSave(); // Automatically save after successful login
        }} 
      />
    </div>
  );
}
