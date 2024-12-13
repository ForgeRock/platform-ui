/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { defineRule } from 'vee-validate';
import { required } from '@vee-validate/rules';
import i18n from '@/i18n';
import GovAssignResourceModal from './GovAssignResourceModal';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

defineRule('required', () => required);

const mountComponent = (propsData = {}) => mount(GovAssignResourceModal, {
  global: {
    plugins: [i18n],
  },
  props: {
    entitlementOptions: [{ text: 'EntitlementText', value: 'value' }],
    isTesting: true,
    resourceType: 'entitlements',
    ...propsData,
  },
});

describe('GovAssignResourceModal Component', () => {
  it('changes step when next is clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.find('header').text()).toContain('Grant Entitlements');

    const selectApplicationField = wrapper.findComponent('[label="Select application"]');
    selectApplicationField.vm.$emit('selected:option', { name: 'testApp', icon: 'icon.svg' });
    await flushPromises();
    const nextButton = wrapper.findAllComponents('[type="button"]').filter((item) => item.text().includes('Next'))[0];
    nextButton.trigger('click');
    await flushPromises();
    expect(nextButton.attributes('disabled')).toBeUndefined();
    expect(wrapper.find('header').text()).toContain('Choose Entitlements');
  });

  it('enables grant button when application is selected', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const selectApplicationField = wrapper.findComponent('[label="Select application"]');
    selectApplicationField.vm.$emit('selected:option', { name: 'testApp', icon: 'icon.svg' });
    await flushPromises();
    const nextButton = wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Next'))[0];
    expect(nextButton.attributes('disabled')).toBeUndefined();
    nextButton.trigger('click');
    await flushPromises();

    wrapper.find('[type="multiselect"]').trigger('click');
    wrapper.find('[role="option"]').trigger('click');
    await flushPromises();

    const grantButton = wrapper.findAll('[type="button"]').filter((item) => item.text().includes('Grant Entitlements'))[0];
    expect(grantButton.attributes('disabled')).toBeUndefined();
  });
});
