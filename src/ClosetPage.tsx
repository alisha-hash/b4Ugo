import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Search } from 'lucide-react';
import { useCloset, useAuth } from './lib/auth';

const BRAND_ORANGE = '#E8712A';

export default function ClosetPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { savedLooks } = useCloset();

  // Redirect if not logged in
  useEffect(() => {
    // Only check after first render to prevent hydration mismatch on strict mode
    const stored = localStorage.getItem('b4ugo_user');
    if (!stored && !user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B1120', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
          <ArrowLeft size={18} /> Back to Home
        </button>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, color: BRAND_ORANGE, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          B4U-GO
        </span>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.02em' }}>
            Welcome, {user.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>This is your personal style archive. The Curated Edit.</p>
        </div>

        {savedLooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Search size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: 24 }} />
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Your closet is empty</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>Let our stylist curate your first look.</p>
            <button onClick={() => navigate('/style-me')} style={{ background: BRAND_ORANGE, border: 'none', padding: '16px 32px', borderRadius: 100, color: 'white', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
              Style Me Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
            {savedLooks.map(look => (
              <div key={look.id} style={{ background: '#151A2A', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ height: 400, width: '100%' }}>
                  <img src={look.imageUrl} alt="Saved Look" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ color: BRAND_ORANGE, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{look.date}</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>{look.top}</h3>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{look.vibe}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
