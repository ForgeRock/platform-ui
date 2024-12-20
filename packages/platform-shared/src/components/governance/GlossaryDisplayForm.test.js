/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as Resource from '@forgerock/platform-shared/src/utils/governance/resource';
import GlossaryDisplayForm from './GlossaryDisplayForm';

describe('GlossaryDisplayForm', () => {
  function setup(props = {
    glossarySchema: [
      {
        name: 'test1',
      },
      {
        name: 'test3',
      },
    ],
    glossaryValues: {
      test1: 'testValue1',
      test2: 'testValue2',
    },
  }) {
    return mount(GlossaryDisplayForm, {
      props,
    });
  }

  it('shows a property that has a schema and value', async () => {
    const wrapper = setup();
    await flushPromises();
    const propName = findByTestId(wrapper, 'prop-0');
    expect(propName.text()).toBe('test1');

    const propValue = findByTestId(wrapper, 'prop-value-0');
    expect(propValue.text()).toBe('testValue1');
  });

  it('does not show property that is not in schema', async () => {
    const wrapper = setup();
    await flushPromises();
    expect(wrapper.vm.glossaryData.length).toBe(2);

    const propName = findByTestId(wrapper, 'prop-1');
    expect(propName.text()).not.toBe('test2');

    const propValue = findByTestId(wrapper, 'prop-value-1');
    expect(propValue.text()).not.toBe('testValue2');
  });

  it('shows property with blankValueIndicator that has schema but no value', async () => {
    const wrapper = setup();
    await flushPromises();
    const propName = findByTestId(wrapper, 'prop-1');
    expect(propName.text()).toBe('test3');

    const propValue = findByTestId(wrapper, 'prop-value-1');
    expect(propValue.text()).toBe('--');
  });

  it('should get managed objects data and show the name of these properties', async () => {
    Resource.getResourceDisplayData = jest.fn().mockResolvedValue('User Name');

    const wrapper = setup({
      glossarySchema: [
        {
          name: 'owner',
          type: 'managedObject',
          managedObjectType: 'user',
        },
      ],
      glossaryValues: {
        owner: 'managed/id',
      },
    });
    await flushPromises();

    expect(Resource.getResourceDisplayData).toHaveBeenCalledWith('user', 'managed/id');
    const propName = findByTestId(wrapper, 'prop-0');
    expect(propName.text()).toBe('owner');
    const propValue = findByTestId(wrapper, 'prop-value-0');
    expect(propValue.text()).toBe('User Name');
  });
});
