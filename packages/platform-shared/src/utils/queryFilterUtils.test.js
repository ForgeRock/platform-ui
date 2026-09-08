/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateSearchQuery, filterFieldsForSearchQuery, escapeQueryFilterValue } from './queryFilterUtils';

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

describe('Filtering Fields for Search Queries', () => {
  it('Filters out password fields', () => {
    const filteredFields = filterFieldsForSearchQuery(['userName', 'sn', 'passwordLastChangedTime']);
    expect(filteredFields).toStrictEqual(['userName', 'sn']);
  });

  it('Filters out date fields', () => {
    const filteredFields = filterFieldsForSearchQuery(['userName', 'givenName', 'frIndexedDate3', 'frUnindexedDate7']);
    expect(filteredFields).toStrictEqual(['userName', 'givenName']);
  });

  it('Filters out integer fields', () => {
    const filteredFields = filterFieldsForSearchQuery(['userName', 'mail', 'frIndexedInteger', 'frUnindexedInteger8']);
    expect(filteredFields).toStrictEqual(['userName', 'mail']);
  });
});

describe('Escaping Query Filter Values', () => {
  it('leaves a plain value unchanged', () => {
    expect(escapeQueryFilterValue('jdoe')).toBe('jdoe');
  });

  it('escapes single quotes so the literal stays balanced', () => {
    expect(escapeQueryFilterValue("O'Brien")).toBe("O\\'Brien");
  });

  it('escapes backslashes before quoting so a trailing backslash cannot escape the closing quote', () => {
    expect(escapeQueryFilterValue("a\\'")).toBe("a\\\\\\'");
  });

  it('produces a value that cannot terminate the surrounding literal early', () => {
    const malicious = "') or (true) or ('";
    const escaped = escapeQueryFilterValue(malicious);
    const filter = `field co '${escaped}'`;
    // The escaped value must not contain an unescaped closing quote
    expect(filter.match(/(?<!\\)'/g)).toHaveLength(2);
  });
});
