import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('b4ugo_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (name: string) => {
    const newUser = { name };
    localStorage.setItem('b4ugo_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('b4ugo_user');
    setUser(null);
  };

  return { user, login, logout };
};

export interface SavedLook {
  id: string;
  date: string;
  vibe: string;
  imageUrl: string;
  top: string;
  bottom: string;
}

export const useCloset = () => {
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('b4ugo_closet');
    if (stored) {
      setSavedLooks(JSON.parse(stored));
    }
  }, []);

  const saveLook = (look: Omit<SavedLook, 'id' | 'date'>) => {
    const newLook = {
      ...look,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
    };
    const updated = [newLook, ...savedLooks];
    localStorage.setItem('b4ugo_closet', JSON.stringify(updated));
    setSavedLooks(updated);
  };

  return { savedLooks, saveLook };
};
