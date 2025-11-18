/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import {
  loadData,
  advanceStage,
  getIdentityProviders,
  unbindSocialProvider,
  bindSocialProvider,
  getConnectedProviders,
  getSocialProviderProfile,
} from './SelfServiceApi';

jest.mock('@forgerock/platform-shared/src/api/BaseApi', () => ({
  generateIdmApi: jest.fn(),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  BaseApi.generateIdmApi.mockReturnValue({
    get: mockGet,
    post: mockPost,
  });
});

describe('SelfServiceApi', () => {
  describe('loadData', () => {
    it('calls GET with correct endpoint and headers', async () => {
      mockGet.mockResolvedValue('response');
      const result = await loadData('register');
      expect(BaseApi.generateIdmApi).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-OpenIDM-NoSession': true,
            'X-OpenIDM-Password': 'anonymous',
            'X-OpenIDM-Username': 'anonymous',
          }),
        }),
        false,
      );
      expect(mockGet).toHaveBeenCalledWith('/selfservice/register');
      expect(result).toBe('response');
    });
  });

  describe('advanceStage', () => {
    it('uses anonymous headers by default', async () => {
      mockPost.mockResolvedValue('advanced');
      const data = { foo: 'bar' };
      await advanceStage(data, 'reset');
      expect(BaseApi.generateIdmApi).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-OpenIDM-NoSession': true,
            'X-OpenIDM-Password': 'anonymous',
            'X-OpenIDM-Username': 'anonymous',
            'X-Requested-With': 'XMLHttpRequest',
          }),
        }),
        false,
      );
      expect(mockPost).toHaveBeenCalledWith('/selfservice/reset?_action=submitRequirements', data);
    });

    it('uses non-anonymous headers when anonymous=false', async () => {
      mockPost.mockResolvedValue('advanced');
      const data = { foo: 'bar' };
      await advanceStage(data, 'reset', false);
      expect(BaseApi.generateIdmApi).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-OpenIDM-NoSession': false,
            'X-OpenIDM-Password': null,
            'X-OpenIDM-Username': null,
            'X-Requested-With': 'XMLHttpRequest',
          }),
        }),
        false,
      );
      expect(mockPost).toHaveBeenCalledWith('/selfservice/reset?_action=submitRequirements', data);
    });
  });

  describe('getIdentityProviders', () => {
    it('calls GET with /identityProviders', async () => {
      mockGet.mockResolvedValue('idps');
      const result = await getIdentityProviders();
      expect(mockGet).toHaveBeenCalledWith('/identityProviders');
      expect(result).toBe('idps');
    });
  });

  describe('unbindSocialProvider', () => {
    it('calls POST with correct endpoint', async () => {
      mockPost.mockResolvedValue('unbind');
      await unbindSocialProvider('/managed/user', '123', 'google');
      expect(mockPost).toHaveBeenCalledWith('/managed/user/123?_action=unbind&provider=google');
    });
  });

  describe('bindSocialProvider', () => {
    it('calls POST with correct endpoint and payload', async () => {
      mockPost.mockResolvedValue('bind');
      const token = { access_token: 'abc' };
      await bindSocialProvider('/managed/user', '123', 'facebook', token);
      expect(BaseApi.generateIdmApi).toHaveBeenCalledWith({
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
      expect(mockPost).toHaveBeenCalledWith('/managed/user/123?_action=bind&provider=facebook', JSON.stringify(token));
    });
  });

  describe('getConnectedProviders', () => {
    it('calls GET with correct endpoint', async () => {
      mockGet.mockResolvedValue('connected');
      await getConnectedProviders('/managed/user', '456');
      expect(mockGet).toHaveBeenCalledWith('/managed/user/456?_fields=idps/*');
    });
  });

  describe('getSocialProviderProfile', () => {
    it('calls POST with correct endpoint and payload', async () => {
      mockPost.mockResolvedValue('profile');
      const payload = { profile: 'data' };
      await getSocialProviderProfile(payload);
      expect(mockPost).toHaveBeenCalledWith('identityProviders?_action=normalizeProfile', payload);
    });
  });
});
