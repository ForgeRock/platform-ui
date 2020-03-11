/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import Router from 'vue-router';
import Vue from 'vue';
import store from '@forgerock/platform-shared/src/store';

Vue.use(Router);

/**
 * Available toolbar configuration
 * hideToolbar - Will hide main toolbar when route accessed
 */
export default new Router({
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
      path: '/login',
      name: 'Login',
      alias: ['/_=_'], // Need alias for catching Facebook odd oAuth return
      beforeEnter: () => {
        window.location = store.state.ApplicationStore.loginURL;
      },
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
      component: () => import(/* webpackChunkName: "listResource" */ '@/components/access'),
      meta: { columns: true, authenticate: true },
    },
    {
      path: '/edit/:resourceType/:resourceName/:resourceId',
      name: 'EditResource',
      component: () => import('@forgerock/platform-shared/src/components/resource/EditResource'),
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
      path: '*',
      component: () => import('@/components/NotFound'),
      meta: { hideToolbar: true, bodyClass: 'fr-body-image' },
    },
  ],
});
