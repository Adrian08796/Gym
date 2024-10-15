// jest-setup.js

import { vi } from 'vitest';

// Mock the import.meta.env object
vi.mock('import.meta.env', () => ({
  VITE_BACKEND_HOST: 'http://localhost:4500/api'
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});