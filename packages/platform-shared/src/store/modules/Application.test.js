/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import Store from '../index';

describe('Application Store', () => {
  it('authHeaders state management', () => {
    expect(Store.state.ApplicationStore.authHeaders).toBeNull();

    Store.commit('ApplicationStore/setAuthHeadersAction', { 'test-header': 'test' });

    expect(JSON.stringify(Store.state.ApplicationStore.authHeaders)).toBe(JSON.stringify({ 'test-header': 'test' }));

    Store.commit('ApplicationStore/clearAuthHeadersAction');

    expect(Store.state.ApplicationStore.authHeaders).toBeNull();
  });

  it('loginRedirect state management', () => {
    expect(Store.state.ApplicationStore.loginRedirect).toBeNull();

    Store.commit('ApplicationStore/setLoginRedirect', 'testUrl');

    expect(Store.state.ApplicationStore.loginRedirect).toBe('testUrl');

    Store.commit('ApplicationStore/clearLoginRedirect');
  });
});
