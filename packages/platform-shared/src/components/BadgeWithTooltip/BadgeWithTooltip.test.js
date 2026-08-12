/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import BadgeWithTooltip from './index';

/**
 * jsdom returns all-zero rects, which BootstrapVue treats as "not visible" and
 * refuses to show the tooltip. Stub a real-looking rect on the target so
 * BTooltip's isVisible() check passes and the tooltip actually renders.
 */
function stubTargetVisibility(target) {
  target.getBoundingClientRect = () => ({
    width: 100, height: 20, top: 0, left: 0, right: 100, bottom: 20,
  });
}

/**
 * BTooltip has a default show delay (50ms) and creates its popper
 * asynchronously; poll a few ticks so the tooltip has actually rendered
 * before asserting on its content/ARIA wiring.
 */
async function waitForTooltip() {
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < 10; i += 1) {
    await flushPromises();
    await new Promise((resolve) => { setTimeout(resolve, 50); });
  }
  /* eslint-enable no-await-in-loop */
}

function setup(props = {}, slots = {}) {
  return mount(BadgeWithTooltip, {
    global: {
      plugins: [i18n],
    },
    props: {
      tooltipText: 'This is a development template',
      variant: 'warning',
      ...props,
    },
    slots: {
      default: 'Development',
      ...slots,
    },
    attachTo: document.body,
  });
}

