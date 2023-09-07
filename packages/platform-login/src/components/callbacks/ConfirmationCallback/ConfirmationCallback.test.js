/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import ConfirmationCallback from '@/components/callbacks/ConfirmationCallback';
import i18n from '@/i18n';

describe('ConfirmationCallback', () => {
  const stubOptions = [
    'stub-option-1',
    'stub-option-2',
    'stub-option-3',
  ];

  const defaultProps = {
    callback: {
      getOptions: () => stubOptions,
      setInputValue: jest.fn(),
    },
    stage: {
      showOnlyPositiveAnswer: true,
    },
  };

  function setup(props) {
    return mount(ConfirmationCallback, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    describe('displaying buttons based on variant property', () => {
      it('displays button as a link', async () => {
        const propsData = {
          callback: {
            getOptions: () => stubOptions,
            payload: {
              type: 'ConfirmationCallback',
            },
          },
          variant: 'link',
        };
        const wrapper = setup(propsData);
        await wrapper.vm.$nextTick();

        const cancelButton = findByTestId(wrapper, 'btn-stub-option-1');
        expect(cancelButton.classes()).toContain('btn-link');
      });

      it('displays button as a button', async () => {
        const propsData = {
          callback: {
            getOptions: () => stubOptions,
            payload: {
              type: 'ConfirmationCallback',
            },
          },
          variant: 'primary',
        };
        const wrapper = setup(propsData);
        await wrapper.vm.$nextTick();

        const cancelButton = findByTestId(wrapper, 'btn-stub-option-1');
        expect(cancelButton.classes()).toContain('btn-primary');
      });

      it('displays button as button by default', async () => {
        const propsData = {
          callback: {
            getOptions: () => stubOptions,
            payload: {
              type: 'ConfirmationCallback',
            },
          },
        };
        const wrapper = setup(propsData);
        await wrapper.vm.$nextTick();

        const cancelButton = findByTestId(wrapper, 'btn-stub-option-1');
        expect(cancelButton.classes()).toContain('btn-primary');
      });
    });
    describe('when only positive answer', () => {
      const testCases = [
        ['first option as buton', 'primary'],
        ['first option as link', 'link'],
      ];
      it.each(testCases)('%s', async (name, variant) => {
        const wrapper = setup({ variant });
        await wrapper.vm.$nextTick();

        const expectedClass = variant === 'link' ? 'btn-link' : 'btn-primary';

        const positiveAnswerOnlyButton = findByTestId(wrapper, 'btn-stub-option-1');
        expect(positiveAnswerOnlyButton.attributes('aria-label')).toBe('stub-option-1');
        expect(positiveAnswerOnlyButton.attributes('class')).toContain(expectedClass);
        expect(positiveAnswerOnlyButton.text()).toBe('stub-option-1');
      });
    });

    describe('when not positive answer', () => {
      const testCases = [
        ['options as buton', 'primary'],
        ['options option as link', 'link'],
      ];
      it.each(testCases)('%s', async (name, variant) => {
        const wrapper = setup({ variant, stage: { showOnlyPositiveAnswer: false } });
        await wrapper.vm.$nextTick();

        const expectedClass = variant === 'link' ? 'btn-link' : 'btn-primary';

        stubOptions.forEach((option) => {
          const optionButton = findByTestId(wrapper, `btn-${option}`);
          expect(optionButton.attributes('aria-label')).toBe(option);
          expect(optionButton.attributes('class')).toContain(expectedClass);
          expect(optionButton.text()).toBe(option);
        });
      });
    });
  });

  describe('@actions', () => {
    describe('when only positive answer', () => {
      it('can click next step', async () => {
        const wrapper = setup();
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('next-step')).toBeFalsy();
        const positiveAnswerOnlyButton = findByTestId(wrapper, 'btn-stub-option-1');

        await positiveAnswerOnlyButton.trigger('click');
        expect(wrapper.emitted('next-step')).toBeTruthy();
      });
    });

    describe('when not positive answer', () => {
      it('options', async () => {
        const wrapper = setup({ stage: { showOnlyPositiveAnswer: false } });
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('next-step')).toBeFalsy();
        const positiveAnswerOnlyButton = findByTestId(wrapper, 'btn-stub-option-1');

        await positiveAnswerOnlyButton.trigger('click');
        expect(wrapper.emitted('next-step')).toBeTruthy();
      });
    });
  });

  it('displays journey button position', async () => {
    const options = ['this is a positive answer', 'No'];
    const propsData = {
      callback: {
        getOptions: () => options,
        payload: {
          type: 'ConfirmationCallback',
        },
      },
      stage: { showOnlyPositiveAnswer: false },
      variant: 'primary',
      positionButton: 'justify-content-end',
    };
    const wrapper = setup(propsData);
    await wrapper.vm.$nextTick();
    options.forEach((option) => {
      const optionButton = findByTestId(wrapper, `option-${option.toLowerCase().replace(/\s/g, '')}`);
      expect(optionButton.attributes('class')).toEqual(`d-flex ${wrapper.vm.positionButton}`);
    });
  });

  it('should only have the class d-flex', async () => {
    const options = ['this is a positive answer', 'No'];
    const propsData = {
      callback: {
        getOptions: () => options,
        payload: {
          type: 'ConfirmationCallback',
        },
      },
      stage: { showOnlyPositiveAnswer: false },
      variant: 'primary',
      positionButton: '',
    };
    const wrapper = setup(propsData);
    await wrapper.vm.$nextTick();
    options.forEach((option) => {
      const optionButton = findByTestId(wrapper, `option-${option.toLowerCase().replace(/\s/g, '')}`);
      expect(optionButton.attributes('class')).toEqual('d-flex');
    });
  });
});
