/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, shallowMount } from '@vue/test-utils';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import DefaultResourceForm from './DefaultResourceForm';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');

describe('DefaultResourceForm', () => {
  const objectTypeSchema = {
    properties: {
      resourceName: {
        type: 'string',
        displayName: 'Resource Name',
        order: 2,
      },
      isEnabled: {
        type: 'boolean',
        displayName: 'Enabled',
        order: 1,
      },
      tags: {
        type: 'array',
        displayName: 'Tags',
        order: 3,
      },
      priority: {
        type: 'number',
        displayName: 'Priority',
        order: 4,
      },
      createdDate: {
        type: 'date',
        displayName: 'Created Date',
        order: 5,
      },
      lastUpdated: {
        type: 'datetime',
        displayName: 'Last Updated',
        order: 6,
      },
      ownerReference: {
        type: 'relationship',
        displayName: 'Owner',
        order: 7,
      },
      lockedUntil: {
        type: 'string',
        displayName: 'Locked Until',
        flags: ['NOT_UPDATEABLE'],
      },
    },
  };

  function shallowMountComponent(propsData) {
    return shallowMount(DefaultResourceForm, {
      global: {
        plugins: [i18n],
      },
      props: {
        applicationId: 'test-app-id',
        objectType: 'testObjectType',
        resource: { resourceName: 'Existing name', isEnabled: true },
        ...propsData,
      },
    });
  }

  beforeEach(() => {
    ApplicationsApi.getObjectTypeSchema.mockImplementation(() => Promise.resolve({ data: objectTypeSchema }));
  });

  it('renders the form once the object type schema is loaded', async () => {
    const wrapper = shallowMountComponent();
    await flushPromises();
    expect(wrapper.vm.schemaFormGenerator).toHaveLength(4);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('orders fields by the schema order property', async () => {
    const wrapper = shallowMountComponent();
    await flushPromises();
    const flatFields = wrapper.vm.schemaFormGenerator.flat();
    expect(flatFields.map((f) => f.model)).toEqual([
      'lockedUntil', 'isEnabled', 'resourceName', 'tags', 'priority', 'createdDate', 'lastUpdated', 'ownerReference',
    ]);
  });

  it('treats missing order as 0 instead of producing NaN ordering', async () => {
    const schemaWithoutOrder = {
      properties: {
        alpha: { type: 'string', displayName: 'Alpha' },
        beta: { type: 'string', displayName: 'Beta', order: 1 },
      },
    };
    ApplicationsApi.getObjectTypeSchema.mockImplementation(() => Promise.resolve({ data: schemaWithoutOrder }));
    const wrapper = shallowMountComponent();
    await flushPromises();
    expect(wrapper.vm.schemaFormGenerator.flat().map((f) => f.model)).toEqual(['alpha', 'beta']);
  });

  it('maps schema types to FormGenerator types', async () => {
    const wrapper = shallowMountComponent();
    await flushPromises();
    const typesByModel = Object.fromEntries(wrapper.vm.schemaFormGenerator.flat().map((f) => [f.model, f.type]));
    expect(typesByModel).toEqual({
      isEnabled: 'boolean',
      resourceName: 'string',
      tags: 'array',
      priority: 'integer',
      createdDate: 'date',
      lastUpdated: 'date',
      ownerReference: 'string',
      lockedUntil: 'string',
    });
  });

  it('disables relationship and NOT_UPDATEABLE properties', async () => {
    const wrapper = shallowMountComponent();
    await flushPromises();
    const disabledByModel = Object.fromEntries(wrapper.vm.schemaFormGenerator.flat().map((f) => [f.model, f.disabled]));
    expect(disabledByModel.ownerReference).toBe(true);
    expect(disabledByModel.lockedUntil).toBe(true);
    expect(disabledByModel.resourceName).toBe(false);
  });

  it('disables all fields when read-only', async () => {
    const wrapper = shallowMountComponent({ readOnly: true });
    await flushPromises();
    wrapper.vm.schemaFormGenerator.flat().forEach((field) => {
      expect(field.disabled).toBe(true);
    });
  });

  it('emits resource values when a field changes', async () => {
    const wrapper = shallowMountComponent();
    await flushPromises();
    wrapper.vm.fieldChanged({ path: 'resourceName', value: 'New name' });
    expect(wrapper.emitted('update:resourceValues')[0][0]).toEqual(expect.objectContaining({ resourceName: 'New name' }));
  });
});
