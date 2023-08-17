/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import GlossaryDisplayForm from './index';

describe('GlossaryDisplayForm', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(GlossaryDisplayForm, {
      propsData: {
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
      },
    });
  });

  it('shows a property that has a schema and value', async () => {
    const propName = findByTestId(wrapper, 'prop-0');
    expect(propName.text()).toBe('test1');

    const propValue = findByTestId(wrapper, 'prop-value-0');
    expect(propValue.text()).toBe('testValue1');
  });

  it('does not show property that is not in schema', async () => {
    expect(wrapper.vm.glossary.length).toBe(2);

    const propName = findByTestId(wrapper, 'prop-1');
    expect(propName.text()).not.toBe('test2');

    const propValue = findByTestId(wrapper, 'prop-value-1');
    expect(propValue.text()).not.toBe('testValue2');
  });

  it('shows property with blankValueIndicator that has schema but no value', async () => {
    const propName = findByTestId(wrapper, 'prop-1');
    expect(propName.text()).toBe('test3');

    const propValue = findByTestId(wrapper, 'prop-value-1');
    expect(propValue.text()).toBe('--');
  });
});
