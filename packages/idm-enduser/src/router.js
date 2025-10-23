/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuth } from './composables/useAuth';

const { isAuthenticated, restoreIdmEnduserSession } = useAuth();

/**
 * Checks if the user is authenticated and determines the appropriate navigation path.
 * @async
 * @returns {Promise<{ path: string } | true>} Returns an object with a redirect path if authenticated, otherwise returns true.
 */
async function checkAuthentication() {
  if (isAuthenticated()) {
    return { path: '/dashboard' };
  }
  return true;
}

/**
 * Available routes configuration
 * hideSideMenu - Will hide left-hand navigation when route accessed
 * hideNavBar - Will hide top toolbar when route accessed
 */
const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/handleOAuth/:amData',
    component: () => import('@/components/selfservice/social/OAuthReturn'),
    meta: { hideLayout: true },
  },
  {
    path: '/oauthReturn',
    component: () => import('@/components/selfservice/social/OAuthReturn'),
    meta: { hideLayout: true },
  },
  {
    path: '/login',
    name: 'Login',
    beforeEnter: () => {
      if (isAuthenticated()) {
        return { path: '/dashboard' };
      }
      if (window.location.search && window.location.search.match(/state|oauth_token/)) {
        return { path: '/oauthReturn' };
      }
      return true;
    },
    component: () => import('@/views/Login'),
    meta: { hideLayout: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@forgerock/platform-shared/src/enduser/components/Dashboard/DefaultDashboard'),
    meta: { authenticate: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    props: true,
    component: () => import('@/views/Profile'),
    meta: { authenticate: true },
  },
  {
    path: '/list/:resourceType/:resourceName',
    name: 'ListResource',
    component: () => import(/* webpackChunkName: "listResource" */ '@forgerock/platform-shared/src/enduser/views/ListResourceView'),
    meta: { columns: true, authenticate: true },
  },
  {
    path: '/edit/:resourceType/:resourceName/:resourceId',
    name: 'EditResource',
    component: () => import('@forgerock/platform-shared/src/enduser/views/EditResourceView'),
    meta: { authenticate: true, listRoute: 'list' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@forgerock/platform-shared/src/views/NotFound'),
    meta: { authenticate: true },
  },
  // Self-Service routes
  {
    path: '/forgotusername',
    name: 'ForgotUsername',
    beforeEnter: checkAuthentication,
    component: () => import('@/components/selfservice/forgotusername/ForgotUsername'),
    meta: { hideLayout: true },
  },
  {
    path: '/passwordreset/:queryParams?',
    name: 'PasswordReset',
    beforeEnter: () => {
      if (isAuthenticated()) {
        return { path: '/dashboard' };
      }
      return true;
    },
    component: () => import('@/components/selfservice/passwordreset/PasswordReset'),
    meta: { hideLayout: true },
  },
  {
    path: '/passwordreset/:queryParams',
    name: 'PasswordResetForm',
    beforeEnter: checkAuthentication,
    component: () => import('@/components/selfservice/passwordreset/PasswordReset'),
    meta: { hideLayout: true },
  },
  {
    path: '/registration/:queryParams?',
    name: 'Registration',
    beforeEnter: () => {
      if (isAuthenticated()) {
        return { path: '/dashboard' };
      }
      return true;
    },
    component: () => import('@/components/selfservice/registration/Registration'),
    meta: { hideLayout: true },
  },
  {
    path: '/profilecompletion/:profileProcess?',
    name: 'ProgressiveProfile',
    beforeEnter: checkAuthentication,
    component: () => import('@/components/selfservice/progressiveprofile/ProgressiveProfile'),
    meta: { hideLayout: true },
  },
  {
    path: '/accountClaiming',
    name: 'AccountClaiming',
    component: () => import('@/components/selfservice/registration/AccountClaiming'),
    beforeEnter: checkAuthentication,
    meta: { hideLayout: true },
  },
];

// Initialize router
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export { routes };

// Guards
async function authenticate(to) {
  if (to.meta.authenticate && !isAuthenticated()) {
    try {
      await restoreIdmEnduserSession();
    } catch {
      return { name: 'Login' };
    }
  }
  return true;
}
router.beforeEach(authenticate);

export default router;
