/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import SchemaMixin from './index';

const exampleApplicationSchema = {
  type: 'object',
  properties: {
    advancedOAuth2ClientConfig: {
      type: 'object',
      title: 'Advanced',
      propertyOrder: 1,
      properties: {
        mixUpMitigation: {
          title: 'OAuth 2.0 Mix-Up Mitigation enabled', description: 'blah', propertyOrder: 26300, type: 'object', exampleValue: '', properties: { inherited: { type: 'boolean', required: true }, value: { type: 'boolean', required: true } },
        },
        name: {
          title: 'Display name', description: 'blah', propertyOrder: 23500, items: { type: 'string' }, type: 'object', exampleValue: '', properties: { inherited: { type: 'boolean', required: true }, value: { type: 'array', required: false } },
        },
        updateAccessToken: {
          title: 'Access Token', description: 'blah', propertyOrder: 25100, type: 'object', exampleValue: '', properties: { inherited: { type: 'boolean', required: true }, value: { type: 'string', required: false } },
        },
        requestUris: {
          title: 'Request uris', description: 'blah', propertyOrder: 23700, items: { type: 'string' }, type: 'object', exampleValue: '', properties: { inherited: { type: 'boolean', required: true }, value: { type: 'array', required: false } },
        },
        isConsentImplied: {
          title: 'Implied consent', description: 'blah', propertyOrder: 26200, type: 'object', exampleValue: '', properties: { inherited: { type: 'boolean', required: true }, value: { type: 'boolean', required: true } },
        },
        tokenEndpointAuthMethod: {
          title: 'Token Endpoint Authentication Method', description: 'blah', propertyOrder: 24000, enum: ['client_secret_post', 'client_secret_basic', 'private_key_jwt', 'tls_client_auth', 'self_signed_tls_client_auth', 'none'], options: { enum_titles: ['client_secret_post', 'client_secret_basic', 'private_key_jwt', 'tls_client_auth', 'self_signed_tls_client_auth', 'none'] }, enumNames: ['client_secret_post', 'client_secret_basic', 'private_key_jwt', 'tls_client_auth', 'self_signed_tls_client_auth', 'none'], type: 'object', exampleValue: '', properties: { inherited: { type: 'boolean', required: true }, value: { type: 'string', required: true } },
        },
        subjectType: {
          title: 'Subject Type', description: 'blah', propertyOrder: 24400, enum: ['pairwise', 'public'], options: { enum_titles: ['pairwise', 'public'] }, enumNames: ['pairwise', 'public'], type: 'object', exampleValue: '', properties: { inherited: { type: 'boolean', required: true }, value: { type: 'string', required: true } },
        },
      },
    },
  },
};

const uiSchemaExample = [
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.isConsentImplied',
      label: 'oauth.generalSettings.clientNameLabel',
      type: 'string',
    },
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.mixUpMitigation',
      label: 'oauth.generalSettings.logoUriLabel',
      description: 'oauth.generalSettings.logoUriHelp',
      type: 'string',
    },
  ],
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.name',
      label: 'oauth.generalSettings.descriptionsLabel',
      description: '',
      type: 'string',
    },
    {
      columns: 6,
      customSlot: 'default',
      model: 'custom',
    },
  ],
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.requestUris',
      label: 'oauth.generalSettings.redirectionUrisLabel',
      description: 'oauth.generalSettings.redirectionUrisHelp',
    },
  ],
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.subjectType',
      label: 'oauth.generalSettings.postLogoutRedirectUriLabel',
      description: 'oauth.generalSettings.postLogoutRedirectUriHelp',
    },
  ],
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.tokenEndpointAuthMethod',
      label: 'oauth.generalSettings.grantTypesLabel',
      description: 'oauth.generalSettings.grantTypesHelp',
    },
  ],
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.updateAccessToken',
      label: 'oauth.generalSettings.scopesLabel',
      description: 'oauth.generalSettings.scopesHelp',
    },
  ],
];

