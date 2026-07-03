/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { JAVASCRIPT_SDK_TIMEOUT } from './constants';

/**
 * journey-client request middleware that aborts SDK requests after
 * `JAVASCRIPT_SDK_TIMEOUT` (60s). The journey-client ignores
 * `serverConfig.timeout` (it is listed in the SDK's `ignoredProperties`),
 * so the timeout must be applied at the request layer: the middleware
 * attaches an AbortController signal to each request, which RTK Query's
 * fetchBaseQuery forwards to `fetch`. On timeout the request rejects and
 * journey-client surfaces it as a GenericError, which the apps already
 * handle. A manual AbortController is used instead of `AbortSignal.timeout`
 * for older-browser support.
 *
 * Add this middleware to every `journey()` call's `requestMiddleware` array,
 * before any other middleware.
 */
export const sdkTimeoutMiddleware = (req, _action, next) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), JAVASCRIPT_SDK_TIMEOUT);
  if (req.signal?.aborted) {
    controller.abort();
  } else if (typeof req.signal?.addEventListener === 'function') {
    req.signal.addEventListener('abort', () => {
      clearTimeout(timer);
      controller.abort();
    }, { once: true });
  }
  req.signal = controller.signal;
  next();
};
