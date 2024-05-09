/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  formatIdAsPlaceholder,
  valueIsPurposePlaceholder,
  mapBooleanToSecretVersionStatus,
  processSecretVersionData,
  PLACEHOLDER_REGEX,
  coercePlaceholderByType,
  doesValueContainPlaceholder,
  getPlaceholderValueToDisplay,
  isFieldTypeSupportedForPlaceholderEntry,
  determineEsvTypeForField,
  showEsvSecretsForField,
} from './esvUtils';

/* eslint-disable indent */

it('formats IDs correctly as placeholders', () => {
  expect(formatIdAsPlaceholder('esv-123-abc_def')).toBe('&{esv.123.abc_def}');
});

it('maps boolean secret version statuses to API status strings', () => {
  expect(mapBooleanToSecretVersionStatus(true)).toBe('ENABLED');
  expect(mapBooleanToSecretVersionStatus(false)).toBe('DISABLED');
});

describe('processing secret version data', () => {
  it('Filters destroyed secret versions from the passed array', () => {
    const versionData = [
      {
        name: 'bob',
        status: 'ENABLED',
        version: 5,
        createDate: '2021-09-28T13:38:50.331Z',
      },
      {
        name: 'bill',
        status: 'DESTROYED',
        version: 4,
        createDate: '2021-09-28T13:38:50.331Z',
      },
      {
        name: 'ben',
        status: 'DISABLED',
        version: 3,
        createDate: '2021-09-28T13:38:50.331Z',
      },
    ];

    const processedData = processSecretVersionData(versionData);

    expect(processedData[0]).toEqual(expect.objectContaining({
      canDelete: false,
      canDisable: false,
      name: 'bob',
      status: true,
      value: '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■',
      version: 5,
    }));
    expect(processedData[1]).toEqual(expect.objectContaining({
      canDelete: true,
      canDisable: true,
      name: 'ben',
      status: false,
      value: '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■',
      version: 3,
    }));
  });

  it('Sets canDisable to true for all versions apart from the latest, and canDelete to true for all versions if the previous version to the latest is enabled', () => {
    const versionData = [
      {
        name: 'bob',
        status: 'ENABLED',
        version: 5,
        createDate: '2021-09-28T13:38:50.331Z',
      },
      {
        name: 'bill',
        status: 'ENABLED',
        version: 4,
        createDate: '2021-09-28T13:38:50.331Z',
      },
      {
        name: 'ben',
        status: 'ENABLED',
        version: 3,
        createDate: '2021-09-28T13:38:50.331Z',
      },
    ];

    const processedData = processSecretVersionData(versionData);

    expect(processedData[0]).toEqual(expect.objectContaining({
      canDelete: true,
      canDisable: false,
      name: 'bob',
      status: true,
      value: '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■',
      version: 5,
    }));
    expect(processedData[1]).toEqual(expect.objectContaining({
      canDelete: true,
      canDisable: true,
      name: 'bill',
      status: true,
      value: '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■',
      version: 4,
    }));
    expect(processedData[2]).toEqual(expect.objectContaining({
      canDelete: true,
      canDisable: true,
      name: 'ben',
      status: true,
      value: '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■',
      version: 3,
    }));
  });

  it('Sets canDelete to false for the latest version if it is the only non-destroyed version', () => {
    const versionData = [
      {
        name: 'bob',
        status: 'ENABLED',
        version: 5,
        createDate: '2021-09-28T13:38:50.331Z',
      },
      {
        name: 'bob',
        status: 'DESTROYED',
        version: 4,
        createDate: '2021-09-28T13:38:50.331Z',
      },
    ];

    expect(processSecretVersionData(versionData)[0]).toEqual(expect.objectContaining({
      canDelete: false,
      canDisable: false,
      name: 'bob',
      status: true,
      value: '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■',
      version: 5,
    }));
  });

  it('Sets canDelete to true for all versions except the latest if the previous version is not enabled', () => {
    const versionData = [
      {
        name: 'bill',
        status: 'ENABLED',
        version: 4,
        createDate: '2021-09-28T13:38:50.331Z',
      },
      {
        name: 'ben',
        status: 'DISABLED',
        version: 3,
        createDate: '2021-09-28T13:38:50.331Z',
      },
    ];

    const processedData = processSecretVersionData(versionData);

    expect(processedData[0]).toEqual(expect.objectContaining({
      canDelete: false,
      canDisable: false,
      name: 'bill',
      status: true,
      value: '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■',
      version: 4,
    }));
    expect(processedData[1]).toEqual(expect.objectContaining({
      canDelete: true,
      canDisable: true,
      name: 'ben',
      status: false,
      value: '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■',
      version: 3,
    }));
  });

  describe('PLACEHOLDER_REGEX matches the expected placeholder format', () => {
    it.each`
      name                                 | placeholder                      | expectedResult
      ${'given %{invalid.placeholder'}     | ${'%{invalid.placeholder'}      | ${false}
      ${'given %invalid.placeholder}'}     | ${'%invalid.placeholder}'}      | ${false}
      ${'given {invalid.placeholder}'}     | ${'{invalid.placeholder}'}      | ${false}
      ${'given %invalid.placeholder'}      | ${'%invalid.placeholder'}       | ${false}
      ${'given #{invalid.placeholder}'}    | ${'#{invalid.placeholder}'}     | ${false}
      ${'given &{a..b}'}                   | ${'&{a..b}'}                    | ${false}
      ${'given &{}'}                       | ${'&{}'}                        | ${false}
      ${'given null'}                      | ${null}                         | ${false}
      ${'given undefined'}                 | ${undefined}                    | ${false}
      ${'given 42'}                        | ${42}                           | ${false}
      ${'given &{valid}'}                  | ${'&{valid}'}                   | ${true}
      ${'given &{valid.placeholder}'}      | ${'&{valid.placeholder}'}       | ${true}
      ${'given &{valid.placeholder1}'}     | ${'&{valid.placeholder1}'}      | ${true}
      ${'given &{very.valid.placeholder}'} | ${'&{very.valid.placeholder}'}  | ${true}
      `('$name', ({ placeholder, expectedResult }) => {
      const test = PLACEHOLDER_REGEX.test(placeholder);
      expect(test).toBe(expectedResult);
    });
  });
});

