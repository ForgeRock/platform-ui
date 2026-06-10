/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { axe } from 'jest-axe';
import i18n from '@/i18n';
import EscConfirmModal from './EscConfirmModal';

function setup(props = {}) {
  return mount(EscConfirmModal, {
    global: {
      plugins: [i18n],
    },
    props: {
      isTesting: true,
      ...props,
    },
  });
}

describe('EscConfirmModal', () => {
  describe('@renders', () => {
    it('renders a BModal', () => {
      const wrapper = setup();
      expect(wrapper.findComponent({ name: 'BModal' }).exists()).toBe(true);
    });

    it('displays the default unsaved changes title from i18n', () => {
      const wrapper = setup();
      expect(wrapper.findComponent({ name: 'BModal' }).props('title')).toBe(
        i18n.global.t('common.unsavedChangesTitle'),
      );
    });

    it('displays the default unsaved changes body from i18n', () => {
      const wrapper = setup();
      expect(wrapper.find('p').text()).toBe(
        i18n.global.t('common.unsavedChangesBody'),
      );
    });

    it('displays an override title when the title prop is provided', () => {
      const wrapper = setup({ title: 'Custom Title' });
      expect(wrapper.findComponent({ name: 'BModal' }).props('title')).toBe('Custom Title');
    });

    it('displays an override body when the body prop is provided', () => {
      const wrapper = setup({ body: 'Custom body text.' });
      expect(wrapper.find('p').text()).toBe('Custom body text.');
    });

    it('uses title-tag h2 and title-class h5 for accessibility', () => {
      const wrapper = setup();
      const modal = wrapper.findComponent({ name: 'BModal' });
      expect(modal.props('titleTag')).toBe('h2');
      expect(modal.props('titleClass')).toBe('h5');
    });
  });

  describe('@accessibility', () => {
    // The "region" rule is disabled because the component is tested in isolation
    // (no outer <main> landmark), which is normal for unit tests.
    it('has no axe accessibility violations', async () => {
      const wrapper = setup();
      const results = await axe(wrapper.element, {
        rules: {
          region: { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('@actions', () => {
    it('emits ok when the discard changes button is clicked', async () => {
      const wrapper = setup({ visible: true });
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      const buttons = wrapper.findAll('button');
      const discardButton = buttons.find((btn) => btn.text() === i18n.global.t('common.discardChanges'));
      expect(discardButton).toBeDefined();
      await discardButton.trigger('click');
      expect(wrapper.emitted('ok')).toBeTruthy();
      expect(wrapper.emitted('ok')).toHaveLength(1);
    });

    it('emits cancel when the keep editing button is clicked', async () => {
      const wrapper = setup({ visible: true });
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      const buttons = wrapper.findAll('button');
      const keepEditingButton = buttons.find((btn) => btn.text() === i18n.global.t('common.keepEditing'));
      expect(keepEditingButton).toBeDefined();
      await keepEditingButton.trigger('click');
      expect(wrapper.emitted('cancel')).toBeTruthy();
      expect(wrapper.emitted('cancel')).toHaveLength(1);
    });
  });
});
