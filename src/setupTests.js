import '@testing-library/jest-dom';

Object.defineProperty(window, 'EventSource', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    CLOSED: 0,
    CONNECTING: 0,
    OPEN: 0,
    dispatchEvent(event) {
      return false;
    },
    onerror: jest.fn(),
    onmessage: jest.fn(),
    onopen: jest.fn(),
    readyState: 0,
    url: '',
    withCredentials: false,
    addEventListener: jest.fn(),
    close: jest.fn(),
    removeEventListener: jest.fn()
  }))
});
