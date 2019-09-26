import Store from '@/store/store';

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
