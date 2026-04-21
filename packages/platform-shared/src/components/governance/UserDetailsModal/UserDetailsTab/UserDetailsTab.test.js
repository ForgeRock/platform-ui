/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import UserDetailsTab from './index';

describe('UserDetailsTab', () => {
  function mountComponent(user, displayProperties) {
    return shallowMount(UserDetailsTab, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        user,
        displayProperties,
      },
    });
  }

  describe('should load correctly user data in template', () => {
    const testCases = [
      ['given false', false, blankValueIndicator],
      ['given zero', 0, blankValueIndicator],
      ['given empty string', '', blankValueIndicator],
      ['given null', null, blankValueIndicator],
      ['given undefined', undefined, blankValueIndicator],
      ['given NaN', NaN, blankValueIndicator],
      ['given valid string', 'test', 'test'],
      ['given valid number', 10, '10'],
    ];
    it.each(testCases)('%s', (name, userProp, value) => {
      const wrapper = mountComponent({ userProp });
      const elem = findByTestId(wrapper, 'userProp');
      expect(elem.exists()).toBe(true);
      expect(elem.find('dt').text()).toBe('common.user.userProp');
      expect(elem.find('dd').text()).toBe(value);
    });
  });

  describe('should only show those values listed in displayProperties', () => {
    it('should only display properties listed in displayProperties', () => {
      const user = { name: 'John', age: 30, email: 'john@example.com' };
      const displayProperties = ['name', 'email'];
      const wrapper = mountComponent(user, displayProperties);

      displayProperties.forEach((prop) => {
        const elem = findByTestId(wrapper, prop);
        expect(elem.exists()).toBe(true);
      });

      const hiddenProperties = Object.keys(user).filter((prop) => !displayProperties.includes(prop));
      hiddenProperties.forEach((prop) => {
        const elem = findByTestId(wrapper, prop);
        expect(elem.exists()).toBe(false);
      });
    });
  });
});
