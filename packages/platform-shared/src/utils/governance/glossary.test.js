/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { getGlossaryAttributes } from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import { getGlossarySchema } from './glossary';

jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');

describe('getGlossarySchema', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch glossary attributes and return them as a flat array', async () => {
    const mockAttributes = {
      data: {
        result: [{ name: 'attribute1' }, { name: 'attribute2' }],
        resultCount: 2,
        totalCount: 2,
      },
    };
    getGlossaryAttributes.mockResolvedValueOnce(mockAttributes);

    const result = await getGlossarySchema('role');

    expect(getGlossaryAttributes).toHaveBeenCalledWith({
      objectType: '/openidm/managed/role',
      pageNumber: 0,
      pageSize: 100,
      sortBy: 'name',
      sortDir: 'asc',
    });
    expect(result).toEqual([{ name: 'attribute1' }, { name: 'attribute2' }]);
  });

  it('should fetch remaining glossary attributes if more than the first call', async () => {
    const mockFirstCall = {
      data: {
        result: [{ name: 'attribute1' }],
        resultCount: 1,
        totalCount: 2,
      },
    };
    const mockSecondCall = {
      data: {
        result: [{ name: 'attribute2' }],
      },
    };
    getGlossaryAttributes.mockResolvedValueOnce(mockFirstCall);
    getGlossaryAttributes.mockResolvedValueOnce(mockSecondCall);

    const result = await getGlossarySchema('role');

    expect(getGlossaryAttributes).toHaveBeenCalledWith({
      objectType: '/openidm/managed/role',
      pageNumber: 1,
      pageSize: 1,
      sortBy: 'name',
      sortDir: 'asc',
    });
    expect(result).toEqual([{ name: 'attribute1' }, { name: 'attribute2' }]);
  });

  it('should reject with an error if the API call fails', async () => {
    const mockError = new Error('API call failed');
    getGlossaryAttributes.mockRejectedValueOnce(mockError);

    await expect(getGlossarySchema('role')).rejects.toThrow('API call failed');
  });
});
