/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import {
  find,
  first,
} from 'lodash';
import Consent from '@/components/profile/Consent';
import i18n from '@/i18n';

Consent.created = jest.fn();
Consent.methods.loadConsent = jest.fn();

describe('Profile Consent Component', () => {
  const date = new Date(2019, 11, 17, 1, 24, 0).toISOString();
  let consentableMappings;
  let wrapper;

  beforeEach(() => {
    consentableMappings = [
      { name: 'test', consentDate: date },
      { name: 'test2' },
    ];
    wrapper = shallowMount(Consent, {
      global: {
        plugins: [i18n],
      },
      props: {
        consentedMappings: [
          { mapping: 'test', consentDate: date },
        ],
      },
    });
  });

  describe('computed#mappings', () => {
    it('should return the mappings that are populated with user data', () => {
      wrapper.setData({ consentableMappings });

      const { mappings } = wrapper.vm;
      const test = find(mappings, { name: 'test' });
      const test2 = find(mappings, { name: 'test2' });

      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings.length).toBe(2);
      expect(mappings[0].subTitle).toBe('Authorized December 17th 2019');
      expect(test).toHaveProperty('consented');
      expect(test.consented).toBe(true);
      expect(test).toHaveProperty('consentDate');
      expect(test.consentDate).toBe(date);
      expect(test2).toHaveProperty('consented');
      expect(test2.consented).toBe(false);
      expect(test2).not.toHaveProperty('consentDate');
    });
  });

  describe('#toggleConsentAndHideModal', () => {
    it('should call #toggleConsent and #hideModal', () => {
      const hideSpy = jest.spyOn(wrapper.vm, 'hideModal').mockImplementation();
      const toggleSpy = jest.spyOn(wrapper.vm, 'toggleConsent');

      wrapper.vm.toggleConsentAndHideModal({ name: 'test' });

      expect(hideSpy).toBeCalled();
      expect(toggleSpy).toBeCalled();
    });
  });

  describe('#generatePatch', () => {
    it('should generate an "add" patch given an unconsented mapping', () => {
      const mapping = {
        name: 'test',
        consented: false,
      };

      const patch = wrapper.vm.generatePatch(mapping);
      const addOp = first(patch);

      expect(typeof patch).toBe('object');
      expect(typeof addOp).toBe('object');
      expect(addOp).toHaveProperty('field');
      expect(addOp.field).toBe('/consentedMappings/-');
      expect(addOp).toHaveProperty('operation');
      expect(addOp.operation).toBe('add');
      expect(typeof addOp).toBe('object');
      expect(addOp.value).toHaveProperty('mapping');
      expect(addOp.value.mapping).toBe('test');
      expect(typeof addOp.value).toBe('object');
    });

    it('should generate a "remove" patch given a consented mapping', () => {
      const mapping = {
        name: 'test',
        consented: true,
        consentDate: new Date().toISOString(),
      };

      const patch = wrapper.vm.generatePatch(mapping);
      const addOp = first(patch);

      expect(typeof patch).toBe('object');
      expect(typeof addOp).toBe('object');
      expect(addOp).toHaveProperty('field');
      expect(addOp.field).toBe('/consentedMappings');
      expect(addOp).toHaveProperty('operation');
      expect(addOp.operation).toBe('remove');
      expect(typeof addOp).toBe('object');
      expect(addOp.value).toHaveProperty('mapping');
      expect(addOp.value.mapping).toBe('test');
      expect(typeof addOp.value).toBe('object');
      expect(addOp.value.consentDate).toBe(mapping.consentDate);
    });
  });

  describe('#toggleConsent', () => {
    it('should emit "updateProfile"', () => {
      wrapper.vm.toggleConsent({ consentDate: '123', name: 'test' });

      expect(wrapper.emitted().updateProfile.length).toBe(1);
    });
  });
});
