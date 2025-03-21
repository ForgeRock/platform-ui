/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { shallowMount } from '@vue/test-utils';
import FrProfileContainer from '@forgerock/platform-shared/src/components/profile/ProfileContainer';
import Profile from '.';

describe('Profile.vue', () => {
  it('renders FrProfileContainer', () => {
    const wrapper = shallowMount(Profile);
    expect(wrapper.findComponent(FrProfileContainer).exists()).toBe(true);
  });
  it('passes the theme prop to FrProfileContainer', () => {
    const theme = {
      accountPageSections: { personalInformation: { enabled: false } },
    };
    const wrapper = shallowMount(Profile, {
      propsData: {
        theme,
      },
    });
    expect(wrapper.findComponent(FrProfileContainer).props('theme')).toEqual(theme);
  });

  it('sets the default theme prop correctly', () => {
    const wrapper = shallowMount(Profile);
    expect(wrapper.props('theme')).toEqual({});
  });
});
