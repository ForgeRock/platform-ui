/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import i18n from '@/i18n';

export const operatorOptions = {
  All: { label: 'All', delimeter: 'ALL' },
  Any: { label: 'Any', delimeter: 'OR' },
};

export const defaultConditionOptions = {
  Contains: { label: i18n.t('filters.contains'), value: 'CONTAINS', type: ['string'] },
  Is: { label: i18n.t('filters.is'), value: 'EQUALS', type: ['string', 'number', 'boolean'] },
  Include: { label: i18n.t('filters.include'), value: 'EQUALS', type: ['managedObject'] },
  DontInclude: { label: i18n.t('filters.dontInclude'), value: 'NOT EQUALS', type: ['managedObject'] },
  StartsWith: { label: i18n.t('filters.startsWith'), value: 'STARTS_WITH', type: ['string'] },
  EndsWith: { label: i18n.t('filters.endsWith'), value: 'ENDS_WITH', type: ['string'] },
  Gte: { label: i18n.t('filters.greaterThanEqual'), value: 'GTE', type: ['number'] },
  Gt: { label: i18n.t('filters.greaterThan'), value: 'GT', type: ['number'] },
  Lte: { label: i18n.t('filters.lessThanEqual'), value: 'LTE', type: ['number'] },
  Lt: { label: i18n.t('filters.lessThan'), value: 'LT', type: ['number'] },
};