describe('coercePlaceholderByType matches the expected outout format', () => {
  it.each`
    name                             | fieldType      | placeholder      | expectedResult
    ${'given string, &{esv.test}'}   | ${'string'}    | ${'&{esv.test}'} | ${{ $string: '&{esv.test}' }}
    ${'given text, &{esv.test}'}     | ${'text'}      | ${'&{esv.test}'} | ${{ $string: '&{esv.test}' }}
    ${'given password, &{esv.test}'} | ${'password'}  | ${'&{esv.test}'} | ${{ $string: '&{esv.test}' }}
    ${'given boolean, &{esv.test}'}  | ${'boolean'}   | ${'&{esv.test}'} | ${{ $bool: '&{esv.test}' }}
    ${'given checkbox, &{esv.test}'} | ${'checkbox'}  | ${'&{esv.test}'} | ${{ $bool: '&{esv.test}' }}
    `('$name', ({ fieldType, placeholder, expectedResult }) => {
    const output = coercePlaceholderByType(fieldType, placeholder);
    expect(output).toStrictEqual(expectedResult);
  });
});

describe('determining whether a field value contains a placeholder', () => {
  it.each`
    name                                  | fieldValue                               | expectedValue
    ${'string placeholder'}               | ${'&{esv.test}'}                         | ${true}
    ${'string that is not a placeholder'} | ${'blah'}                                | ${false}
    ${'object placeholder'}               | ${{ key: '&{esv.test}' }}                | ${true}
    ${'purpose placeholder'}              | ${{ $purpose: { name: 'test.secret' } }} | ${true}
    ${'object that is not a placeholder'} | ${{ key: 'a' }}                          | ${false}
    ${'object that is not a placeholder'} | ${{ a: '12', b: 23 }}                    | ${false}
    ${'other non-placeholder value'}      | ${false}                                 | ${false}
    `('Value containing $name', ({ fieldValue, expectedValue }) => {
      expect(doesValueContainPlaceholder(fieldValue)).toBe(expectedValue);
    });
});

