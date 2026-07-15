/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import resolveNavProfileMenuItems from './navigationProfilePolicy';

const DASHBOARD_ITEM = { id: 'dashboard', icon: 'dashboard' };
const PROFILE_ITEM = { id: 'profile', icon: 'person' };
const APPLICATIONS_ITEM = { id: 'applications', icon: 'apps' };

function encodeProfile(profile) {
  return encodeURIComponent(JSON.stringify(profile));
}

function encodePriorityOrder(order) {
  return encodeURIComponent(JSON.stringify(order));
}

function makeResult(attributes) {
  return [{
    resource: 'endUserMenuItems:/',
    attributes,
  }];
}

describe('resolveNavProfileMenuItems', () => {
  describe('null / empty inputs', () => {
    it('returns null for null input', () => {
      expect(resolveNavProfileMenuItems(null)).toBeNull();
    });

    it('returns null for empty array', () => {
      expect(resolveNavProfileMenuItems([])).toBeNull();
    });

    it('returns null when no endUserMenuItems resource is present', () => {
      const results = [{ resource: 'somethingElse:/', attributes: { navigationProfile: ['abc'] } }];
      expect(resolveNavProfileMenuItems(results)).toBeNull();
    });

    it('returns null when attributes is missing', () => {
      expect(resolveNavProfileMenuItems([{ resource: 'endUserMenuItems:/' }])).toBeNull();
    });

    it('returns null when navigationProfile attribute is absent', () => {
      const results = makeResult({ priorityOrder: [encodePriorityOrder(['uuid-1'])] });
      expect(resolveNavProfileMenuItems(results)).toBeNull();
    });

    it('returns null when navigationProfile array is empty', () => {
      const results = makeResult({ navigationProfile: [] });
      expect(resolveNavProfileMenuItems(results)).toBeNull();
    });
  });

  describe('single profile, no priority order', () => {
    it('returns the profile menuItems when only one profile is present', () => {
      const profile = { id: 'uuid-1', name: 'Test', menuItems: [DASHBOARD_ITEM] };
      const results = makeResult({ navigationProfile: [encodeProfile(profile)] });
      expect(resolveNavProfileMenuItems(results)).toEqual([DASHBOARD_ITEM]);
    });

    it('returns null when the encoded value is unparseable', () => {
      const results = makeResult({ navigationProfile: ['%%invalid%%'] });
      expect(resolveNavProfileMenuItems(results)).toBeNull();
    });

    it('returns null when the profile has no id', () => {
      const profile = { name: 'No ID', menuItems: [DASHBOARD_ITEM] };
      const results = makeResult({ navigationProfile: [encodeProfile(profile)] });
      expect(resolveNavProfileMenuItems(results)).toBeNull();
    });

    it('returns null when menuItems is not an array', () => {
      const profile = { id: 'uuid-1', name: 'Bad', menuItems: 'not-an-array' };
      const results = makeResult({ navigationProfile: [encodeProfile(profile)] });
      expect(resolveNavProfileMenuItems(results)).toBeNull();
    });

    it('returns empty array when profile has empty menuItems', () => {
      const profile = { id: 'uuid-1', name: 'Empty', menuItems: [] };
      const results = makeResult({ navigationProfile: [encodeProfile(profile)] });
      expect(resolveNavProfileMenuItems(results)).toEqual([]);
    });
  });

  describe('priority order resolution', () => {
    const profileA = { id: 'uuid-a', name: 'Profile A', menuItems: [DASHBOARD_ITEM, PROFILE_ITEM] };
    const profileB = { id: 'uuid-b', name: 'Profile B', menuItems: [APPLICATIONS_ITEM] };

    it('returns the first matching profile in priority order', () => {
      const results = makeResult({
        navigationProfile: [encodeProfile(profileA), encodeProfile(profileB)],
        priorityOrder: [encodePriorityOrder(['uuid-a', 'uuid-b'])],
      });
      expect(resolveNavProfileMenuItems(results)).toEqual([DASHBOARD_ITEM, PROFILE_ITEM]);
    });

    it('respects priority order — second profile wins when it is listed first', () => {
      const results = makeResult({
        navigationProfile: [encodeProfile(profileA), encodeProfile(profileB)],
        priorityOrder: [encodePriorityOrder(['uuid-b', 'uuid-a'])],
      });
      expect(resolveNavProfileMenuItems(results)).toEqual([APPLICATIONS_ITEM]);
    });

    it('skips ids in priority order that have no matching profile', () => {
      const results = makeResult({
        navigationProfile: [encodeProfile(profileB)],
        priorityOrder: [encodePriorityOrder(['uuid-missing', 'uuid-b'])],
      });
      expect(resolveNavProfileMenuItems(results)).toEqual([APPLICATIONS_ITEM]);
    });

    it('falls back to first profile in map when priority order is empty array', () => {
      const results = makeResult({
        navigationProfile: [encodeProfile(profileA)],
        priorityOrder: [encodePriorityOrder([])],
      });
      expect(resolveNavProfileMenuItems(results)).toEqual([DASHBOARD_ITEM, PROFILE_ITEM]);
    });

    it('falls back to first profile when priorityOrder attribute is absent', () => {
      const results = makeResult({
        navigationProfile: [encodeProfile(profileA), encodeProfile(profileB)],
      });
      expect(resolveNavProfileMenuItems(results)).toEqual([DASHBOARD_ITEM, PROFILE_ITEM]);
    });

    it('falls back to first profile when priorityOrder value is malformed', () => {
      const results = makeResult({
        navigationProfile: [encodeProfile(profileA)],
        priorityOrder: ['%%not-valid%%'],
      });
      expect(resolveNavProfileMenuItems(results)).toEqual([DASHBOARD_ITEM, PROFILE_ITEM]);
    });

    it('returns null when priority order references no matching profile and no fallback exists', () => {
      const results = makeResult({
        navigationProfile: ['%%invalid%%'],
        priorityOrder: [encodePriorityOrder(['uuid-a'])],
      });
      expect(resolveNavProfileMenuItems(results)).toBeNull();
    });
  });

  describe('multiple policy results in the array', () => {
    it('only uses the result with endUserMenuItems resource path', () => {
      const profile = { id: 'uuid-1', name: 'Test', menuItems: [DASHBOARD_ITEM] };
      const results = [
        { resource: 'other:/resource', attributes: { navigationProfile: ['garbage'] } },
        { resource: 'endUserMenuItems:/', attributes: { navigationProfile: [encodeProfile(profile)] } },
      ];
      expect(resolveNavProfileMenuItems(results)).toEqual([DASHBOARD_ITEM]);
    });

    it('matches any resource starting with endUserMenuItems:/', () => {
      const profile = { id: 'uuid-1', name: 'Test', menuItems: [PROFILE_ITEM] };
      const results = [{ resource: 'endUserMenuItems:/subpath', attributes: { navigationProfile: [encodeProfile(profile)] } }];
      expect(resolveNavProfileMenuItems(results)).toEqual([PROFILE_ITEM]);
    });
  });
});
