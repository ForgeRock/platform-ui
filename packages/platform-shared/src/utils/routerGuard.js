/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Checks to make sure if a route can be accessed, otherwise redirects to the 'Not Found' route
 */
export default function checkIfRouteCanBeAccessed(next, requiredFlags = [], onFailRoute = { name: 'NotFound' }) {
  if (!requiredFlags.length || requiredFlags.every((flag) => flag)) {
    next();
  } else {
    next(onFailRoute);
  }
}
