import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as utils from '../utils/buildEventSource';

const buildEventSourceSpy = jest.spyOn(utils, 'buildEventSource');

buildEventSourceSpy.mockReturnValue({
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
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
