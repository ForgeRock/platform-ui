/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const ldapOperatorOptions = {
  All: { label: 'All', delimeter: 'and' },
  Any: { label: 'Any', delimeter: 'or' },
};

export const ldapDefaultConditionOptions = {
  Equals: { label: 'is', value: '=' },
  NotEquals: { label: 'is not', value: '!=' },
  Gte: { label: 'GTE (>=)', value: '>=' },
  Gt: { label: 'GT (>)', value: '!<=' },
  Lte: { label: 'LTE (<=)', value: '<=' },
  Lt: { label: 'LT (<)', value: '!>=' },
  BitwiseAnd: { label: 'Bitwise AND', value: ':1.2.840.113556.1.4.803:=' },
  BitwiseNand: { label: 'Bitwise NAND', value: '!:1.2.840.113556.1.4.803:=' },
  BitwiseOr: { label: 'Bitwise OR', value: ':1.2.840.113556.1.4.804:=' },
  BitwiseNor: { label: 'Bitwise NOR', value: '!:1.2.840.113556.1.4.804:=' },
};

export const conditionMap = {
  equal: '=',
  ge: '>=',
  le: '<=',
};

export function getTypeFromValue(value, properties) {
  if (!value) return 'string';
  const property = properties.find((prop) => prop.value === value);
  return property ? property.type : 'string';
}
