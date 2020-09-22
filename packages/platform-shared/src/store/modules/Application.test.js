/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import Store from '../index';

describe('Application Store', () => {
  it('authHeaders state management', () => {
    expect(Store.state.ApplicationStore.authHeaders).toBeNull();

    Store.commit('ApplicationStore/setAuthHeadersAction', { 'test-header': 'test' });

    expect(JSON.stringify(Store.state.ApplicationStore.authHeaders)).toBe(JSON.stringify({ 'test-header': 'test' }));

    Store.commit('ApplicationStore/clearAuthHeadersAction');

    expect(Store.state.ApplicationStore.authHeaders).toBeNull();
  });

  it('loginRedirect state management', () => {
    expect(Store.state.ApplicationStore.loginRedirect).toBeNull();

    Store.commit('ApplicationStore/setLoginRedirect', 'testUrl');

    expect(Store.state.ApplicationStore.loginRedirect).toBe('testUrl');

    Store.commit('ApplicationStore/clearLoginRedirect');
  });

  describe('setting schema data property values', () => {
    beforeEach(() => {
      Store.commit('ApplicationStore/setSchemaData', {
        schemaType: 'test',
        data: {
          core: {
            propThatExists: {
              value: 'oldValue',
            },
            userpassword: null,
          },
          advanced: {
            propThatIsArray: {
              value: ['oldArrayValue'],
            },
          },
        },
      });
    });

    it('stores values of existing properties under a nested "value" prop', () => {
      expect(Store.state.ApplicationStore.jsonSchemaData.test.core.propThatExists.value).toBe('oldValue');

      Store.commit(
        'ApplicationStore/setSchemaDataPropertyValue',
        {
          schemaType: 'test',
          value: 'newValue',
          model: 'core.propThatExists',
        },
      );

      expect(Store.state.ApplicationStore.jsonSchemaData.test.core.propThatExists.value).toBe('newValue');
    });

    it('stores values of non-existing properties directly at the specified model location', () => {
      expect(Store.state.ApplicationStore.jsonSchemaData.test.core.propThatDoesntExist).toBeUndefined();

      Store.commit(
        'ApplicationStore/setSchemaDataPropertyValue',
        {
          schemaType: 'test',
          value: 'existingValue',
          model: 'core.propThatDoesntExist',
        },
      );

      expect(Store.state.ApplicationStore.jsonSchemaData.test.core.propThatDoesntExist).toBe('existingValue');
    });

    it('stores values of "userpassword" properties directly at the specified model location', () => {
      expect(Store.state.ApplicationStore.jsonSchemaData.test.core.userpassword).toBeNull();

      Store.commit(
        'ApplicationStore/setSchemaDataPropertyValue',
        {
          schemaType: 'test',
          value: 'newPassword',
          model: 'core.userpassword',
        },
      );

      expect(Store.state.ApplicationStore.jsonSchemaData.test.core.userpassword).toBe('newPassword');
    });

    it('stores values with model names ending in "[0]" as single values in an array at the specified model location', () => {
      const initialValueArray = Store.state.ApplicationStore.jsonSchemaData.test.advanced.propThatIsArray.value;
      expect(initialValueArray.length).toBe(1);
      expect(initialValueArray[0]).toBe('oldArrayValue');

      Store.commit(
        'ApplicationStore/setSchemaDataPropertyValue',
        {
          schemaType: 'test',
          value: 'newArrayValue',
          model: 'advanced.propThatIsArray[0]',
        },
      );

      const newValueArray = Store.state.ApplicationStore.jsonSchemaData.test.advanced.propThatIsArray.value;
      expect(newValueArray.length).toBe(1);
      expect(newValueArray[0]).toBe('newArrayValue');
    });
  });
});