const expectedCombinedSchema = [
  [
    {
      columns: 6,
      description: 'blah',
      label: 'oauth.generalSettings.clientNameLabel',
      model: 'advancedOAuth2ClientConfig.isConsentImplied',
      required: true,
      title: 'Implied consent',
      type: 'string',
    },
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.mixUpMitigation',
      label: 'oauth.generalSettings.logoUriLabel',
      description: 'oauth.generalSettings.logoUriHelp',
      required: true,
      title: 'OAuth 2.0 Mix-Up Mitigation enabled',
      type: 'string',
    },
  ],
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.name',
      label: 'oauth.generalSettings.descriptionsLabel',
      description: '',
      type: 'string',
      arrayType: 'addMany',
      options: [],
      title: 'Display name',
    },
    {
      columns: 6,
      customSlot: 'default',
      model: 'custom',
    },
  ],
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.requestUris',
      label: 'oauth.generalSettings.redirectionUrisLabel',
      description: 'oauth.generalSettings.redirectionUrisHelp',
      arrayType: 'addMany',
      options: [],
      title: 'Request uris',
      type: 'array',
    },
  ],
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.subjectType',
      label: 'oauth.generalSettings.postLogoutRedirectUriLabel',
      description: 'oauth.generalSettings.postLogoutRedirectUriHelp',
      options: [
        {
          text: 'pairwise',
          value: 'pairwise',
        },
        {
          text: 'public',
          value: 'public',
        },
      ],
      required: true,
      title: 'Subject Type',
      type: 'radio',
    },
  ],
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.tokenEndpointAuthMethod',
      label: 'oauth.generalSettings.grantTypesLabel',
      description: 'oauth.generalSettings.grantTypesHelp',
      arrayType: 'selectOne',
      options: [
        { value: 'client_secret_post', text: 'client_secret_post' },
        { value: 'client_secret_basic', text: 'client_secret_basic' },
        { value: 'private_key_jwt', text: 'private_key_jwt' },
        { value: 'tls_client_auth', text: 'tls_client_auth' },
        { value: 'self_signed_tls_client_auth', text: 'self_signed_tls_client_auth' },
        { value: 'none', text: 'none' },
      ],
      required: true,
      title: 'Token Endpoint Authentication Method',
      type: 'array',
    },
  ],
  [
    {
      columns: 6,
      model: 'advancedOAuth2ClientConfig.updateAccessToken',
      label: 'oauth.generalSettings.scopesLabel',
      description: 'oauth.generalSettings.scopesHelp',
      title: 'Access Token',
      type: 'string',
    },
  ],
];

const expectedMappedApplicationSchema = {
  advancedOAuth2ClientConfig: {
    isConsentImplied: {
      description: 'blah',
      required: true,
      title: 'Implied consent',
      type: 'boolean',
    },
    mixUpMitigation: {
      description: 'blah',
      required: true,
      title: 'OAuth 2.0 Mix-Up Mitigation enabled',
      type: 'boolean',
    },
    name: {
      arrayType: 'addMany',
      description: 'blah',
      options: [],
      title: 'Display name',
      type: 'array',
    },
    requestUris: {
      arrayType: 'addMany',
      description: 'blah',
      options: [],
      title: 'Request uris',
      type: 'array',
    },
    required: [
      'mixUpMitigation',
      'isConsentImplied',
      'tokenEndpointAuthMethod',
      'subjectType',
    ],
    subjectType: {
      description: 'blah',
      options: [
        {
          text: 'pairwise',
          value: 'pairwise',
        },
        {
          text: 'public',
          value: 'public',
        },
      ],
      required: true,
      title: 'Subject Type',
      type: 'radio',
    },
    tokenEndpointAuthMethod: {
      arrayType: 'selectOne',
      description: 'blah',
      options: [
        { value: 'client_secret_post', text: 'client_secret_post' },
        { value: 'client_secret_basic', text: 'client_secret_basic' },
        { value: 'private_key_jwt', text: 'private_key_jwt' },
        { value: 'tls_client_auth', text: 'tls_client_auth' },
        { value: 'self_signed_tls_client_auth', text: 'self_signed_tls_client_auth' },
        { value: 'none', text: 'none' },
      ],
      required: true,
      title: 'Token Endpoint Authentication Method',
      type: 'array',
    },
    updateAccessToken: {
      description: 'blah',
      title: 'Access Token',
      type: 'string',
    },
  },
};

const exampleGatewaySchema = {
  type: 'object',
  properties: {
    igCdssoRedirectUrls: {
      title: 'Redirect URLs for CDSSO', description: 'blah', propertyOrder: 150, items: { type: 'string' }, type: 'object', exampleValue: '', properties: { inherited: { type: 'boolean', required: true }, value: { type: 'array', required: false } },
    },
    igTokenIntrospection: {
      title: 'Token Introspection', description: 'blah', propertyOrder: 160, enum: ['None', 'Realm', 'Realm_Subs'], options: { enum_titles: ['None', 'Realm Only', 'Realm and Sub Realms'] }, enumNames: ['None', 'Realm Only', 'Realm and Sub Realms'], type: 'object', exampleValue: '', properties: { inherited: { type: 'boolean', required: true }, value: { type: 'string', required: false } },
    },
    userpassword: {
      title: 'Password', description: 'blah', propertyOrder: 100, required: true, type: 'string', format: 'password', exampleValue: '',
    },
    status: {
      title: 'Status', description: 'blah', propertyOrder: 200, enum: ['Active', 'Inactive'], options: { enum_titles: ['Active', 'Inactive'] }, enumNames: ['Active', 'Inactive'], type: 'object', exampleValue: '', properties: { inherited: { type: 'boolean', required: true }, value: { type: 'string', required: true } },
    },
  },
};

