/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { onBeforeUnmount, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const AUTO_FOCUSED_CLASS = 'fr-auto-focused';

/**
 * Composable that moves keyboard focus to a target element after route
 * transitions, supporting WCAG 2.4.3.
 *
 * Two triggers are used together:
 *  - `handleRouteAfterEnter`: returned callback, wired to `@after-enter` on
 *    the wrapping `<Transition>`. Fires after the fade completes for cross-route
 *    navigations — guarantees focus moves only once content is fully visible,
 *    which matters for magnification users.
 *  - `router.afterEach`: handles same-route activations (e.g. pressing Enter
 *    on the already-active Dashboard link) where no transition enter cycle runs.
 *    Skips the initial page-load navigation (from.name === undefined).
 *
 * The target element (#appContent) keeps tabindex="-1" permanently so it does
 * not appear in the natural tab sequence. Shift+Tab from the first focusable
 * child inside #appContent will land on the last focusable item before it in
 * DOM order (the nav) — this is the correct spec-defined behaviour and does
 * not fail WCAG 2.4.3, which does not require backward navigation to return
 * to a landmark container.
 *
 * Currently wired in platform-enduser only. platform-admin has the same
 * #appContent landmark and could use this composable, but is intentionally
 * out of scope for IAM-10141.
 *
 * @param {string} selector - CSS selector for the focus target (default: '#appContent')
 * @returns {{ handleRouteAfterEnter: Function }}
 */
export default function useRouteFocus(selector = '#appContent', navSelector = '#fr-sidebar-nav') {
  let autoFocusCleanup = null;
  let isPointerNavigation = false;

  // Attached in onMounted so the DOM exists when the listener is registered.
  const onNavPointerDown = () => { isPointerNavigation = true; };
  let nav = null;
  onMounted(() => {
    nav = document.querySelector(navSelector);
    if (nav) nav.addEventListener('pointerdown', onNavPointerDown);
  });

  function focusTarget() {
    const element = document.querySelector(selector);

    if (!element || typeof element.focus !== 'function') {
      return;
    }

    const pointerTriggered = isPointerNavigation;
    isPointerNavigation = false;

    if (!pointerTriggered && !element.classList.contains(AUTO_FOCUSED_CLASS)) {
      if (autoFocusCleanup?.element && autoFocusCleanup?.handler) {
        autoFocusCleanup.element.removeEventListener('focusout', autoFocusCleanup.handler);
      }

      const onFocusOut = () => {
        element.classList.remove(AUTO_FOCUSED_CLASS);
        element.removeEventListener('focusout', onFocusOut);
        if (autoFocusCleanup?.element === element && autoFocusCleanup?.handler === onFocusOut) {
          autoFocusCleanup = null;
        }
      };

      element.classList.add(AUTO_FOCUSED_CLASS);
      element.addEventListener('focusout', onFocusOut);
      autoFocusCleanup = { element, handler: onFocusOut };
    }

    // Set aria-label from the page portion of document.title so screen readers
    // announce the destination (e.g. "Dashboard, main") rather than just "main".
    if (document.title) {
      const sep = document.title.indexOf(' - ');
      const pageLabel = sep !== -1 ? document.title.slice(sep + 3) : document.title;
      if (pageLabel) element.setAttribute('aria-label', pageLabel);
    }

    element.focus({ preventScroll: true });
  }

  const router = useRouter();
  // Same-route navigations (e.g. pressing Enter on the already-active nav link)
  // do not trigger a new <Transition> enter cycle, so @after-enter never fires.
  // Handle them here: when to and from are the same path, focus immediately.
  const removeAfterEach = router.afterEach((to, from) => {
    if (from.name === undefined) return;
    if (to.fullPath === from.fullPath) focusTarget();
  });

  onBeforeUnmount(() => {
    if (nav) nav.removeEventListener('pointerdown', onNavPointerDown);
    removeAfterEach();
    if (autoFocusCleanup?.element && autoFocusCleanup?.handler) {
      autoFocusCleanup.element.removeEventListener('focusout', autoFocusCleanup.handler);
      autoFocusCleanup.element.classList.remove(AUTO_FOCUSED_CLASS);
      autoFocusCleanup = null;
    }
  });

  return { handleRouteAfterEnter: focusTarget };
}
