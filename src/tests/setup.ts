import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-inter', className: 'inter' }),
}));

// Suppress console.error in tests unless it matters
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
    originalError.call(console, ...args);
  };
});
afterAll(() => { console.error = originalError; });
