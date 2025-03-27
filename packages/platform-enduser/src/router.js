/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createRouter, createWebHashHistory } from 'vue-router';
import checkIfRouteCanBeAccessed from '@forgerock/platform-shared/src/utils/routerGuard';
import i18n from './i18n';
import store from '@/store';

function configureRouterHistory() {
  // '&loggedin=true' parameter in the url causes Vue Router to calculate routes incorrectly, as it interprets the parameter as part of the hash.
  // Removing this parameter helps in ensuring that Vue Router computes the routes correctly
  if (window.location.hash.endsWith('&loggedin=true')) {
    window.location.hash = window.location.hash.slice(0, -14);
  }
  return createWebHashHistory();
}

/**
 * Available configuration
 * hideSideMenu - Will hide left-hand navigation when route accessed
 * hideNavBar - Will hide top toolbar when route accessed
 */
const router = createRouter({
  history: configureRouterHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/risk-dashboard',
      name: 'RiskDashboard',
      component: () => import('@forgerock/platform-shared/src/views/AutoAccess/Activity'),
    },
    {
      path: '/autoaccess/data-sources',
      name: 'AutoAccessDataSources',
      component: () => import('@forgerock/platform-shared/src/views/AutoAccess/DataSources'),
    },
    {
      path: '/autoaccess/pipelines',
      name: 'AutoAccessPipelines',
      component: () => import('@forgerock/platform-shared/src/views/AutoAccess/Pipelines'),
    },
    {
      path: '/autoaccess/risk-config',
      name: 'AutoAccessRiskConfig',
      component: () => import('@forgerock/platform-shared/src/views/AutoAccess/RiskConfig'),
    },
    {
      path: '/handleOAuth/:amData',
      component: () => import('@/components/OAuthReturn'),
      meta: { hideSideMenu: true, bodyClass: 'fr-body-image' },
    },
    {
      path: '/oauthReturn',
      component: () => import('@/components/OAuthReturn'),
      meta: { hideSideMenu: true, bodyClass: 'fr-body-image' },
    },
    {
      path: '/profile',
      name: 'Profile',
      props: true,
      component: () => import('@/components/profile'),
      meta: { authenticate: true },
    },
    {
      path: '/administer',
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
      meta: { authenticate: true },
      children: [
        {
          path: 'entitlements',
          children: [
            {
              path: '',
              name: 'AdministerEntitlements',
              component: () => import('@/views/governance/LCM/Entitlements/EntitlementList'),
              beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.govLcmEntitlement]),
            },
            {
              path: ':entitlementId',
              name: 'EntitlementDetails',
              component: () => import('@/views/governance/LCM/Entitlements/Edit/EntitlementDetails'),
              beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.govLcmEntitlement]),
            },
          ],
        },
        {
          path: 'users',
          children: [
            {
              path: '',
              name: 'AdministerUsers',
              component: () => import('@/views/governance/LCM/Users/UserList'),
              beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.govLcmUser]),
            },
          ],
        },
      ],
    },
    {
      path: '/approvals',
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
      meta: { authenticate: true },
      children: [
        {
          path: '',
          name: 'Approvals',
          component: () => import('@/views/governance/Approvals'),
        },
        {
          path: ':requestId',
          name: 'ApprovalDetails',
          component: () => import(/* webpackChunkName: "MyRequests" */ '@/views/governance/Approvals/ApprovalDetails'),
        },
      ],
    },
    {
      path: '/tasks',
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
      meta: { authenticate: true },
      children: [
        {
          path: '',
          name: 'Tasks',
          component: () => import('@/views/governance/Tasks/Tasks.vue'),
        },
        {
          path: ':taskId',
          name: 'TaskDetails',
          component: () => import('@/views/governance/Tasks/TaskDetail.vue'),
        },
      ],
    },
    {
      path: '/access-reviews',
      name: 'AccessReviews',
      component: () => import('@/views/governance/AccessReviews'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/violations',
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
      children: [
        {
          path: '',
          name: 'Violations',
          component: () => import('@/views/governance/Violations/Violations.vue'),
        },
        {
          path: ':itemType/:violationId',
          children: [
            {
              path: '',
              name: 'Violation',
              component: () => import('@/views/governance/Violations/ViolationEdit.vue'),
            },
            {
              path: 'remediate',
              name: 'ViolationEditRemediate',
              meta: { hideNavBar: true, hideSideMenu: true },
              component: () => import('@/views/governance/Violations/Remediate.vue'),
            },
          ],
        },
        {
          path: 'remediate/:violationId',
          name: 'ViolationRemediate',
          meta: { hideNavBar: true, hideSideMenu: true },
          component: () => import('@/views/governance/Violations/Remediate.vue'),
        },
      ],
    },
    {
      path: '/my-requests',
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
      meta: { authenticate: true },
      children: [
        {
          path: '',
          name: 'MyRequests',
          component: () => import(/* webpackChunkName: "MyRequests" */ '@/views/governance/accessRequest/MyRequests'),
        },
        {
          path: 'details/:requestId',
          name: 'MyRequestDetails',
          component: () => import(/* webpackChunkName: "MyRequestDetails" */ '@/views/governance/accessRequest/MyRequestDetails'),
        },
      ],
    },
    {
      path: '/my-requests/new-request',
      name: 'AccessRequestNew',
      component: () => import(/* webpackChunkName: "AccessRequestNew" */ '@/views/governance/accessRequest/NewRequest'),
      meta: { hideNavBar: true, hideSideMenu: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled, store.state.requestCartUsers.length > 0], { path: '/my-requests' }),
    },
    {
      path: '/requestForm/:formId',
      name: 'RequestFormLauncher',
      component: () => import(/* webpackChunkName: "AccessRequestNew" */ '@/views/governance/RequestForm/RequestFormLauncher'),
      meta: { hideNavBar: true, hideSideMenu: true, authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/certification/certification-task/:campaignId',
      name: 'CertificationTask',
      component: () => import('@forgerock/platform-shared/src/views/Governance/CertificationTask'),
      meta: { hideNavBar: true, hideSideMenu: true, authenticate: true },
    },
    {
      path: '/applications',
      name: 'Applications',
      component: () => import('@/views/WorkforceApplications'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.workforceEnabled]),
    },
    {
      path: '/reports',
      beforeEnter: (_to, _from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.autoReportsEnabled]),
      children: [
        {
          path: '',
          name: 'Reports',
          component: () => import('@forgerock/platform-shared/src/views/Reports/Reports.vue'),
        },
        {
          path: 'run/:state/:template',
          name: 'ReportRun',
          component: () => import('@forgerock/platform-shared/src/views/Reports/Report.vue'),
        },
        {
          path: 'history/:state/:template',
          name: 'ReportHistory',
          component: () => import('@forgerock/platform-shared/src/views/Reports/Report.vue'),
        },
        {
          path: 'view/:state/:template/:id',
          name: 'ReportView',
          component: () => import('@forgerock/platform-shared/src/views/Reports/ReportView.vue'),
          meta: { hideNavBar: true, hideSideMenu: true },
        },
      ],
    },
    {
      path: '/my-delegates',
      name: 'Delegates',
      component: () => import('@/views/governance/Directory/Delegates'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/my-reports',
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
      meta: { authenticate: true },
      children: [
        {
          path: '',
          name: 'DirectReports',
          component: () => import('@/views/governance/Directory/DirectReports'),
        },
        {
          path: ':userId/:grantType',
          name: 'DirectReportDetail',
          component: () => import('@/views/governance/Directory/DirectReportDetail'),
        },
      ],
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
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardManager'),
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
      path: '/my-accounts',
      name: 'Accounts',
      component: () => import('@/views/governance/MyAccessReview/Accounts'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/my-entitlements',
      name: 'Entitlements',
      component: () => import('@/views/governance/MyAccessReview/Entitlements'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
    },
    {
      path: '/my-roles',
      name: 'Roles',
      component: () => import('@/views/governance/MyAccessReview/Roles'),
      meta: { authenticate: true },
      beforeEnter: (to, from, next) => checkIfRouteCanBeAccessed(next, [store.state.SharedStore.governanceEnabled]),
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
        hideSideMenu: true,
      },
    },
    {
      path: '/forbidden',
      name: 'Forbidden',
      component: () => import(/* webpackChunkName: "forbidden" */ '@/components/forbidden'),
      beforeEnter: (to, from, next) => {
        if (store.state.hostedPages === false) {
          to.meta.hideSideMenu = true;
          to.meta.hideNavBar = true;
        }
        next();
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@forgerock/platform-shared/src/views/NotFound'),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const page = to.name ? i18n.global.t(`pageTitles.${to.name}`) : '';
  document.title = i18n.global.t('pageTitles.pageTitle', { page });
  const url = new URL(window.location);
  let realm = url.searchParams.get('realm');

  if (realm && realm !== '/' && realm.startsWith('/')) {
    realm = realm.substring(1);
  }

  if (store.state.hostedPages === false && to.name !== 'Forbidden') {
    next({ name: 'Forbidden' });
  } else if (realm !== store.state.realm) {
    // If there is no realm defined here it means the realm is root and no realm url
    // param is defined or a custom domain is being used. In both cases we do not need
    // (or want in the case of custom domain) to add the realm parameter.
    if (realm) {
      url.searchParams.set('realm', store.state.realm);
      window.location = encodeURI(url);
    }
    next();
  } else {
    next();
  }
});

export default router;
