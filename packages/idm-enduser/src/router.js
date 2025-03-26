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
    component: () => import('@/views/Dashboard'),
    meta: { authenticate: true },
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
