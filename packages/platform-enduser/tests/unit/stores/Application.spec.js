import { expect } from 'chai';
import Store from '@/store/store';

describe('Application Store', () => {
	it('authHeaders state management', () => {
		expect(Store.state.ApplicationStore.authHeaders).to.equal(null);

		Store.commit('ApplicationStore/setAuthHeadersAction', { 'test-header': 'test' });

		expect(JSON.stringify(Store.state.ApplicationStore.authHeaders)).to.equal(JSON.stringify({ 'test-header': 'test' }));

		Store.commit('ApplicationStore/clearAuthHeadersAction');

		expect(Store.state.ApplicationStore.authHeaders).to.equal(null);
	});

	it('loginRedirect state management', () => {
		expect(Store.state.ApplicationStore.loginRedirect).to.equal(null);

		Store.commit('ApplicationStore/setLoginRedirect', 'testUrl');

		expect(Store.state.ApplicationStore.loginRedirect).to.equal('testUrl');

		Store.commit('ApplicationStore/clearLoginRedirect');
	});
});
