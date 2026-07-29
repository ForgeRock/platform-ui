/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi, generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import {
  getAgents,
  getAgentById,
  getAgentGlossaryAttributesData,
  saveAgentGlossaryAttributesData,
  getAgentGrants,
  getAgentResourcesByIds,
  getAgentResourceById,
  getAgentConfig,
} from './AgentApi';

jest.mock('@forgerock/platform-shared/src/api/BaseApi');
jest.mock('@forgerock/platform-shared/src/utils/encodeQueryString');

describe('AgentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAgents', () => {
    it('should fetch agents with query parameters', async () => {
      const queryParams = { _pageSize: 10 };
      const encodedQueryParams = '?_pageSize=10';
      const mockResponse = [{ id: '123', account: { __NAME__: 'Agent 123' } }];
      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAgents(queryParams);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/agent${encodedQueryParams}`);
    });
  });

  describe('getAgentById', () => {
    it('should fetch agent details by ID', async () => {
      const agentId = '123';
      const mockResponse = { id: agentId, account: { __NAME__: 'Agent 123' } };
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAgentById(agentId);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/agent/${agentId}`);
    });
  });

  describe('getAgentGlossaryAttributesData', () => {
    it('should fetch glossary attributes data for an agent', async () => {
      const agentId = '123';
      const mockResponse = { actors: ['managed/user/abc'], accountType: 'agent' };
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAgentGlossaryAttributesData(agentId);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/agent/${agentId}/glossary`);
    });
  });

  describe('saveAgentGlossaryAttributesData', () => {
    it('should save glossary attributes data for an agent', async () => {
      const agentId = '123';
      const payload = { actors: ['managed/user/abc'], accountType: 'agent' };
      const mockResponse = { actors: ['managed/user/abc'], accountType: 'agent' };
      generateIgaApi.mockReturnValue({
        put: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await saveAgentGlossaryAttributesData(agentId, payload);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().put).toHaveBeenCalledWith(`governance/agent/${agentId}/glossary`, payload);
    });
  });

  describe('getAgentGrants', () => {
    it('should fetch agent grants with query parameters', async () => {
      const agentId = '123';
      const queryParams = { _pageSize: 10, _queryFilter: "item.type eq 'entitlementGrant'" };
      const encodedQueryParams = '?_pageSize=10&_queryFilter=item.type%20eq%20%27entitlementGrant%27';
      const mockResponse = [{ id: 'entitlement1' }];
      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAgentGrants(agentId, queryParams);
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith(queryParams);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/agent/${agentId}/grants${encodedQueryParams}`);
    });
  });

  describe('getAgentResourcesByIds', () => {
    it('should fetch agent resources for disconnected app with query parameters', async () => {
      const accountId = '123';
      const queryParams = { _pageSize: 10 };
      const updatedQueryParams = { _pageSize: 10, _queryFilter: 'objectType eq "tools" and (id eq "tool1")' };
      const encodedQueryParams = '?_pageSize=10&_queryFilter=objectType eq "tools" and (id eq "tool1")';
      const mockResponse = [{ id: 'tool1' }];

      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAgentResourcesByIds(queryParams, { id: accountId, isDisconnected: true }, 'tools', ['tool1']);
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith(updatedQueryParams);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/application/${accountId}/resources${encodedQueryParams}`);
    });

    it('should fetch agent resources for non-disconnected app with query parameters', async () => {
      const connectorId = 'connector-456';
      const queryParams = { _pageSize: 10 };
      const updatedQueryParams = { _pageSize: 10, _queryFilter: '_id eq "tool1"' };
      const encodedQueryParams = '?_pageSize=10&_queryFilter=_id eq "tool1"';
      const mockResponse = [{ _id: 'tool1' }];

      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIdmApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAgentResourcesByIds(queryParams, { connectorId, isDisconnected: false }, 'tools', ['tool1']);
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith(updatedQueryParams);
      expect(generateIdmApi().get).toHaveBeenCalledWith(`/system/${connectorId}/tools${encodedQueryParams}`);
    });
  });

  describe('getAgentResourceById', () => {
    const resourceType = 'tools';
    const resourceId = 'tool1';
    const mockResource = { id: resourceId, name: 'My Tool' };

    it('should return the first result from getApplicationObjectsByIds for a disconnected app', async () => {
      const application = { id: 'app-123', isDisconnected: true };
      const encodedQueryParams = '?_queryFilter=objectType eq "tools" and (id eq "tool1")';
      const mockApiResponse = { data: { result: [mockResource] } };

      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const result = await getAgentResourceById(application, resourceType, resourceId);
      expect(encodeQueryString).toHaveBeenCalledWith({ _queryFilter: `objectType eq "${resourceType}" and (id eq "${resourceId}")` });
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/application/${application.id}/resources${encodedQueryParams}`);
      expect(result).toEqual({ ...mockApiResponse, data: mockResource });
    });

    it('should call getSystemResource for a non-disconnected app', async () => {
      const application = { connectorId: 'connector-456', isDisconnected: false };

      generateIdmApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResource),
      });

      const result = await getAgentResourceById(application, resourceType, resourceId);
      expect(generateIdmApi().get).toHaveBeenCalledWith(`system/${application.connectorId}/${resourceType}/${resourceId}`);
      expect(result).toEqual(mockResource);
    });
  });

  describe('getAgentConfig', () => {
    it('should fetch the agent config and return response data', async () => {
      const mockConfig = { templates: [{ id: 'aws.bedrock' }], applicationProps: [] };
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockConfig }),
      });

      const result = await getAgentConfig();
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/agent/config');
      expect(result.data).toEqual(mockConfig);
    });
  });
});
