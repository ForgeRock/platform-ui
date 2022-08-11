/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { first } from 'lodash';
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import {
  ValidationObserver,
  ValidationProvider,
} from 'vee-validate';
import i18n from '@/i18n';
import EditKBA from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.component('ValidationProvider', ValidationProvider);
localVue.component('ValidationObserver', ValidationObserver);

describe('EditKBA.vue', () => {
  let wrapper;
  const kbaData = {
    kbaPropertyName: 'kbaInfo',
    minimumAnswersToDefine: 1,
    minimumAnswersToVerify: 1,
    questions: {
      1: { en: 'Question1?' },
    },
  };

  it('AccountSecurity page loaded', () => {
    wrapper = shallowMount(EditKBA, {
      localVue,
      i18n,
      propsData: {
        kbaData,
      },
    });

    expect(wrapper.name()).toBe('EditKBA');
  });

  describe('#generatePatch', () => {
    beforeEach(() => {
      wrapper = shallowMount(EditKBA, {
        localVue,
        i18n,
        propsData: {
          kbaData,
        },
      });
    });

    it('should correctly generate patches for custom questions', () => {
      wrapper.setData({ kbaChoices: [{ customQuestion: 'test', answer: 'test answer', selected: 'test' }] });

      const patch = wrapper.vm.generatePatch();

      expect(typeof patch).toBe('object');
      expect(patch.length).toBe(1);
      expect(typeof first(patch)).toBe('object');
      expect(first(patch)).toHaveProperty('value');
      expect(first(patch).value).toEqual([{ answer: 'test answer', customQuestion: 'test' }]);
    });

    it('should correctly generate patches for provided questions', () => {
      wrapper.setData({ kbaChoices: [{ selected: 'test', answer: 'test answer', customQuestion: '' }] });

      const patch = wrapper.vm.generatePatch();

      expect(typeof patch).toBe('object');
      expect(patch.length).toBe(1);
      expect(typeof first(patch)).toBe('object');
      expect(first(patch)).toHaveProperty('value');
      expect(first(patch).value).toEqual([{ answer: 'test answer', questionId: 'test' }]);
    });
    it('emits updateKBA event if form data is valid', async () => {
      const validateSpy = jest.spyOn(wrapper.vm, 'validate').mockImplementation(() => Promise.resolve(true));
      expect(validateSpy).toHaveBeenCalledTimes(0);
      wrapper.vm.onSaveKBA();

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it('does not emit updateKBA event if the form data is invalid', async () => {
      const validateSpy = jest.spyOn(wrapper.vm, 'validate').mockImplementation(() => Promise.resolve(false));
      expect(validateSpy).toHaveBeenCalledTimes(0);
      wrapper.vm.onSaveKBA();

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    it('emits updateKBA event with correct patch payload', async () => {
      const validateSpy = jest.spyOn(wrapper.vm, 'validate').mockImplementation(() => Promise.resolve(true));
      const patchSpy = jest.spyOn(wrapper.vm, 'generatePatch').mockImplementation(() => 'patch');
      wrapper.vm.onSaveKBA();

      await expect(validateSpy).toHaveBeenCalled();
      expect(patchSpy).toHaveBeenCalled();
      expect(wrapper.emitted().updateKBA).toBeTruthy();
      expect(wrapper.emitted().updateKBA[0]).toEqual(['patch']);
    });

    it('Collapses the reset-security-questions-form, when the network request has been processed', () => {
      wrapper = shallowMount(EditKBA, {
        localVue,
        i18n,
        propsData: {
          kbaData,
          processingRequest: true,
        },
        data() {
          return {
            showKBAResetForm: true,
          };
        },
      });
      wrapper.setProps({ processingRequest: false });

      expect(wrapper.vm.showKBAResetForm).toBe(false);
    });
  });
});
