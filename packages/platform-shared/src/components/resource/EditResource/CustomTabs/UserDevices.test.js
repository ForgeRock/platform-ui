/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@forgerock/platform-shared/src/i18n';
import { BTab } from 'bootstrap-vue';
import FrListViewTrustedDevices from '@forgerock/platform-shared/src/components/profile/TrustedDevices/ListViewTrustedDevices';
import UserDevices from './UserDevices';

describe('@renders', () => {
  function setup(props) {
    return mount(UserDevices, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  it('the Trusted Devices tab and title', () => {
    const wrapper = setup();
    const btabProps = wrapper.findComponent(BTab).props();
    expect(btabProps.title).toBe('Trusted Devices');
  });

  it('the ListViewTrustedDevices component', () => {
    const wrapper = setup();
    const listViewTrustedDevices = wrapper.findComponent(FrListViewTrustedDevices);
    expect(listViewTrustedDevices).toBeDefined();
  });
});
