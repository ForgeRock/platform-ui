/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { first } from 'lodash';
import { flushPromises, mount } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';
import EditKBA from './index';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

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
});
