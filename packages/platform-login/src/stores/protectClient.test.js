/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { setActivePinia, createPinia } from 'pinia';
import { useProtectClientStore } from './protectClient';

describe('protectClient store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should return null as the initial client state', () => {
    const store = useProtectClientStore();
    expect(store.client).toBeNull();
  });

  it('should store a client', () => {
    const store = useProtectClientStore();
    const mockClient = { start: jest.fn(), getData: jest.fn() };

    store.client = mockClient;

    expect(store.client).toStrictEqual(mockClient);
  });

  it('should reset the client to null', () => {
    const store = useProtectClientStore();
    store.client = { start: jest.fn(), getData: jest.fn() };

    store.$reset();

    expect(store.client).toBeNull();
  });
});
