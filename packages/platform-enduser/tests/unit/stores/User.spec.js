import _ from 'lodash';
import { expect } from 'chai';
import Store from '@/store/store';

describe('User Store', () => {
	it('userId state management', () => {
		expect(Store.state.UserStore.userId).to.equal(null);

		Store.commit('UserStore/setUserIdAction', 'test');

		expect(Store.state.UserStore.userId).to.equal('test');

		Store.commit('UserStore/clearUserIdAction');

		expect(Store.state.UserStore.userId).to.equal(null);
	});

	it('access state management', () => {
		expect(Store.state.UserStore.access.length).to.equal(0);

		Store.commit('UserStore/setAccess', ['test']);

		expect(Store.state.UserStore.access.length).to.equal(1);

		Store.commit('UserStore/clearAccess');

		expect(Store.state.UserStore.access.length).to.equal(0);
	});

	it('managedResource state management', () => {
		expect(Store.state.UserStore.managedResource).to.equal(null);

		Store.commit('UserStore/setManagedResourceAction', 'test');

		expect(Store.state.UserStore.managedResource).to.equal('test');

		Store.commit('UserStore/clearManagedResourceAction');

		expect(Store.state.UserStore.managedResource).to.equal(null);
	});

	it('roles state management', () => {
		expect(Store.state.UserStore.roles).to.equal(null);

		Store.commit('UserStore/setRolesAction', 'test');

		expect(Store.state.UserStore.roles).to.equal('test');

		Store.commit('UserStore/clearRolesAction');

		expect(Store.state.UserStore.roles).to.equal(null);
	});

	it('Clear all state management', () => {
		Store.commit('UserStore/setRolesAction', 'test');
		Store.commit('UserStore/setManagedResourceAction', 'test');
		Store.commit('UserStore/setUserIdAction', 'test');

		expect(Store.state.UserStore.roles).to.equal('test');
		expect(Store.state.UserStore.managedResource).to.equal('test');
		expect(Store.state.UserStore.userId).to.equal('test');

		Store.commit('UserStore/clearStoreAction');

		expect(Store.state.UserStore.roles).to.equal(null);
		expect(Store.state.UserStore.managedResource).to.equal(null);
		expect(Store.state.UserStore.userId).to.equal(null);
	});

	it('profile state management', () => {
		Store.commit('UserStore/setProfileAction', {
			givenName: 'test',
			sn: 'test',
			mail: 'test',
			userName: 'test',
		});

		expect(Store.state.UserStore.givenName).to.equal('test');
		expect(Store.state.UserStore.sn).to.equal('test');
		expect(Store.state.UserStore.email).to.equal('test');
		expect(Store.state.UserStore.userName).to.equal('test');

		Store.commit('UserStore/clearProfileAction');

		expect(_.isNull(Store.state.UserStore.profile)).to.equal(true);
		expect(Store.state.UserStore.givenName).to.equal('');
		expect(Store.state.UserStore.sn).to.equal('');
		expect(Store.state.UserStore.email).to.equal('');
		expect(Store.state.UserStore.userName).to.equal('');

		Store.commit('UserStore/setProfileAction', {});

		expect(_.isObject(Store.state.UserStore.profile)).to.equal(true);
		expect(Store.state.UserStore.givenName).to.equal('');
		expect(Store.state.UserStore.sn).to.equal('');
		expect(Store.state.UserStore.email).to.equal('');
		expect(Store.state.UserStore.userName).to.equal('');
	});

	it('schema state management', () => {
		Store.commit('UserStore/setSchemaAction', {
			name: 'test',
		});

		expect(Store.state.UserStore.schema.name).to.equal('test');

		Store.commit('UserStore/clearSchemaAction');

		expect(_.isNull(Store.state.UserStore.schema)).to.equal(true);
	});
});
