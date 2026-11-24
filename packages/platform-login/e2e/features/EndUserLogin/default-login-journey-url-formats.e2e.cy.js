/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { retryableBeforeEach, eachCase } from '@e2e/util';
import apiSteps from '@e2e/steps/apiSteps';

/**
 * Covers TC-13112: the default Login journey can be initiated from many URL
 * formats (canonical, /service, #login, and malformed variants that must fall
 * back to Login). Every format must log in successfully. Each test title
 * names the manual step(s) it mirrors; the manual case's "fresh incognito
 * window per step" maps to a fresh API-created enduser per test.
 */

const REALM = Cypress.env('IS_FRAAS') ? '/alpha' : '/';
// The manual case's "hash in query" formats append a slash before #/ (written
// for the alpha realm); on ForgeOps the realm is already '/', so that slash
// would produce realm=// — use the bare realm there instead.
const REALM_TAIL = Cypress.env('IS_FRAAS') ? `${REALM}/` : REALM;

describe('Default login journey can be initiated using different URL formats', () => {
  // Fresh API-created enduser per test (the manual case's "fresh incognito
  // window per step"). Each test clears cookies and storage before visiting.
  let user;

  retryableBeforeEach(() => {
    cy.loginAsAdminCached()
      .then(() => apiSteps.user.createEndUser())
      .then((createdUser) => {
        user = createdUser;
      });
  });

  afterEach(() => {
    cy.logout();
    apiSteps.user.deleteCreatedUsers();
  });

  // Per-case tags are test-level so @cypress/grep filters each test exactly —
  // unlike describe-level tags, which grep unions into every nested test.
  eachCase([
    {
      name: '[TC-13112] Default login journey can be initiated using canonical XUI URL (manual steps 1, 6, 11)',
      path: `/am/XUI/?realm=${REALM}`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using Default Success Login URL (manual step 2)',
      path: `/enduser/?realm=${REALM}`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using Default Dashboard URL (manual step 3)',
      path: `/enduser/?realm=${REALM}#/dashboard`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using service route with Login tree (manual step 4)',
      path: `/am/XUI/?realm=${REALM}#/service/Login`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using lowercase authIndex params fall back to Login (manual step 7)',
      path: `/am/XUI/?realm=${REALM}&authindextype=service&authindexValue=ForgottenUsername#/`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using typo on authIndex param names falls back to Login (manual step 8)',
      path: `/am/XUI/?realm=${REALM}&authIndxType=service&authxValue=ForgottenUsername#/`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using missing authIndexValue falls back to Login (manual step 9)',
      path: `/am/XUI?realm=${REALM}&authIndexType=service`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using missing authIndexType falls back to Login (manual step 10)',
      path: `/am/XUI?realm=${REALM}&authIndexValue=ForgottenUsername`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using junk path under /am/XUI falls back to Login (hash after query) (manual step 12)',
      path: `/am/XUI/blahblah?realm=${REALM}#/`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using junk path under /am/XUI falls back to Login (hash in query) (manual step 13)',
      path: `/am/XUI/blahblah?realm=${REALM_TAIL}#/`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using bare /am path falls back to Login (hash after query) (manual step 14)',
      path: `/am/?realm=${REALM}#/`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using bare /am path falls back to Login (hash in query) (manual step 15)',
      path: `/am/?realm=${REALM_TAIL}#/`,
      tags: ['@cloud', '@forgeops'],
    },
    {
      name: '[TC-13112] Default login journey can be initiated using enduser path without trailing slash (manual step 18)',
      path: `/enduser?realm=${REALM}`,
      tags: ['@cloud', '@forgeops'],
    },
    // The /login/ path is served by the backend only on cloud deployments (404
    // on ForgeOps nightly), so the manual case's /login/ steps run cloud-only.
    {
      name: '[TC-13112] Default login journey can be initiated using login path with trailing realm slash (manual steps 5, 17)',
      path: '/login/?realm=alpha/#/',
      tags: '@cloud',
    },
    {
      name: '[TC-13112] Default login journey can be initiated using login path falls back to Login (hash after query) (manual step 16)',
      path: '/login/?realm=alpha#/',
      tags: '@cloud',
    },
    // The #login route is documented with the alpha realm; on ForgeOps the realm
    // is '/'.
    {
      name: '[TC-13112] Default login journey can be initiated using login route from AM docs (cloud realm) (manual step 19)',
      path: '/am/XUI/?realm=/alpha#login',
      tags: '@cloud',
    },
    {
      name: '[TC-13112] Default login journey can be initiated using login route from AM docs (ForgeOps realm) (manual step 20)',
      path: '/am/XUI/?realm=/#login',
      tags: '@forgeops',
    },
  ], ({ path }) => {
    cy.loginAsEnduser(user.username, user.password, true, `${Cypress.config().baseUrl}${path}`, user.firstName);
  });
});
