/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useRouter } from 'vue-router';
import useSelfService from './selfService';
import * as SelfServiceApi from '@/api/SelfServiceApi';

// Mock dependencies
jest.mock('vue-router');
jest.mock('@/api/SelfServiceApi');
jest.mock('@forgerock/platform-shared/src/utils/notification');

describe('useSelfService', () => {
  let mockRouter;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter = {
      currentRoute: { params: {} },
      push: jest.fn(),
    };

    useRouter.mockReturnValue(mockRouter);
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { selfServiceDetails, showSelfService } = useSelfService();

      expect(selfServiceDetails.value).toBeNull();
      expect(showSelfService.value).toBe(true);
    });
  });

  describe('loadSelfServiceData', () => {
    it('should load self-service data successfully', async () => {
      const mockResponse = {
        data: { type: 'UserQuery' },
      };

      SelfServiceApi.loadData.mockResolvedValue(mockResponse);

      const { loadSelfServiceData, selfServiceDetails } = useSelfService();

      await loadSelfServiceData('username');

      expect(SelfServiceApi.loadData).toHaveBeenCalledWith('username');
      expect(selfServiceDetails.value).toEqual(mockResponse.data);
    });

    it('should handle error and call showErrorMessage', async () => {
      const mockError = new Error('boom');
      SelfServiceApi.loadData.mockRejectedValue(mockError);

      const { loadSelfServiceData } = useSelfService();
      await loadSelfServiceData('username');

      expect(showErrorMessage).toHaveBeenCalledWith(mockError, '');
    });
  });

  describe('advanceSelfServiceStage', () => {
    it('should advance self-service stage successfully', async () => {
      const mockResponse = {
        data: { type: 'success', additions: { username: 'someUserName' } },
      };

      SelfServiceApi.advanceStage.mockResolvedValue(mockResponse);

      const { advanceSelfServiceStage, selfServiceDetails, showSelfService } = useSelfService();

      const inputData = { email: 'test@example.com' };

      await advanceSelfServiceStage('username', inputData, false);

      expect(SelfServiceApi.advanceStage).toHaveBeenCalledWith(
        { input: inputData },
        'username',
        true,
      );
      expect(selfServiceDetails.value).toEqual(mockResponse.data);
      expect(showSelfService.value).toBe(false);
    });

    it('should handle advance self-service stage failure and show error message', async () => {
      const mockError = new Error('Service unavailable');
      SelfServiceApi.advanceStage.mockRejectedValue(mockError);

      const { advanceSelfServiceStage } = useSelfService();

      const inputData = { email: 'test@example.com' };

      await advanceSelfServiceStage('username', inputData, false);

      expect(SelfServiceApi.advanceStage).toHaveBeenCalledWith(
        { input: inputData },
        'username',
        true,
      );
      expect(showErrorMessage).toHaveBeenCalledWith(mockError, '');
    });
  });
});
