/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */

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
      i18n,
      propsData: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    describe('when only positive answer', () => {
      it.each`
      name                       | isLink
      ${'first option as buton'} | ${false}
      ${'first option as link'}  | ${true}
      `('$name', async ({ isLink }) => {
        const wrapper = setup({ stage: { showButtonsAsLinks: isLink } });
        await wrapper.vm.$nextTick();

        const expectedClass = isLink ? 'btn-link' : 'btn-primary';

        const positiveAnswerOnlyButton = findByTestId(wrapper, 'btn-stub-option-1');
        expect(positiveAnswerOnlyButton.attributes('aria-label')).toBe('stub-option-1');
        expect(positiveAnswerOnlyButton.attributes('class')).toContain(expectedClass);
        expect(positiveAnswerOnlyButton.text()).toBe('stub-option-1');
      });
    });

    describe('when not positive answer', () => {
      it.each`
      name                        | isLink
      ${'options as buton'}       | ${false}
      ${'options option as link'} | ${true}
      `('$name', async ({ isLink }) => {
        const wrapper = setup({ stage: { showOnlyPositiveAnswer: false, showButtonsAsLinks: isLink } });
        await wrapper.vm.$nextTick();

        const expectedClass = isLink ? 'btn-link' : 'btn-primary';

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
});
