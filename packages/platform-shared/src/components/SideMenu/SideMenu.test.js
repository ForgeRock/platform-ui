/**
 * Copyright (c) 2019-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mount, flushPromises } from '@vue/test-utils';
import SideMenu from './index';
import { runA11yTest } from '../../utils/testHelpers';

let wrapper;
function setup(props = {}) {
  setupTestPinia({ theme: { theme: {} } });
  wrapper = mount(SideMenu, {
    global: {
      mocks: {
        $t: (msg) => msg,
      },
    },
    props: {
      ...props,
    },
  });
}

describe('SideMenu Component', () => {
  afterEach(() => {
    if (wrapper?.unmount) {
      wrapper.unmount();
    }
  });

  it('Component successfully loaded', async () => {
    setup();
    await flushPromises();
    expect(wrapper.vm.dropdownItems).toStrictEqual([]);
  });

  describe('@a11y', () => {
    const scenarios = [
      {
        name: 'in default state',
        props: {},
      },
      {
        name: 'when expanded with menu items',
        props: {
          isExpanded: true,
          menuItems: [{ displayName: 'Item 1', routeTo: { name: 'item-1' } }],
        },
      },
      {
        name: 'with dividers + custom links',
        props: {
          isExpanded: true,
          menuItems: [
            { displayName: 'Item 1', routeTo: { name: 'item-1' } },
            { isDivider: true },
            { displayName: 'Item 2', routeTo: { name: 'item-2' } },
          ],
        },
      },
    ];
    describe('should not have any accessibility violations', () => {
      it.each(scenarios)('$name', async (scenario) => {
        setup(scenario.props);
        await flushPromises();
        await runA11yTest(wrapper);
      });
    });
  });
});
