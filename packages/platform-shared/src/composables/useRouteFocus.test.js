/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable vue/one-component-per-file */

import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import useRouteFocus from './useRouteFocus';

function createTestRouter() {
  const PageA = defineComponent({ template: '<div>A</div>' });
  const PageB = defineComponent({ template: '<div>B</div>' });
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: PageA, name: 'Home' },
      { path: '/b', component: PageB, name: 'PageB' },
    ],
  });
}

function createAndAppendElement(id = 'appContent', tag = 'main') {
  const el = document.createElement(tag);
  el.id = id;
  el.focus = jest.fn();
  document.body.appendChild(el);
  return el;
}

/**
 * Mount with a real router so both @after-enter (via handleRouteAfterEnter)
 * and router.afterEach (same-route) can be tested.
 */
async function mountWithRouteFocus(selector) {
  const router = createTestRouter();
  await router.push('/');
  await router.isReady();

  let exposed;
  const TestComponent = defineComponent({
    setup() {
      const result = selector !== undefined ? useRouteFocus(selector) : useRouteFocus();
      exposed = result;
      return result;
    },
    template: '<div></div>',
  });

  const wrapper = mount(TestComponent, { global: { plugins: [router] } });
  return { wrapper, router, handleRouteAfterEnter: exposed.handleRouteAfterEnter };
}

describe('useRouteFocus', () => {
  let element;

  beforeEach(() => {
    element = createAndAppendElement();
  });

  afterEach(() => {
    if (element && element.parentNode) element.parentNode.removeChild(element);
  });

  // (a) handleRouteAfterEnter moves focus — used by @after-enter for cross-route transitions
  it('calls focus on the element when handleRouteAfterEnter is invoked', async () => {
    const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus();
    handleRouteAfterEnter();
    expect(element.focus).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  // (b) same-route navigation triggers focus via router.afterEach (core IAM-10141 fix)
  it('calls focus on same-route navigation (to.fullPath === from.fullPath)', async () => {
    const { wrapper, router } = await mountWithRouteFocus();
    // Navigate away first so from.name is defined, then back to same route
    await router.push('/b');
    await nextTick();
    element.focus.mockClear();
    // Same-route push: from=/b to=/b
    await router.push('/b');
    await nextTick();
    expect(element.focus).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  // (c) cross-route navigation does NOT focus via router.afterEach (handled by @after-enter)
  it('does not call focus via router.afterEach on cross-route navigation', async () => {
    const { wrapper, router } = await mountWithRouteFocus();
    await router.push('/b');
    await nextTick();
    // Cross-route: focus should NOT have fired via afterEach (only via @after-enter)
    expect(element.focus).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  // (d) initial page-load navigation is skipped (from.name === undefined)
  it('does not call focus on the initial page-load navigation', async () => {
    const freshRouter = createTestRouter();
    const TestComponent = defineComponent({
      setup() { return useRouteFocus(); },
      template: '<div></div>',
    });
    const wrapper = mount(TestComponent, { global: { plugins: [freshRouter] } });
    // Initial push: from = START (name undefined) → must be skipped
    await freshRouter.push('/');
    await nextTick();
    expect(element.focus).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  // (e) fr-auto-focused class is added on focus and focus is called with preventScroll:true
  it('adds the "fr-auto-focused" class and calls focus with preventScroll:true', async () => {
    const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus();
    handleRouteAfterEnter();
    expect(element.classList.contains('fr-auto-focused')).toBe(true);
    expect(element.focus).toHaveBeenCalledWith({ preventScroll: true });
    wrapper.unmount();
  });

  // (f) aria-label set from document.title page portion
  it('sets aria-label from the page portion of document.title', async () => {
    document.title = 'Platform Enduser - Dashboard';
    const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus();
    handleRouteAfterEnter();
    expect(element.getAttribute('aria-label')).toBe('Dashboard');
    document.title = '';
    wrapper.unmount();
  });

  // (g) auto-focused class removed on focusout
  it('removes the "auto-focused" class when focus leaves the element', async () => {
    const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus();
    handleRouteAfterEnter();
    element.dispatchEvent(new Event('focusout', { bubbles: true }));
    expect(element.classList.contains('fr-auto-focused')).toBe(false);
    wrapper.unmount();
  });

  // (h) relatedTarget=null (Alt+Tab out of browser) cleans up correctly
  it('removes "auto-focused" class when relatedTarget is null', async () => {
    const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus();
    handleRouteAfterEnter();
    const focusout = new Event('focusout', { bubbles: true });
    Object.defineProperty(focusout, 'relatedTarget', { value: null });
    element.dispatchEvent(focusout);
    expect(element.classList.contains('fr-auto-focused')).toBe(false);
    wrapper.unmount();
  });

  // (i) tabindex is never mutated
  it('does not modify the tabindex attribute', async () => {
    element.setAttribute('tabindex', '-1');
    const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus();
    handleRouteAfterEnter();
    expect(element.getAttribute('tabindex')).toBe('-1');
    element.dispatchEvent(new Event('focusout', { bubbles: true }));
    expect(element.getAttribute('tabindex')).toBe('-1');
    wrapper.unmount();
  });

  // (j) cleanup record cleared after focusout — subsequent call installs a fresh listener
  it('clears the cleanup record after focusout', async () => {
    const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus();
    handleRouteAfterEnter();
    element.dispatchEvent(new Event('focusout', { bubbles: true }));
    const removeEventListenerSpy = jest.spyOn(element, 'removeEventListener');
    handleRouteAfterEnter();
    expect(removeEventListenerSpy).not.toHaveBeenCalled();
    removeEventListenerSpy.mockRestore();
    wrapper.unmount();
  });

  // (k) unmount removes focusout listener and clears class
  it('removes the focusout listener and clears class on unmount', async () => {
    const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus();
    handleRouteAfterEnter();
    const removeListenerSpy = jest.spyOn(element, 'removeEventListener');
    wrapper.unmount();
    expect(removeListenerSpy).toHaveBeenCalledWith('focusout', expect.any(Function));
    expect(element.classList.contains('fr-auto-focused')).toBe(false);
    removeListenerSpy.mockRestore();
  });

  // (l) unmount stops same-route afterEach from firing
  it('stops same-route focus after unmount', async () => {
    const { wrapper, router } = await mountWithRouteFocus();
    await router.push('/b');
    await nextTick();
    wrapper.unmount();
    element.focus.mockClear();
    await router.push('/b');
    await nextTick();
    expect(element.focus).not.toHaveBeenCalled();
  });

  // (m) no-op when element absent
  it('does not throw when no element matches the selector', async () => {
    const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus('#nonExistent');
    expect(() => handleRouteAfterEnter()).not.toThrow();
    wrapper.unmount();
  });

  // (n) configurable selector
  it('focuses an element matching a custom selector', async () => {
    const customEl = document.createElement('div');
    customEl.id = 'customTarget';
    customEl.focus = jest.fn();
    document.body.appendChild(customEl);
    try {
      const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus('#customTarget');
      handleRouteAfterEnter();
      expect(customEl.focus).toHaveBeenCalledTimes(1);
      wrapper.unmount();
    } finally {
      document.body.removeChild(customEl);
    }
  });

  // (o) guard: class already present — no duplicate listener added
  it('does not add "auto-focused" class if already present', async () => {
    const { wrapper, handleRouteAfterEnter } = await mountWithRouteFocus();
    handleRouteAfterEnter();
    const addSpy = jest.spyOn(element.classList, 'add');
    handleRouteAfterEnter();
    expect(addSpy).not.toHaveBeenCalled();
    addSpy.mockRestore();
    wrapper.unmount();
  });
});
