import { describe, expect, it } from 'vitest';
import { hotkeyAction } from './useHotkeys';

const keydown = (key, target = document.body, init = {}) => {
  const event = new KeyboardEvent('keydown', { key, ...init });
  Object.defineProperty(event, 'target', { value: target });
  return event;
};

describe('hotkeyAction', () => {
  it('maps keys to actions', () => {
    expect(hotkeyAction(keydown(' '))).toBe('toggle');
    expect(hotkeyAction(keydown('k'))).toBe('toggle');
    expect(hotkeyAction(keydown('ArrowUp'))).toBe('volumeUp');
    expect(hotkeyAction(keydown('ArrowDown'))).toBe('volumeDown');
    expect(hotkeyAction(keydown('x'))).toBeNull();
  });

  it('leaves space alone on buttons and form fields', () => {
    expect(hotkeyAction(keydown(' ', document.createElement('button')))).toBe(
      null
    );
    expect(hotkeyAction(keydown(' ', document.createElement('input')))).toBe(
      null
    );
  });

  it('leaves arrows alone on the volume slider', () => {
    expect(
      hotkeyAction(keydown('ArrowUp', document.createElement('input')))
    ).toBeNull();
  });

  it('ignores shortcuts with modifiers', () => {
    expect(hotkeyAction(keydown('k', document.body, { metaKey: true }))).toBe(
      null
    );
  });
});
