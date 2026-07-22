import { useState, useEffect, Fragment } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Check, Loader2, UploadCloud, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateOutfit } from './lib/gemini';

/* ─── Brand colours — sampled from fashion1 orange dress ─── */
const BRAND_ORANGE = '#E8712A';
const BRAND_ORANGE_LIGHT = '#F2863D';
const BRAND_ORANGE_GLOW = 'rgba(232, 113, 42, 0.35)';

/* ═══════════════════════════════════════
   STEP & OPTION DATA
   ═══════════════════════════════════════ */

const STEPS = [
  { id: 1, label: 'Occasion' },
  { id: 2, label: 'Gender' },
  { id: 3, label: 'Style' },
  { id: 4, label: 'Budget' },
  { id: 5, label: 'Item' },
  { id: 6, label: 'Generate' },
];

const STEP_HEADERS = [
  { title: 'Where are you going?', subtitle: "Pick the event you're dressing for" },
  { title: 'Who are we styling?', subtitle: 'Select who this outfit is for' },
  { title: "What's your vibe?", subtitle: 'Choose the style that speaks to you' },
  { title: 'Set your budget', subtitle: 'How classy do you want to be?' },
  { title: 'Style My Item', subtitle: 'Upload a specific piece you want to style around (optional)' },
  { title: 'Ready to get styled?', subtitle: 'Review your choices and let our stylist curate your look' },
];

const OCCASIONS = [
  { id: 'birthday', image: '/images/fashion1.png', label: 'Birthday' },
  { id: 'wedding', image: '/images/fashion2.png', label: 'Wedding' },
  { id: 'interview', image: '/images/fashion3.png', label: 'Interview' },
  { id: 'tech-event', image: '/images/fashion4.png', label: 'Tech Event' },
  { id: 'graduation', image: '/images/fashion1.png', label: 'Graduation' },
  { id: 'dinner-date', image: '/images/fashion2.png', label: 'Dinner Date' },
  { id: 'church', image: '/images/fashion3.png', label: 'Church' },
  { id: 'beach', image: '/images/fashion4.png', label: 'Beach Party' },
  { id: 'owambe', image: '/images/fashion1.png', label: 'Owambe' },
  { id: 'gala', image: '/images/fashion2.png', label: 'Gala Night' },
  { id: 'photoshoot', image: '/images/fashion3.png', label: 'Photoshoot' },
  { id: 'office', image: '/images/fashion4.png', label: 'Office' },
];

const GENDERS = [
  { id: 'male', image: '/images/fashion3.png', label: 'Male', desc: "Men's fashion" },
  { id: 'female', image: '/images/fashion1.png', label: 'Female', desc: "Women's fashion" },
  { id: 'children', image: '/images/fashion4.png', label: 'Children', desc: "Kids' fashion" },
];

const STYLES = [
  { id: 'luxury', image: '/images/fashion2.png', label: 'Luxury', desc: 'Premium & opulent' },
  { id: 'corporate', image: '/images/fashion3.png', label: 'Corporate', desc: 'Sharp & professional' },
  { id: 'casual', image: '/images/fashion4.png', label: 'Casual', desc: 'Relaxed & comfortable' },
  { id: 'traditional', image: '/images/fashion1.png', label: 'Traditional', desc: 'Cultural & heritage' },
  { id: 'minimal', image: '/images/fashion2.png', label: 'Minimal', desc: 'Clean & understated' },
  { id: 'trendy', image: '/images/fashion4.png', label: 'Trendy', desc: 'Bold & current' },
];

const BUDGETS = [
  { id: 'low', image: '/images/fashion4.png', label: 'Budget-Friendly', desc: 'Stylish without breaking the bank' },
  { id: 'medium', image: '/images/fashion1.png', label: 'Mid-Range', desc: 'Premium picks, great value' },
  { id: 'high', image: '/images/fashion2.png', label: 'High-End', desc: 'Nothing but the finest' },
];

/* ═══════════════════════════════════════
   TYPES
   ═══════════════════════════════════════ */

type SelectionKey = 'occasion' | 'gender' | 'style' | 'budget';

interface CardItem {
  id: string;
  image: string;
  label: string;
  desc?: string;
}

