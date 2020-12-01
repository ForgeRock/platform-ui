/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
