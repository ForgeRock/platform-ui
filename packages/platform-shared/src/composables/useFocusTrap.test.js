/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { useFocusTrap } from './useFocusTrap';

describe('useFocusTrap composable', () => {
  let popup;
  let trap;

  const createPopup = (tabableCount = 3) => {
    const el = document.createElement('div');
    el.innerHTML = Array.from({ length: tabableCount }, (_, i) => `<button id="btn-${i}">${i}</button>`).join('');
    document.body.appendChild(el);
    return el;
  };

  const tabEvent = (shiftKey = false) => {
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    return event;
  };

  beforeEach(() => {
    popup = createPopup();
    trap = useFocusTrap(() => popup);
    trap.activate();
  });

  afterEach(() => {
    trap.deactivate();
    popup.remove();
  });

  it('wraps Tab from the last tabable element to the first', () => {
    const last = popup.querySelector('#btn-2');
    last.focus();
    popup.dispatchEvent(tabEvent());
    expect(document.activeElement).toBe(popup.querySelector('#btn-0'));
  });

  it('wraps Shift+Tab from the first tabable element to the last', () => {
    const first = popup.querySelector('#btn-0');
    first.focus();
    popup.dispatchEvent(tabEvent(true));
    expect(document.activeElement).toBe(popup.querySelector('#btn-2'));
  });

  it('does not interfere with Tab between interior elements', () => {
    // jsdom does not run the browser's default focus-move for dispatched keydown,
    // so assert our handler stayed hands-off: no preventDefault
    popup.querySelector('#btn-0').focus();
    const event = tabEvent();
    popup.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(popup.querySelector('#btn-0'));
  });

  it('does not preventDefault when not at the boundary (browser default focus move proceeds)', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    popup.querySelector('#btn-0').focus();
    popup.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('does not wrap when the popup has fewer than two tabable elements', () => {
    trap.deactivate();
    popup.remove();
    popup = createPopup(1);
    trap.activate();

    popup.querySelector('#btn-0').focus();
    const event = tabEvent();
    popup.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('stops handling Tab after deactivate', () => {
    trap.deactivate();
    popup.querySelector('#btn-2').focus();
    const event = tabEvent();
    popup.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(popup.querySelector('#btn-2'));
  });

  it('supports a ref-wrapped element', () => {
    const refTrap = useFocusTrap({ value: popup });
    refTrap.activate();
    popup.querySelector('#btn-2').focus();
    popup.dispatchEvent(tabEvent());
    expect(document.activeElement).toBe(popup.querySelector('#btn-0'));
    refTrap.deactivate();
  });

  it('supports a plain element instead of a getter or ref', () => {
    const elementTrap = useFocusTrap(popup);
    elementTrap.activate();
    popup.querySelector('#btn-2').focus();
    popup.dispatchEvent(tabEvent());
    expect(document.activeElement).toBe(popup.querySelector('#btn-0'));
    elementTrap.deactivate();
  });
});
