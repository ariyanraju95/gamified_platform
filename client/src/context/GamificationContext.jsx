import { createContext, useContext, useState, useCallback } from 'react';
import { getMyGamificationState } from '../services/gamification.service';

const GamificationContext = createContext(null);

export const GamificationProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const [xpPopup, setXpPopup] = useState(null); // { xpEarned, multiplier }

  const refresh = useCallback(async () => {
    try {
      const { data } = await getMyGamificationState();
      setState(data);
    } catch (_) {}
  }, []);

  const showXPGain = (xpEarned, multiplier, badges = []) => {
    setXpPopup({ xpEarned, multiplier });
    if (badges.length > 0) setNewBadges(badges);
    setTimeout(() => setXpPopup(null), 3500);
    setTimeout(() => setNewBadges([]), 5000);
  };

  return (
    <GamificationContext.Provider value={{ state, refresh, showXPGain, xpPopup, newBadges, setNewBadges }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
};
