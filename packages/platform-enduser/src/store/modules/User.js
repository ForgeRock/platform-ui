/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * State - Enduser data store information
 *      @param {string} userId - Unique system identifier for a user used to get their specific profile information
 *      @param {string} managedResource - Managed object where profile information lives
 *      @param {array} roles - Available roles for a user
 *      @param {object} profile - JSON blob of the managed resource profile details
 *      @param {object} schema - JSON blob of the managed resource schema
 *      @param {string} givenName - Users first name pulled from profile details
 *      @param {string} sn - Users last name pulled from profile details
 *      @param {string} email - Users email pulled from profile details,
 *      @param {string} userName - Users username from profile details
 */
import {
  clone,
  includes,
} from 'lodash';

const defaultState = {
  access: [],
  adminUser: false,
  aliasList: [],
  consentedMappings: null,
  email: '',
  givenName: '',
  internalUser: false,
  managedResource: null,
  preferences: [],
  roles: null,
  schema: null,
  sn: '',
  userId: null,
  userName: '',
  userSearchAttribute: null,
};

const mutations = {
  setAccess(state, access) {
    state.access = clone(access);
  },

  setAliasList(state, aliasList) {
    state.aliasList = [...aliasList];
  },

  setManagedResource(state, managedResource) {
    state.managedResource = managedResource;

    if (managedResource === 'internal/user') {
      state.internalUser = true;
    }
  },

  setProfile(state, profile) {
    state.givenName = profile.givenName || '';
    state.sn = profile.sn || '';
    state.email = profile.mail || '';
    state.userName = profile.userName || '';
    state.consentedMappings = profile.consentedMappings || null;
    state.preferences = profile.preferences || [];
    state.aliasList = profile.aliasList || [];
  },

  setRoles(state, roles) {
    state.roles = clone(roles);

    if (includes(state.roles, 'internal/role/openidm-admin')) {
      state.adminUser = true;
    }
  },

  setSchema(state, schema) {
    state.schema = schema;
  },

  setUserId(state, userId) {
    state.userId = userId;
  },

  setUserSearchAttribute(state, userSearchAttribute) {
    state.userSearchAttribute = userSearchAttribute;
  },
};

export default {
  state: defaultState,
  mutations,
};
