/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import Store from '../index';

describe('User Store', () => {
  it('setAccess', () => {
    expect(Store.state.UserStore.access.length).toBe(0);

    Store.commit('UserStore/setAccess', ['test']);
    expect(Store.state.UserStore.access.length).toBe(1);

    Store.commit('UserStore/setAccess', []);
    expect(Store.state.UserStore.access.length).toBe(0);
  });

  it('setAliasList', () => {
    expect(Store.state.UserStore.aliasList.length).toBe(0);

    Store.commit('UserStore/setAliasList', ['google']);
    expect(Store.state.UserStore.aliasList.length).toBe(1);

    Store.commit('UserStore/setAliasList', []);
    expect(Store.state.UserStore.aliasList.length).toBe(0);
  });

  it('setManagedResource', () => {
    expect(Store.state.UserStore.managedResource).toBeNull();

    Store.commit('UserStore/setManagedResource', 'test');
    expect(Store.state.UserStore.managedResource).toBe('test');
    expect(Store.state.UserStore.internalUser).toBe(false);

    Store.commit('UserStore/setManagedResource', 'internal/user');
    expect(Store.state.UserStore.managedResource).toBe('internal/user');
    expect(Store.state.UserStore.internalUser).toBe(true);
  });

  it('setProfile', () => {
    Store.commit('UserStore/setProfile', {
      givenName: 'test',
      sn: 'test',
      mail: 'test',
      userName: 'test',
      consentedMappings: { test: 'test' },
      preferences: ['test'],
      aliasList: ['test'],
    });

    expect(Store.state.UserStore.givenName).toBe('test');
    expect(Store.state.UserStore.sn).toBe('test');
    expect(Store.state.UserStore.email).toBe('test');
    expect(Store.state.UserStore.userName).toBe('test');
    expect(Store.state.UserStore.consentedMappings.test).toBe('test');
    expect(Store.state.UserStore.preferences[0]).toBe('test');
    expect(Store.state.UserStore.aliasList[0]).toBe('test');

    Store.commit('UserStore/setProfile', {});

    expect(Store.state.UserStore.givenName).toBe('');
    expect(Store.state.UserStore.sn).toBe('');
    expect(Store.state.UserStore.email).toBe('');
    expect(Store.state.UserStore.userName).toBe('');
    expect(Store.state.UserStore.consentedMappings).toBe(null);
    expect(Store.state.UserStore.preferences.length).toBe(0);
    expect(Store.state.UserStore.aliasList.length).toBe(0);
  });

  it('setRoles', () => {
    expect(Store.state.UserStore.roles).toBeNull();

    Store.commit('UserStore/setRoles', ['test']);
    expect(Store.state.UserStore.roles[0]).toBe('test');
    expect(Store.state.UserStore.adminUser).toBe(false);

    Store.commit('UserStore/setRoles', null);
    expect(Store.state.UserStore.roles).toBeNull();

    Store.commit('UserStore/setRoles', ['internal/role/openidm-admin']);
    expect(Store.state.UserStore.roles[0]).toBe('internal/role/openidm-admin');
    expect(Store.state.UserStore.adminUser).toBe(true);
  });

  it('setSchema', () => {
    Store.commit('UserStore/setSchema', {
      name: 'test',
    });

    expect(Store.state.UserStore.schema.name).toBe('test');
  });

  it('setUserId', () => {
    expect(Store.state.UserStore.userId).toBeNull();

    Store.commit('UserStore/setUserId', 'test');
    expect(Store.state.UserStore.userId).toBe('test');
  });

  it('setUserSearchAttribute', () => {
    expect(Store.state.UserStore.userSearchAttribute).toBeNull();

    Store.commit('UserStore/setUserSearchAttribute', 'test');
    expect(Store.state.UserStore.userSearchAttribute).toBe('test');
  });
});
