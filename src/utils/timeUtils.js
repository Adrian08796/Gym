// src/utils/timeUtils.js

/**
 * Formats a number of seconds into a string representation of hours, minutes, and seconds
 * @param {number} seconds - The number of seconds to format
 * @returns {string} A formatted string in the format "HH:MM:SS"
 */
export const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };