/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/Login'),
    },
    {
      path: '/logout',
      name: 'logout',
    },
    {
      path: '/service/:tree',
      name: 'service',
      component: () => import('@/views/Login'),
    },
    {
      // send any bad routes to default login
      path: '*',
      redirect: '/',
    },
  ],
});
