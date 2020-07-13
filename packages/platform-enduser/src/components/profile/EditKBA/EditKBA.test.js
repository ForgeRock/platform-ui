/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
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
import EditKBA from '@/components/profile/EditKBA';
import i18n from '@/i18n';

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
    expect(wrapper).toMatchSnapshot();
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
      wrapper.setData({ kbaChoices: [{ customQuestion: { value: 'test' }, answer: { value: 'test answer' }, selected: { value: 'test' } }] });

      const patch = wrapper.vm.generatePatch();

      expect(typeof patch).toBe('object');
      expect(patch.length).toBe(1);
      expect(typeof first(patch)).toBe('object');
      expect(first(patch)).toHaveProperty('value');
      expect(first(patch).value).toEqual([{ answer: 'test answer', customQuestion: 'test' }]);
    });

    it('should correctly generate patches for provided questions', () => {
      wrapper.setData({ kbaChoices: [{ selected: { value: 'test' }, answer: { value: 'test answer' }, customQuestion: { value: '' } }] });

      const patch = wrapper.vm.generatePatch();

      expect(typeof patch).toBe('object');
      expect(patch.length).toBe(1);
      expect(typeof first(patch)).toBe('object');
      expect(first(patch)).toHaveProperty('value');
      expect(first(patch).value).toEqual([{ answer: 'test answer', questionId: 'test' }]);
    });
  });
});
