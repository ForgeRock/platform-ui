/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  isPasswordField,
  getSelectFieldOptions,
  getFieldTypeForProperty,
  getKeyValueOptions,
  checkEmpty,
  getPropertyDefault,
  isPropertyRequired,
  sanitizePropertyValue,
  removeNullPasswords,
  prepareValuesForSave,
  createAmForm,
} from './amSchemaUtils';

describe('amSchemaUtils', () => {
  describe('isPasswordField', () => {
    it('returns true for string fields with password format', () => {
      expect(isPasswordField({ type: 'string', format: 'password' })).toBe(true);
    });

    it('returns false for non-password string fields', () => {
      expect(isPasswordField({ type: 'string' })).toBe(false);
    });

    it('returns false for non-string fields', () => {
      expect(isPasswordField({ type: 'boolean', format: 'password' })).toBe(false);
    });
  });

  describe('getSelectFieldOptions', () => {
    it('builds options for a select field', () => {
      const property = {
        type: 'select',
        enum: ['a', 'b'],
        enumNames: ['Option A', 'Option B'],
      };
      expect(getSelectFieldOptions(property)).toEqual([
        { text: 'Option A', value: 'a' },
        { text: 'Option B', value: 'b' },
      ]);
    });

    it('builds options for a multiselect field', () => {
      const property = {
        type: 'multiselect',
        items: { enum: ['x', 'y'], enumNames: ['Ex', 'Why'] },
      };
      expect(getSelectFieldOptions(property)).toEqual([
        { text: 'Ex', value: 'x' },
        { text: 'Why', value: 'y' },
      ]);
    });

    it('returns null for non-select field types', () => {
      expect(getSelectFieldOptions({ type: 'string' })).toBeNull();
      expect(getSelectFieldOptions({ type: 'boolean' })).toBeNull();
    });
  });

  describe('getFieldTypeForProperty', () => {
    it('returns password for string + password format', () => {
      expect(getFieldTypeForProperty({ type: 'string', format: 'password' })).toBe('password');
    });

    it('returns select for string with enum', () => {
      expect(getFieldTypeForProperty({ type: 'string', enum: ['a'] })).toBe('select');
    });

    it('returns multiselect for array with items.enum', () => {
      expect(getFieldTypeForProperty({ type: 'array', items: { enum: ['a'] } })).toBe('multiselect');
    });

    it('returns tag for plain array', () => {
      expect(getFieldTypeForProperty({ type: 'array' })).toBe('tag');
    });

    it('returns checkbox for boolean', () => {
      expect(getFieldTypeForProperty({ type: 'boolean' })).toBe('checkbox');
    });

    it('returns number for integer', () => {
      expect(getFieldTypeForProperty({ type: 'integer' })).toBe('number');
    });

    it('returns the raw type string for unmapped types', () => {
      expect(getFieldTypeForProperty({ type: 'string' })).toBe('string');
    });
  });

  describe('getKeyValueOptions', () => {
    it('returns valueOptions with labels from enumNames when present', () => {
      const property = {
        type: 'object',
        patternProperties: {
          '.*': {
            type: 'string',
            enum: ['chain1', 'chain2'],
            enumNames: ['Chain One', 'Chain Two'],
          },
        },
      };
      expect(getKeyValueOptions(property)).toEqual([
        { text: 'Chain One', value: 'chain1' },
        { text: 'Chain Two', value: 'chain2' },
      ]);
    });

    it('falls back to options.enum_titles when enumNames is absent', () => {
      const property = {
        type: 'object',
        patternProperties: {
          '.*': {
            type: 'string',
            enum: ['chain1', 'chain2'],
            options: { enum_titles: ['Chain One', 'Chain Two'] },
          },
        },
      };
      expect(getKeyValueOptions(property)).toEqual([
        { text: 'Chain One', value: 'chain1' },
        { text: 'Chain Two', value: 'chain2' },
      ]);
    });

    it('falls back to the raw enum value as label when neither enumNames nor enum_titles is present', () => {
      const property = {
        type: 'object',
        patternProperties: {
          '.*': {
            type: 'string',
            enum: ['chain1', 'chain2'],
          },
        },
      };
      expect(getKeyValueOptions(property)).toEqual([
        { text: 'chain1', value: 'chain1' },
        { text: 'chain2', value: 'chain2' },
      ]);
    });

    it('returns null for an object property whose patternProperties[".*"] has no enum', () => {
      const property = {
        type: 'object',
        patternProperties: {
          '.*': { type: 'string' },
        },
      };
      expect(getKeyValueOptions(property)).toBeNull();
    });

    it('returns null for an object property with no patternProperties', () => {
      expect(getKeyValueOptions({ type: 'object' })).toBeNull();
    });

    it('returns null for non-object types', () => {
      expect(getKeyValueOptions({ type: 'string', enum: ['a', 'b'] })).toBeNull();
      expect(getKeyValueOptions({ type: 'array' })).toBeNull();
    });

    it('falls back per-element when enumNames is shorter than enum', () => {
      const property = {
        type: 'object',
        patternProperties: {
          '.*': {
            type: 'string',
            enum: ['chain1', 'chain2', 'chain3'],
            enumNames: ['Chain One'],
          },
        },
      };
      expect(getKeyValueOptions(property)).toEqual([
        { text: 'Chain One', value: 'chain1' },
        { text: 'chain2', value: 'chain2' },
        { text: 'chain3', value: 'chain3' },
      ]);
    });
  });

  describe('checkEmpty', () => {
    it('returns false for numbers including zero', () => {
      expect(checkEmpty(0)).toBe(false);
      expect(checkEmpty(42)).toBe(false);
    });

    it('returns false for booleans including false', () => {
      expect(checkEmpty(false)).toBe(false);
      expect(checkEmpty(true)).toBe(false);
    });

    it('returns true for empty string', () => {
      expect(checkEmpty('')).toBe(true);
    });

    it('returns true for empty array', () => {
      expect(checkEmpty([])).toBe(true);
    });

    it('returns false for non-empty array', () => {
      expect(checkEmpty(['a'])).toBe(false);
    });
  });

  describe('getPropertyDefault', () => {
    it('returns the explicit default when present', () => {
      expect(getPropertyDefault({ type: 'string', default: 'hello' })).toBe('hello');
    });

    it('returns false as an explicit default (not skipped)', () => {
      expect(getPropertyDefault({ type: 'boolean', default: false })).toBe(false);
    });

    it('returns first enum value for select fields with no explicit default', () => {
      expect(getPropertyDefault({ type: 'string', enum: ['a', 'b'] })).toBe('a');
    });

    it('returns type-based defaults when no explicit default exists', () => {
      expect(getPropertyDefault({ type: 'string' })).toBe('');
      expect(getPropertyDefault({ type: 'array' })).toEqual([]);
      expect(getPropertyDefault({ type: 'integer' })).toBe(0);
      expect(getPropertyDefault({ type: 'boolean' })).toBe(false);
      expect(getPropertyDefault({ type: 'object' })).toEqual({});
    });

    it('returns undefined for unknown types with no default', () => {
      expect(getPropertyDefault({ type: 'unknown' })).toBeUndefined();
    });
  });

  describe('isPropertyRequired', () => {
    it('returns true for required fields with no default', () => {
      expect(isPropertyRequired({ required: true })).toBe(true);
    });

    it('returns false for required fields that have a default', () => {
      expect(isPropertyRequired({ required: true, default: 'val' })).toBe(false);
    });

    it('returns false for required fields with a falsy default (0 or false)', () => {
      expect(isPropertyRequired({ required: true, default: 0 })).toBe(false);
      expect(isPropertyRequired({ required: true, default: false })).toBe(false);
    });

    it('returns false for non-required fields', () => {
      expect(isPropertyRequired({ required: false })).toBe(false);
    });
  });

  describe('removeNullPasswords', () => {
    const schemaProperties = {
      clientSecret: { type: 'string', format: 'password' },
      clientId: { type: 'string' },
      enabled: { type: 'boolean' },
    };

    it('removes password fields with null values', () => {
      const result = removeNullPasswords({ clientSecret: null, clientId: 'abc' }, schemaProperties);
      expect(result).not.toHaveProperty('clientSecret');
      expect(result.clientId).toBe('abc');
    });

    it('removes password fields with undefined values', () => {
      const result = removeNullPasswords({ clientSecret: undefined, clientId: 'abc' }, schemaProperties);
      expect(result).not.toHaveProperty('clientSecret');
    });

    it('keeps password fields that have a real value', () => {
      const result = removeNullPasswords({ clientSecret: 'my-secret', clientId: 'abc' }, schemaProperties);
      expect(result.clientSecret).toBe('my-secret');
    });

    it('does not remove null values for non-password fields', () => {
      const result = removeNullPasswords({ clientSecret: null, clientId: null }, schemaProperties);
      expect(result).toHaveProperty('clientId');
      expect(result.clientId).toBeNull();
    });

    it('does not remove fields absent from the schema', () => {
      const result = removeNullPasswords({ unknownField: null, clientId: 'abc' }, schemaProperties);
      expect(result).toHaveProperty('unknownField');
    });
  });

  describe('prepareValuesForSave', () => {
    const placeholderObject = { $string: '&{am.keystore.default.entry.password}' };
    const formSchema = [
      { key: 'clientId', type: 'string' },
      {
        key: 'privateKeyPassword', type: 'string', format: 'string', originalValue: placeholderObject,
      },
      { key: 'clientSecret', type: 'string', format: 'string' },
    ];
    const schemaProperties = {
      clientId: { type: 'string' },
      privateKeyPassword: { type: 'string', format: 'password' },
      clientSecret: { type: 'string', format: 'password' },
    };

    it('restores placeholder fields to their original object form', () => {
      const values = { clientId: 'abc', privateKeyPassword: '&{am.keystore.default.entry.password}', clientSecret: undefined };
      const result = prepareValuesForSave(values, formSchema, schemaProperties);
      expect(result.privateKeyPassword).toEqual(placeholderObject);
    });

    it('removes null/undefined password fields', () => {
      const values = { clientId: 'abc', privateKeyPassword: '&{am.keystore.default.entry.password}', clientSecret: undefined };
      const result = prepareValuesForSave(values, formSchema, schemaProperties);
      expect(result).not.toHaveProperty('clientSecret');
    });

    it('preserves non-placeholder non-password fields unchanged', () => {
      const values = { clientId: 'abc', privateKeyPassword: '&{am.keystore.default.entry.password}', clientSecret: null };
      const result = prepareValuesForSave(values, formSchema, schemaProperties);
      expect(result.clientId).toBe('abc');
    });

    it('does not mutate the original values object', () => {
      const values = { clientId: 'abc', privateKeyPassword: '&{am.keystore.default.entry.password}', clientSecret: null };
      prepareValuesForSave(values, formSchema, schemaProperties);
      expect(values.privateKeyPassword).toBe('&{am.keystore.default.entry.password}');
    });
  });

  describe('sanitizePropertyValue', () => {
    it('returns the property default when value is null', () => {
      expect(sanitizePropertyValue({ type: 'string' }, null)).toBe('');
    });

    it('returns the property default when value is undefined', () => {
      expect(sanitizePropertyValue({ type: 'array' }, undefined)).toEqual([]);
    });

    it('returns the raw value when it is a normal string', () => {
      expect(sanitizePropertyValue({ type: 'string' }, 'hello')).toBe('hello');
    });

    it('returns undefined for password fields without a placeholder value', () => {
      expect(sanitizePropertyValue({ type: 'string', format: 'password' }, 'real-secret')).toBeUndefined();
    });

    it('returns undefined for password fields when value is null or undefined', () => {
      const passwordProp = { type: 'string', format: 'password' };
      expect(sanitizePropertyValue(passwordProp, undefined)).toBeUndefined();
      expect(sanitizePropertyValue(passwordProp, null)).toBeUndefined();
    });
  });

  describe('createAmForm', () => {
    const schema = {
      properties: {
        name: { type: 'string', propertyOrder: 1 },
        count: { type: 'integer', propertyOrder: 2 },
        active: { type: 'boolean', propertyOrder: 3 },
      },
    };

    it('returns schema array sorted by propertyOrder', () => {
      const { schema: result } = createAmForm({ schema, values: {} });
      expect(result.map((f) => f.key)).toEqual(['name', 'count', 'active']);
    });

    it('seeds initial values from the provided values object', () => {
      const { values } = createAmForm({ schema, values: { name: 'Alice', count: 5 } });
      expect(values.name).toBe('Alice');
      expect(values.count).toBe(5);
    });

    it('fills missing values with schema defaults', () => {
      const { values } = createAmForm({ schema, values: {} });
      expect(values.name).toBe('');
      expect(values.count).toBe(0);
      expect(values.active).toBe(false);
    });

    it('maps property types to FrField types', () => {
      const { schema: result } = createAmForm({ schema, values: {} });
      const countField = result.find((f) => f.key === 'count');
      expect(countField.type).toBe('number');
    });

    it('includes all fields by default regardless of required status', () => {
      const mixedSchema = {
        properties: {
          required: { type: 'string', required: true },
          optional: { type: 'string' },
        },
      };
      const { schema: result } = createAmForm({ schema: mixedSchema, values: {} });
      expect(result.map((f) => f.key)).toEqual(expect.arrayContaining(['required', 'optional']));
    });

    it('filters to only required fields when showOnlyRequired is true', () => {
      const mixedSchema = {
        properties: {
          required: { type: 'string', required: true },
          optional: { type: 'string' },
        },
      };
      const { schema: result } = createAmForm({ schema: mixedSchema, values: {}, showOnlyRequired: true });
      expect(result.map((f) => f.key)).toEqual(['required']);
    });

    it('sorts fields without propertyOrder to the end', () => {
      const unorderedSchema = {
        properties: {
          noOrder: { type: 'string' },
          first: { type: 'string', propertyOrder: 1 },
        },
      };
      const { schema: result } = createAmForm({ schema: unorderedSchema, values: {} });
      expect(result[0].key).toBe('first');
      expect(result[1].key).toBe('noOrder');
    });

    describe('valueOptions projection', () => {
      it('sets valueOptions only on enum-object fields, leaving other fields unchanged', () => {
        const mixedSchema = {
          properties: {
            loaMapping: {
              type: 'object',
              propertyOrder: 1,
              patternProperties: {
                '.*': {
                  type: 'string',
                  enum: ['chain1', 'chain2'],
                  enumNames: ['Chain One', 'Chain Two'],
                },
              },
            },
            jwtMappings: {
              type: 'object',
              propertyOrder: 2,
              patternProperties: {
                '.*': { type: 'string' },
              },
            },
            enabled: {
              type: 'boolean',
              propertyOrder: 3,
            },
          },
        };

        const { schema: result } = createAmForm({ schema: mixedSchema, values: {} });
        const loaField = result.find((f) => f.key === 'loaMapping');
        const jwtField = result.find((f) => f.key === 'jwtMappings');
        const enabledField = result.find((f) => f.key === 'enabled');

        expect(loaField.valueOptions).toEqual([
          { text: 'Chain One', value: 'chain1' },
          { text: 'Chain Two', value: 'chain2' },
        ]);
        expect(loaField.type).toBe('object');
        expect(jwtField).not.toHaveProperty('valueOptions');
        expect(enabledField).not.toHaveProperty('valueOptions');
      });
    });

    describe('placeholder handling', () => {
      const placeholderObject = { $string: '&{am.keystore.default.entry.password}' };
      const placeholderSchema = {
        properties: {
          clientId: { type: 'string', propertyOrder: 1 },
          privateKeyPassword: { type: 'string', format: 'password', propertyOrder: 2 },
        },
      };
      const placeholderValues = {
        clientId: 'my-client',
        privateKeyPassword: placeholderObject,
      };

      it('overrides type and format to string for a placeholder-valued password field', () => {
        const { schema: result } = createAmForm({ schema: placeholderSchema, values: placeholderValues });
        const field = result.find((f) => f.key === 'privateKeyPassword');
        expect(field.type).toBe('string');
        expect(field.format).toBe('string');
      });

      it('flattens the placeholder object to its display string as the initial value', () => {
        const { values } = createAmForm({ schema: placeholderSchema, values: placeholderValues });
        expect(values.privateKeyPassword).toBe('&{am.keystore.default.entry.password}');
      });

      it('stashes the original placeholder object as originalValue on the schema entry', () => {
        const { schema: result } = createAmForm({ schema: placeholderSchema, values: placeholderValues });
        const field = result.find((f) => f.key === 'privateKeyPassword');
        expect(field.originalValue).toEqual(placeholderObject);
      });

      it('does not affect non-placeholder fields', () => {
        const { schema: result, values } = createAmForm({ schema: placeholderSchema, values: placeholderValues });
        const field = result.find((f) => f.key === 'clientId');
        expect(field.type).toBe('string');
        expect(field.originalValue).toBeUndefined();
        expect(values.clientId).toBe('my-client');
      });
    });
  });
});
