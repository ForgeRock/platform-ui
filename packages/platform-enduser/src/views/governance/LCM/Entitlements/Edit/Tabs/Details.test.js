/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import Details from './Details';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');

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
});
