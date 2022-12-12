/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default function formatNumber(number, locale = 'en-US', options = {}) {
  return new Intl.NumberFormat(locale, options).format(number);
}
