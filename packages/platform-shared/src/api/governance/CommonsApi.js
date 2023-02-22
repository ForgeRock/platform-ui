/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';

// eslint-disable-next-line import/prefer-default-export
export function getResource(resource, queryString = '') {
  return generateIgaApi().get(`commons/search/${resource}?queryString=${queryString}`);
}
