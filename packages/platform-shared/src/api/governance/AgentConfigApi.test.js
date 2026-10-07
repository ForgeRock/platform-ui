/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import { getAgentConfig } from './AgentConfigApi';

jest.mock('@forgerock/platform-shared/src/api/BaseApi');

describe('AgentConfigApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAgentConfig', () => {
    const mockResponse = {
      data: {
        templates: [
          { id: 'aws.bedrock', name: 'AWS Bedrock' },
          { id: 'azure.openai', name: 'Azure OpenAI' },
        ],
      },
    };

    it('calls the IGA API with GET governance/agent/config', async () => {
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAgentConfig();

      expect(generateIgaApi).toHaveBeenCalledWith();
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/agent/config');
      expect(result).toEqual(mockResponse);
    });

    it('returns the raw response so the caller can read data.templates[].id', async () => {
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAgentConfig();

      expect(result).toBe(mockResponse);
      expect(result.data.templates.map((template) => template.id)).toEqual(['aws.bedrock', 'azure.openai']);
    });

    it('propagates the rejection from the IGA API request', async () => {
      const mockError = new Error('Network error');
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
      });

      await expect(getAgentConfig()).rejects.toBe(mockError);
    });
  });
});
