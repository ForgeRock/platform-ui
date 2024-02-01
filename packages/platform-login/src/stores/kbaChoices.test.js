/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { setActivePinia, createPinia } from 'pinia';
import { useKbaChoicesStore } from './kbaChoices';

describe('kbaChoices store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should return the correct initial state', () => {
    const kbaChoicesStore = useKbaChoicesStore();
    expect(kbaChoicesStore.choices).toStrictEqual({});
  });

  describe('storing choices', () => {
    it('should store the choice', () => {
      const kbaChoicesStore = useKbaChoicesStore();

      kbaChoicesStore.storeChoice('bob', 5);
      expect(kbaChoicesStore.choices).toStrictEqual({ 5: 'bob' });
    });

    it('should replace existing choices when new ones are stored for the same index', () => {
      const kbaChoicesStore = useKbaChoicesStore();

      kbaChoicesStore.storeChoice('bob', 5);
      kbaChoicesStore.storeChoice('bill', 5);
      expect(kbaChoicesStore.choices).toStrictEqual({ 5: 'bill' });
    });

    it('should store multiple choices', () => {
      const kbaChoicesStore = useKbaChoicesStore();

      kbaChoicesStore.storeChoice('bob', 5);
      kbaChoicesStore.storeChoice('ben', 7);
      expect(kbaChoicesStore.choices).toStrictEqual({ 5: 'bob', 7: 'ben' });
    });
  });

  describe('getting choices made by other callbacks', () => {
    it('should not return choices from the current callback index', () => {
      const kbaChoicesStore = useKbaChoicesStore();

      kbaChoicesStore.storeChoice('bob', 5);
      expect(kbaChoicesStore.getOtherChoices(5)).toStrictEqual([]);
    });

    it('should return all choices for other callback indices', () => {
      const kbaChoicesStore = useKbaChoicesStore();

      kbaChoicesStore.storeChoice('bob', 5);
      kbaChoicesStore.storeChoice('bill', 6);
      expect(kbaChoicesStore.getOtherChoices(5)).toStrictEqual(['bill']);
    });
  });
});
