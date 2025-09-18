/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  mount,
} from '@vue/test-utils';
import {
  ref, nextTick, defineComponent,
} from 'vue';
import floatingElementPosition from './floatingElementPosition';

describe('floatingElementPosition (Jest)', () => {
  beforeEach(() => {
    window.getComputedStyle = () => ({
      paddingBottom: '10px',
    });

    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 80,
    });

    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        top: 100,
        bottom: 150,
        left: 200,
        right: 300,
        width: 100,
        height: 50,
      }),
    });
  });

  /**
   * Mount a test component using the composable
   * @param {Object} options
   * @param {boolean} options.alignRight
   * @param {boolean} options.enabled
   * @param {boolean} options.initialVisible
   * @returns wrapper and utilities
   */
  function createTestComponent({
    alignRight = false,
    enabled = true,
    initialVisible = false,
  } = {}) {
    const TestComponent = defineComponent({
      template: `
        <div>
          <button ref="target" @click="show" data-testid="target">Toggle</button>
          <div
            v-if="isVisible"
            ref="floating"
            :style="floatingStyle"
            data-testid="floating"
          >
            Floating Content
          </div>
        </div>
      `,
      setup() {
        const isVisible = ref(initialVisible);
        const targetRef = ref(null);
        const floatingRef = ref(null);

        const show = () => {
          isVisible.value = !isVisible.value;
        };

        const { floatingStyle } = floatingElementPosition({
          alignRight,
          enabled,
          isVisible,
          targetRef,
          floatingRef,
        });

        return {
          isVisible,
          show,
          target: targetRef,
          floating: floatingRef,
          floatingStyle,
        };
      },
    });

    const wrapper = mount(TestComponent);
    return {
      wrapper,
      getTarget: () => wrapper.get('[data-testid="target"]'),
      getFloating: () => wrapper.get('[data-testid="floating"]'),
      showFloating: async () => {
        await wrapper.get('[data-testid="target"]').trigger('click');
        await nextTick();
      },
    };
  }

  it('applies correct styles on show (alignRight: false)', async () => {
    const { showFloating, getFloating } = createTestComponent({ alignRight: false });

    await showFloating();

    const floating = getFloating();
    expect(floating.element.style.position).toBe('fixed');
    expect(floating.element.style.transform).toBe('translate(200px, 140px)');
  });

  it('applies correct styles when alignRight is true', async () => {
    const { showFloating, getFloating } = createTestComponent({ alignRight: true });

    await showFloating();

    const floating = getFloating();

    expect(floating.element.style.transform).toBe('translate(220px, 140px)');
  });

  it('does not apply styles if enabled is false', async () => {
    const { showFloating, getFloating } = createTestComponent({ enabled: false });

    await showFloating();

    const floating = getFloating();

    expect(floating.element.style.position).toBe('');
    expect(floating.element.style.transform).toBe('');
  });

  it('does not render floating element if isVisible is false', () => {
    const { wrapper } = createTestComponent({ initialVisible: false });

    expect(wrapper.find('[data-testid="floating"]').exists()).toBe(false);
  });

  it('adds scroll and resize listeners when visible and removes on unmount', async () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { wrapper, showFloating } = createTestComponent({ enabled: true });
    // open the floating element
    await showFloating();

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).not.toHaveBeenCalledWith('scroll', expect.any(Function), true);
    expect(removeEventListenerSpy).not.toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(0);

    // close the floating element
    await showFloating();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);

    wrapper.unmount();

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(4);

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