/* ═══════════════════════════════════════
   STYLE ME PAGE COMPONENT
   ═══════════════════════════════════════ */

export default function StyleMePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState({
    occasion: '',
    gender: '',
    style: '',
    budget: '',
  });
  const [uploadedItem, setUploadedItem] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepVisible, setStepVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ─── Responsive ─── */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ─── Auto-detect occasion from hero search query ─── */
  useEffect(() => {
    const q = searchParams.get('q')?.toLowerCase() || '';
    if (q) {
      const match = OCCASIONS.find(
        (o) => q.includes(o.id) || q.includes(o.label.toLowerCase())
      );
      if (match) {
        setSelections((prev) => ({ ...prev, occasion: match.id }));
      }
    }
  }, [searchParams]);

  /* ─── Step navigation with fade transition ─── */
  const changeStep = (newStep: number) => {
    setStepVisible(false);
    setTimeout(() => {
      setCurrentStep(newStep);
      setStepVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 220);
  };

  const goNext = () => {
    if (currentStep < 6 && canProceed()) changeStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 1) changeStep(currentStep - 1);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1: return !!selections.occasion;
      case 2: return !!selections.gender;
      case 3: return !!selections.style;
      case 4: return !!selections.budget;
      case 5: return true; // Upload is optional
      default: return true;
    }
  };

  /* ─── Card selection with auto-advance ─── */
  const handleSelect = (key: SelectionKey, value: string) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
    // Auto-advance after brief pause so user sees their selection
    if (currentStep < 6) {
      setTimeout(() => changeStep(currentStep + 1), 450);
    }
  };

  /* ─── Generate — Call Gemini API ─── */
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const occasionLabel = OCCASIONS.find(o => o.id === selections.occasion)?.label || selections.occasion;
    const genderLabel = GENDERS.find(g => g.id === selections.gender)?.label || selections.gender;
    const styleLabel = STYLES.find(s => s.id === selections.style)?.label || selections.style;
    const budgetLabel = BUDGETS.find(b => b.id === selections.budget)?.label || selections.budget;

    try {
      const recommendation = await generateOutfit(occasionLabel, genderLabel, styleLabel, budgetLabel, uploadedItem);
      setIsGenerating(false);
      navigate('/results', { state: { recommendation } });
    } catch (error: any) {
      console.error("Generation failed:", error);
      setIsGenerating(false);
      
      const errMsg = error?.message || "";
      if (errMsg === 'MISSING_API_KEY' || !import.meta.env.VITE_GEMINI_API_KEY) {
        alert("Oops! The API key is missing. Please add it to your .env.local file and restart the server.");
      } else if (errMsg.includes('API_KEY_INVALID') || errMsg.toLowerCase().includes('key not valid') || errMsg.toLowerCase().includes('forbidden')) {
        alert("Oops! The API key you provided is invalid. Please double-check the key.");
      } else {
        alert(`The stylist encountered an error: ${errMsg}. Please try again.`);
      }
    }
  };

  /* ─── Helpers ─── */
  const getSelectionKey = (): SelectionKey => {
    const keys: SelectionKey[] = ['occasion', 'gender', 'style', 'budget'];
    return keys[currentStep - 1] || 'occasion';
  };

  const getOptions = (): CardItem[] => {
    switch (currentStep) {
      case 1: return OCCASIONS;
      case 2: return GENDERS;
      case 3: return STYLES;
      case 4: return BUDGETS;
      default: return [];
    }
  };

  const getGridCols = (): number => {
    if (isMobile) {
      if (currentStep === 1) return 3;
      if (currentStep === 4) return 1;
      return 2;
    }
    if (currentStep === 1) return 4;
    return 3;
  };

  /* ═══════════════════════════════════════
     PROGRESS BAR
     ═══════════════════════════════════════ */
  const renderProgressBar = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: isMobile ? 300 : 480,
        margin: '0 auto',
        padding: '0 16px',
      }}
    >
      {STEPS.map((step, i) => (
        <Fragment key={step.id}>
          {/* Step circle */}
          <button
            onClick={() => {
              // Allow clicking completed steps to go back
              if (step.id < currentStep) changeStep(step.id);
            }}
            style={{
              width: isMobile ? 34 : 42,
              height: isMobile ? 34 : 42,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background:
                currentStep >= step.id
                  ? BRAND_ORANGE
                  : 'rgba(255,255,255,0.05)',
              border: `2px solid ${
                currentStep >= step.id
                  ? BRAND_ORANGE
                  : 'rgba(255,255,255,0.1)'
              }`,
              color:
                currentStep >= step.id ? '#fff' : 'rgba(255,255,255,0.25)',
              fontSize: isMobile ? 12 : 14,
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.4s ease',
              cursor: step.id < currentStep ? 'pointer' : 'default',
              boxShadow:
                currentStep === step.id
                  ? `0 0 20px ${BRAND_ORANGE_GLOW}`
                  : 'none',
              padding: 0,
            }}
          >
            {currentStep > step.id ? (
              <Check size={isMobile ? 14 : 16} strokeWidth={3} />
            ) : (
              step.id
            )}
          </button>

          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                minWidth: isMobile ? 12 : 28,
                borderRadius: 1,
                background:
                  currentStep > step.id
                    ? BRAND_ORANGE
                    : 'rgba(255,255,255,0.06)',
                transition: 'background 0.4s ease',
              }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );

  /* ═══════════════════════════════════════
     STEP LABELS (desktop only)
     ═══════════════════════════════════════ */
  const renderStepLabels = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: 480,
        margin: '10px auto 0',
        padding: '0 6px',
      }}
    >
      {STEPS.map((step) => (
        <span
          key={step.id}
          style={{
            fontSize: 11,
            color:
              currentStep >= step.id
                ? 'rgba(255,255,255,0.55)'
                : 'rgba(255,255,255,0.18)',
            fontWeight: currentStep === step.id ? 600 : 400,
            textAlign: 'center',
            width: 80,
            transition: 'all 0.3s ease',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {step.label}
        </span>
      ))}
    </div>
  );

  /* ═══════════════════════════════════════
     SELECTION CARD
     ═══════════════════════════════════════ */
  const renderCard = (
    item: CardItem,
    isSelected: boolean,
    onClick: () => void
  ) => {
    const isBudgetStep = currentStep === 4;
    const isGenderStep = currentStep === 2;
    return (
      <button
        key={item.id}
        onClick={onClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isBudgetStep
            ? isMobile
              ? '22px 20px'
              : '32px 24px'
            : isGenderStep
            ? isMobile
              ? '24px 12px'
              : '36px 20px'
            : isMobile
            ? '18px 10px'
            : '26px 18px',
          background: isSelected
            ? 'rgba(232, 113, 42, 0.14)'
            : 'rgba(255,255,255,0.03)',
          border: `1.5px solid ${
            isSelected ? BRAND_ORANGE : 'rgba(255,255,255,0.07)'
          }`,
          borderRadius: isBudgetStep ? 20 : 16,
          cursor: 'pointer',
          transition: 'all 0.28s ease',
          boxShadow: isSelected
            ? `0 0 28px ${BRAND_ORANGE_GLOW}, inset 0 0 0 1px rgba(232,113,42,0.15)`
            : 'none',
          transform: isSelected ? 'scale(1.03)' : 'scale(1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        {/* Selected check badge */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: BRAND_ORANGE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={12} strokeWidth={3} color="#fff" />
          </div>
        )}

        <img
          src={item.image}
          alt={item.label}
          style={{
            height: isGenderStep ? 72 : isBudgetStep ? 60 : isMobile ? 50 : 64,
            width: 'auto',
            objectFit: 'contain',
            marginBottom: isBudgetStep ? 12 : 8,
            filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))',
          }}
        />
        <span
          style={{
            fontSize: isBudgetStep
              ? isMobile
                ? 16
                : 18
              : isMobile
              ? 12
              : 15,
            fontWeight: 600,
            color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
            fontFamily: "'Outfit', sans-serif",
            transition: 'color 0.2s',
          }}
        >
          {item.label}
        </span>
        {item.desc && (
          <span
            style={{
              fontSize: isMobile ? 10 : 12,
              color: isSelected
                ? 'rgba(255,255,255,0.55)'
                : 'rgba(255,255,255,0.3)',
              marginTop: 5,
              textAlign: 'center',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 300,
              lineHeight: 1.45,
              transition: 'color 0.2s',
              maxWidth: 200,
            }}
          >
            {item.desc}
          </span>
        )}
      </button>
    );
  };

  /* ═══════════════════════════════════════
     UPLOAD STEP (Step 5)
     ═══════════════════════════════════════ */
  const renderUploadStep = () => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedItem(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!uploadedItem ? (
          <div style={{
            width: '100%', maxWidth: 500, height: 260,
            border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onClick={() => document.getElementById('item-upload')?.click()}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND_ORANGE; e.currentTarget.style.background = 'rgba(232, 113, 42, 0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <input type="file" id="item-upload" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            <UploadCloud size={48} color="rgba(255,255,255,0.4)" style={{ marginBottom: 16 }} />
            <span style={{ fontSize: 16, fontWeight: 500, color: 'white', marginBottom: 8 }}>Click to upload an image</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>JPEG, PNG up to 5MB</span>
          </div>
        ) : (
          <div style={{
            width: '100%', maxWidth: 300, position: 'relative',
            borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img src={uploadedItem} alt="Uploaded item" style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }} />
            <button
              onClick={() => setUploadedItem(null)}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', cursor: 'pointer', backdropFilter: 'blur(4px)'
              }}
            >
              <X size={16} />
            </button>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} color={BRAND_ORANGE} /> Item Ready
              </span>
            </div>
          </div>
        )}
        <div style={{ marginTop: 32 }}>
           <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
             Don't have a specific item? Just click Next to skip.
           </p>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════
     SUMMARY + GENERATE (Step 6)
     ═══════════════════════════════════════ */
  const renderSummary = () => {
    const sel = {
      occasion: OCCASIONS.find((o) => o.id === selections.occasion),
      gender: GENDERS.find((g) => g.id === selections.gender),
      style: STYLES.find((s) => s.id === selections.style),
      budget: BUDGETS.find((b) => b.id === selections.budget),
    };

    const summaryCards = [
      { category: 'Occasion', image: sel.occasion?.image, name: sel.occasion?.label },
      { category: 'Gender', image: sel.gender?.image, name: sel.gender?.label },
      { category: 'Style', image: sel.style?.image, name: sel.style?.label },
      { category: 'Budget', image: sel.budget?.image, name: sel.budget?.label },
    ];

    return (
      <div style={{ width: '100%' }}>
        {/* Summary grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 10 : 14,
            marginBottom: 40,
          }}
        >
          {summaryCards.map((item) => (
            <div
              key={item.category}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: isMobile ? '18px 12px' : '24px 16px',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: BRAND_ORANGE,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                }}
              >
                {item.category}
              </span>
              <div style={{ height: 42, margin: '10px 0 6px', display: 'flex', justifyContent: 'center' }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ height: '100%', objectFit: 'contain', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
                  />
                ) : (
                  <span style={{ fontSize: 32 }}>❓</span>
                )}
              </div>
              <span
                style={{
                  fontSize: isMobile ? 13 : 15,
                  fontWeight: 500,
                  color: '#fff',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {item.name || 'Not selected'}
              </span>
            </div>
          ))}
        </div>

        {/* Generate button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: isGenerating
                ? 'rgba(232, 113, 42, 0.4)'
                : `linear-gradient(135deg, ${BRAND_ORANGE}, ${BRAND_ORANGE_LIGHT})`,
              border: 'none',
              borderRadius: 18,
              padding: isMobile ? '18px 36px' : '20px 56px',
              color: '#fff',
              fontSize: isMobile ? 16 : 19,
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              cursor: isGenerating ? 'wait' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isGenerating
                ? 'none'
                : `0 8px 36px ${BRAND_ORANGE_GLOW}`,
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (!isGenerating) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 12px 48px rgba(232, 113, 42, 0.5)`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 8px 36px ${BRAND_ORANGE_GLOW}`;
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Creating your look…
              </>
            ) : (
              <>
                <Sparkles size={22} />
                Generate My Look
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════ */
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#0B1120',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        position: 'relative',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          margin: '0 auto',
          padding: isMobile ? '18px 16px' : '28px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => (currentStep > 1 ? goBack() : navigate('/'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: 14,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
            padding: '8px 0',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <ArrowLeft size={18} />
          {currentStep > 1 ? 'Back' : 'Home'}
        </button>

        <span
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 16,
            color: BRAND_ORANGE,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          B4U-GO
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ padding: isMobile ? '6px 0 0' : '8px 0 0' }}>
        {renderProgressBar()}
        {!isMobile && renderStepLabels()}
      </div>

      {/* ── Step counter pill ── */}
      <div style={{ textAlign: 'center', marginTop: isMobile ? 16 : 20 }}>
        <span
          style={{
            display: 'inline-block',
            background: 'rgba(232, 113, 42, 0.12)',
            border: `1px solid rgba(232, 113, 42, 0.25)`,
            borderRadius: 100,
            padding: '5px 16px',
            fontSize: 12,
            fontWeight: 600,
            color: BRAND_ORANGE_LIGHT,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '0.04em',
          }}
        >
          Step {currentStep} of {STEPS.length}
        </span>
      </div>

      {/* ── Main content area ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: isMobile ? '20px 16px 40px' : '32px 24px 60px',
          maxWidth: 760,
          width: '100%',
          margin: '0 auto',
          opacity: stepVisible ? 1 : 0,
          transform: stepVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        {/* Step heading */}
        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: isMobile
              ? 'clamp(24px, 7vw, 34px)'
              : 'clamp(32px, 4vw, 46px)',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
          }}
        >
          {STEP_HEADERS[currentStep - 1].title}
        </h1>
        <p
          style={{
            fontSize: isMobile ? 13 : 15,
            color: 'rgba(255,255,255,0.38)',
            textAlign: 'center',
            marginBottom: isMobile ? 24 : 36,
            fontWeight: 400,
            maxWidth: 420,
            lineHeight: 1.5,
          }}
        >
          {STEP_HEADERS[currentStep - 1].subtitle}
        </p>

        {/* Step content — cards grid, upload, or summary */}
        {currentStep <= 4 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`,
              gap: isMobile ? 10 : 14,
              width: '100%',
            }}
          >
            {getOptions().map((item) =>
              renderCard(
                item,
                selections[getSelectionKey()] === item.id,
                () => handleSelect(getSelectionKey(), item.id)
              )
            )}
          </div>
        )}
        {currentStep === 5 && renderUploadStep()}
        {currentStep === 6 && renderSummary()}

        {/* ── Manual navigation (visible when user has selected & wants to correct) ── */}
        {currentStep > 1 && currentStep <= 5 && (
          <div
            style={{
              marginTop: 28,
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={goBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '10px 20px',
                color: 'rgba(255,255,255,0.55)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.22s',
                fontFamily: "'Outfit', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              <ArrowLeft size={14} />
              Back
            </button>
            {canProceed() && (
              <button
                onClick={goNext}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: BRAND_ORANGE,
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 24px',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.22s',
                  fontFamily: "'Outfit', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = BRAND_ORANGE_LIGHT;
                  e.currentTarget.style.transform = 'scale(1.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = BRAND_ORANGE;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Next
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '16px 0 24px', textAlign: 'center' }}>
        <p
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.12)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 400,
          }}
        >
          B4U-GO
        </p>
      </div>

      {/* ── Generating overlay ── */}
      {isGenerating && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(11, 17, 32, 0.9)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <div className="generating-pulse">
            <Sparkles size={52} color={BRAND_ORANGE} />
          </div>
          <p
            style={{
              fontSize: 20,
              color: 'white',
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '-0.01em',
            }}
          >
            Creating your perfect look…
          </p>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.35)',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
            }}
          >
            Our stylist is curating your look
          </p>
          {/* Animated progress bar */}
          <div
            style={{
              width: isMobile ? 200 : 280,
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
              marginTop: 8,
            }}
          >
            <div
              className="generating-bar"
              style={{
                height: '100%',
                borderRadius: 2,
                background: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_ORANGE_LIGHT})`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
