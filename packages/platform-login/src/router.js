/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
