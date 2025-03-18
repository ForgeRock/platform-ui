/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import FrEntitlementEditForm from '@forgerock/platform-shared/src/components/governance/EntitlementEditForm';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import DefaultEntitlementForm from './DefaultEntitlementForm';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');

describe('DefaultEntitlementForm', () => {
  let wrapper;

  const entitlement = {
    glossary: {
      idx: {
        '/entitlement': {
          testGlossaryProperty: 'some value',
        },
      },
    },
    entitlement: {
      testObjectProperty: 'some other value',
      testObjectProperty2: 'some other value2',
    },
  };

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

  function mountComponent(props) {
    return mount(DefaultEntitlementForm, {
      global: {
        plugins: [i18n],
      },
      props: {
        entitlement,
        applicationId: 'testApp',
        objectType: 'Role',
        ...props,
      },
    });
  }

  it('calls to get glossary schema', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(GlossaryApi.getGlossaryAttributes).toHaveBeenCalledWith({
      objectType: '/openidm/managed/assignment',
      pageNumber: 0,
      pageSize: 100,
      sortBy: 'name',
      sortDir: 'asc',
    });
  });

  it('sets form values based on glossary values', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const glossaryInput = wrapper.find('[id="test glossary property"]');
    expect(glossaryInput.exists()).toBe(true);
    expect(glossaryInput.attributes('value')).toEqual('some value');
  });

  it('calls to get object type schema', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(EntitlementApi.getEntitlementSchema).toHaveBeenCalledWith('testApp', 'Role');
  });

  it('sets form values based on entitlement values', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const objectInput = wrapper.find('[id="test object property"]');
    expect(objectInput.exists()).toBe(true);
    expect(objectInput.attributes('value')).toEqual('some other value');

    const objectInput2 = wrapper.find('[id="test object property2"]');
    expect(objectInput2.exists()).toBe(true);
    expect(objectInput2.attributes('value')).toEqual('some other value2');
  });

  it('hides NOT_CREATABLE properties for CREATE mode', async () => {
    wrapper = mountComponent({ type: 'CREATE' });
    await flushPromises();

    const objectInput = wrapper.find('[id="test object property"]');
    expect(objectInput.exists()).toBe(true);
    expect(objectInput.attributes('value')).toEqual('some other value');

    const objectInput2 = wrapper.find('[id="test object property2"]');
    expect(objectInput2.exists()).toBe(false);
  });

  it('emits event when glossary properties change values', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent(FrGlossaryEditForm).vm.$emit('update:modelValue', {
      testGlossaryProperty: 'new value',
    });
    await flushPromises();
    expect(wrapper.emitted('update:glossaryValues')[1]).toEqual([
      {
        testGlossaryProperty: 'new value',
      },
    ]);
  });

  it('emits event when entitlement properties change values', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent(FrEntitlementEditForm).vm.$emit('update:modelValue', {
      testObjectProperty: 'new value',
      testObjectProperty2: 'some other value2',
    });
    await flushPromises();
    expect(wrapper.emitted('update:entitlementValues')[3]).toEqual([
      {
        testObjectProperty: 'new value',
        testObjectProperty2: 'some other value2',
      },
    ]);
  });
});
