/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import i18n from '@/i18n';
import GovAssignResourceModal from './GovAssignResourceModal';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  debounce: (fn) => Object.assign(fn, { cancel: () => {} }),
}));

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');

EntitlementApi.getApplicationList.mockResolvedValue({
  data: { result: [] },
});

mockValidation(['required']);

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
  it('queries applications via getApplicationList with disconnected filter', async () => {
    mountComponent({ parentResourceName: 'role' });
    await flushPromises();

    expect(EntitlementApi.getApplicationList).toHaveBeenCalledWith(
      'application',
      expect.objectContaining({
        queryFilter: expect.stringContaining('!(application.isDisconnected eq "true")'),
      }),
    );
  });

  it('queries applications with name filter when searching', async () => {
    const wrapper = mountComponent({ parentResourceName: 'role' });
    await flushPromises();

    const resourceSelect = wrapper.findComponent('[label="Select application"]');
    resourceSelect.vm.debouncedSearch('myapp');
    await flushPromises();

    expect(EntitlementApi.getApplicationList).toHaveBeenCalledWith(
      'application',
      expect.objectContaining({
        queryFilter: expect.stringContaining('application.name co "myapp"'),
      }),
    );
  });

  it('changes step when next is clicked', async () => {
    const wrapper = mountComponent({ parentResourceName: 'role' });
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
    const wrapper = mountComponent({ parentResourceName: 'role' });
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
    expect(grantButton.attributes('disabled')).toBeFalsy();
  });
});
