import React, { useState } from 'react';
import { useAuth } from './lib/auth';
import { X } from 'lucide-react';

const BRAND_ORANGE = '#E8712A';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: { isOpen: boolean, onClose: () => void, onLoginSuccess?: () => void }) {
  const [name, setName] = useState('');
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim());
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#151A2A', padding: 40, borderRadius: 24, width: '90%', maxWidth: 400,
        border: '1px solid rgba(255,255,255,0.05)', position: 'relative',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, textTransform: 'uppercase', color: 'white', margin: '0 0 8px 0', letterSpacing: '0.02em' }}>
          Join B4U-GO
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 }}>Enter your name to start curating your personal style archive.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your First Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%', padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 16, marginBottom: 24,
              fontFamily: "'Outfit', sans-serif"
            }}
            autoFocus
          />
          <button type="submit" disabled={!name.trim()} style={{
            width: '100%', padding: '16px', background: name.trim() ? BRAND_ORANGE : 'rgba(255,255,255,0.05)',
            color: name.trim() ? 'white' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: 12,
            fontSize: 16, fontWeight: 600, cursor: name.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s'
          }}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
