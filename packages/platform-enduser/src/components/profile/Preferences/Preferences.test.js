/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Preferences from '@/components/profile/Preferences';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Preferences.vue', () => {
  const store = {
    state: {
      UserStore: {
        preferences: {
          updates: {},
          marketing: {},
        },
        schema: {
          properties: {
            preferences: {
              properties: {
                marketing: {
                  description: 'Send me special offers and services',
                  type: true,
                },
                updates: {
                  description: 'Send me news and updates',
                  type: false,
                },
              },
            },
          },
        },
      },
    },
  };
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Preferences, {
      localVue,
      store,
      i18n,
      mocks: {
        $store: store,
      },
    });
  });

  it('Preferences page loaded', () => {
    expect(wrapper.name()).toBe('Preferences');
    expect(wrapper).toMatchSnapshot();
  });

  describe('#loadData', () => {
    it('should load the preferences data', () => {
      wrapper.vm.loadData();
      const { marketing, updates } = wrapper.vm.preferences;

      expect(marketing).toHaveProperty('description');
      expect(marketing.description).toBe('Send me special offers and services');
      expect(marketing.type).toBe(true);
      expect(updates).toHaveProperty('description');
      expect(updates.description).toBe('Send me news and updates');
      expect(updates.type).toBe(false);
    });
  });

  describe('#generatePatch', () => {
    it('should generate a well formed patch payload', () => {
      const patch = wrapper.vm.generatePatch('test preference', 'test value');

      expect(typeof patch).toBe('object');
      expect(patch).toHaveProperty('length');
      expect(patch.length).toBe(1);
      expect(patch[0]).toHaveProperty('field');
      expect(patch[0].field).toBe('/preferences/test preference');
      expect(patch[0]).toHaveProperty('value');
      expect(patch[0].value).toBe('test value');
    });
  });

  describe('#savePreferences', () => {
    it('should emit "updateProfile" with a payload', () => {
      wrapper.vm.savePreferences('test preference', 'test value');

      const patchEventList = wrapper.emitted().updateProfile;
      const firstPatchEvent = patchEventList[0];
      const payload = firstPatchEvent[0];

      expect(typeof patchEventList).toBe('object');
      expect(patchEventList).toHaveProperty('length');
      expect(patchEventList.length).toBe(1);
      expect(payload[0]).toEqual(wrapper.vm.generatePatch('test preference', 'test value')[0]);
    });
  });
});
