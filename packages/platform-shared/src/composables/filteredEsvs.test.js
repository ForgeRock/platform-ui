/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import useFilteredEsvs from './filteredEsvs';

const sampleVariables = [
  {
    expressionType: 'bool',
    placeholder: '&{esv.myBool}',
  },
  {
    expressionType: 'string',
    placeholder: '&{esv.myString}',
  },
  {
    expressionType: 'string',
    placeholder: '&{esv.yourString}',
  },
];
const sampleSecrets = [
  {
    placeholder: '&{esv.myPassword}',
  },
  {
    placeholder: '&{esv.yourPassword}',
  },
];

describe('filterEsv composable', () => {
  function setupTestStore(variables, secrets) {
    const testPinia = createTestingPinia({
      initialState: {
        esvInput: { variables, secrets },
      },
    });
    setActivePinia(testPinia);
  }

  it('Throws an error if the required arguments are not passed', () => {
    expect(() => useFilteredEsvs()).toThrow(Error('Both fieldType and query are required to use this composable'));
  });

  describe('Obtaining ESVs from the store', () => {
    it('Returns empty lists of variables and secrets if there is no ESV data', () => {
      setupTestStore([], []);
      const { filteredEsvs } = useFilteredEsvs(ref(''), 'string');
      expect(filteredEsvs.value.length).toBe(0);
    });

    it('Filters ESVs from the store based on the relevant expression type for the passed field type', () => {
      setupTestStore(sampleVariables, sampleSecrets);
      const { filteredEsvs } = useFilteredEsvs(ref('&{'), 'string');

      expect(filteredEsvs.value).toEqual([
        {
          expressionType: 'string',
          placeholder: '&{esv.myString}',
        },
        {
          expressionType: 'string',
          placeholder: '&{esv.yourString}',
        },
        {
          placeholder: '&{esv.myPassword}',
        },
        {
          placeholder: '&{esv.yourPassword}',
        },
      ]);
    });
  });

  it('Filters the relevant ESVs reactively based on the passed query', () => {
    setupTestStore(sampleVariables, sampleSecrets);
    const query = ref('&{');
    const { filteredEsvs } = useFilteredEsvs(query, 'string');

    expect(filteredEsvs.value).toEqual([
      {
        expressionType: 'string',
        placeholder: '&{esv.myString}',
      },
      {
        expressionType: 'string',
        placeholder: '&{esv.yourString}',
      },
      {
        placeholder: '&{esv.myPassword}',
      },
      {
        placeholder: '&{esv.yourPassword}',
      },
    ]);

    query.value = '&{esv.my';

    expect(filteredEsvs.value).toEqual([
      {
        expressionType: 'string',
        placeholder: '&{esv.myString}',
      },
      {
        placeholder: '&{esv.myPassword}',
      },
    ]);
  });

  it('Performs a case insensitive filter based on the passed query', () => {
    setupTestStore(sampleVariables, sampleSecrets);
    const query = ref('&{');
    const { filteredEsvs } = useFilteredEsvs(query, 'string');

    expect(filteredEsvs.value).toEqual([
      {
        expressionType: 'string',
        placeholder: '&{esv.myString}',
      },
      {
        expressionType: 'string',
        placeholder: '&{esv.yourString}',
      },
      {
        placeholder: '&{esv.myPassword}',
      },
      {
        placeholder: '&{esv.yourPassword}',
      },
    ]);

    query.value = '&{esv.MY';

    expect(filteredEsvs.value).toEqual([
      {
        expressionType: 'string',
        placeholder: '&{esv.myString}',
      },
      {
        placeholder: '&{esv.myPassword}',
      },
    ]);
  });

  it('Only includes secrets for relevant field types', () => {
    setupTestStore(sampleVariables, sampleSecrets);
    const { filteredEsvs } = useFilteredEsvs(ref('&{'), 'boolean');

    expect(filteredEsvs.value).toEqual([
      {
        expressionType: 'bool',
        placeholder: '&{esv.myBool}',
      },
    ]);
  });
});
