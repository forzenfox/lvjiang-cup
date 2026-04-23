import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import type { ThanksData } from '@/data/types';

vi.hoisted(() => {
  const mockThanksData: ThanksData = {
    sponsors: [{ name: 'Test Sponsor', tier: 'gold' }],
    staff: [{ name: 'Test Staff', role: 'Organizer' }],
  };
  Object.defineProperty(window, 'THANKS_DATA', {
    value: mockThanksData,
    writable: true,
    configurable: true,
  });
});

beforeEach(() => {
  window.APP_CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api',
    APP_NAME: '驴酱杯赛事',
    VERSION: '1.0.0',
    GITHUB_CDN_BASE: 'https://cdn.jsdmirror.com/gh/forzenfox/lvjiang-cup@main',
  };
});

afterEach(() => {
  cleanup();
});
