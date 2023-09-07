/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';
import { map } from 'lodash';
import i18n from '@/i18n';

/**
 * Parse the temporal constraints of the role in case it has
 * @param {Object[]} temporalConstraints temporal constraints info
 * @returns {String} Parsed date
 */
export default function formatConstraintDate(temporalConstraints = []) {
  const value = temporalConstraints[0]?.duration;
  if (value) {
    const dates = map(value.split('/'), (date) => (dayjs(date).format('MMM D, YYYY h:mm A')));
    return i18n.global.t('common.temporalConstraint', { startDate: dates[0], endDate: dates[1] });
  }

  return value;
}
