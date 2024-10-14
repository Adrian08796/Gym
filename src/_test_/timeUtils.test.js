// src/__tests__/timeUtils.test.js
import { formatTime } from '../utils/timeUtils.js';

describe('formatTime', () => {
  test('formats seconds correctly', () => {
    expect(formatTime(3661)).toBe('01:01:01');
    expect(formatTime(0)).toBe('00:00:00');
    expect(formatTime(3600)).toBe('01:00:00');
  });
});