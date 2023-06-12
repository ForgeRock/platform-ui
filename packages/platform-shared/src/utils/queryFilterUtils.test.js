/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateSearchQuery } from './queryFilterUtils';

describe('Generating Search URLs', () => {
  const schemaProps = {
    isAdmin: { type: 'boolean' },
    sn: { type: 'string' },
    userName: { type: 'string' },
    age: { type: 'number' },
  };

  it('Generates a filter url for a string', () => {
    const filterUrl = generateSearchQuery('a', ['userName', 'sn'], schemaProps);
    expect(filterUrl).toStrictEqual('userName sw "a" OR sn sw "a"');
  });

  it('Generates a filter url for a number', () => {
    const filterUrl = generateSearchQuery('1', ['age'], schemaProps);
    expect(filterUrl).toStrictEqual('age eq 1');
  });

  it('Generates a filter url for a boolean', () => {
    const filterUrl = generateSearchQuery('true', ['isAdmin'], schemaProps);
    expect(filterUrl).toStrictEqual('isAdmin eq true');
  });
});