const expectedMappedGatewaySchema = {
  igCdssoRedirectUrls: {
    arrayType: 'addMany',
    description: 'blah',
    options: [],
    title: 'Redirect URLs for CDSSO',
    type: 'array',
  },
  igTokenIntrospection: {
    arrayType: 'selectOne',
    description: 'blah',
    options: [
      { value: 'None', text: 'None' },
      { value: 'Realm', text: 'Realm Only' },
      { value: 'Realm_Subs', text: 'Realm and Sub Realms' },
    ],
    title: 'Token Introspection',
    type: 'array',
  },
  status: {
    description: 'blah',
    options: [
      {
        text: 'Active',
        value: 'Active',
      },
      {
        text: 'Inactive',
        value: 'Inactive',
      },
    ],
    required: true,
    title: 'Status',
    type: 'radio',
  },
  userpassword: {
    description: 'blah',
    format: 'password',
    required: true,
    title: 'Password',
    type: '',
  },
};

let wrapper;

beforeEach(() => {
  wrapper = mount({
    template: '<div>Testing is awesome!</div>',
    mixins: [SchemaMixin],
  });
});

describe('Schema mixin', () => {
  describe('isNestedProperty method', () => {
    it('identifies properties with more than two sub-properties as nested', () => {
      expect(wrapper.vm.isNestedProperty(
        {
          something: 'something',
          properties: {
            value: 'test',
            inherited: 'test',
            other: 'test',
          },
        },
      )).toBe(true);
    });

    it('identifies properties which have no sub properties as not nested', () => {
      expect(wrapper.vm.isNestedProperty(
        {
          something: 'something',
        },
      )).toBe(false);
    });

    it('identifies properties which only have \'inherited\' and \'value\' as keys as not nested', () => {
      expect(wrapper.vm.isNestedProperty(
        {
          something: 'something',
          properties: {
            inherited: 'test',
            value: 'test',
          },
        },
      )).toBe(false);
    });
  });

  describe('combining backend and frontend schemas', () => {
    it('combines two schemas', () => {
      expect(wrapper.vm.combineSchemas(expectedMappedApplicationSchema, uiSchemaExample)).toEqual(expectedCombinedSchema);
    });
  });

  describe('filtering and mapping json schemas', () => {
    it('correctly filters and maps nested schema information', () => {
      expect(wrapper.vm.filterAndMapRawSchema(exampleApplicationSchema)).toEqual(expectedMappedApplicationSchema);
    });

    it('correctly filters and maps non-nested schema information', () => {
      expect(wrapper.vm.filterAndMapRawSchema(exampleGatewaySchema)).toEqual(expectedMappedGatewaySchema);
    });
  });

  describe('setModelPropertyValue method', () => {
    const model = {
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
    };

    it('updates values of existing properties under a nested "value" prop', () => {
      wrapper.vm.setModelPropertyValue({ path: 'core.propThatExists', value: 'newValue' }, model);

      expect(model.core.propThatExists.value).toBe('newValue');
    });

    it('updates values of non-existing properties directly at the specified path', () => {
      wrapper.vm.setModelPropertyValue({ path: 'core.propThatDoesntExist', value: 'existingValue' }, model);
      expect(model.core.propThatDoesntExist).toBe('existingValue');
    });

    it('updates values of "userpassword" properties directly at the specified path', () => {
      wrapper.vm.setModelPropertyValue({ path: 'core.userpassword', value: 'newPassword' }, model);
      expect(model.core.userpassword).toBe('newPassword');
    });

    it('updates values with paths ending in "[0]" as single values in an array at the specified path', () => {
      wrapper.vm.setModelPropertyValue({ path: 'advanced.propThatIsArray', value: 'newArrayValue' }, model);
      const newValueArray = model.advanced.propThatIsArray.value;
      expect(newValueArray.length).toBe(1);
      expect(newValueArray[0]).toBe('newArrayValue');
    });
  });
});
