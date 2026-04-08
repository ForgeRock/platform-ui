/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  ref, watch, nextTick, onUnmounted,
} from 'vue';

/**
 * Positions a floating element relative to a target element.
 * @param {Object} options
 * @param {Ref<HTMLElement>} options.targetRef - Reference to the target element.
 * @param {Ref<HTMLElement>} options.floatingRef - Reference to the floating element to be positioned.
 * @param {Ref<boolean>} options.isVisible - Reactive boolean indicating if the floating element is visible.
 * @param {boolean} [options.enabled=false] - Whether the positioning logic is enabled.
 * @param {boolean} [options.alignRight=false] - Align element to the right of the trigger.
 * @returns {{ floatingStyle: Ref<Object> }} Object containing floating element styles reactive ref.
 */
export default function floatingElementPosition({
  alignRight = false,
  targetRef,
  enabled = false,
  isVisible,
  floatingRef,
  floatingElementStyles = {},
}) {
  const floatingStyle = ref({});

  function updatePosition() {
    const target = targetRef?.value;
    const floating = floatingRef?.value;
    if (!target || !floating) return;

    const targetRect = target.getBoundingClientRect();
    const targetStyles = getComputedStyle(target);
    const targetPaddingBottom = parseFloat(targetStyles.paddingBottom) || 0;
    const targetPaddingTop = parseFloat(targetStyles.paddingTop) || 0;

    const floatingHeight = floating.getBoundingClientRect().height;
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - targetRect.bottom;
    // open above only when there is more space above than below
    const spaceAbove = targetRect.top - targetPaddingTop;
    const showAbove = spaceBelow < floatingHeight && spaceAbove > spaceBelow;

    const translateY = showAbove
      ? targetRect.top - floatingHeight + targetPaddingTop
      : targetRect.bottom - targetPaddingBottom;

    const translateX = alignRight
      ? targetRect.right - floating.offsetWidth
      : targetRect.left;

    floatingStyle.value = {
      ...floatingElementStyles,
      position: 'fixed',
      top: '0',
      left: '0',
      transform: `translate(${translateX}px, ${translateY}px)`,
      maxHeight: `${showAbove ? spaceAbove : spaceBelow}px`,
      overflowY: 'auto',
    };
  }

  function addListeners() {
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
  }

  function removeListeners() {
    window.removeEventListener('scroll', updatePosition, true);
    window.removeEventListener('resize', updatePosition);
  }

  watch(isVisible, async (isVisibleValue) => {
    await nextTick();
    if (!enabled) return;
    if (isVisibleValue) {
      updatePosition();
      addListeners();
    } else {
      removeListeners();
    }
  });

  onUnmounted(() => {
    removeListeners();
  });

  return {
    floatingStyle,
  };
}
