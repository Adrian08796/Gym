// src/hooks/useRestTimer.js

import { useState, useEffect, useCallback } from 'react';

const useRestTimer = (initialTime, onTimerEnd) => {
  const [isResting, setIsResting] = useState(false);
  const [remainingRestTime, setRemainingRestTime] = useState(initialTime);

  useEffect(() => {
    let timer;
    if (isResting && remainingRestTime > 0) {
      timer = setInterval(() => {
        setRemainingRestTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (remainingRestTime === 0 && isResting) {
      setIsResting(false);
      onTimerEnd();
      
      // Trigger vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(1000); // Vibrate for 1 second
      }

      // Show alert
      alert('Rest time is over. Ready for the next set!');
    }
    return () => clearInterval(timer);
  }, [isResting, remainingRestTime, onTimerEnd]);

  const startRestTimer = useCallback(() => {
    setIsResting(true);
    setRemainingRestTime(initialTime);
  }, [initialTime]);

  const skipRestTimer = useCallback(() => {
    setIsResting(false);
    setRemainingRestTime(0);
  }, []);

  return { isResting, remainingRestTime, startRestTimer, skipRestTimer };
};

export default useRestTimer;