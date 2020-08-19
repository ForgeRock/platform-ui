/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import {
  clone,
  includes,
} from 'lodash';

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
  realmAdmin: false,
  amAdmin: false,
  schema: null,
  access: [],
  givenName: '',
  sn: '',
  email: '',
  userName: '',
  preferences: [],
  aliasList: [],
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

  setRealmAdmin(context, realmAdmin) {
    context.commit('setRealmAdmin', realmAdmin);
  },

  setAmAdmin(context, amAdmin) {
    context.commit('setAmAdmin', amAdmin);
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

  setAliasListAction(context, aliasList) {
    context.commit('setAliasListAction', aliasList);
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
    state.preferences = profile.preferences || [];
    state.aliasList = profile.aliasList || [];
  },

  clearProfileAction(state) {
    state.givenName = '';
    state.sn = '';
    state.email = '';
    state.userName = '';
    state.consentedMappings = [];
    state.preferences = [];
    state.aliasList = [];
  },

  setSchemaAction(state, schema) {
    state.schema = schema;
  },

  clearSchemaAction(state) {
    state.schema = null;
  },

  setUserIdAction(state, userId) {
    state.userId = clone(userId);
  },

  clearUserIdAction(state) {
    state.userId = null;
  },

  setManagedResourceAction(state, managedResource) {
    state.managedResource = clone(managedResource);

    if (managedResource === 'internal/user') {
      state.internalUser = true;
    }
  },

  clearManagedResourceAction(state) {
    state.managedResource = null;
  },

  setRolesAction(state, roles) {
    state.roles = clone(roles);

    if (includes(state.roles, 'internal/role/openidm-admin')) {
      state.adminUser = true;
    }
  },

  setRealmAdmin(state, realmAdmin) {
    state.realmAdmin = clone(realmAdmin);
  },

  setAmAdmin(state, amAdmin) {
    state.amAdmin = clone(amAdmin);
  },

  clearRolesAction(state) {
    state.roles = null;
  },

  setAccess(state, access) {
    state.access = clone(access);
  },

  clearAccess(state) {
    state.access = [];
  },

  setAliasListAction(state, aliasList) {
    state.aliasList = clone(aliasList);
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
    state.realmAdmin = false;
    state.amAdmin = false;
    state.access = [];
    state.consentedMappings = [];
    state.preferences = [];
    state.aliasList = [];
  },
};

export default {
  state: defaultState,
  getters,
  actions,
  mutations,
};
