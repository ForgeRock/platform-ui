/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as MappingApi from './MappingApi';

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

BaseApi.generateIdmApi = mockGenerate;

describe('MappingApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMappingDetails', () => {
    it('calls get with the correct endpoint', async () => {
      const response = { data: { mappings: [] } };
      mockGet.mockResolvedValue(response);

      const result = await MappingApi.getMappingDetails();

      expect(mockGet).toHaveBeenCalledWith('/endpoint/mappingDetails');
      expect(result).toEqual(response);
    });
  });

  describe('getSyncFile', () => {
    it('returns sync config when successful', async () => {
      const response = {
        data: {
          mappings: [
            { name: 'mapping1', source: 'managed/user', target: 'system/ldap' },
          ],
        },
      };
      mockGet.mockResolvedValue(response);

      const result = await MappingApi.getSyncFile();

      expect(mockGet).toHaveBeenCalledWith('config/sync');
      expect(result).toEqual(response);
    });

    it('returns empty mappings array when sync file is not found (404)', async () => {
      const error = {
        response: {
          status: 404,
        },
      };
      mockGet.mockRejectedValue(error);

      const result = await MappingApi.getSyncFile();

      expect(mockGet).toHaveBeenCalledWith('config/sync');
      expect(result).toEqual({ data: { mappings: [] } });
    });

    it('rethrows errors that are not 404', async () => {
      const error = {
        response: {
          status: 500,
        },
        message: 'Internal Server Error',
      };
      mockGet.mockRejectedValue(error);

      await expect(MappingApi.getSyncFile()).rejects.toEqual(error);
      expect(mockGet).toHaveBeenCalledWith('config/sync');
    });

    it('rethrows errors when response is undefined', async () => {
      const error = new Error('Network Error');
      mockGet.mockRejectedValue(error);

      await expect(MappingApi.getSyncFile()).rejects.toThrow('Network Error');
      expect(mockGet).toHaveBeenCalledWith('config/sync');
    });
  });

  describe('getSyncMappings', () => {
    it('calls get with the correct URL without params', async () => {
      const response = { data: { mappings: [] } };
      mockGet.mockResolvedValue(response);

      const result = await MappingApi.getSyncMappings();

      expect(mockGet).toHaveBeenCalledWith('sync/mappings');
      expect(result).toEqual(response);
    });

    it('calls get with the correct URL with params', async () => {
      const response = { data: { mappings: [] } };
      mockGet.mockResolvedValue(response);
      const params = { _queryFilter: 'true' };

      const result = await MappingApi.getSyncMappings(params);

      expect(mockGet).toHaveBeenCalledWith('sync/mappings?_queryFilter=true');
      expect(result).toEqual(response);
    });
  });

  describe('getConfigMapping', () => {
    it('calls get with the correct URL for a mapping name', async () => {
      const response = { data: { name: 'mapping1' } };
      mockGet.mockResolvedValue(response);

      const result = await MappingApi.getConfigMapping('mapping1');

      expect(mockGet).toHaveBeenCalledWith('config/mapping/mapping1');
      expect(result).toEqual(response);
    });

    it('propagates errors from the API call', async () => {
      const error = new Error('Not found');
      mockGet.mockRejectedValue(error);

      await expect(MappingApi.getConfigMapping('mapping1')).rejects.toThrow('Not found');
    });
  });

  describe('getSyncMapping', () => {
    it('calls get with the correct URL for a mapping name', async () => {
      const response = { data: { name: 'mapping1' } };
      mockGet.mockResolvedValue(response);

      const result = await MappingApi.getSyncMapping('mapping1');

      expect(mockGet).toHaveBeenCalledWith('sync/mappings/mapping1');
      expect(result).toEqual(response);
    });
  });

  describe('previewMapping', () => {
    it('calls post with default action "eval"', async () => {
      const payload = { script: 'return true;' };
      const response = { data: { result: true } };
      mockPost.mockResolvedValue(response);

      const result = await MappingApi.previewMapping(payload);

      expect(mockPost).toHaveBeenCalledWith('script?_action=eval', payload);
      expect(result).toEqual(response);
    });

    it('calls post with custom action', async () => {
      const payload = { script: 'return true;' };
      const response = { data: { result: true } };
      mockPost.mockResolvedValue(response);

      const result = await MappingApi.previewMapping(payload, 'compile');

      expect(mockPost).toHaveBeenCalledWith('script?_action=compile', payload);
      expect(result).toEqual(response);
    });
  });

  describe('putConfigMapping', () => {
    it('calls put with default waitForCompletion=true', async () => {
      const payload = { name: 'mapping1', source: 'managed/user' };
      const response = { data: { name: 'mapping1' } };
      mockPut.mockResolvedValue(response);

      const result = await MappingApi.putConfigMapping('mapping1', payload);

      expect(mockPut).toHaveBeenCalledWith('config/mapping/mapping1?waitForCompletion=true', payload);
      expect(result).toEqual(response);
    });

    it('calls put with waitForCompletion=false when specified', async () => {
      const payload = { name: 'mapping1', source: 'managed/user' };
      const response = { data: { name: 'mapping1' } };
      mockPut.mockResolvedValue(response);

      const result = await MappingApi.putConfigMapping('mapping1', payload, false);

      expect(mockPut).toHaveBeenCalledWith('config/mapping/mapping1?waitForCompletion=false', payload);
      expect(result).toEqual(response);
    });

    it('propagates errors from the API call', async () => {
      const payload = { name: 'mapping1' };
      const error = new Error('Bad request');
      mockPut.mockRejectedValue(error);

      await expect(MappingApi.putConfigMapping('mapping1', payload)).rejects.toThrow('Bad request');
    });
  });

  describe('putSyncMappings', () => {
    it('calls put with default waitForCompletion=true', async () => {
      const payload = { mappings: [] };
      const response = { data: { mappings: [] } };
      mockPut.mockResolvedValue(response);

      const result = await MappingApi.putSyncMappings(payload);

      expect(mockPut).toHaveBeenCalledWith('config/sync?waitForCompletion=true', payload);
      expect(result).toEqual(response);
    });

    it('calls put with waitForCompletion=false when specified', async () => {
      const payload = { mappings: [] };
      const response = { data: { mappings: [] } };
      mockPut.mockResolvedValue(response);

      const result = await MappingApi.putSyncMappings(payload, false);

      expect(mockPut).toHaveBeenCalledWith('config/sync?waitForCompletion=false', payload);
      expect(result).toEqual(response);
    });
  });

  describe('deleteConfigMapping', () => {
    it('calls delete with the correct URL', async () => {
      const response = { data: {} };
      mockDelete.mockResolvedValue(response);

      const result = await MappingApi.deleteConfigMapping('mapping1');

      expect(mockDelete).toHaveBeenCalledWith('config/mapping/mapping1?waitForCompletion=true');
      expect(result).toEqual(response);
    });

    it('propagates errors from the API call', async () => {
      const error = new Error('Not found');
      mockDelete.mockRejectedValue(error);

      await expect(MappingApi.deleteConfigMapping('mapping1')).rejects.toThrow('Not found');
    });
  });

  describe('getTargetPreview', () => {
    it('calls post with the correct URL and parameters', async () => {
      const response = { data: { preview: 'result' } };
      mockPost.mockResolvedValue(response);

      const result = await MappingApi.getTargetPreview('user123', 'mapping1');

      expect(mockPost).toHaveBeenCalledWith('sync?_action=getTargetPreview&resourceId=user123&mapping=mapping1');
      expect(result).toEqual(response);
    });

    it('handles special characters in resourceId and mapping', async () => {
      const response = { data: {} };
      mockPost.mockResolvedValue(response);

      const result = await MappingApi.getTargetPreview('user@example.com', 'mapping-with-dashes');

      expect(mockPost).toHaveBeenCalledWith('sync?_action=getTargetPreview&resourceId=user@example.com&mapping=mapping-with-dashes');
      expect(result).toEqual(response);
    });
  });
});
