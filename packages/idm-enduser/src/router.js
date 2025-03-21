/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuth } from './composables/useAuth';

const { isAuthenticated, restoreIdmEnduserSession } = useAuth();

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
    path: '/login',
    name: 'Login',
    beforeEnter: async () => {
      if (isAuthenticated()) {
        return { path: '/dashboard' };
      }
      return true;
    },
    component: () => import('@/views/Login'),
    meta: { hideLayout: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@forgerock/platform-shared/src/components/Dashboard/DefaultDashboard'),
    meta: { authenticate: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    props: true,
    component: () => import('@/views/profile'),
    meta: { authenticate: true },
  },
  {
    path: '/list/:resourceType/:resourceName',
    name: 'ListResource',
    component: () => import(/* webpackChunkName: "listResource" */ '@forgerock/platform-shared/src/views/ListResourceView'),
    meta: { columns: true, authenticate: true },
  },
  {
    path: '/edit/:resourceType/:resourceName/:resourceId',
    name: 'EditResource',
    component: () => import('@forgerock/platform-shared/src/views/EditResourceView'),
    meta: { authenticate: true, listRoute: 'list' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@forgerock/platform-shared/src/views/NotFound'),
    meta: { authenticate: true },
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
