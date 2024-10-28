/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as AgentsApi from './AgentsApi';

jest.mock('@forgerock/platform-shared/src/store', () => {
  const store = {
    state: {
      realm: 'root',
      realms: [{ name: '/' }, { name: 'mySubRealm', parentPath: '/' }],
      SharedStore: {
        amBaseURL: 'https://default.iam.example.com/am',
      },
    },
  };

  return {
    __esModule: true,
    setRealm(newRealm) {
      store.state.realm = newRealm;
    },
    default: store,
  };
});

describe('getGatewaysOrAgents', () => {
  const cases = [
    {
      name: 'root realm, gateway agent type',
      realm: 'root',
      agentType: 'gateway',
      url: '/IdentityGatewayAgent?_fields=status&_queryFilter=true',
    },
    {
      name: 'root realm, oauth2 agent type',
      realm: 'root',
      agentType: 'oauth2',
      url: '/OAuth2Client?_pageSize=10&_fields=coreOAuth2ClientConfig/status,advancedOAuth2ClientConfig/logoUri,coreOAuth2ClientConfig/clientType,coreOAuth2ClientConfig/clientName,advancedOAuth2ClientConfig/grantTypes,advancedOAuth2ClientConfig/responseTypes&_queryFilter=true',
    },
    {
      name: 'root realm, java agent type',
      realm: 'root',
      agentType: 'java-agent',
      url: '/J2EEAgent?_fields=globalJ2EEAgentConfig/status&_queryFilter=true',
    },
    {
      name: 'root realm, web agent type',
      realm: 'root',
      agentType: 'web-agent',
      url: '/WebAgent?_fields=globalWebAgentConfig/status&_queryFilter=true',
    },
    {
      name: 'sub realm, gateway agent type',
      realm: 'mySubRealm',
      agentType: 'gateway',
      url: '/IdentityGatewayAgent?_fields=status&_queryFilter=true',
    },
    {
      name: 'sub realm, oauth2 agent type',
      realm: 'mySubRealm',
      agentType: 'oauth2',
      url: '/OAuth2Client?_pageSize=10&_fields=coreOAuth2ClientConfig/status,advancedOAuth2ClientConfig/logoUri,coreOAuth2ClientConfig/clientType,coreOAuth2ClientConfig/clientName,advancedOAuth2ClientConfig/grantTypes,advancedOAuth2ClientConfig/responseTypes&_queryFilter=true',
    },
    {
      name: 'with custom params, not overwriting queryFilter',
      realm: 'root',
      agentType: 'gateway',
      params: { foo: 'bar' },
      url: '/IdentityGatewayAgent?_fields=status&_foo=bar&_queryFilter=true',
    },
    {
      name: 'with custom params, including queryFilter',
      realm: 'root',
      agentType: 'gateway',
      params: { foo: 'bar', queryFilter: 'baz' },
      url: '/IdentityGatewayAgent?_fields=status&_foo=bar&_queryFilter=_id+co+"baz"',
    },
  ];

  cases.forEach(({
    name,
    agentType,
    params,
    url,
  }) => {
    test(name, async () => {
      const getSpy = jest.fn();
      const generateAmApiSpy = jest.spyOn(BaseApi, 'generateAmApi').mockImplementation(() => ({
        get: getSpy,
      }));
      const path = 'realms/root/realm-config/agents';

      await AgentsApi.getGatewaysOrAgents(agentType, params);

      expect(generateAmApiSpy).toHaveBeenCalledWith({
        apiVersion: 'protocol=2.1,resource=2.0',
        path,
      });
      expect(getSpy).toHaveBeenCalledWith(expect.stringContaining(url), { withCredentials: true });
    });
  });
});
