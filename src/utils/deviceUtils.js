// src/utils/deviceUtils.js

export const canVibrate = () => {
    return 'vibrate' in navigator;
  };
  
  export const vibrateDevice = (pattern = [200, 100, 200]) => {
    if (canVibrate()) {
      navigator.vibrate(pattern);
    }
  };