/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import SettingsTab from './index';

SettingsTab.mounted = jest.fn();

describe('SettingsTab', () => {
  it('Settings Tab successfully loaded', () => {
    const wrapper = shallowMount(SettingsTab, {
      mocks: {
        $t: () => {},
      },
      mounted: () => {},
    });

    expect(wrapper.name()).toEqual('SettingsTab');
  });
});
