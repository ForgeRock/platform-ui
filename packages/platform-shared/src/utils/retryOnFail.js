/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Retries a request if it fails (n) aka "maxRetries" times.
 */
export default function retryOnFail(request, waitTimeMs = 1000, maxRetries = 5) {
  return new Promise((resolve, reject) => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    return request()
      .then(resolve)
      .catch((e) => {
        if (maxRetries > 0) {
          // eslint-disable-next-line no-console
          console.log(`RETRYING FAILED REQUEST (${maxRetries - 1} retries left)`);
          return delay(waitTimeMs)
            .then(retryOnFail.bind(null, request, waitTimeMs, maxRetries - 1))
            .then(resolve)
            .catch(reject);
        }
        // eslint-disable-next-line no-console
        console.log('RETRY FAILURE', request.toString());
        return reject(e);
      });
  });
}
