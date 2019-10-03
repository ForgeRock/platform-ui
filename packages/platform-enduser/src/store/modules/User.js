import _ from 'lodash';

/**
 * State - Enduser data store information
 *      @param {string} userId - Unique system identifier for a user used to get their specific profile information
 *      @param {string} managedResource - Managed object where profile information lives
 *      @param {array} roles - Available roles for a user
 *      @param {object} profile - JSON blob of the managed resource profile details
 *      @param {object} schema - JSON blob of the managed resource schema
 *      @param {string} firstName - Users first name pulled from profile details
 *      @param {string} sn - Users last name pulled from profile details
 *      @param {string} email - Users email pulled from profile details,
 *      @param {string} userName - Users username from profile details
 *      @param {array} access - Available resources user has access to
 */

const defaultState = {
	userId: null,
	managedResource: null,
	roles: null,
	internalUser: false,
	adminUser: false,
	profile: null,
	schema: null,
	access: [],
	givenName: '',
	sn: '',
	email: '',
	userName: '',
};

const getters = {
	getUserState(state) { return state; },
};

const actions = {
	setProfileAction(context, profile) {
		context.commit('setProfileAction', profile);
	},

	clearProfileAction(context) {
		context.commit('clearProfileAction');
	},

	setSchemaAction(context, schema) {
		context.commit('setSchemaAction', schema);
	},

	clearSchemaAction(context) {
		context.commit('clearSchemaAction');
	},

	setUserIdAction(context, userId) {
		context.commit('setUserIdAction', userId);
	},

	clearUserIdAction(context) {
		context.commit('clearUserIdAction');
	},

	setManagedResourceAction(context, managedResource) {
		context.commit('setManagedResourceAction', managedResource);
	},

	clearManagedResourceAction(context) {
		context.commit('clearManagedResourceAction');
	},

	setRolesAction(context, roles) {
		context.commit('setRolesAction', roles);
	},

	clearRolesAction(context) {
		context.commit('clearRolesAction');
	},

	setAccess(context, access) {
		context.commit('setAccess', access);
	},

	clearAccess(context) {
		context.commit('clearAccess');
	},

	clearStoreAction(context) {
		context.commit('clearStoreAction');
	},
};

const mutations = {
	setProfileAction(state, profile) {
		state.givenName = profile.givenName || '';
		state.sn = profile.sn || '';
		state.email = profile.mail || '';
		state.userName = profile.userName || '';
		state.consentedMappings = profile.consentedMappings || null;
		state.name = profile.name || '';
		state.profile = profile;
	},

	clearProfileAction(state) {
		state.givenName = '';
		state.sn = '';
		state.email = '';
		state.userName = '';
		state.consentedMappings = [];
		state.name = '';
		state.profile = null;
	},

	setSchemaAction(state, schema) {
		state.schema = schema;
	},

	clearSchemaAction(state) {
		state.schema = null;
	},

	setUserIdAction(state, userId) {
		state.userId = _.clone(userId);
	},

	clearUserIdAction(state) {
		state.userId = null;
	},

	setManagedResourceAction(state, managedResource) {
		state.managedResource = _.clone(managedResource);

		if (managedResource === 'internal/user') {
			state.internalUser = true;
		}
	},

	clearManagedResourceAction(state) {
		state.managedResource = null;
	},

	setRolesAction(state, roles) {
		state.roles = _.clone(roles);

		if (_.includes(state.roles, 'internal/role/openidm-admin')) {
			state.adminUser = true;
		}
	},

	clearRolesAction(state) {
		state.roles = null;
	},

	setAccess(state, access) {
		state.access = _.clone(access);
	},

	clearAccess(state) {
		state.access = [];
	},

	clearStoreAction(state) {
		state.userId = null;
		state.managedResource = null;
		state.roles = null;
		state.schema = null;
		state.givenName = '';
		state.sn = '';
		state.email = '';
		state.userName = '';
		state.internalUser = false;
		state.adminUser = false;
		state.access = [];
		state.consentedMappings = [];
		state.name = '';
		state.preferences = null;
	},
};

export default {
	state: defaultState,
	getters,
	actions,
	mutations,
};
