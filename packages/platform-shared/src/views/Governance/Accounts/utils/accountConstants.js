/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const ACCOUNT_TYPES = {
  DEFAULT: 'default',
  MACHINE: 'machine',
};

const ACCOUNT_SUBTYPES = [
  {
    value: 'oauthToken', text: 'OAuth Token', icon: 'key', iconColor: 'blue',
  },
  {
    value: 'serviceAccount', text: 'Service Account', icon: 'badge', iconColor: 'purple',
  },
  {
    value: 'rpa', text: 'RPA', icon: 'precision_manufacturing', iconColor: 'orange',
  },
  {
    value: 'bot', text: 'BOT', icon: 'smart_toy', iconColor: 'green',
  },
  {
    value: 'accessToken', text: 'Access Token', icon: 'vpn_key', iconColor: 'brown',
  },
  {
    value: 'secret', text: 'Secret', icon: 'lock', iconColor: 'red',
  },
  {
    value: 'apiKey', text: 'API Key', icon: 'code', iconColor: 'blue',
  },
  {
    value: 'personalAccessToken', text: 'Personal Access Token', icon: 'person', iconColor: 'orange',
  },
  {
    value: 'managedAccount', text: 'Managed Account', icon: 'manage_accounts', iconColor: 'blue',
  },
  {
    value: 'teamToken', text: 'Team Token', icon: 'group', iconColor: 'teal',
  },
  {
    value: 'organizationToken', text: 'Organization Token', icon: 'domain', iconColor: 'gray',
  },
  {
    value: 'botToken', text: 'BOT Token', icon: 'memory', iconColor: 'green',
  },
  {
    value: 'webhookKey', text: 'Webhook Key', icon: 'link', iconColor: 'gray',
  },
  {
    value: 'integrationToken', text: 'Integration Token', icon: 'merge_type', iconColor: 'purple',
  },
  {
    value: 'servicePrincipal', text: 'Service Principal', icon: 'verified_user', iconColor: 'yellow',
  },
  {
    value: 'userManagedIdentity', text: 'User Managed Identity', icon: 'supervised_user_circle', iconColor: 'red',
  },
  {
    value: 'cognitoToken', text: 'Cognito Token', icon: 'login', iconColor: 'teal',
  },
  {
    value: 'lambdaAuthorizer', text: 'Lambda Authorizer', icon: 'flash_on', iconColor: 'yellow',
  },
];

export default {
  ACCOUNT_TYPES,
  ACCOUNT_SUBTYPES,
};
