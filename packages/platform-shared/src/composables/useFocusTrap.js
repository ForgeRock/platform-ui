/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Focus containment for BootstrapVue non-modal popups (IAM-11385): Tab cycles within
 * the open popup (WAI-ARIA APG dialog pattern); dismissal stays with the popup itself
 * (Escape, selection, outside interaction).
 *
 * @param {Function|Ref|Element} popup The popup element, a ref wrapping it, or a getter
 *                                     resolving to it (resolved live, since BootstrapVue
 *                                     re-renders the popup node on open/close).
 * @returns {{ activate: Function, deactivate: Function }}
 */
export function useFocusTrap(popup) {
  // Mirrors BootstrapVue's internal getTabables selector.
  const TABABLE_SELECTOR = 'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, object, embed, *[tabindex]:not([tabindex^="-"]), audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';

  // Raw elements are returned as-is; a ref's .value is unwrapped.
  const resolvePopup = () => {
    if (typeof popup === 'function') return popup();
    return popup instanceof Element ? popup : popup?.value;
  };

  let active = false;
  let handleKeydown = null;

  /**
   * Collects the currently tabable elements inside the popup, in DOM order.
   * @returns {Array<HTMLElement>} Focusable elements, or an empty array when inactive
   */
  function getTabables() {
    const currentPopup = resolvePopup();
    if (!currentPopup || !currentPopup.isConnected) return [];
    return Array.from(currentPopup.querySelectorAll(TABABLE_SELECTOR))
      // jsdom has no layout; check computed display, not offsetParent
      .filter((el) => getComputedStyle(el).display !== 'none');
  }

  /**
   * Cycles focus within the popup when Tab would otherwise exit it.
   * @param {KeyboardEvent} event The Tab keydown event
   * @returns {void}
   */
  function wrapFocus(event) {
    const tabables = getTabables();
    if (tabables.length < 2) return;

    const currentIndex = tabables.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    const goingBack = event.shiftKey;
    const atBoundary = goingBack ? currentIndex === 0 : currentIndex === tabables.length - 1;
    if (!atBoundary) return;

    event.preventDefault();
    const target = goingBack ? tabables[tabables.length - 1] : tabables[0];
    target.focus();
  }

  return {
    activate() {
      if (active) return;
      active = true;
      handleKeydown = (event) => {
        if (event.key === 'Tab') wrapFocus(event);
      };
      const currentPopup = resolvePopup();
      if (currentPopup) {
        currentPopup.addEventListener('keydown', handleKeydown);
      }
    },
    deactivate() {
      if (!active) return;
      active = false;
      const currentPopup = resolvePopup();
      if (currentPopup) {
        currentPopup.removeEventListener('keydown', handleKeydown);
      }
      handleKeydown = null;
    },
  };
}
