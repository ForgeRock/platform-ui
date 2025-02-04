/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as GlossaryApi from './GlossaryApi';

describe('Glossary API', () => {
  it('should call backend with correct payload and api url', async () => {
    const post = jest.fn();
    BaseApi.generateIgaApi = jest.fn(() => ({
      post,
    }));
    post.mockReturnValue(Promise.resolve());
    const data = {
      targetFilter: {
        operator: 'AND',
        operand: [
          {
            operator: 'EQUALS',
            operand: {
              targetName: 'objectType',
              targetValue: '/openidm/managed/application',
            },
          },
          {
            operator: 'STARTS_WITH',
            operand: {
              targetName: 'name',
              targetValue: 'te',
            },
          },
        ],
      },
    };
    const config = {
      params: {
        pageNumber: 0,
        pageSize: 10,
        sortBy: 'name',
        sortDir: 'asc',
      },
    };
    await GlossaryApi.searchGlossaryAttributes({ data, config });
    expect(post).toBeCalledWith('/commons/glossary/schema/search', data, config);
  });

  it('saveGlossaryAttribute calls properly for edit scenario', async () => {
    const put = jest.fn();
    BaseApi.generateIgaApi = jest.fn(() => ({
      put,
    }));
    put.mockReturnValue(Promise.resolve());
    const query = {
      id: 'c76b3d38-57d0-4f39-977b-9ddfdbc560e2',
      name: 'test1',
      description: 'test2s',
      displayName: 'test2',
      type: 'string',
      objectType: '/openidm/managed/application',
      isMultiValue: true,
      enumeratedValues: [
        {
          text: 'test1',
          value: 'test1',
        },
      ],
      isIndexed: true,
      searchable: true,
    };
    await GlossaryApi.saveGlossaryAttribute(query);
    expect(put).toBeCalledWith('/commons/glossary/schema/c76b3d38-57d0-4f39-977b-9ddfdbc560e2', query);
  });

  it('saveGlossaryAttribute calls properly for save scenario', async () => {
    const post = jest.fn();
    BaseApi.generateIgaApi = jest.fn(() => ({
      post,
    }));
    post.mockReturnValue(Promise.resolve());
    const query = {
      name: 'test1',
      description: 'test2s',
      displayName: 'test2',
      type: 'string',
      objectType: '/openidm/managed/application',
      isMultiValue: true,
      enumeratedValues: [
        {
          text: 'test1',
          value: 'test1',
        },
      ],
      isIndexed: true,
      searchable: true,
    };
    await GlossaryApi.saveGlossaryAttribute(query);
    expect(post).toBeCalledWith('/commons/glossary/schema', query);
  });
  it('deleteGlossaryAttribute calls properly', async () => {
    const id = 'c76b3d38-57d0-4f39-977b-9ddfdbc560e2';
    const deleteSpy = jest.fn().mockImplementation(() => Promise.resolve());
    jest.spyOn(BaseApi, 'generateIgaApi').mockImplementation(() => ({ delete: deleteSpy }));
    await GlossaryApi.deleteGlossaryAttribute(id);
    expect(deleteSpy).toBeCalledWith(`/commons/glossary/schema/${id}`);
  });
  it('should call getGlossaryAttributesByAppId with right parameters', async () => {
    const id = 'c76b3d38-57d0-4f39-977b-9ddfdbc560e2';
    const getSpy = jest.fn().mockImplementation(() => Promise.resolve());
    jest.spyOn(BaseApi, 'generateIgaApi').mockImplementation(() => ({ get: getSpy }));
    await GlossaryApi.getGlossaryAttributesByAppId(id);
    expect(getSpy).toBeCalledWith(`/governance/application/${id}/glossary`);
  });
  it('should call saveGlossaryAttributesByAppId with right parameters', async () => {
    const id = 'c76b3d38-57d0-4f39-977b-9ddfdbc560e2';
    const postSpy = jest.fn().mockImplementation(() => Promise.resolve());
    jest.spyOn(BaseApi, 'generateIgaApi').mockImplementation(() => ({ post: postSpy }));
    await GlossaryApi.saveGlossaryAttributesByAppId(id, { data: 'test' });
    expect(postSpy).toBeCalledWith(`/governance/application/${id}/glossary`, { data: 'test' });
  });
  it('should call updateGlossaryAttributesByAppId with right parameters', async () => {
    const id = 'c76b3d38-57d0-4f39-977b-9ddfdbc560e2';
    const putSpy = jest.fn().mockImplementation(() => Promise.resolve());
    jest.spyOn(BaseApi, 'generateIgaApi').mockImplementation(() => ({ put: putSpy }));
    await GlossaryApi.updateGlossaryAttributesByAppId(id, { data: 'test' });
    expect(putSpy).toBeCalledWith(`/governance/application/${id}/glossary`, { data: 'test' });
  });

  it('getGlossaryAttributes calls properly with query parameters', async () => {
    const getSpy = jest.fn().mockImplementation(() => Promise.resolve());
    jest.spyOn(BaseApi, 'generateIgaApi').mockImplementation(() => ({ get: getSpy }));
    const params = { name: 'test' };
    const queryParams = '?name=test';
    await GlossaryApi.getGlossaryAttributes(params);
    expect(getSpy).toBeCalledWith(`/commons/glossary/schema${queryParams}`);
  });

  it('getGlossaryAttributes handles empty parameters', async () => {
    const getSpy = jest.fn().mockImplementation(() => Promise.resolve());
    jest.spyOn(BaseApi, 'generateIgaApi').mockImplementation(() => ({ get: getSpy }));
    await GlossaryApi.getGlossaryAttributes({});
    expect(getSpy).toBeCalledWith('/commons/glossary/schema');
  });

  it('getGlossaryAttributes handles API errors', async () => {
    const getSpy = jest.fn().mockImplementation(() => Promise.reject(new Error('API Error')));
    jest.spyOn(BaseApi, 'generateIgaApi').mockImplementation(() => ({ get: getSpy }));
    const params = { name: 'test' };
    try {
      await GlossaryApi.getGlossaryAttributes(params);
    } catch (error) {
      expect(error.message).toBe('API Error');
    }
    expect(getSpy).toBeCalledWith('/commons/glossary/schema?name=test');
  });
});
