import { describe, it, expect } from 'vitest';
import { formatTime } from '../utils/timeUtils.js';

describe('formatTime', () => {
  it('formats seconds correctly', () => {
    expect(formatTime(3661)).toBe('01:01:01');
    expect(formatTime(0)).toBe('00:00:00');
    expect(formatTime(3600)).toBe('01:00:00');
  });
});

// This test verifies that the formatTime function formats seconds correctly.