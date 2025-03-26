/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { setActivePinia, createPinia } from 'pinia';
import { useEnduserStore } from './enduser';
import { useUserStore } from './user';

describe('enduser store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should return the correct initial state', () => {
    const enduserStore = useEnduserStore();

    expect(enduserStore.managedResourceSchema).toStrictEqual({});
    expect(enduserStore.preferences).toStrictEqual({});
    expect(enduserStore.profileImage).toBe('');
    expect(enduserStore.aliasList).toStrictEqual([]);
    expect(enduserStore.consentedMappings).toBe(null);
    expect(enduserStore.isInternalUser).toBe(false);
  });

  it('should reset the store to its initial state', () => {
    const enduserStore = useEnduserStore();
    enduserStore.setProfile({
      aliasList: ['aliasList'],
      consentedMappings: 'consentedMappings',
      preferences: {
        pref1: 'fine',
      },
      profileImage: 'profileImage',
    });

    enduserStore.$reset();

    expect(enduserStore.managedResourceSchema).toStrictEqual({});
    expect(enduserStore.preferences).toStrictEqual({});
    expect(enduserStore.profileImage).toBe('');
    expect(enduserStore.aliasList).toStrictEqual([]);
    expect(enduserStore.consentedMappings).toBe(null);
  });

  describe('computing if the user is an internal enduser', () => {
    it('should return true if the user has the managed resource internal/user', () => {
      const enduserStore = useEnduserStore();
      enduserStore.setProfile({
        managedResource: 'internal/user',
      });
      expect(enduserStore.isInternalUser).toBe(true);
    });

    it('should return false if the user does not have the managed resource internal/user', () => {
      const enduserStore = useEnduserStore();
      enduserStore.setProfile({
        managedResource: 'internal/role',
      });
      expect(enduserStore.isInternalUser).toBe(false);
    });
  });

  describe('setting profile information', () => {
    it('sets enduser profile information with the passed data', () => {
      const enduserStore = useEnduserStore();
      enduserStore.setProfile({
        aliasList: ['aliasList'],
        consentedMappings: 'consentedMappings',
        preferences: {
          pref1: 'fine',
        },
        profileImage: 'profileImage',
      });

      expect(enduserStore.aliasList).toStrictEqual(['aliasList']);
      expect(enduserStore.consentedMappings).toStrictEqual('consentedMappings');
      expect(enduserStore.preferences).toStrictEqual({
        pref1: 'fine',
      });
      expect(enduserStore.profileImage).toBe('profileImage');
    });

    it('sets the aliasList to an empty array if it is not included in the passed data', () => {
      const enduserStore = useEnduserStore();

      enduserStore.aliasList = ['aliasList'];

      enduserStore.setProfile({
        consentedMappings: 'consentedMappings',
        preferences: {
          pref1: 'fine',
        },
        profileImage: 'profileImage',
      });

      expect(enduserStore.aliasList).toStrictEqual([]);
      expect(enduserStore.consentedMappings).toStrictEqual('consentedMappings');
      expect(enduserStore.preferences).toStrictEqual({
        pref1: 'fine',
      });
      expect(enduserStore.profileImage).toBe('profileImage');
    });

    it('sets the consentedMappings to null if it is not included in the passed data', () => {
      const enduserStore = useEnduserStore();

      enduserStore.consentedMappings = 'consentedMappings';

      enduserStore.setProfile({
        aliasList: ['aliasList'],
        preferences: {
          pref1: 'fine',
        },
        profileImage: 'profileImage',
      });

      expect(enduserStore.aliasList).toStrictEqual(['aliasList']);
      expect(enduserStore.consentedMappings).toBe(null);
      expect(enduserStore.preferences).toStrictEqual({
        pref1: 'fine',
      });
      expect(enduserStore.profileImage).toBe('profileImage');
    });

    it('sets the preferences to an empty object if it is not included in the passed data', () => {
      const enduserStore = useEnduserStore();

      enduserStore.preferences = 'prefs';

      enduserStore.setProfile({
        aliasList: ['aliasList'],
        consentedMappings: 'consentedMappings',
        profileImage: 'profileImage',
      });

      expect(enduserStore.aliasList).toStrictEqual(['aliasList']);
      expect(enduserStore.consentedMappings).toStrictEqual('consentedMappings');
      expect(enduserStore.preferences).toStrictEqual({});
      expect(enduserStore.profileImage).toBe('profileImage');
    });

    it('sets the profileImage to an empty string if it is not included in the passed data', () => {
      const enduserStore = useEnduserStore();

      enduserStore.profileImage = 'profileImage';

      enduserStore.setProfile({
        aliasList: ['aliasList'],
        consentedMappings: 'consentedMappings',
        preferences: {
          pref1: 'fine',
        },
      });

      expect(enduserStore.aliasList).toStrictEqual(['aliasList']);
      expect(enduserStore.consentedMappings).toStrictEqual('consentedMappings');
      expect(enduserStore.preferences).toStrictEqual({
        pref1: 'fine',
      });
      expect(enduserStore.profileImage).toBe('');
    });

    it('also sets passed profile data in the base user store', () => {
      const enduserStore = useEnduserStore();
      const userStore = useUserStore();

      enduserStore.setProfile({
        aliasList: ['aliasList'],
        consentedMappings: 'consentedMappings',
        preferences: {
          pref1: 'fine',
        },
        profileImage: 'profileImage',
        givenName: 'gn',
        sn: 'sn',
        mail: 'email',
        company: 'company',
        managedResource: 'managedResource',
        userName: 'userName',
      });

      // Check the enduser values
      expect(enduserStore.aliasList).toStrictEqual(['aliasList']);
      expect(enduserStore.consentedMappings).toStrictEqual('consentedMappings');
      expect(enduserStore.preferences).toStrictEqual({
        pref1: 'fine',
      });
      expect(enduserStore.profileImage).toBe('profileImage');

      // Check the user values
      expect(userStore.givenName).toBe('gn');
      expect(userStore.sn).toBe('sn');
      expect(userStore.email).toBe('email');
      expect(userStore.userDetails.company).toBe('company');
      expect(userStore.managedResource).toBe('managedResource');
      expect(userStore.userName).toBe('userName');
    });
  });
});
