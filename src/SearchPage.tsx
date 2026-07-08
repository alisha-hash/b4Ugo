import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SUGGESTIONS = [
  'Style me for a wedding',
  'What to wear to a job interview',
  'Ankara combinations for Owambe',
  'Casual weekend fits',
  'How to style agbada for men',
  'Date night outfit ideas',
  'Corporate wear for women',
  'Beach vacation wardrobe',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ─── Pre-fill from hero search ─── */
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      inputRef.current?.focus();
    }
  }, [searchParams]);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#0B1120',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          padding: '28px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            fontSize: 14,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
            padding: '8px 0',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'; }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <span
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          B4U-GO
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px 60px',
          maxWidth: 700,
          width: '100%',
        }}
      >
        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(32px, 7vw, 64px)',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
          }}
        >
          Watin you want<br />
          make we do for you<br />
          B4U-GO?
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            color: 'rgba(255, 255, 255, 0.45)',
            textAlign: 'center',
            marginBottom: 44,
            maxWidth: 460,
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Tell us what you need — outfit ideas, tailor instructions,
          event looks, or style combos.
        </p>

        {/* Search bar */}
        <div
          style={{
            width: '100%',
            maxWidth: 560,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              border: `1.5px solid ${isFocused ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: 16,
              padding: '4px 6px 4px 20px',
              transition: 'background-color 0.2s, border-color 0.2s',
            }}
          >
            <Search
              size={20}
              style={{
                color: isFocused ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)',
                transition: 'color 0.2s',
                flexShrink: 0,
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="E.g. Style me for a beach wedding..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: 16,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 400,
                padding: '14px 12px',
              }}
            />
            <button
              style={{
                background: query.trim() ? '#E8712A' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: 12,
                padding: '10px 24px',
                color: query.trim() ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                fontSize: 14,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                cursor: query.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (query.trim()) {
                  e.currentTarget.style.opacity = '0.85';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Suggestion chips */}
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
            maxWidth: 560,
          }}
        >
          {SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(suggestion);
                inputRef.current?.focus();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 100,
                padding: '7px 16px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: 13,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 0 28px', textAlign: 'center' }}>
        <p
          style={{
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.18)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 400,
          }}
        >
          B4U-GO
        </p>
      </div>
    </div>
  );
}
