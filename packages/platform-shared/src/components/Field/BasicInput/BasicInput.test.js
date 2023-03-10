/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import BasicInput from './index';
import i18n from '@/i18n';
import { findByTestId } from '../../../utils/testHelpers';

const defaultProps = {
  name: '',
  autofocus: false,
  type: 'test',
};

describe('BasicInput', () => {
  it('BasicInput component loaded', () => {
    const wrapper = mount(BasicInput, {
      i18n,
      propsData: {
        ...defaultProps,
      },
    });

    expect(wrapper.name()).toBe('BasicInput');
    expect(wrapper.vm.floatLabels).toBe(false);
  });

  it('starts animation', () => {
    const wrapper = mount(BasicInput, {
      i18n,
      propsData: {
        ...defaultProps,
        label: 'test',
      },
    });

    wrapper.vm.$refs = {
      input: {
        matches: {
          call: () => true,
        },
      },
    };

    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.vm.animationStart();
    expect(wrapper.vm.floatLabels).toBe(true);
  });

  it('BasicInput component renders reveal button for password', async () => {
    const wrapper = mount(BasicInput, {
      i18n,
      propsData: {
        ...defaultProps,
        type: 'password',
        testid: 'stub-testid',
      },
    });
    const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');
    const input = findByTestId(wrapper, 'input-stub-testid');

    expect(showPasswordButton.exists()).toBe(true);
    expect(showPasswordButton.attributes('name')).toBe('revealButton');
    expect(wrapper.vm.showPassword).toBe(false);
    expect(input.attributes('type')).toBe('password');
    expect(showPasswordButton.attributes('aria-label')).toBe('Show password');

    await showPasswordButton.trigger('click');

    expect(wrapper.vm.showPassword).toBe(true);
    expect(input.attributes('type')).toBe('text');
    expect(showPasswordButton.attributes('aria-label')).toBe('Hide password');
  });

  it('BasicInput passes through component slots', () => {
    const wrapper = mount(BasicInput, {
      i18n,
      propsData: {
        ...defaultProps,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>',
      },
    });

    expect(wrapper.contains('.test_prepend')).toBe(true);
    expect(wrapper.contains('.test_append')).toBe(true);
  });

  it('BasicInput without floating label', () => {
    const wrapper = mount(BasicInput, {
      i18n,
      propsData: {
        ...defaultProps,
        floatingLabel: false,
      },
    });

    expect(wrapper.vm.floatLabels).toBe(false);
  });

  it('BasicInput without floating label must not call animationstart event method', async () => {
    const wrapper = mount(BasicInput, {
      i18n,
      propsData: {
        ...defaultProps,
        floatingLabel: false,
        testid: 'stub-testid',
      },
    });
    const animationStartSpy = jest.spyOn(wrapper.vm, 'animationStart');

    expect(wrapper.vm.floatLabels).toBe(false);
    findByTestId(wrapper, 'input-stub-testid').trigger('animationstart');
    expect(animationStartSpy).not.toHaveBeenCalled();
    expect(wrapper.vm.floatLabels).toBe(false);
  });
});
