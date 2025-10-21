/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { useRouter } from 'vue-router';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import getFQDN from '@forgerock/platform-shared/src/utils/getFQDN';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import { getUserPrivileges } from '@forgerock/platform-shared/src/api/PrivilegeApi';
import useSelfService from '@/composables/selfService';
import {
  getAccessToken, getProfile, login, logout,
} from '../api/AuthenticationApi';
import store from '@/store';

const idmContext = getFQDN(process.env.VUE_APP_IDM_URL);

/**
 * Composable function to handle authentication
 * @returns {Object} The authentication functions
 *
 * @example
 *
 * import { useAuth } from './composables/useAuth';
 *
 * const { isAuthenticated, restoreIdmEnduserSession, loginIdmEnduser, initializeLogout } = useAuth();
 *
 * initializeLogout();
 * restoreIdmEnduserSession();
 *
 * if (!isAuthenticated()) {
 *   window.location.hash = '/login';
 *   return;
 * }
 *
 * // continue with the app
 * console.log('User is authenticated');
 * ...
 */
// eslint-disable-next-line import/prefer-default-export
export function useAuth() {
  // user and enduser stores initialization, this is required because this
  // composable is used in the router and depending on the order the router
  // plugin is initialized the pinia store plugin is probably not used by the app yet.
  let userStoreInstance;
  let enduserStoreInstance;
  const { progressiveProfileCheck } = useSelfService();
  const router = useRouter();

  function getUserStore() {
    if (!userStoreInstance) {
      userStoreInstance = useUserStore();
    }
    return userStoreInstance;
  }

  function getEnduserStore() {
    if (!enduserStoreInstance) {
      enduserStoreInstance = useEnduserStore();
    }
    return enduserStoreInstance;
  }

  /**
   * Load the user information from the IDM API
   * @param {Object} data The data from the IDM API
   * @returns {Promise} The response from the API
   * @example
   * loadIdmEnduserInfo(data);
   */
  async function loadIdmEnduserInfo(data) {
    if (data.authorization.id === 'openidm-admin') {
      // amadmin/openidm-admin don't need access to end user,
      // so send them back to the admin to avoid problems.
      window.location.href = process.env.VUE_APP_ADMIN_URL;
      return;
    }

    const userStore = getUserStore();
    userStore.userId = data.authorization.id;
    userStore.managedResource = data.authorization.component;

    // Get profile information from the IDM API
    const [userInfo, privileges, schema] = await Promise.all([
      getProfile(userStore.managedResource, userStore.userId),
      getUserPrivileges(),
      getSchema(userStore.managedResource, { baseURL: idmContext }),
    ]);
    userStore.privileges = privileges.data;

    const enduserStore = getEnduserStore();
    enduserStore.setProfile(userInfo.data);
    enduserStore.managedResourceSchema = schema.data;
  }

  /**
   * Check if the user is authenticated
   * @returns {Boolean} True if the user is authenticated
   */
  function isAuthenticated() {
    const userStore = getUserStore();
    return !!userStore.userId;
  }

  /**
   * Restore the IDM enduser session
   * @returns {Promise} The response from the API
   */
  async function restoreIdmEnduserSession() {
    const { data } = await getAccessToken();
    loadIdmEnduserInfo(data);
  }

  /**
   * Login the IDM enduser
   * @param {String} username The username
   * @param {String} password The password
   * @param {Boolean} noSession Whether to create a session or not
   * @returns {Promise} The response from the API
   */
  async function loginIdmEnduser(username, password, noSession = false) {
    const { data } = await login(username, password, noSession);
    if (store.state.FeatureFlagsStore.isSelfServiceEnabled) {
      await progressiveProfileCheck(data, async () => {
        await loadIdmEnduserInfo(data);
        router.push({ name: 'Dashboard' });
      });
    } else {
      await loadIdmEnduserInfo(data);
      router.push({ name: 'Dashboard' });
    }
  }

  // trigger logout from anywhere in the SPA by calling this global function
  function initializeLogout() {
    window.logout = async () => {
      await logout();

      // reset stores to default data
      const userStore = getUserStore();
      userStore.$reset();
      const enduserStore = getEnduserStore();
      enduserStore.$reset();

      window.location.hash = '/login';
    };
  }

  return {
    isAuthenticated,
    restoreIdmEnduserSession,
    loginIdmEnduser,
    loadIdmEnduserInfo,
    initializeLogout,
  };
}
