/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import DropDownMenu from './index';
import { setupTestPinia } from '../../utils/testPiniaHelpers';
import { runA11yTest } from '../../utils/testHelpers';

let wrapper;
let mountedComponent;

function setupApp() {
  const app = document.createElement('div');
  app.id = 'app';
  document.body.appendChild(app);
  return app;
}

async function setupMount(props = {}) {
  const target = setupApp();
  setupTestPinia();
  mountedComponent = mount(DropDownMenu, {
    attachTo: target,
    global: {
      mocks: {
        $t: (msg) => msg,
        $store: {
          state: {
            SharedStore: {
              currentPackage: 'enduser',
            },
          },
        },
      },
    },
    props: {
      ...props,
    },
  });

  wrapper = new DOMWrapper(document.body);
}

describe('Dropdown Menu Component', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    if (mountedComponent?.unmount) {
      mountedComponent.unmount();
    }
  });

  describe('@a11y', () => {
    const scenarios = [
      { name: 'with default state without menu open', props: {} },
      { name: 'with default state with menu open', props: {}, openMenu: true },
      { name: 'with some dropdown items defined', props: { dropdownItems: [{ id: 1, label: 'Item 1' }, { id: 2, label: 'Item 2' }] }, openMenu: true },
      { name: 'when only show Profile Link is enabled', props: { showProfileLink: true }, openMenu: true },
      { name: 'when show Profile Link is enabled with Logout action and dropdown items', props: { showProfileLink: true, enableLogout: true, dropdownItems: [{ id: 1, label: 'Item 1' }] }, openMenu: true },
      { name: 'when only Logout action is enabled without any dropdown items', props: { enableLogout: true }, openMenu: true },
      { name: 'when only Logout action is enabled with some dropdown items', props: { enableLogout: true, dropdownItems: [{ id: 1, label: 'Item 1' }] }, openMenu: true },
    ];
    describe('should not have accessibility violations', () => {
      it.each(scenarios)('$name', async ({ props, openMenu = false }) => {
        setupMount(props);
        await flushPromises();

        if (openMenu) {
          await wrapper.find('button[id^="menu-button-"]').trigger('click');
          await flushPromises();
        }
        await runA11yTest(wrapper);
      });
    });
  });
});