describe('retrieving the placeholder key from a field value', () => {
  it.each`
    name                     | fieldValue                               | expectedValue
    ${'string placeholder'}  | ${'&{esv.test}'}                         | ${'&{esv.test}'}
    ${'object placeholder'}  | ${{ key: '&{esv.tast}' }}                | ${'&{esv.tast}'}
    ${'purpose placeholder'} | ${{ $purpose: { name: 'test.secret' } }} | ${'{"$purpose":{"name":"test.secret"}}'}
    `('Value containing $name', ({ fieldValue, expectedValue }) => {
      expect(getPlaceholderValueToDisplay(fieldValue)).toBe(expectedValue);
    });

  it('throws an error when passed a value that is not an object or string', () => {
    expect(() => getPlaceholderValueToDisplay(false)).toThrow(Error('Invalid field type'));
  });
});

describe('checking if a field type supports placeholder entry', () => {
  it.each`
    name                           | fieldType     | expectedValue
    ${'supported type "checkbox"'} | ${'checkbox'} | ${true}
    ${'unsupported type'}          | ${'datetime'} | ${false}
    ${'non string value as type'}  | ${false}      | ${false}
    `('Given the $name', ({ fieldType, expectedValue }) => {
      expect(isFieldTypeSupportedForPlaceholderEntry(fieldType)).toBe(expectedValue);
  });
});

describe('determining which esv types are relevant for an input field type', () => {
  it.each`
    inputfieldType | expectedEsvType
    ${'string'}    | ${'string'}
    ${'text'}      | ${'string'}
    ${'password'}  | ${'string'}
    ${'checkbox'}  | ${'bool'}
    ${'boolean'}   | ${'bool'}
    `('Given the input field type $inputFieldType', ({ inputfieldType, expectedEsvType }) => {
      expect(determineEsvTypeForField(inputfieldType)).toBe(expectedEsvType);
  });

  it.each`
    inputfieldType | expectedError
    ${'datetime'}  | ${'Unable to determine ESVs to show for the field type datetime'}
    ${undefined}   | ${'Unable to determine ESVs to show for the field type undefined'}
    ${null}        | ${'Unable to determine ESVs to show for the field type null'}
    `('Throws an error when given $inputFieldType', ({ inputfieldType, expectedError }) => {
      expect(() => determineEsvTypeForField(inputfieldType)).toThrow(Error(expectedError));
  });
});

describe('checking if secrets should be shown for a field type', () => {
  it.each`
    name                                   | fieldType     | expectedValue
    ${'type that should show secrets'}     | ${'string'}   | ${true}
    ${'type that should not show secrets'} | ${'datetime'} | ${false}
    ${'non string value as type'}          | ${false}      | ${false}
    `('Given $name', ({ fieldType, expectedValue }) => {
      expect(showEsvSecretsForField(fieldType)).toBe(expectedValue);
  });
});

describe('determining whether a field value contains a $purpose based placeholder', () => {
  it.each`
    name                                  | fieldValue                               | expectedValue
    ${'string placeholder'}               | ${'&{esv.test}'}                         | ${false}
    ${'string that is not a placeholder'} | ${'blah'}                                | ${false}
    ${'object placeholder'}               | ${{ key: '&{esv.test}' }}                | ${false}
    ${'purpose placeholder'}              | ${{ $purpose: { name: 'test.secret' } }} | ${true}
    ${'purpose with extra param'}         | ${{ $purpose: { name: 'test.secret', foo: 'an extra param' } }} | ${true}
    ${'object that is not a placeholder'} | ${{ key: 'a' }}                          | ${false}
    ${'object that is not a placeholder'} | ${{ a: '12', b: 23 }}                    | ${false}
    ${'other non-placeholder value'}      | ${false}                                 | ${false}
    `('Value containing $name', ({ fieldValue, expectedValue }) => {
      expect(valueIsPurposePlaceholder(fieldValue)).toBe(expectedValue);
    });
});
