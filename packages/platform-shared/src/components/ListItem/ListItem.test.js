/**
 * Copyright (c) 2019-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import ListItem from './index';
import { runA11yTest } from '../../utils/testHelpers';

describe('a11y tests', () => {
  function setup(props = {}, slotData = {}) {
    const wrapper = mount(ListItem, {
      props: {
        ...props,
      },
      slots: slotData,
    });
    return wrapper;
  }
  it('should pass accessibility tests with default props', async () => {
    const wrapper = setup();
    await runA11yTest(wrapper);
  });

  it('should pass accessibility tests with custom slot content', async () => {
    const wrapper = setup({ panelShown: true }, {
      'list-item-header': '<div>Custom List Header</div>',
      'list-item-collapse-body': '<div>Custom Collapse Body</div>',
    });
    await runA11yTest(wrapper);
  });
});

describe('ListItem Component', () => {
  it('ListItem successfully loaded', () => {
    const wrapper = shallowMount(ListItem, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
    });
    expect(wrapper.vm.id).toEqual(`listItem${wrapper.vm._uid}`);
  });
});
