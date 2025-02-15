/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import AppAndObjectType from './AppAndObjectType';
import i18n from '@/i18n';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));

describe('AppAndObjectType', () => {
  let wrapper;

  EntitlementApi.getApplicationList.mockImplementation(() => Promise.resolve({
    data: {
      result: [
        {
          application: {
            name: 'TestApp',
            id: 'TestId',
            objectTypes: [
              {
                name: 'TestObjectType',
                accountAttribute: 'accountAttribute1',
              },
              {
                name: 'TestObjectType2',
              },
            ],
          },
        },
      ],
    },
  }));

  function mountComponent() {
    return mount(AppAndObjectType, {
      global: {
        plugins: [i18n],
      },
    });
  }

  it('gets application list on load', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(EntitlementApi.getApplicationList).toHaveBeenCalledWith(
      'application',
      {
        pageSize: 10,
        queryFilter: 'application.objectTypes.accountAttribute co ""',
      },
    );
  });

  it('selecting application type sets object type options and emits event', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const application = {
      application: {
        name: 'TestApp',
        id: 'TestId',
        objectTypes: [
          {
            name: 'TestObjectType',
            accountAttribute: 'accountAttribute1',
          },
          {
            name: 'TestObjectType2',
          },
        ],
      },
    };

    wrapper.findComponent(FrGovResourceSelect).vm.$emit('selected:option', application);
    await flushPromises();

    const objectTypeInput = wrapper.find('[label="Object Type"]');
    expect(objectTypeInput.exists()).toBe(true);
    const options = objectTypeInput.findAll('[role="option"]');
    expect(options.length).toBe(1);
    expect(options[0].text()).toBe('TestObjectType');

    expect(wrapper.emitted('selected:application')[0]).toEqual([application.application]);
    expect(wrapper.emitted('input')[0]).toEqual([null]);
  });

  it('selecting application and object type emits event', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const application = {
      application: {
        name: 'TestApp',
        id: 'TestId',
        objectTypes: [
          {
            name: 'TestObjectType',
            accountAttribute: 'accountAttribute1',
          },
          {
            name: 'TestObjectType2',
          },
        ],
      },
    };

    wrapper.findComponent(FrGovResourceSelect).vm.$emit('input', 'TestId');
    wrapper.findComponent(FrGovResourceSelect).vm.$emit('selected:option', application);
    await flushPromises();
    wrapper.findComponent('[label="Object Type"]').vm.$emit('input', 'TestObjectType');
    await flushPromises();

    expect(wrapper.emitted('input')[1]).toEqual([{
      applicationId: 'TestId',
      objectType: 'TestObjectType',
    }]);
  });
});
