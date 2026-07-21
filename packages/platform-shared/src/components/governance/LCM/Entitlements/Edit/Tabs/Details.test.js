/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import Details from './Details';
import i18n from '@/i18n';
import { setupTestPinia } from '../../../../../../utils/testPiniaHelpers';

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi');

// mockFormState holds a mutable reference to the form value.
// The jest.mock factory (hoisted) reads from this object, so tests can set
// mockFormState.current before mounting to simulate a custom form being active.
// Per Jest rules, variables prefixed with 'mock' are permitted in hoisted factory scope.
const mockFormState = { current: null };

// eslint-disable-next-line global-require
jest.mock('@forgerock/platform-shared/src/composables/governance/forms', () => {
  // eslint-disable-next-line global-require
  const { ref } = require('vue');
  return () => {
    // Each useForm() call gets a fresh ref whose initial value matches
    // whatever the test set on mockFormState.current before mounting.
    const form = ref(mockFormState.current);
    return {
      form,
      formValue: ref({}),
      formTypes: { APPLICATION: 'application' },
      isLoadingForm: ref(false),
      isValidForm: ref(true),
      getFormDefinitionByType: jest.fn().mockResolvedValue(undefined),
      setDefaultFormValues: jest.fn(),
    };
  };
});

describe('Details', () => {
  let wrapper;

  const entitlement = {
    application: {
      name: 'TargetApp',
      id: 'testApp',
    },
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'template_read_global',
        },
      },
    },
    glossary: {
      idx: {
        '/entitlement': {
          testGlossaryProperty: 'some value',
        },
      },
    },
    entitlement: {
      testObjectProperty: 'some other value',
    },
    item: { objectType: 'Role' },
    id: 'testEntitlement',
  };

  beforeEach(() => {
    mockFormState.current = null;
  });

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
      },
    },
  }));

  function mountComponent() {
    setupTestPinia({ user: {} });
    return mount(Details, {
      global: {
        plugins: [i18n],
      },
      props: {
        entitlement,
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
  });

  it('submits request with justification in common when using default form', async () => {
    AccessRequestApi.submitCustomRequest.mockImplementation(() => Promise.resolve({ data: { id: 'test-id' } }));
    wrapper = mountComponent();
    await flushPromises();

    await wrapper.vm.submitRequest();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith(
      'modifyEntitlement',
      expect.objectContaining({
        common: expect.objectContaining({ justification: 'LCM: Modify entitlement' }),
      }),
    );
  });

  it('does not include justification in common when custom form is active', async () => {
    mockFormState.current = { form: { fields: [] } };

    AccessRequestApi.submitCustomRequest.mockImplementation(() => Promise.resolve({ data: { id: 'test-id' } }));

    wrapper = mountComponent();
    await flushPromises();

    await wrapper.vm.submitRequest();
    await flushPromises();

    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith(
      'modifyEntitlement',
      expect.objectContaining({
        common: expect.not.objectContaining({ justification: expect.anything() }),
      }),
    );
  });
});
