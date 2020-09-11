/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
      enum: [
        'client_secret_post',
        'client_secret_basic',
        'private_key_jwt',
        'tls_client_auth',
        'self_signed_tls_client_auth',
        'none',
      ],
      enumNames: [
        'client_secret_post',
        'client_secret_basic',
        'private_key_jwt',
        'tls_client_auth',
        'self_signed_tls_client_auth',
        'none',
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
    enum: [
      'None',
      'Realm',
      'Realm_Subs',
    ],
    enumNames: [
      'None',
      'Realm Only',
      'Realm and Sub Realms',
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

  describe('filtering and mapping json schemas', () => {
    it('correctly filters and maps nested schema information', () => {
      expect(wrapper.vm.filterAndMapRawSchema(exampleApplicationSchema)).toEqual(expectedMappedApplicationSchema);
    });

    it('correctly filters and maps non-nested schema information', () => {
      expect(wrapper.vm.filterAndMapRawSchema(exampleGatewaySchema)).toEqual(expectedMappedGatewaySchema);
    });
  });
});
