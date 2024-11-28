/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as TreeApi from './TreeApi';

jest.mock('@/store', () => ({
  __esModule: true,
  default: {
    state: {
      realm: 'alpha',
      realms: [
        { name: 'alpha', parentPath: '/' },
        { name: 'bravo', parentPath: '/' },
      ],
    },
  },
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();
const mockGenerate = jest.fn(() => ({
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
}));
const withCreds = { withCredentials: true };

BaseApi.generateAmApi = mockGenerate;

describe('Tree API', () => {
  it('calls endpoints with correct request config', async () => {
    const expected = {
      path: 'realms/root/realms/alpha/realm-config/authentication/authenticationtrees',
      apiVersion: 'protocol=2.1,resource=1.0',
    };

    TreeApi.actionGetAllTrees();
    expect(mockGenerate).toHaveBeenLastCalledWith(expected);
  });

  it('actionGetAllTrees should call api with correct parameters', async () => {
    // No params
    TreeApi.actionGetAllTrees();
    expect(mockGet).toHaveBeenLastCalledWith('/trees?_queryFilter=true&_pageSize=-1', withCreds);

    // With single field
    TreeApi.actionGetAllTrees(['_id']);
    expect(mockGet).toHaveBeenLastCalledWith('/trees?_queryFilter=true&_pageSize=-1&_fields=_id', withCreds);

    // With multiple fields
    TreeApi.actionGetAllTrees(['_id', 'description']);
    expect(mockGet).toHaveBeenLastCalledWith('/trees?_queryFilter=true&_pageSize=-1&_fields=_id,description', withCreds);// With multiple fields

    // with search query
    TreeApi.actionGetAllTrees([], 'displayName+co+"testQuery"');
    expect(mockGet).toHaveBeenLastCalledWith('/trees?_queryFilter=displayName+co+"testQuery"&_pageSize=-1', withCreds);

    // with field and search query
    TreeApi.actionGetAllTrees(['_id'], 'displayName+co+"testQuery"');
    expect(mockGet).toHaveBeenLastCalledWith('/trees?_queryFilter=displayName+co+"testQuery"&_pageSize=-1&_fields=_id', withCreds);

    // with pageSize
    TreeApi.actionGetAllTrees([], true, 10);
    expect(mockGet).toHaveBeenLastCalledWith('/trees?_queryFilter=true&_pageSize=10', withCreds);

    // the whole shabang
    TreeApi.actionGetAllTrees(['_id', 'description'], 'displayName+co+"testQuery"', 10);
    expect(mockGet).toHaveBeenLastCalledWith('/trees?_queryFilter=displayName+co+"testQuery"&_pageSize=10&_fields=_id,description', withCreds);
  });

  it('getTree should call api with correct parameters', async () => {
    const expectedConfig = {
      path: 'realms/root/realms/bravo/realm-config/authentication/authenticationtrees',
      apiVersion: 'protocol=2.1,resource=1.0',
    };

    // not forExport
    TreeApi.getTree('123');
    expect(mockGet).toHaveBeenLastCalledWith('/trees/123?forUI=true', withCreds);

    // forExport
    TreeApi.getTree('123', true);
    expect(mockGet).toHaveBeenLastCalledWith('/trees/123', withCreds);

    // with realm
    TreeApi.getTree('123', false, 'bravo');
    expect(mockGenerate).toHaveBeenLastCalledWith(expectedConfig);
    expect(mockGet).toHaveBeenLastCalledWith('/trees/123?forUI=true', withCreds);

    // with single field
    TreeApi.getTree('123', false, 'alpha', ['_id']);
    expect(mockGet).toHaveBeenLastCalledWith('/trees/123?forUI=true&_fields=_id', withCreds);

    // with multiple fields
    TreeApi.getTree('123', false, 'alpha', ['_id', 'description']);
    expect(mockGet).toHaveBeenLastCalledWith('/trees/123?forUI=true&_fields=_id,description', withCreds);
  });

  it('putNode should call api with correct parameters', async () => {
    const nodeConfig = { config: 'test' };
    TreeApi.putNode('123', 'mockNodeType', nodeConfig);
    expect(mockPut).toHaveBeenLastCalledWith('/nodes/mockNodeType/123', nodeConfig, withCreds);
  });

  it('deleteNode should call api with correct parameters', async () => {
    TreeApi.deleteNode('123', 'mockNodeType');
    expect(mockDelete).toHaveBeenLastCalledWith('/nodes/mockNodeType/123', withCreds);
  });

  it('putTree should call api with correct parameters', async () => {
    const expectedConfig = {
      path: 'realms/root/realms/alpha/realm-config/authentication/authenticationtrees',
      apiVersion: 'protocol=2.1,resource=1.0',
    };
    let expectedHeaders = {
      'Content-type': 'application/json',
      'accept-api-version': 'protocol=2.1,resource=1.0',
    };
    const treeDetails = { config: 'test' };
    TreeApi.putTree('123', treeDetails);

    expect(mockGenerate).toHaveBeenLastCalledWith(expectedConfig, expectedHeaders);
    expect(mockPut).toHaveBeenLastCalledWith('/trees/123', treeDetails, withCreds);

    expectedHeaders = {
      'Content-type': 'application/json',
      'accept-api-version': 'protocol=2.1,resource=1.0',
      'if-none-match': '*',
    };
    TreeApi.putTree('123', treeDetails, true);

    expect(mockGenerate).toHaveBeenLastCalledWith(expectedConfig, expectedHeaders);
    expect(mockPut).toHaveBeenLastCalledWith('/trees/123', treeDetails, withCreds);
  });

  it('cloneTree should call api with correct parameters', async () => {
    const expectedConfig = {
      path: 'realms/root/realms/alpha/realm-config/authentication/authenticationtrees',
      apiVersion: 'protocol=2.1,resource=1.0',
    };
    const expectedHeaders = {
      'Content-type': 'application/json',
      'accept-api-version': 'protocol=2.1,resource=1.0',
    };
    TreeApi.cloneTree('123', '456');

    expect(mockGenerate).toHaveBeenLastCalledWith(expectedConfig, expectedHeaders);
    expect(mockPost).toHaveBeenLastCalledWith('/trees/123?_action=clone', { newId: '456' }, withCreds);
  });

  it('deleteTree should call api with correct parameters', async () => {
    TreeApi.deleteTree('123');
    expect(mockDelete).toHaveBeenLastCalledWith('/trees/123', withCreds);
  });

  it('actionTreeTemplate should call api with correct parameters', async () => {
    TreeApi.actionTreeTemplate();
    expect(mockPost).toHaveBeenLastCalledWith('/trees?_action=template', {}, withCreds);
  });

  it('actionNodeGetAllTypes should call api with correct parameters', async () => {
    TreeApi.actionNodeGetAllTypes();
    expect(mockPost).toHaveBeenLastCalledWith('/nodes?_action=getAllTypes', {}, withCreds);
  });

  it('actionNodeSchema should call api with correct parameters', async () => {
    TreeApi.actionNodeSchema('mockNodeType');
    expect(mockPost).toHaveBeenLastCalledWith('/nodes/mockNodeType?_action=schema', {}, withCreds);
  });

  it('actionNodeTemplate should call api with correct parameters', async () => {
    TreeApi.actionNodeTemplate('mockNodeType');
    expect(mockPost).toHaveBeenLastCalledWith('/nodes/mockNodeType?_action=template', {}, withCreds);
  });

  it('getNodeTemplate should call api with correct parameters', async () => {
    TreeApi.getNodeTemplate('mockNodeType', '123');
    expect(mockGet).toHaveBeenLastCalledWith('/nodes/mockNodeType/123', withCreds);
  });

  it('actionNodeListOutcomes should call api with correct parameters', async () => {
    TreeApi.actionNodeListOutcomes('mockNodeType');
    expect(mockPost).toHaveBeenLastCalledWith('/nodes/mockNodeType?_action=listOutcomes', {}, withCreds);

    const mockNodeConfig = { config: 'test' };
    TreeApi.actionNodeListOutcomes('mockNodeType', mockNodeConfig);
    expect(mockPost).toHaveBeenLastCalledWith('/nodes/mockNodeType?_action=listOutcomes', mockNodeConfig, withCreds);
  });
});
