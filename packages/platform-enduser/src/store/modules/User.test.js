import _ from 'lodash';
import Store from '@/store/store';

describe('User Store', () => {
	it('userId state management', () => {
		expect(Store.state.UserStore.userId).toBeNull();

		Store.commit('UserStore/setUserIdAction', 'test');

		expect(Store.state.UserStore.userId).toBe('test');

		Store.commit('UserStore/clearUserIdAction');

		expect(Store.state.UserStore.userId).toBeNull();
	});

	it('access state management', () => {
		expect(Store.state.UserStore.access.length).toBe(0);

		Store.commit('UserStore/setAccess', ['test']);

		expect(Store.state.UserStore.access.length).toBe(1);

		Store.commit('UserStore/clearAccess');

		expect(Store.state.UserStore.access.length).toBe(0);
	});

	it('managedResource state management', () => {
		expect(Store.state.UserStore.managedResource).toBeNull();

		Store.commit('UserStore/setManagedResourceAction', 'test');

		expect(Store.state.UserStore.managedResource).toBe('test');

		Store.commit('UserStore/clearManagedResourceAction');

		expect(Store.state.UserStore.managedResource).toBeNull();
	});

	it('roles state management', () => {
		expect(Store.state.UserStore.roles).toBeNull();

		Store.commit('UserStore/setRolesAction', 'test');

		expect(Store.state.UserStore.roles).toBe('test');

		Store.commit('UserStore/clearRolesAction');

		expect(Store.state.UserStore.roles).toBeNull();
	});

	it('Clear all state management', () => {
		Store.commit('UserStore/setRolesAction', 'test');
		Store.commit('UserStore/setManagedResourceAction', 'test');
		Store.commit('UserStore/setUserIdAction', 'test');

		expect(Store.state.UserStore.roles).toBe('test');
		expect(Store.state.UserStore.managedResource).toBe('test');
		expect(Store.state.UserStore.userId).toBe('test');

		Store.commit('UserStore/clearStoreAction');

		expect(Store.state.UserStore.roles).toBeNull();
		expect(Store.state.UserStore.managedResource).toBeNull();
		expect(Store.state.UserStore.userId).toBeNull();
	});

	it('profile state management', () => {
		Store.commit('UserStore/setProfileAction', {
			givenName: 'test',
			sn: 'test',
			mail: 'test',
			userName: 'test',
		});

		expect(Store.state.UserStore.givenName).toBe('test');
		expect(Store.state.UserStore.sn).toBe('test');
		expect(Store.state.UserStore.email).toBe('test');
		expect(Store.state.UserStore.userName).toBe('test');

		Store.commit('UserStore/clearProfileAction');

		expect(_.isNull(Store.state.UserStore.profile)).toBe(true);
		expect(Store.state.UserStore.givenName).toBe('');
		expect(Store.state.UserStore.sn).toBe('');
		expect(Store.state.UserStore.email).toBe('');
		expect(Store.state.UserStore.userName).toBe('');

		Store.commit('UserStore/setProfileAction', {});

		expect(_.isObject(Store.state.UserStore.profile)).toBe(true);
		expect(Store.state.UserStore.givenName).toBe('');
		expect(Store.state.UserStore.sn).toBe('');
		expect(Store.state.UserStore.email).toBe('');
		expect(Store.state.UserStore.userName).toBe('');
	});

	it('schema state management', () => {
		Store.commit('UserStore/setSchemaAction', {
			name: 'test',
		});

		expect(Store.state.UserStore.schema.name).toBe('test');

		Store.commit('UserStore/clearSchemaAction');

		expect(_.isNull(Store.state.UserStore.schema)).toBe(true);
	});
});
