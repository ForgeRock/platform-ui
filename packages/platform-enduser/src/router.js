/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Router from 'vue-router';
import Vue from 'vue';
import i18n from './i18n';

import store from '@/store';

Vue.use(Router);

/**
 * Available toolbar configuration
 * hideToolbar - Will hide main toolbar when route accessed
 */
const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/handleOAuth/:amData',
      component: () => import('@/components/OAuthReturn'),
      meta: { hideToolbar: true, bodyClass: 'fr-body-image' },
    },
    {
      path: '/oauthReturn',
      component: () => import('@/components/OAuthReturn'),
      meta: { hideToolbar: true, bodyClass: 'fr-body-image' },
    },
    {
      path: '/profile',
      name: 'Profile',
      props: true,
      component: () => import('@/components/profile'),
      meta: { authenticate: true },
    },
    {
      path: '/list/:resourceType/:resourceName',
      name: 'ListResource',
      component: () => import(/* webpackChunkName: "listResource" */ '@/views/ListResourceView'),
      meta: { columns: true, authenticate: true },
    },
    {
      path: '/edit/:resourceType/:resourceName/:resourceId',
      name: 'EditResource',
      component: () => import('@/views/EditResourceView'),
      meta: { authenticate: true, listRoute: 'list' },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/components/dashboard'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => {
        if (window.location.search && window.location.search.match(/state|oauth_token/)) {
          next({
            path: '/oauthReturn',
          });
        } else {
          next();
        }
      },
    },
    {
      path: '/sharing',
      name: 'Sharing',
      component: () => import('@/components/uma'),
      meta: {
        authenticate: true,
      },
    },
    {
      path: '/auth-devices',
      component: () => import('@forgerock/platform-shared/src/components/profile/AuthenticationDevices'),
      meta: {
        authenticate: true,
        hideToolbar: true,
      },
    },
    {
      path: '/forbidden',
      name: 'Forbidden',
      component: () => import(/* webpackChunkName: "forbidden" */ '@/components/forbidden'),
      meta: { hideNav: true, hideToolbar: true },
    },
    {
      path: '*',
      component: () => import('@forgerock/platform-shared/src/views/NotFound'),
      meta: { hideToolbar: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const page = to.name ? i18n.t(`pageTitles.${to.name}`) : '';
  document.title = i18n.t('pageTitles.pageTitle', { page });
  const url = new URL(window.location);
  const realm = url.searchParams.get('realm');

  if (store.state.hostedPages === false && to.name !== 'Forbidden') {
    next({ name: 'Forbidden' });
  } else if (realm !== store.state.realm) {
    url.searchParams.set('realm', store.state.realm);
    window.location = encodeURI(url);
    next();
  } else {
    next();
  }
});

export default router;
