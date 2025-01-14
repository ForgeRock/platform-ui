/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import { runAnalyticsTemplate, getReportFieldOptions } from '@forgerock/platform-shared/src/api/AutoApi';

const get = jest.fn();
BaseApi.generateAutoAccessReports = jest.fn(() => ({ get }));

jest.mock('@forgerock/platform-shared/src/store', () => {
  const store = {
    state: {
      realm: 'alpha',
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

describe('AutoApi', () => {
  let mockPost;

  beforeEach(() => {
    mockPost = jest.fn();
    BaseApi.generateAutoAccessReports.mockReturnValue({
      post: mockPost,
    });
  });

  it('runAnalyticsTemplate should call the API with correct parameters indicating the current realm', async () => {
    const template = 'test-template';
    const state = 'published';
    const payload = { key: 'value' };
    const mockResponse = {
      data: {
        jobId: '12345',
        status: 'success',
        statusMessage: 'Report generated successfully.',
      },
    };
    mockPost.mockResolvedValue(mockResponse);

    const result = await runAnalyticsTemplate(template, state, payload);

    expect(BaseApi.generateAutoAccessReports).toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith(
      `templates/${template}?_action=run&templateType=${state}`,
      {
        parameters: JSON.stringify(payload),
        context: [
          {
            type: 'global',
            data: [{
              key: 'realm',
              value: 'alpha',
            },
            ],
          },
        ],
      },
    );

    expect(result).toEqual(mockResponse.data);
  });

  it('getReportFieldOptions should call the API with correct parameters indicating the current realm and return the response', async () => {
    const payload = { field: 'value' };
    const versionedPayload = { version: 'v2' };

    const mockResponse = {
      data: {
        options: ['option1', 'option2'],
      },
    };

    mockPost.mockResolvedValue(mockResponse);

    const result = await getReportFieldOptions(payload);

    expect(BaseApi.generateAutoAccessReports).toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith(
      'fieldoptions',
      {
        query: JSON.stringify({ ...versionedPayload, ...payload }),
        context: [{
          type: 'global',
          data: [{
            key: 'realm',
            value: 'alpha',
          },
          ],
        },
        ],
      },
    );

    expect(result).toEqual(mockResponse);
  });
});
