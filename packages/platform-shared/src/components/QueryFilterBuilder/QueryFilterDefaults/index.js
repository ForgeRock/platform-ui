export default {
  All: { label: 'All', delimeter: 'and' },
  Any: { label: 'Any', delimeter: 'or' },
};

export const defaultConditionOptions = {
  Contains: { label: 'contains', value: 'co', type: ['string'] },
  DoesNotContain: { label: 'does not contain', value: '!co', type: ['string'] },
  Is: { label: 'is ', value: 'eq', type: ['string', 'number', 'boolean'] },
  IsNot: { label: 'is not', value: '!eq', type: ['string', 'number'] },
  IsPresent: { label: 'is present', value: 'pr', type: ['string', 'number', 'boolean'] },
  IsNotPresent: { label: 'is not present', value: '!pr', type: ['string', 'number', 'boolean'] },
  StartsWith: { label: 'starts with', value: 'sw', type: ['string'] },
  DoesNotStartsWith: { label: 'does not start with', value: '!sw', type: ['string'] },
  Gte: { label: 'GTE (>=)', value: 'ge', type: ['number'] },
  Gt: { label: 'GT (>)', value: 'gt', type: ['number'] },
  Lte: { label: 'LTE (<=)', value: 'le', type: ['number'] },
  Lt: { label: 'LT (<)', value: 'lt', type: ['number'] },
};


export function getTypeFromValue(value, properties) {
  if (!value) return 'string';
  const property = properties.find((prop) => prop.value === value);
  return property ? property.type : 'string';
}
