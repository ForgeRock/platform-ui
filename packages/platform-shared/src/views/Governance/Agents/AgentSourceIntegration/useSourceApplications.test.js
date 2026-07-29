/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import {
  useSourceApplications, buildSubtypeRows, getSubtypeDisplayName, getSourceLabel,
} from './useSourceApplications';

jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  displayNotification: jest.fn(),
  showErrorMessage: jest.fn(),
}));

const mockSources = {
  privilege: {
    bedrock: { objectClasses: [] },
    vertex: { objectClasses: [] },
  },
};

describe('useSourceApplications', () => {
  describe('buildSubtypeRows', () => {
    it('builds one row per subtype key, marked configured when a fetched application matches its subtype', () => {
      const applications = [
        { id: 'app-1', ingestion: { connector: { type: 'privilege', subtype: 'bedrock' } } },
      ];

      expect(buildSubtypeRows(mockSources, 'privilege', applications)).toEqual([
        { key: 'bedrock', displayName: 'bedrock', configured: true },
        { key: 'vertex', displayName: 'vertex', configured: false },
      ]);
    });

    it('uses the account objectClass\'s nativeName when present instead of falling back to the subtype key', () => {
      const sources = {
        privilege: {
          bedrock: {
            objectClasses: [
              { name: '__ACCOUNT__', nativeName: 'AWS Bedrock Agents' },
            ],
          },
        },
      };

      expect(buildSubtypeRows(sources, 'privilege', [])).toEqual([
        { key: 'bedrock', displayName: 'AWS Bedrock Agents', configured: false },
      ]);
    });

    it('falls back to the subtype key when no __ACCOUNT__ objectClass entry exists', () => {
      const sources = {
        privilege: {
          bedrock: {
            objectClasses: [
              { name: '__GROUP__', nativeName: 'Some Group Type' },
            ],
          },
        },
      };

      expect(buildSubtypeRows(sources, 'privilege', [])).toEqual([
        { key: 'bedrock', displayName: 'bedrock', configured: false },
      ]);
    });

    it('returns an empty list for a missing source or null sources', () => {
      expect(buildSubtypeRows(null, 'privilege', [])).toEqual([]);
      expect(buildSubtypeRows(mockSources, 'unknownSource', [])).toEqual([]);
    });
  });

  describe('getSubtypeDisplayName', () => {
    it('returns the nativeName of the __ACCOUNT__ objectClass', () => {
      expect(getSubtypeDisplayName('bedrock', {
        objectClasses: [{ name: '__ACCOUNT__', nativeName: 'AWS Bedrock Agents' }],
      })).toBe('AWS Bedrock Agents');
    });

    it('falls back to the key when no __ACCOUNT__ entry exists', () => {
      expect(getSubtypeDisplayName('bedrock', { objectClasses: [] })).toBe('bedrock');
    });
  });

  describe('getSourceLabel', () => {
    it('maps known source keys to their display labels', () => {
      expect(getSourceLabel('privilege')).toBe('PingOne Agent Privilege');
    });

    it('falls back to the raw key for unknown sources', () => {
      expect(getSourceLabel('unknownSource')).toBe('unknownSource');
    });
  });

  describe('useSourceApplications()', () => {
    beforeEach(() => {
      ApplicationsApi.getApplications = jest.fn().mockResolvedValue({ data: { result: [] } });
    });

    it('fetches applications for a source with the expected query params and exposes them', async () => {
      const applications = [
        { id: 'app-1', ingestion: { connector: { type: 'privilege', subtype: 'bedrock' } } },
      ];
      ApplicationsApi.getApplications.mockResolvedValue({ data: { result: applications } });

      const { sourceApplications, isLoadingApplications, fetchSourceApplications } = useSourceApplications();
      expect(sourceApplications.value).toEqual([]);
      expect(isLoadingApplications.value).toBe(false);

      const promise = fetchSourceApplications('privilege');
      expect(isLoadingApplications.value).toBe(true);
      const result = await promise;

      expect(ApplicationsApi.getApplications).toHaveBeenCalledWith(null, {
        queryFilter: 'ingestion.connector.type eq "privilege"',
        pageSize: 100,
        fields: 'name,id,aiAgentSource,ingestion',
        disconnected: true,
      });
      expect(sourceApplications.value).toEqual(applications);
      expect(result).toEqual(applications);
      expect(isLoadingApplications.value).toBe(false);
    });

    it('resets to empty and swallows the error when the fetch fails', async () => {
      ApplicationsApi.getApplications.mockRejectedValue(new Error('fetch failed'));

      const { sourceApplications, fetchSourceApplications } = useSourceApplications();
      const result = await fetchSourceApplications('privilege');

      expect(sourceApplications.value).toEqual([]);
      expect(result).toEqual([]);
      expect(showErrorMessage).toHaveBeenCalledWith(expect.any(Error), 'Failed to load integration status');
    });
  });
});
