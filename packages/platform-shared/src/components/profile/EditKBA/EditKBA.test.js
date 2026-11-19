/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { first } from 'lodash';
import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import i18n from '@/i18n';
import EditKBA from './index';

mockValidation(['required']);

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

  describe('#generatePatch', () => {
    beforeEach(() => {
      wrapper = mount(EditKBA, {
        global: {
          plugins: [i18n],
        },
        props: {
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
      wrapper.vm.$refs.observer.validate = () => Promise.resolve({ valid: true });
      wrapper.vm.onSaveKBA();
    });

    it('does not emit updateKBA event if the form data is invalid', async () => {
      wrapper.vm.$refs.observer.validate = () => Promise.resolve({ valid: false });
      wrapper.vm.onSaveKBA();
    });

    it('emits updateKBA event with correct patch payload', async () => {
      wrapper.vm.$refs.observer.validate = () => Promise.resolve({ valid: true });
      const patchSpy = jest.spyOn(wrapper.vm, 'generatePatch').mockImplementation(() => 'patch');
      wrapper.vm.onSaveKBA();

      await flushPromises();

      expect(patchSpy).toHaveBeenCalled();
      expect(wrapper.emitted().updateKBA).toBeTruthy();
      expect(wrapper.emitted().updateKBA[0]).toEqual(['patch']);
    });

    it('Collapses the reset-security-questions-form, when the network request has been processed', async () => {
      wrapper = mount(EditKBA, {
        global: {
          plugins: [i18n],
        },
        props: {
          kbaData,
          processingRequest: true,
        },
        data() {
          return {
            showKBAResetForm: true,
          };
        },
      });
      await wrapper.setProps({ processingRequest: false });

      expect(wrapper.vm.showKBAResetForm).toBe(false);
    });
  });

  describe('@actions', () => {
    const kbaDataWithQuestions = {
      ...kbaData,
      questions: {
        1: { en: 'Question 1?' },
        2: { en: 'Question 2?' },
        3: { en: 'Question 3?' },
      },
    };

    let selectWrapper;

    afterEach(() => {
      if (selectWrapper) {
        selectWrapper.unmount();
        selectWrapper = null;
      }
    });

    async function chooseQuestion(questionText) {
      await selectWrapper.find('.multiselect__tags').trigger('mousedown');
      await flushPromises();
      const option = selectWrapper.findAll('.multiselect__option').find((el) => el.text() === questionText);
      await option.trigger('click');
      await flushPromises();
    }

    it('keeps the newly selected question when a different question is chosen after a previous selection', async () => {
      selectWrapper = mount(EditKBA, {
        attachTo: document.body,
        global: { plugins: [i18n] },
        props: { kbaData: kbaDataWithQuestions },
      });
      selectWrapper.vm.initializeForm(1);
      await flushPromises();

      await chooseQuestion('Question 1?');
      expect(selectWrapper.vm.kbaChoices[0].selected).toBe('1');

      await chooseQuestion('Question 2?');
      expect(selectWrapper.vm.kbaChoices[0].selected).toBe('2');
    });
  });
});
