/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import ResetSecretField from './index';

describe('ResetSecretField', () => {
  it('sets the effectiveLabel property to the label prop if it has a value', () => {
    const label = 'My Password';
    const wrapper = mount(ResetSecretField, {
      global: {
        plugins: [i18n],
      },
      props: {
        label,
      },
    });

    expect(wrapper.vm.effectiveLabel).toEqual(label);
  });

  it('sets the effectiveLabel property to "Password" if the label prop is empty', () => {
    const wrapper = mount(ResetSecretField, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.vm.effectiveLabel).toEqual('Password');
  });

  it('displays a label below the input field if description prop has a value', () => {
    const wrapper = mount(ResetSecretField, {
      global: {
        plugins: [i18n],
      },
      props: {
        description: 'My Description',
      },
    });
    const description = wrapper.find('[id^=floatingLabel]');
    expect(description.exists()).toBe(true);
  });

  it('displays an html label below the input field if description prop has a value and the isHtml prop is true', () => {
    const descriptionHtml = '<a href="#">html</a>';
    const wrapper = mount(ResetSecretField, {
      global: {
        plugins: [i18n],
      },
      props: {
        description: descriptionHtml,
        isHtml: true,
      },
    });
    const description = wrapper.find('[id^=floatingLabel] > a');
    expect(description.html()).toBe(descriptionHtml);
  });
});
