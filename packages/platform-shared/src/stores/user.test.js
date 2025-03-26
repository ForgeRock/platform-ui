/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from './user';

const idmUIAdminRoles = [
  'internal/role/openidm-admin',
  'openidm-admin',
  'managed/teammembergroup/tenant-auditor',
  'super-admins',
  'tenant-admins',
];

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should return the correct initial state', () => {
    const userStore = useUserStore();

    expect(userStore.managedResource).toBe('');
    expect(userStore.userSearchAttribute).toBe('');
    expect(userStore.idmRoles).toStrictEqual([]);
    expect(userStore.adminUser).toBe(false);
    expect(userStore.amRoles).toStrictEqual([]);
    expect(userStore.realmAdmin).toBe(false);
    expect(userStore.amAdmin).toBe(false);
    expect(userStore.privileges).toStrictEqual({});
    expect(userStore.hasFederationAdminPrivilege).toBe(false);
    expect(userStore.email).toBe('');
    expect(userStore.givenName).toBe('');
    expect(userStore.sn).toBe('');
    expect(userStore.userId).toBe('');
    expect(userStore.userName).toBe('');
    expect(userStore.name).toBe('');
    expect(userStore.effectiveRoles).toStrictEqual([]);
    expect(userStore.allRoles).toStrictEqual([]);
    expect(userStore.userDetails).toStrictEqual({
      company: '',
      email: '',
      name: '',
      roles: [],
      userName: '',
    });
  });

  it('should reset the user store', () => {
    const userStore = useUserStore();
    userStore.managedResource = 'managedResource';
    userStore.userSearchAttribute = 'userSearchAttribute';
    userStore.idmRoles = ['idmRoles'];
    userStore.idmUIAdminRoles = idmUIAdminRoles;
    userStore.amRoles = ['amRoles'];
    userStore.amAdmin = true;
    userStore.privileges = { privileges: 'privileges' };
    userStore.email = 'email';
    userStore.givenName = 'givenName';
    userStore.sn = 'sn';
    userStore.userId = 'userId';
    userStore.userName = 'userName';

    userStore.$reset();

    expect(userStore.managedResource).toBe('');
    expect(userStore.userSearchAttribute).toBe('');
    expect(userStore.idmRoles).toStrictEqual([]);
    expect(userStore.adminUser).toBe(false);
    expect(userStore.amRoles).toStrictEqual([]);
    expect(userStore.realmAdmin).toBe(false);
    expect(userStore.amAdmin).toBe(false);
    expect(userStore.privileges).toStrictEqual({});
    expect(userStore.hasFederationAdminPrivilege).toBe(false);
    expect(userStore.email).toBe('');
    expect(userStore.givenName).toBe('');
    expect(userStore.sn).toBe('');
    expect(userStore.userId).toBe('');
    expect(userStore.userName).toBe('');
  });

  describe('setting user details', () => {
    it('should set user details with passed data', () => {
      const userStore = useUserStore();
      userStore.setUserDetails({
        givenName: 'gn',
        sn: 'sn',
        mail: 'email',
        company: 'company',
        managedResource: 'managedResource',
        userName: 'userName',
      });
      expect(userStore.givenName).toBe('gn');
      expect(userStore.sn).toBe('sn');
      expect(userStore.email).toBe('email');
      expect(userStore.userDetails.company).toBe('company');
      expect(userStore.managedResource).toBe('managedResource');
      expect(userStore.userName).toBe('userName');
    });

    it('should set internal user details with default data', () => {
      const userStore = useUserStore();
      userStore.setInternalUserDetails();

      expect(userStore.givenName).toBe('Platform');
      expect(userStore.sn).toBe('Admin');
      expect(userStore.email).toBe('No Email');
      expect(userStore.userDetails.company).toBe('System');
    });
  });

  describe('computing the users name', () => {
    it('combines the given name and surname if both are present', () => {
      const userStore = useUserStore();
      userStore.givenName = 'givenName';
      userStore.sn = 'sn';
      expect(userStore.name).toBe('givenName sn');
    });

    it('returns the given name if the surname is not present', () => {
      const userStore = useUserStore();
      userStore.givenName = 'givenName';
      expect(userStore.name).toBe('givenName');
    });

    it('returns the surname if the given name is not present', () => {
      const userStore = useUserStore();
      userStore.sn = 'sn';
      expect(userStore.name).toBe('sn');
    });

    it('returns the userName if neither the given name or surname are present', () => {
      const userStore = useUserStore();
      userStore.userName = 'userName';
      expect(userStore.name).toBe('userName');
    });

    it('returns the userId if neither the given name, surname or userName are present', () => {
      const userStore = useUserStore();
      userStore.userId = 'userId';
      expect(userStore.name).toBe('userId');
    });
  });

  describe('computing user details', () => {
    it('returns the user details', () => {
      const userStore = useUserStore();
      userStore.setUserDetails({
        givenName: 'gn',
        sn: 'sn',
        mail: 'email',
        company: 'company',
        userName: 'userName',
      });
      userStore.idmRoles = ['internal/role/openidm-admin', 'openidm-admin'];
      userStore.idmUIAdminRoles = idmUIAdminRoles;

      expect(userStore.userDetails).toStrictEqual({
        name: 'gn sn',
        userName: 'userName',
        company: 'company',
        email: 'email',
        roles: ['adminUser'],
      });
    });
  });

  describe('computing roles', () => {
    describe('computing adminUser', () => {
      it('returns true if the user has the internal/role/openidm-admin or openidm-admin idm roles', () => {
        const userStore = useUserStore();
        userStore.idmRoles = ['internal/role/openidm-admin', 'openidm-admin'];
        userStore.idmUIAdminRoles = idmUIAdminRoles;
        expect(userStore.adminUser).toBe(true);
      });

      it('returns true if the user only has the internal/role/openidm-admin idm role', () => {
        const userStore = useUserStore();
        userStore.idmRoles = ['internal/role/openidm-admin'];
        userStore.idmUIAdminRoles = idmUIAdminRoles;
        expect(userStore.adminUser).toBe(true);
      });

      it('returns true if the user only has the openidm-admin idm role', () => {
        const userStore = useUserStore();
        userStore.idmRoles = ['openidm-admin'];
        userStore.idmUIAdminRoles = idmUIAdminRoles;
        expect(userStore.adminUser).toBe(true);
      });

      it('returns true if the user only has the managed/teammembergroup/tenant-auditor idm role', () => {
        const userStore = useUserStore();
        userStore.idmRoles = ['managed/teammembergroup/tenant-auditor'];
        userStore.idmUIAdminRoles = idmUIAdminRoles;
        expect(userStore.adminUser).toBe(true);
      });

      it('returns true if the user only has the super-admins idm role', () => {
        const userStore = useUserStore();
        userStore.idmRoles = ['super-admins'];
        userStore.idmUIAdminRoles = idmUIAdminRoles;
        expect(userStore.adminUser).toBe(true);
      });

      it('returns true if the user only has the tenant-admins idm role', () => {
        const userStore = useUserStore();
        userStore.idmRoles = ['tenant-admins'];
        userStore.idmUIAdminRoles = idmUIAdminRoles;
        expect(userStore.adminUser).toBe(true);
      });

      it('returns false if the user does not have the internal/role/openidm-admin or openidm-admin idm roles', () => {
        const userStore = useUserStore();
        userStore.idmRoles = ['internal/role/openidm-user'];
        userStore.idmUIAdminRoles = idmUIAdminRoles;
        expect(userStore.adminUser).toBe(false);
      });
    });

    describe('computing realmAdmin', () => {
      it('returns true if the user has the ui-realm-admin am role', () => {
        const userStore = useUserStore();
        userStore.amRoles = ['ui-realm-admin'];
        expect(userStore.realmAdmin).toBe(true);
      });

      it('returns true if the user has the ui-global-admin am role', () => {
        const userStore = useUserStore();
        userStore.amRoles = ['ui-global-admin'];
        expect(userStore.realmAdmin).toBe(true);
      });

      it('returns false if the user does not have the ui-realm-admin am role', () => {
        const userStore = useUserStore();
        userStore.amRoles = ['ui-realm-user'];
        expect(userStore.realmAdmin).toBe(false);
      });
    });

    describe('computing effective roles', () => {
      it('returns an array including adminUser if the user is an idm admin', () => {
        const userStore = useUserStore();
        userStore.idmRoles = ['internal/role/openidm-admin', 'openidm-admin'];
        userStore.idmUIAdminRoles = idmUIAdminRoles;
        expect(userStore.effectiveRoles).toStrictEqual(['adminUser']);
      });

      it('returns an array including realmAdmin if the user is a realm admin', () => {
        const userStore = useUserStore();
        userStore.amRoles = ['ui-realm-admin'];
        expect(userStore.effectiveRoles).toStrictEqual(['realmAdmin']);
      });

      it('returns an array including amAdmin if the user is an am admin', () => {
        const userStore = useUserStore();
        userStore.amAdmin = true;
        expect(userStore.effectiveRoles).toStrictEqual(['amAdmin']);
      });
    });

    describe('computing all roles', () => {
      it('returns an array including am roles, idm roles and the effective roles', () => {
        const userStore = useUserStore();
        userStore.amRoles = ['ui-realm-admin'];
        userStore.idmRoles = ['internal/role/openidm-admin', 'openidm-admin'];
        userStore.idmUIAdminRoles = idmUIAdminRoles;
        userStore.amAdmin = true;
        expect(userStore.allRoles).toStrictEqual(['adminUser', 'realmAdmin', 'amAdmin', 'internal/role/openidm-admin', 'openidm-admin', 'ui-realm-admin']);
      });
    });

    describe('computing privilege information', () => {
      it('indicates the user has federation admin privileges if their privileges contain the federation admin privilege with the value true', () => {
        const userStore = useUserStore();
        userStore.privileges = { FederationAdmin: true };
        expect(userStore.hasFederationAdminPrivilege).toBe(true);
      });

      it('indicates the user does not have federation admin privileges if their privileges contain the federation admin privilege with the value false', () => {
        const userStore = useUserStore();
        userStore.privileges = { FederationAdmin: false };
        expect(userStore.hasFederationAdminPrivilege).toBe(false);
      });

      it('indicates the user does not have federation admin privileges if their privileges do not contain the federation admin privilege', () => {
        const userStore = useUserStore();
        userStore.privileges = ['federation-user'];
        expect(userStore.hasFederationAdminPrivilege).toBe(false);
      });

      it('should change the IDMUsersView privilege', () => {
        const userStore = useUserStore();
        userStore.setIDMUsersViewPrivilege(false);
        expect(userStore.hasIDMUsersViewPrivilege).toBe(false);
      });
    });
  });
});
