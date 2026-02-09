/**
 * Copyright (c) 2019-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mount, flushPromises } from '@vue/test-utils';
import SideMenu from './index';
import { runA11yTest } from '../../utils/testHelpers';
import store from '@/store';

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

jest.mock('@forgerock/platform-shared/src/assets/images/ping-logo-horizontal-color.svg', () => 'ping-logo-horizontal-color.svg');
jest.mock('@forgerock/platform-shared/src/assets/images/ping-logo-square-color.svg', () => 'ping-logo-square-color.svg');

describe('SideMenu Component', () => {
  afterEach(() => {
    if (wrapper?.unmount) {
      wrapper.unmount();
    }
  });

  it('shows ping logos in IDM deployment', async () => {
    store.state.SharedStore.deploymentType = 'IDM';
    setup();
    await flushPromises();

    const imageHorizontal = wrapper.find('img');
    expect(imageHorizontal.exists()).toBe(true);
    expect(imageHorizontal.attributes('alt')).toContain('Ping Identity Logo');
    expect(imageHorizontal.attributes('src')).toContain('ping-logo-horizontal-color.svg');

    const imageSquare = wrapper.findAll('img').at(1);
    expect(imageSquare.exists()).toBe(true);
    expect(imageSquare.attributes('alt')).toContain('Ping Identity Logo');
    expect(imageSquare.attributes('src')).toContain('ping-logo-square-color.svg');
    store.state.SharedStore.deploymentType = 'PLATFORM';
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
