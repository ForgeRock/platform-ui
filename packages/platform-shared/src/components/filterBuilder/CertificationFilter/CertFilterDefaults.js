/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import i18n from '@/i18n';

export const operatorOptions = {
  All: { label: i18n.global.t('filters.all'), delimeter: 'AND' },
  Any: { label: i18n.global.t('filters.any'), delimeter: 'OR' },
};

export const defaultConditionOptions = {
  Contains: { label: i18n.global.t('filters.contains'), value: 'CONTAINS', type: ['string'] },
  Is: { label: i18n.global.t('filters.is'), value: 'EQUALS', type: ['string', 'number', 'int', 'boolean'] },
  Exists: { label: i18n.global.t('filters.exists'), value: 'EXISTS', type: ['managedObject'] },
  Include: { label: i18n.global.t('filters.include'), value: 'EQUALS', type: ['managedObject'] },
  DontInclude: { label: i18n.global.t('filters.dontInclude'), value: 'NOT EQUALS', type: ['managedObject'] },
  StartsWith: { label: i18n.global.t('filters.startsWith'), value: 'STARTS_WITH', type: ['string'] },
  EndsWith: { label: i18n.global.t('filters.endsWith'), value: 'ENDS_WITH', type: ['string'] },
  Gte: { label: i18n.global.t('filters.greaterThanEqual'), value: 'GTE', type: ['number', 'int'] },
  Gt: { label: i18n.global.t('filters.greaterThan'), value: 'GT', type: ['number', 'int'] },
  Lte: { label: i18n.global.t('filters.lessThanEqual'), value: 'LTE', type: ['number', 'int'] },
  Lt: { label: i18n.global.t('filters.lessThan'), value: 'LT', type: ['number', 'int'] },
};
