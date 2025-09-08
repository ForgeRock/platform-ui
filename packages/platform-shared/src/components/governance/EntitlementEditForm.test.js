/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import EntitlementEditForm from './EntitlementEditForm';
import i18n from '@/i18n';

mockValidation(['integer']);

describe('EntitlementEditForm', () => {
  let wrapper;

  const entitlementSchema = {
    testString: {
      type: 'string',
      displayName: 'Test String Property',
    },
    testBoolean: {
      type: 'boolean',
      displayName: 'Test Boolean Property',
    },
    testNumber: {
      type: 'number',
      displayName: 'Test Number Property',
    },
    testStringReadOnly: {
      type: 'string',
      displayName: 'Test Read Only String Property',
      readOnly: true,
    },
  };

  const modelValue = {
    testString: 'some value',
    testNumber: 42,
  };

  function mountComponent() {
    return mount(EntitlementEditForm, {
      global: {
        plugins: [i18n],
      },
      props: {
        entitlementSchema,
        'model-value': modelValue,
      },
    });
  }

  it('builds a form based on the entitlement schema', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const stringInput = wrapper.find('[label="Test String Property"]');
    expect(stringInput.exists()).toBe(true);

    const booleanInput = wrapper.find('[label="Test Boolean Property"]');
    expect(booleanInput.exists()).toBe(true);

    const testNumber = wrapper.find('[label="Test Number Property"]');
    expect(testNumber.exists()).toBe(true);
  });

  it('builds a form with some read only properties', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const stringInput = wrapper.find('[label="Test String Property"]');
    expect(stringInput.exists()).toBe(true);

    const booleanInput = wrapper.find('[label="Test Boolean Property"]');
    expect(booleanInput.exists()).toBe(true);

    const testNumber = wrapper.find('[label="Test Number Property"]');
    expect(testNumber.exists()).toBe(true);

    const testReadOnly = wrapper.find('[id="Test Read Only String Property"]');
    expect(testReadOnly.exists()).toBe(true);
    expect(testReadOnly.attributes().disabled).toBe('true');
  });

  it('sets default value for booleans and emits event', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([{
      testString: 'some value',
      testBoolean: false,
      testNumber: 42,
    }]);
  });
});
