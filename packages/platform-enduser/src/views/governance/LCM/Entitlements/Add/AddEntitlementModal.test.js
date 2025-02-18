/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrDefaultEntitlementForm from '@forgerock/platform-shared/src/components/governance/DefaultEntitlementForm';
import AddEntitlementModal from './AddEntitlementModal';
import i18n from '@/i18n';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));

describe('AddEntitlementModal', () => {
  let wrapper;

  GlossaryApi.getGlossaryAttributes.mockImplementation(() => Promise.resolve({
    data: {
      result: [
        {
          name: 'testGlossaryProperty',
          type: 'string',
          displayName: 'test glossary property',
        },
      ],
    },
  }));
  EntitlementApi.getEntitlementSchema.mockImplementation(() => Promise.resolve({
    data: {
      properties: {
        testObjectProperty: {
          type: 'string',
          order: 2,
          displayName: 'test object property',
        },
        testObjectProperty2: {
          type: 'string',
          order: 3,
          displayName: 'test object property2',
          flags: ['NOT_CREATABLE'],
        },
      },
    },
  }));
  AccessRequestApi.submitCustomRequest.mockImplementation(() => Promise.resolve({ data: { id: '123' } }));

  function mountComponent() {
    return mount(AddEntitlementModal, {
      global: {
        plugins: [i18n],
        stubs: ['GovResourceSelect'],
        mocks: {
          $router: { push: jest.fn() },
        },
      },
      props: {
        isTesting: true,
      },
    });
  }

  it('can select application and object type and move to next step', async () => {
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

    await flushPromises();
    const nextButton = wrapper.findComponent('[aria-label="Next"]');
    expect(nextButton.exists()).toBe(true);
    expect(nextButton.attributes('class')).toMatch('disabled');
    expect(wrapper.vm.step).toBe(0);

    const appInput = wrapper.findComponent('[label="Application"]');
    appInput.setValue('TestId');
    appInput.vm.$emit('selected:option', application);
    await flushPromises();
    wrapper.findComponent('[label="Object Type"]').vm.$emit('input', 'TestObjectType');
    await flushPromises();

    expect(nextButton.attributes('class')).not.toMatch('disabled');
    nextButton.trigger('click');
    expect(wrapper.vm.step).toBe(1);
    await flushPromises();
  });

  it('second step shows default entitlement form and can calls to submit request', async () => {
    wrapper = mountComponent();
    wrapper.vm.step = 1;
    wrapper.vm.applicationId = 'TestId';
    wrapper.vm.objectType = 'Role';

    await flushPromises();

    const form = wrapper.findComponent(FrDefaultEntitlementForm);
    form.vm.$emit('update:glossaryValues', { customProp: 'customValue' });
    form.vm.$emit('update:entitlementValues', { customPro2: 'customValue2' });
    await flushPromises();

    wrapper.findComponent('[aria-label="Submit"]').trigger('click');
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith(
      'createEntitlement',
      {
        common: {},
        custom: {},
        entitlement: {
          applicationId: 'TestId',
          glossary: { customProp: 'customValue' },
          object: { customPro2: 'customValue2' },
          objectType: 'Role',
        },
      },
    );
    expect(wrapper.vm.step).toBe(2);
  });

  it('third step has link to access request', async () => {
    wrapper = mountComponent();
    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
    wrapper.vm.step = 2;
    wrapper.vm.requestId = '123';
    await flushPromises();

    const viewLink = wrapper.find('button.btn-outline-primary');
    expect(viewLink.text()).toBe('View Request');
    viewLink.trigger('click');

    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'MyRequestDetails',
      params: { requestId: '123' },
    });
  });
});
