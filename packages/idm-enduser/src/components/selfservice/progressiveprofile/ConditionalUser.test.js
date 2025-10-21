/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { KBADetails } from './mocks/ProgressiveProfileMock';
import ConditionalUser from './ConditionalUser';
import i18n from '@/i18n';

mockValidation();

describe('ConditionalUser', () => {
  let wrapper;
  function mountComponent(propsData = {}) {
    return mount(ConditionalUser, {
      props: {
        ...propsData,
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  describe('user properties', () => {
    const propertyRequirements = {
      requirements: {
        attributes: [
          {
            name: 'city',
            isRequired: false,
            schema: {
              type: 'string',
              title: 'City',
              description: 'City',
            },
            value: 'initialValue',
          },
        ],
        uiConfig: {
          buttonText: 'Save Properties',
        },
      },
    };

    it('shows save button and terms for user properties', async () => {
      wrapper = mountComponent({
        selfServiceDetails: propertyRequirements,
      });
      await flushPromises();

      expect(wrapper.find('[label="City"]').exists()).toBe(true);
      expect(wrapper.find('button').text()).toBe('Save Properties');
    });

    it('emits correct payload for user properties', async () => {
      wrapper = mountComponent({
        selfServiceDetails: propertyRequirements,
      });
      await flushPromises();

      const button = wrapper.find('button');
      await button.trigger('click');

      expect(wrapper.emitted('advanceStage')).toBeTruthy();
      expect(wrapper.emitted('advanceStage')[0]).toEqual([{ attributes: { city: 'initialValue' } }]);
    });

    it('updates payload when user changes value', async () => {
      wrapper = mountComponent({
        selfServiceDetails: propertyRequirements,
      });
      await flushPromises();

      const cityField = wrapper.findComponent('[label="City"]');
      await cityField.vm.$emit('input', 'newCity');

      const button = wrapper.find('button');
      await button.trigger('click');

      expect(wrapper.emitted('advanceStage')).toBeTruthy();
      expect(wrapper.emitted('advanceStage')[0]).toEqual([{ attributes: { city: 'newCity' } }]);
    });
  });

  describe('terms acceptance', () => {
    const termsRequirements = {
      requirements: {
        terms: '<strong> THESE ARE TERMS AND CONDITIONS </strong>',
        uiConfig: {
          buttonText: 'Accept Terms Button',
        },
      },
    };

    it('shows save button and terms for terms acceptance', async () => {
      wrapper = mountComponent({
        selfServiceDetails: termsRequirements,
      });
      await flushPromises();

      expect(wrapper.html()).toContain('<strong> THESE ARE TERMS AND CONDITIONS </strong>');
      expect(wrapper.find('button').text()).toBe('Accept Terms Button');
    });

    it('emits correct payload for terms acceptance', async () => {
      wrapper = mountComponent({
        selfServiceDetails: termsRequirements,
      });
      await flushPromises();

      const button = wrapper.find('button');
      await button.trigger('click');

      expect(wrapper.emitted('advanceStage')).toBeTruthy();
      expect(wrapper.emitted('advanceStage')[0]).toEqual([{ accept: 'true' }]);
    });
  });

  describe('kba questions', () => {
    const kbaRequirements = {
      requirements: {
        ...KBADetails,
        definitions: {},
        uiConfig: {
          buttonText: 'Save KBA',
        },
      },
    };

    it('emits correct payload for kba questions', async () => {
      wrapper = mountComponent({
        selfServiceDetails: kbaRequirements,
      });
      await flushPromises();

      const questionSelects = wrapper.findAllComponents('[label="Select a security question..."]');
      const answerInputs = wrapper.findAllComponents('[label="Answer"]');

      questionSelects[0].vm.$emit('input', '1');
      answerInputs[0].vm.$emit('input', 'Blue');
      questionSelects[1].vm.$emit('input', '2');
      answerInputs[1].vm.$emit('input', 'My first employer');
      await flushPromises();

      const button = wrapper.find('button');
      await button.trigger('click');

      expect(wrapper.emitted('advanceStage')).toBeTruthy();
      expect(wrapper.emitted('advanceStage')[0]).toEqual([{
        kba: [
          { questionId: '1', answer: 'Blue' },
          { questionId: '2', answer: 'My first employer' },
        ],
      }]);
    });
  });
});
