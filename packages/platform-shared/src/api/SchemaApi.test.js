/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import { getSchema, setSchemaProperties } from './SchemaApi';

jest.mock('axios');

const mockAxiosInstance = {
  interceptors: {
    response: {
      use: jest.fn(),
    },
  },
  get: jest.fn(),
};

beforeEach(() => {
  axios.create.mockReturnValue(mockAxiosInstance);
});

describe('SchemaApi', () => {
  describe('setSchemaProperties', () => {
    it('falls back to Object.keys(properties) when order is absent', () => {
      const schema = {
        properties: {
          name: { type: ['string', 'null'] },
        },
      };
      setSchemaProperties(schema);
      expect(schema.properties.name.isNullable).toBe(true);
      expect(schema.properties.name.type).toBe('string');
    });

    it('sets type to the first element when type array contains only null', () => {
      const schema = {
        order: ['code'],
        properties: {
          code: { type: ['null'] },
        },
      };
      setSchemaProperties(schema);
      expect(schema.properties.code.isNullable).toBe(true);
      expect(schema.properties.code.type).toBe('null');
    });

    it('does nothing when schema has no properties', () => {
      const schema = { order: [] };
      setSchemaProperties(schema);
      expect(schema).toEqual({ order: [] });
    });
  });

  describe('getSchema', () => {
    it('sets isNullable and extracts the real type when type is an array containing null', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          order: ['userName', 'age'],
          properties: {
            userName: { type: ['string', 'null'] },
            age: { type: ['number', 'null'] },
          },
        },
      });

      const response = await getSchema('managed/alpha_user');
      const { properties } = response.data;

      expect(properties.userName.isNullable).toBe(true);
      expect(properties.userName.type).toBe('string');

      expect(properties.age.isNullable).toBe(true);
      expect(properties.age.type).toBe('number');
    });

    it('sets isNullable and extracts the real type when null appears first in the type array', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          order: ['email'],
          properties: {
            email: { type: ['null', 'string'] },
          },
        },
      });

      const response = await getSchema('managed/alpha_user');
      const { properties } = response.data;

      expect(properties.email.isNullable).toBe(true);
      expect(properties.email.type).toBe('string');
    });

    it('does not set isNullable when type is a plain string', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          order: ['userName'],
          properties: {
            userName: { type: 'string' },
          },
        },
      });

      const response = await getSchema('managed/alpha_user');
      const { properties } = response.data;

      expect(properties.userName.isNullable).toBeUndefined();
      expect(properties.userName.type).toBe('string');
    });

    it('correctly extracts the real type for all supported nullable property types', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          order: ['boolProp', 'numberProp', 'arrayProp', 'objectProp', 'relationshipProp'],
          properties: {
            boolProp: { type: ['boolean', 'null'] },
            numberProp: { type: ['number', 'null'] },
            arrayProp: { type: ['array', 'null'] },
            objectProp: { type: ['object', 'null'] },
            relationshipProp: { type: ['relationship', 'null'] },
          },
        },
      });

      const response = await getSchema('managed/alpha_user');
      const { properties } = response.data;

      expect(properties.boolProp.isNullable).toBe(true);
      expect(properties.boolProp.type).toBe('boolean');

      expect(properties.numberProp.isNullable).toBe(true);
      expect(properties.numberProp.type).toBe('number');

      expect(properties.arrayProp.isNullable).toBe(true);
      expect(properties.arrayProp.type).toBe('array');

      expect(properties.objectProp.isNullable).toBe(true);
      expect(properties.objectProp.type).toBe('object');

      expect(properties.relationshipProp.isNullable).toBe(true);
      expect(properties.relationshipProp.type).toBe('relationship');
    });

    it('normalises nullable properties on connector (system/) schemas', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          objectTypes: {
            account: {
              properties: {
                uid: { type: ['string', 'null'] },
              },
            },
          },
          connectorRef: { connectorName: 'ldap' },
        },
      });

      const response = await getSchema('system/ldap/account');
      const { properties } = response.data;

      expect(properties.uid.isNullable).toBe(true);
      expect(properties.uid.type).toBe('string');
    });

    it('handles result-set responses by processing each schema', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          result: [
            {
              order: ['name'],
              properties: {
                name: { type: ['string', 'null'] },
              },
            },
            {
              order: ['code'],
              properties: {
                code: { type: 'number' },
              },
            },
          ],
        },
      });

      const response = await getSchema('managed/alpha_user');
      const [first, second] = response.data.result;

      expect(first.properties.name.isNullable).toBe(true);
      expect(first.properties.name.type).toBe('string');
      expect(second.properties.code.isNullable).toBeUndefined();
      expect(second.properties.code.type).toBe('number');
    });
  });
});
