/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { setActivePinia, createPinia } from 'pinia';
import { useJourneyClientStore } from './journeyClient';

describe('useJourneyClientStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('client starts as null', () => {
    const store = useJourneyClientStore();
    expect(store.client).toBeNull();
  });

  it('returns the client after it is set on the store', () => {
    const store = useJourneyClientStore();
    const client = { start: jest.fn(), next: jest.fn(), terminate: jest.fn() };
    store.client = client;
    expect(store.client).toStrictEqual(client);
  });

  it('replaces the client when a new value is assigned', () => {
    const store = useJourneyClientStore();
    const firstClient = { start: jest.fn() };
    const secondClient = { start: jest.fn() };
    store.client = firstClient;
    store.client = secondClient;
    expect(store.client).toStrictEqual(secondClient);
  });

  it('$reset() sets client back to null', () => {
    const store = useJourneyClientStore();
    store.client = { start: jest.fn() };
    store.$reset();
    expect(store.client).toBeNull();
  });
});
