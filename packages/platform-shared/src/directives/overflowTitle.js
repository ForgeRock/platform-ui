/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Directive to add title attribute if text overflows its container
 * Usage: v-overflow-title="titleText"
 */
export default {
  inserted(el, binding) {
    const checkOverflow = () => {
      if (el.scrollWidth > el.clientWidth) {
        el.setAttribute('title', binding.value);
      } else {
        el.removeAttribute('title');
      }
    };

    // Initial check
    checkOverflow();

    // Use ResizeObserver for responsive behavior
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(el);

    // Store observer for cleanup
    el._overflowObserver = resizeObserver;
  },
  update(el, binding) {
    if (el.scrollWidth > el.clientWidth) {
      el.setAttribute('title', binding.value);
    } else {
      el.removeAttribute('title');
    }
  },
  unbind(el) {
    if (el._overflowObserver) {
      el._overflowObserver.disconnect();
      delete el._overflowObserver;
    }
  },
};
