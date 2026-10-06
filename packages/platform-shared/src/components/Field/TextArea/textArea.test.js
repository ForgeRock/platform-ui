/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import TextArea from './index';
import { findByTestId, runA11yTest } from '../../../utils/testHelpers';

mockValidation(['required']);

const defaultMixinProps = {
  id: '',
  errorMessages: [],
  name: '',
  description: '',
  isHtml: false,
  label: '',
};

const defaultProps = {
  autofocus: false,
  type: 'test',
  floatingLabel: true,
  name: 'comment',
  testid: 'stub-testid',
};

describe('TextArea input', () => {
  it('TextArea input component has correct attributes', () => {
    const wrapper = mount(TextArea, {
      props: {
        ...defaultMixinProps,
        ...defaultProps,
        cols: 5,
        rows: 6,
      },
    });

    const textarea = wrapper.find('textarea');

    expect(textarea.attributes('cols')).toBe('5');
    expect(textarea.attributes('rows')).toBe('6');
  });

  it('associates the description with the textarea via aria-describedby', () => {
    const wrapper = mount(TextArea, {
      props: {
        ...defaultMixinProps,
        ...defaultProps,
        id: 'justification',
        description: 'Provide a justification for why this request is approved.',
      },
    });

    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('aria-describedby')).toBe('justification_helpText');

    const helpText = wrapper.find('#justification_helpText');
    expect(helpText.exists()).toBe(true);
    expect(helpText.text()).toContain('Provide a justification for why this request is approved.');
  });

  it('does not set aria-describedby when there is no description', () => {
    const wrapper = mount(TextArea, {
      props: {
        ...defaultMixinProps,
        ...defaultProps,
        id: 'justification',
      },
    });

    expect(wrapper.find('textarea').attributes('aria-describedby')).toBeUndefined();
  });

  describe('error association', () => {
    const mountTextArea = (props = {}) => mount(TextArea, {
      props: {
        ...defaultMixinProps,
        ...defaultProps,
        ...props,
      },
    });

    it('associates the validation error with the textarea via aria-describedby', async () => {
      const wrapper = mountTextArea({ validation: 'required', label: 'Comment' });

      const textarea = findByTestId(wrapper, 'stub-testid');
      await textarea.setValue('');
      await textarea.trigger('blur');
      await flushPromises();

      expect(textarea.attributes('aria-describedby')).toBe('comment0-error');
      expect(textarea.attributes('aria-invalid')).toBe('true');

      const error = wrapper.find('[data-testid="comment-validation-error-0"]');
      expect(error.exists()).toBe(true);
      expect(error.text()).toBe('Comment is required');
    });

    it('associates multiple validation errors as a space-separated list', async () => {
      const wrapper = mountTextArea({
        validation: 'required',
        label: 'Comment',
        errors: ['parent error.'],
      });

      const textarea = findByTestId(wrapper, 'stub-testid');
      await textarea.setValue('');
      await textarea.trigger('blur');
      await flushPromises();

      expect(textarea.attributes('aria-describedby')).toBe('comment0-error comment1-error');

      const firstError = wrapper.find('[data-testid="comment-validation-error-0"]');
      expect(firstError.text()).toBe('parent error.');
    });

    it('falls back to the help text id when the field is valid but has a description', async () => {
      const wrapper = mountTextArea({
        id: 'comment',
        description: 'Provide a justification for why this request is approved.',
        label: 'Comment',
        validation: 'required',
      });

      const textarea = findByTestId(wrapper, 'stub-testid');
      await textarea.setValue('Some value');
      await textarea.trigger('blur');
      await flushPromises();

      expect(textarea.attributes('aria-describedby')).toBe('comment_helpText');
    });

    it('associates the error and the help text together when both are present', async () => {
      const wrapper = mountTextArea({
        id: 'comment',
        description: 'Provide a justification for why this request is approved.',
        label: 'Comment',
        validation: 'required',
      });

      const textarea = findByTestId(wrapper, 'stub-testid');
      await textarea.setValue('');
      await textarea.trigger('blur');
      await flushPromises();

      expect(textarea.attributes('aria-describedby')).toBe('comment0-error comment_helpText');
    });

    it('does not set aria-describedby or aria-invalid when the field is valid with no description', async () => {
      const wrapper = mountTextArea({ validation: 'required' });

      const textarea = findByTestId(wrapper, 'stub-testid');
      await textarea.setValue('Some value');
      await textarea.trigger('blur');
      await flushPromises();

      expect(textarea.attributes('aria-describedby')).toBeUndefined();
      expect(textarea.attributes('aria-invalid')).toBe('false');
    });

    it('sets aria-invalid to true for parent errors when validationImmediate is enabled', async () => {
      const wrapper = mountTextArea({
        errors: ['parent error.'],
        validationImmediate: true,
      });

      const textarea = findByTestId(wrapper, 'stub-testid');
      await flushPromises();

      expect(textarea.attributes('aria-invalid')).toBe('true');
      expect(textarea.attributes('aria-describedby')).toBe('comment0-error');
    });

    it('uses the describedbyId prop as aria-describedby when there is no description and no errors', async () => {
      const wrapper = mountTextArea({ describedbyId: 'external-description' });

      const textarea = findByTestId(wrapper, 'stub-testid');
      await flushPromises();

      expect(textarea.attributes('aria-describedby')).toBe('external-description');
      expect(textarea.attributes('aria-invalid')).toBeUndefined();
    });

    it('composes the describedbyId prop and the help text id when a description is rendered', async () => {
      const wrapper = mountTextArea({
        id: 'comment',
        description: 'Provide a justification for why this request is approved.',
        describedbyId: 'external-description',
      });

      const textarea = findByTestId(wrapper, 'stub-testid');
      await flushPromises();

      expect(textarea.attributes('aria-describedby')).toBe('external-description comment_helpText');
    });

    it('resets aria-describedby and aria-invalid after the error is fixed', async () => {
      const wrapper = mountTextArea({
        id: 'comment',
        description: 'Provide a justification for why this request is approved.',
        label: 'Comment',
        validation: 'required',
      });

      const textarea = findByTestId(wrapper, 'stub-testid');

      // Error state: empty value, blur to trigger validation
      await textarea.setValue('');
      await textarea.trigger('blur');
      await flushPromises();
      expect(textarea.attributes('aria-describedby')).toBe('comment0-error comment_helpText');
      expect(textarea.attributes('aria-invalid')).toBe('true');

      // Fixed state: value entered, blur again
      await textarea.setValue('Some value');
      await textarea.trigger('blur');
      await flushPromises();
      expect(textarea.attributes('aria-describedby')).toBe('comment_helpText');
      expect(textarea.attributes('aria-invalid')).toBe('false');
    });
  });

  it('TextArea input component sets floatLabels correctly', async () => {
    const wrapper = shallowMount(TextArea, {
      props: {
        ...defaultMixinProps,
        ...defaultProps,
      },
    });
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.vm.handleFocusEvent();
    await flushPromises();
    expect(wrapper.vm.floatLabels).toBe(false);
    await wrapper.setProps({ label: 'test' });
    wrapper.vm.handleFocusEvent();
    await flushPromises();
    expect(wrapper.vm.floatLabels).toBe(true);

    wrapper.vm.floatLabels = false;
    wrapper.vm.inputValueHandler(null);
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.vm.inputValueHandler('test');
    expect(wrapper.vm.floatLabels).toBe(true);
  });

  describe('@a11y', () => {
    it('TextArea input component is accessible', async () => {
      const wrapper = mount(TextArea, {
        props: {
          ...defaultMixinProps,
          ...defaultProps,
          label: 'test',
        },
      });
      await runA11yTest(wrapper);
    });
  });
});
