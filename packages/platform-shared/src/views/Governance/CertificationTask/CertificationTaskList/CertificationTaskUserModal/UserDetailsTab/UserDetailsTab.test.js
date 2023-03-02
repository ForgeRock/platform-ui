/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */

import { shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import UserDetailsTab from './index';

describe('UserDetailsTab', () => {
  function mountComponent(user) {
    return shallowMount(UserDetailsTab, {
      mocks: {
        $t: (t) => t,
      },
      propsData: {
        user,
      },
    });
  }

  it('component should load correclty', () => {
    const wrapper = mountComponent({
      givenName: 'firstname',
      sn: 'sntest',
      username: 'test',
    });
    expect(wrapper.name()).toBe('UserDetailsTab');
  });

  describe('should load correctly user data in template', () => {
    it.each`
    name                    | userProp      | value
    ${'given false'}        | ${false}      | ${blankValueIndicator}
    ${'given zero'}         | ${0}          | ${blankValueIndicator}
    ${'given empty string'} | ${''}         | ${blankValueIndicator}
    ${'given null'}         | ${null}       | ${blankValueIndicator}
    ${'given undefined'}    | ${undefined}  | ${blankValueIndicator}
    ${'given NaN'}          | ${NaN}        | ${blankValueIndicator}
    ${'given valid string'} | ${'test'}     | ${'test'}
    ${'given valid number'} | ${10}         | ${'10'}
    `('$name', ({ userProp, value }) => {
      const wrapper = mountComponent({ userProp });
      const elem = findByTestId(wrapper, 'userProp');
      expect(elem.exists()).toBe(true);
      expect(elem.find('dt').text()).toBe('common.user.userProp');
      expect(elem.find('dd').text()).toBe(value);
    });
  });
});
