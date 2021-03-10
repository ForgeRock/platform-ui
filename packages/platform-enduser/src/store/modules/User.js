/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
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
  profileImage: '',
  roles: null,
  schema: null,
  sn: '',
  userId: null,
  userName: '',
  userSearchAttribute: null,
};

const getters = {
  userDetails: (state) => {
    let userFullName;
    if (state.givenName || state.sn) {
      userFullName = `${state.givenName} ${state.sn}`;
    } else {
      userFullName = state.userName || state.userId;
    }

    return {
      name: userFullName,
      company: state.company,
      email: state.email,
      roles: state.roles || [],
    };
  },
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
    state.profileImage = profile.profileImage || '';
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
  getters,
  mutations,
};
