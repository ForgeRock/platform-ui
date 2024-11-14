/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getResourceDisplayData } from './resource';
import * as CommonsApi from '../api/governance/CommonsApi';

describe('resource', () => {
  it('should return the display name of a resource', async () => {
    CommonsApi.getResource = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            givenName: 'John',
            sn: 'Doe',
          },
        ],
      },
    });
    const resourceDisplayData = await getResourceDisplayData('user', 'user/123');
    expect(resourceDisplayData).toBe('John Doe');
  });

  it('should return the ID if the resource is not found', async () => {
    CommonsApi.getResource = jest.fn().mockResolvedValue({
      data: {
        result: [],
      },
    });
    const resourceDisplayData = await getResourceDisplayData('user', 'user/123');
    expect(resourceDisplayData).toBe('user/123');
  });

  it('should return the ID if the resource fetch fails', async () => {
    CommonsApi.getResource = jest.fn().mockRejectedValue();
    const resourceDisplayData = await getResourceDisplayData('user', 'user/123');
    expect(resourceDisplayData).toBe('user/123');
  });
});
