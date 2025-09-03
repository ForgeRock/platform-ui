/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { useRouter, useRoute } from 'vue-router';

jest.mock('vue-router');

// eslint-disable-next-line import/prefer-default-export
export function mockRouter(routeOptions, routerOptions = {}) {
  const routerPush = routerOptions.push || jest.fn();
  const routerResolve = routerOptions.resolve || jest.fn();

  useRoute.mockImplementation(() => (routeOptions));
  useRouter.mockImplementation(() => ({
    push: routerPush,
    resolve: routerResolve,
    options: routerOptions.options || {},
  }));
  return { routerPush, routerResolve };
}
