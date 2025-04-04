/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import { getUiConfigNoSession } from './ConfigApi';

jest.mock('axios');

describe('ConfigApi', () => {
  it('getUiConfigNoSession should return the ui configuration', async () => {
    const response = {
      data: {
        configuration: {
          lang: 'en-us',
        },
      },
    };

    axios.create.mockReturnValue({
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
      get: jest.fn().mockResolvedValue(response),
    });

    const result = await getUiConfigNoSession();
    expect(result).toEqual(response);
  });
});