describe('BadgeWithTooltip', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }
  });

  describe('@renders', () => {
    it('renders a single-root BBadge with the default slot content, the variant prop, and tabindex 0', () => {
      wrapper = setup();
      const badge = wrapper.findComponent({ name: 'BBadge' });

      expect(badge.exists()).toBe(true);
      expect(wrapper.element).toBe(badge.element);
      expect(badge.text()).toBe('Development');
      expect(badge.classes()).toContain('badge-warning');
      expect(badge.attributes('tabindex')).toBe('0');
    });

    it('applies the variant prop to the badge', () => {
      wrapper = setup({ variant: 'success' });
      const badge = wrapper.findComponent({ name: 'BBadge' });

      expect(badge.classes()).toContain('badge-success');
    });

    it('falls through a class attribute to the badge, since the component has a single root node', () => {
      wrapper = mount(BadgeWithTooltip, {
        global: { plugins: [i18n] },
        props: { tooltipText: 'This is a development template', variant: 'warning' },
        attrs: { class: 'ml-2' },
        slots: { default: 'Development' },
        attachTo: document.body,
      });
      const badge = wrapper.findComponent({ name: 'BBadge' });

      expect(badge.classes()).toContain('ml-2');
    });

    it('falls through a tabindex attribute to override the default tabindex of 0', () => {
      wrapper = mount(BadgeWithTooltip, {
        global: { plugins: [i18n] },
        props: { tooltipText: 'This is a development template', variant: 'warning' },
        attrs: { tabindex: '-1' },
        slots: { default: 'Development' },
        attachTo: document.body,
      });
      const badge = wrapper.findComponent({ name: 'BBadge' });

      expect(badge.attributes('tabindex')).toBe('-1');
    });

    it('renders a BTooltip targeting the badge id with hover and focus triggers', () => {
      wrapper = setup();
      const badge = wrapper.findComponent({ name: 'BBadge' });
      const tooltip = wrapper.findComponent({ name: 'BTooltip' });

      expect(tooltip.exists()).toBe(true);
      expect(tooltip.props('triggers')).toBe('hover focus');
      expect(tooltip.props('target')).toBe(badge.attributes('id'));
    });

    it('renders the visually-hidden description span only when the srDescription prop is enabled', () => {
      wrapper = setup();
      expect(wrapper.find('.sr-only').exists()).toBe(false);

      wrapper.unmount();
      wrapper = setup({ srDescription: true });

      const srSpan = wrapper.find('.sr-only');
      expect(srSpan.exists()).toBe(true);
      expect(srSpan.text()).toBe('This is a development template');
    });

    it('renders the tooltipText prop as the tooltip content once shown', async () => {
      wrapper = setup();
      await flushPromises();
      const badge = wrapper.findComponent({ name: 'BBadge' });
      stubTargetVisibility(badge.element);
      const tooltip = wrapper.findComponent({ name: 'BTooltip' });

      tooltip.vm.doOpen();
      await waitForTooltip();

      const tooltipContent = document.querySelector('.tooltip-inner');
      expect(tooltipContent).not.toBeNull();
      expect(tooltipContent.textContent.trim()).toBe('This is a development template');
    });

    it('generates a unique id per instance', () => {
      const wrapperOne = setup();
      wrapper = setup();

      const idOne = wrapperOne.findComponent({ name: 'BBadge' }).attributes('id');
      const idTwo = wrapper.findComponent({ name: 'BBadge' }).attributes('id');
      wrapperOne.unmount();

      expect(idOne).toBeTruthy();
      expect(idTwo).toBeTruthy();
      expect(idOne).not.toBe(idTwo);
    });
  });

  describe('@accessibility', () => {
    it('opens the tooltip on a real keyboard focus event and hides it on blur', async () => {
      wrapper = setup();
      await flushPromises();
      const badge = wrapper.findComponent({ name: 'BBadge' });
      stubTargetVisibility(badge.element);

      badge.element.focus();
      badge.element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await waitForTooltip();

      let tooltipContent = document.querySelector('.tooltip-inner');
      expect(tooltipContent).not.toBeNull();
      expect(tooltipContent.textContent.trim()).toBe('This is a development template');

      badge.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      await waitForTooltip();

      tooltipContent = document.querySelector('.tooltip-inner');
      expect(tooltipContent).toBeNull();
    });

    it('links the badge to the tooltip content via aria-describedby once the tooltip is shown', async () => {
      wrapper = setup();
      await flushPromises();
      const badge = wrapper.findComponent({ name: 'BBadge' });
      stubTargetVisibility(badge.element);

      badge.element.focus();
      badge.element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await waitForTooltip();

      const describedBy = badge.attributes('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy)).not.toBeNull();
      expect(document.getElementById(describedBy).textContent).toContain('This is a development template');
    });

    it('permanently links the badge to the visually-hidden description via aria-describedby while the tooltip is closed and open', async () => {
      wrapper = setup({ srDescription: true });
      await flushPromises();
      const badge = wrapper.findComponent({ name: 'BBadge' });
      stubTargetVisibility(badge.element);

      const srSpan = wrapper.find('.sr-only');
      const srDescriptionId = srSpan.attributes('id');

      // Closed: the persistent attribute is present before any focus or
      // tooltip interaction, pointing at the hidden description.
      expect(badge.attributes('aria-describedby')).toBe(srDescriptionId);
      expect(srSpan.attributes('hidden')).toBeUndefined();

      badge.element.focus();
      badge.element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await waitForTooltip();

      // Open: exactly one description source is live — the tooltip node
      // (BootstrapVue appends its id alongside the persistent binding) and
      // the span is hidden to avoid the warning being announced twice.
      const describedBy = badge.attributes('aria-describedby');
      expect(describedBy).toContain(srDescriptionId);
      expect(describedBy).not.toBe(srDescriptionId);
      expect(srSpan.attributes('hidden')).toBeDefined();
      expect(document.querySelector('.tooltip-inner').textContent.trim()).toBe('This is a development template');

      badge.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      await waitForTooltip();

      /**
       * BootstrapVue removes its id from aria-describedby in
       * destroyTemplate(), which runs on the template's hidden transition
       * cleanup. jsdom never completes the fade (and vue-compat never emits
       * the vNodeUnmounted hook event), so the stale tooltip id can linger
       * in the attribute here; in real browsers the fade completes and the
       * cleanup restores the attribute. Either way the lingering id is
       * harmless: the tooltip node is removed from the DOM, and
       * aria-describedby references to missing nodes are ignored, so the
       * hidden span is the live description again.
       */
      expect(badge.attributes('aria-describedby')).toContain(srDescriptionId);
      expect(srSpan.attributes('hidden')).toBeUndefined();
    });

    /**
     * The "region" rule is disabled because the component is tested in isolation
     * (no outer <main> landmark), which is normal for unit tests.
     */
    it('has no axe accessibility violations while the tooltip is closed', async () => {
      wrapper = setup();
      await runA11yTest(wrapper, {
        overrideRules: { region: { enabled: false } },
      });
    });

    it('has no axe accessibility violations while the tooltip is open', async () => {
      wrapper = setup();
      await flushPromises();
      const badge = wrapper.findComponent({ name: 'BBadge' });
      stubTargetVisibility(badge.element);
      const tooltip = wrapper.findComponent({ name: 'BTooltip' });

      tooltip.vm.doOpen();
      await waitForTooltip();

      /**
       * BTooltip renders into document.body as a sibling of the mount
       * container, so the tooltip markup must be scanned separately from
       * the badge subtree to actually audit its accessible tree.
       */
      await runA11yTest(document.body, {
        overrideRules: { region: { enabled: false } },
      });
    });
  });
});
