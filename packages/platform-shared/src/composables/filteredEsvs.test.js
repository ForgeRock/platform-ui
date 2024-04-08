/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { useEsvInputStore } from '@forgerock/platform-shared/src/stores/esvInput';
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
  function setupTestStore(variables, secrets, loading = false, listInUse = false, supportedTypes = '') {
    const testPinia = createTestingPinia({
      initialState: {
        esvInput: {
          variables,
          secrets,
          loading,
          listInUse,
          supportedTypes,
        },
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

  it('Returns the loading state of the store', () => {
    setupTestStore(sampleVariables, sampleSecrets, true);
    const { isLoading } = useFilteredEsvs(ref(''), 'string');
    expect(isLoading.value).toBe(true);
  });

  it('Returns whether secrets are to be displayed for the field type', () => {
    setupTestStore(sampleVariables, sampleSecrets);
    const { secretsVisible } = useFilteredEsvs(ref(''), 'checkbox');
    expect(secretsVisible).toBe(false);
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

  describe('Toggling the list in use', () => {
    it('Returns the list in use from the store', () => {
      setupTestStore(sampleVariables, sampleSecrets, false, true);
      const { esvListInUse } = useFilteredEsvs(ref(''), 'string');
      expect(esvListInUse.value).toBe(true);
    });

    it('Sets the list in use in the store', () => {
      setupTestStore(sampleVariables, sampleSecrets, false, false);
      const { esvListInUse } = useFilteredEsvs(ref(''), 'string');
      expect(useEsvInputStore().listInUse).toBe(false);
      esvListInUse.value = true;

      expect(useEsvInputStore().listInUse).toBe(true);
    });

    it('Sets the supported types in the store when the list is in use', () => {
      setupTestStore(sampleVariables, sampleSecrets, false, false);
      const { esvListInUse } = useFilteredEsvs(ref(''), 'string');
      expect(useEsvInputStore().supportedTypes).toBe('');
      esvListInUse.value = true;

      expect(useEsvInputStore().supportedTypes).toBe('string');
    });
  });
});
