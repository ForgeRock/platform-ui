/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import i18n from '@/i18n';

export const operatorOptions = {
  All: { label: i18n.global.t('filters.all'), delimeter: 'and' },
  Any: { label: i18n.global.t('filters.any'), delimeter: 'or' },
};

export const defaultConditionOptions = {
  Contains: { label: i18n.global.t('filters.contains'), value: 'co', type: ['string'] },
  DoesNotContain: { label: i18n.global.t('filters.doesNotContain'), value: '!co', type: ['string'] },
  Is: { label: i18n.global.t('filters.is'), value: 'eq', type: ['string', 'number', 'boolean'] },
  IsNot: { label: i18n.global.t('filters.isNot'), value: '!eq', type: ['string', 'number'] },
  IsPresent: { label: i18n.global.t('filters.isPresent'), value: 'pr', type: ['string', 'number', 'boolean'] },
  IsNotPresent: { label: i18n.global.t('filters.isNotPresent'), value: '!pr', type: ['string', 'number', 'boolean'] },
  StartsWith: { label: i18n.global.t('filters.startsWith'), value: 'sw', type: ['string'] },
  DoesNotStartsWith: { label: i18n.global.t('filters.doesNotStartWith'), value: '!sw', type: ['string'] },
  Gte: { label: i18n.global.t('filters.greaterThanEqual'), value: 'ge', type: ['number'] },
  Gt: { label: i18n.global.t('filters.greaterThan'), value: 'gt', type: ['number'] },
  Lte: { label: i18n.global.t('filters.lessThanEqual'), value: 'le', type: ['number'] },
  Lt: { label: i18n.global.t('filters.lessThan'), value: 'lt', type: ['number'] },
};

export const governanceConditionOptions = {
  Contains: { label: i18n.global.t('filters.contains'), value: 'contains', type: ['string', 'array'] },
  DoesNotContain: { label: i18n.global.t('filters.doesNotContain'), value: 'not_contains', type: ['string', 'array'] },
  Is: { label: i18n.global.t('filters.is'), value: 'equals', type: ['string', 'reference', 'boolean', 'number'] },
  IsNot: { label: i18n.global.t('filters.isNot'), value: 'not_equals', type: ['string', 'reference', 'number'] },
  StartsWith: { label: i18n.global.t('filters.startsWith'), value: 'starts_with', type: ['string'] },
  DoesNotStartsWith: { label: i18n.global.t('filters.endsWith'), value: 'ends_with', type: ['string'] },
  HasChanged: { label: i18n.global.t('filters.hasChanged'), value: 'has_changed', type: ['reference', 'string', 'number'] },
  HasNotChanged: { label: i18n.global.t('filters.hasNotChanged'), value: 'has_not_changed', type: ['reference', 'string', 'number'] },
  Gte: { label: i18n.global.t('filters.greaterThanEqual'), value: 'gte', type: ['number'] },
  Gt: { label: i18n.global.t('filters.greaterThan'), value: 'gt', type: ['number'] },
  Lte: { label: i18n.global.t('filters.lessThanEqual'), value: 'lte', type: ['number'] },
  Lt: { label: i18n.global.t('filters.lessThan'), value: 'lt', type: ['number'] },
};

export const temporalValueOptions = [
  { text: i18n.global.t('filters.previousValueOf'), value: 'before' },
  { text: i18n.global.t('filters.currentValueOf'), value: 'after' },
];

export function getTypeFromValue(value, properties) {
  if (!value) return 'string';
  const property = properties.find((prop) => prop.value === value);
  return property ? property.type : 'string';
}
