/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getLCMMenuItem } from './menuItems';

describe('getLCMMenuItem', () => {
  it('should return an empty object if govLcmEnabled is not true', () => {
    const store = { state: { govLcmEnabled: false } };
    const result = getLCMMenuItem(store);
    expect(result).toEqual({});
  });

  it('should return the governanceLcm object with no subItems if govLcmEnabled is true but no other flags are set', () => {
    const store = { state: { govLcmEnabled: true } };
    const result = getLCMMenuItem(store);
    expect(result).toEqual({
      displayName: 'sideMenu.administer',
      icon: 'manage_accounts',
      subItems: [],
    });
  });

  it('should include "AdministerUsers" in subItems if govLcmUser is true', () => {
    const store = { state: { govLcmEnabled: true, govLcmUser: true } };
    const result = getLCMMenuItem(store);
    expect(result).toEqual({
      displayName: 'sideMenu.administer',
      icon: 'manage_accounts',
      subItems: [
        {
          displayName: 'sideMenu.administerUsers',
          routeTo: { name: 'AdministerUsers' },
        },
      ],
    });
  });

  it('should include "AdministerEntitlements" in subItems if govLcmEntitlement is true', () => {
    const store = { state: { govLcmEnabled: true, govLcmEntitlement: true } };
    const result = getLCMMenuItem(store);
    expect(result).toEqual({
      displayName: 'sideMenu.administer',
      icon: 'manage_accounts',
      subItems: [
        {
          displayName: 'sideMenu.administerEntitlements',
          routeTo: { name: 'AdministerEntitlements' },
        },
      ],
    });
  });

  it('should include both "AdministerUsers" and "AdministerEntitlements" in subItems if both flags are true', () => {
    const store = {
      state: { govLcmEnabled: true, govLcmUser: true, govLcmEntitlement: true },
    };
    const result = getLCMMenuItem(store);
    expect(result).toEqual({
      displayName: 'sideMenu.administer',
      icon: 'manage_accounts',
      subItems: [
        {
          displayName: 'sideMenu.administerUsers',
          routeTo: { name: 'AdministerUsers' },
        },
        {
          displayName: 'sideMenu.administerEntitlements',
          routeTo: { name: 'AdministerEntitlements' },
        },
      ],
    });
  });
});
