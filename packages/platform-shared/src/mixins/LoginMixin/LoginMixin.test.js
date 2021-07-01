/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import LoginMixin from './index';

let wrapper;

describe('LoginMixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount({}, {
      render() {},
      mixins: [LoginMixin],
      mocks: { $t: (id) => id },
    });
  });
  // Many methods in this mixin do not require unit testing:
  // getIdFromSession, getUserInfo, getConfigurationInfo,
  // getCurrentQueryString, parseParameters
  // Or are constructed in a way that makes unit testing undesirable:
  // verifyGotoUrlAndRedirect
  it('Checks for a default path', () => {
    const isDefault = wrapper.vm.isDefaultPath('/am/console');
    const isNotDefault = wrapper.vm.isDefaultPath('/am/foo');
    expect(isDefault).toBeTruthy();
    expect(isNotDefault).toBeFalsy();
  });

  it('checks for a SAML url', () => {
    const isSaml = wrapper.vm.isSamlURL('http://fr.com/Consumer/metaAlias');
    const isNotSaml = wrapper.vm.isSamlURL('http://fr.com/foo');
    expect(isSaml).toBeTruthy();
    expect(isNotSaml).toBeFalsy();
  });
});
