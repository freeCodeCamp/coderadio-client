import EventSource from 'eventsourcemock';
import '@testing-library/jest-dom';

Object.defineProperty(window, 'EventSource', {
  value: EventSource
});
