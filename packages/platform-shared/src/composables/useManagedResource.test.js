/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises } from '@vue/test-utils';
import { useManagedResource } from './useManagedResource';
import * as ManagedResourceApi from '../api/ManagedResourceApi';

describe('useManagedResource', () => {
  it('should fetch managed users properly', async () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
          {
            _id: '2',
            sn: 'Doe',
            givenName: 'Jane',
            profileImage: 'image',
            userName: 'janedoe',
          },
        ],
      },
    });

    const {
      isLoading, error, data, initialIds, searchTerm,
    } = useManagedResource('alpha', 'user');

    expect(isLoading.value).toBe(true);

    await flushPromises();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(undefined);
    expect(data.value).toEqual([
      {
        meta: {
          sn: 'Doe',
          givenName: 'John',
          profileImage: 'image',
          userName: 'johndoe',
        },
        multiselectId: '1',
        text: 'johndoe',
        value: '1',
      },
      {
        meta: {
          sn: 'Doe',
          givenName: 'Jane',
          profileImage: 'image',
          userName: 'janedoe',
        },
        multiselectId: '2',
        text: 'janedoe',
        value: '2',
      },
    ]);
    expect(initialIds.value).toEqual([]);
    expect(searchTerm.value).toBe('');
  });

  it('should fetch managed users with initial ids properly', async () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
          {
            _id: '2',
            sn: 'Doe',
            givenName: 'Jane',
            profileImage: 'image',
            userName: 'janedoe',
          },
        ],
      },
    });
    ManagedResourceApi.getManagedResource = jest.fn().mockResolvedValueOnce({
      data: {
        _id: '2',
        sn: 'Doe',
        givenName: 'Jane',
        profileImage: 'image',
        userName: 'janedoe',
      },
    }).mockResolvedValueOnce({
      data: {
        _id: '3',
        sn: 'Doe',
        givenName: 'Jack',
        profileImage: 'image',
        userName: 'jackdoe',
      },
    });

    const {
      isLoading, error, data, initialIds, searchTerm,
    } = useManagedResource('alpha', 'user', ['2', '3']);

    expect(isLoading.value).toBe(true);

    await flushPromises();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(undefined);
    expect(data.value).toEqual([
      {
        meta: {
          sn: 'Doe',
          givenName: 'John',
          profileImage: 'image',
          userName: 'johndoe',
        },
        multiselectId: '1',
        text: 'johndoe',
        value: '1',
      },
      {
        meta: {
          sn: 'Doe',
          givenName: 'Jane',
          profileImage: 'image',
          userName: 'janedoe',
        },
        multiselectId: '2',
        text: 'janedoe',
        value: '2',
      },
      {
        meta: {
          sn: 'Doe',
          givenName: 'Jack',
          profileImage: 'image',
          userName: 'jackdoe',
        },
        multiselectId: '3',
        text: 'jackdoe',
        value: '3',
      },
    ]);
    expect(initialIds.value).toEqual(['2', '3']);
    expect(searchTerm.value).toBe('');
  });

  it('should fetch managed users with search term properly', async () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
        ],
      },
    });

    const {
      isLoading, error, data, initialIds, searchTerm,
    } = useManagedResource('alpha', 'user', [], 'john');

    expect(isLoading.value).toBe(true);

    await flushPromises();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(undefined);
    expect(data.value).toEqual([
      {
        meta: {
          sn: 'Doe',
          givenName: 'John',
          profileImage: 'image',
          userName: 'johndoe',
        },
        multiselectId: '1',
        text: 'johndoe',
        value: '1',
      },
    ]);
    expect(initialIds.value).toEqual([]);
    expect(searchTerm.value).toBe('john');
  });

  it('should fetch managed users with search term and initial ids properly', async () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
        ],
      },
    });
    ManagedResourceApi.getManagedResource = jest.fn().mockResolvedValueOnce({
      data: {
        _id: '1',
        sn: 'Doe',
        givenName: 'John',
        profileImage: 'image',
        userName: 'johndoe',
      },
    });

    const {
      isLoading, error, data, initialIds, searchTerm,
    } = useManagedResource('alpha', 'user', ['1'], 'john');

    expect(isLoading.value).toBe(true);

    await flushPromises();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(undefined);
    expect(data.value).toEqual([
      {
        meta: {
          sn: 'Doe',
          givenName: 'John',
          profileImage: 'image',
          userName: 'johndoe',
        },
        multiselectId: '1',
        text: 'johndoe',
        value: '1',
      },
    ]);
    expect(initialIds.value).toEqual(['1']);
    expect(searchTerm.value).toBe('john');
  });

  it('should handle error properly', async () => {
    const errorResponse = new Error('error');
    ManagedResourceApi.getManagedResourceList = jest.fn().mockRejectedValue(errorResponse);

    const {
      isLoading, error, data, initialIds, searchTerm,
    } = useManagedResource('alpha', 'user');

    expect(isLoading.value).toBe(true);

    await flushPromises();

    expect(isLoading.value).toBe(false);
    expect(error.value).toEqual(errorResponse);
    expect(data.value).toEqual([]);
    expect(initialIds.value).toEqual([]);
    expect(searchTerm.value).toBe('');
  });

  it('should handle error when fetching initial ids properly', async () => {
    const errorResponse = {
      response: {
        status: 500,
      },
    };
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
        ],
      },
    });
    ManagedResourceApi.getManagedResource = jest.fn().mockRejectedValue(errorResponse);

    const {
      isLoading, error, data, initialIds, searchTerm,
    } = useManagedResource('alpha', 'user', ['1']);

    expect(isLoading.value).toBe(true);

    await flushPromises();

    expect(isLoading.value).toBe(false);
    expect(error.value).toEqual(errorResponse);
    expect(data.value).toEqual([]);
    expect(initialIds.value).toEqual(['1']);
    expect(searchTerm.value).toBe('');
  });

  it('should re-execute the search when the search term changes', async () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '1',
            sn: 'Doe',
            givenName: 'John',
            profileImage: 'image',
            userName: 'johndoe',
          },
        ],
      },
    });

    const {
      isLoading, error, data, initialIds, searchTerm,
    } = useManagedResource('alpha', 'user');

    expect(isLoading.value).toBe(true);

    await flushPromises();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(undefined);
    expect(data.value).toEqual([
      {
        meta: {
          sn: 'Doe',
          givenName: 'John',
          profileImage: 'image',
          userName: 'johndoe',
        },
        multiselectId: '1',
        text: 'johndoe',
        value: '1',
      },
    ]);
    expect(initialIds.value).toEqual([]);
    expect(searchTerm.value).toBe('');

    ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
      data: {
        result: [
          {
            _id: '2',
            sn: 'Doe',
            givenName: 'Jane',
            profileImage: 'image',
            userName: 'janedoe',
          },
        ],
      },
    });

    searchTerm.value = 'jane';

    await flushPromises();

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(undefined);
    expect(data.value).toEqual([
      {
        meta: {
          sn: 'Doe',
          givenName: 'Jane',
          profileImage: 'image',
          userName: 'janedoe',
        },
        multiselectId: '2',
        text: 'janedoe',
        value: '2',
      },
    ]);
    expect(initialIds.value).toEqual([]);
    expect(searchTerm.value).toBe('jane');
  });
});
