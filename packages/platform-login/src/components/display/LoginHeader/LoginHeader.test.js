/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import AccessibleHeader from './index';

global.document = jest.fn();

describe('AccessibleHeader', () => {
  function setup(props) {
    return mount(AccessibleHeader, {
      attachTo: document.body,
      global: {
        plugins: [i18n],
      },
      props: {
        customHtml: '<p>stub custom html</p>',
        mainContentId: 'content',
        ...props,
      },
    });
  }
  it('should renders custom html', () => {
    const wrapper = setup();

    expect(wrapper.text()).toContain('stub custom html');
  });

  it('should not render skip link when isAccessible is undefined and mainContentId is undefined', () => {
    const wrapper = setup({ mainContentId: undefined, isAccessible: undefined });

    const skipLink = findByTestId(wrapper, 'link-skip-to-main-content');
    expect(skipLink.exists()).toBeFalsy();
  });

  it('should not render skip link when isAccessible is enabled and not mainContentId is present', () => {
    const wrapper = setup({ mainContentId: '', isAccessible: true });

    const skipLink = findByTestId(wrapper, 'link-skip-to-main-content');
    expect(skipLink.exists()).toBeFalsy();
  });

  it('should not render skip link when isAccessible is not present and mainContentId is present', () => {
    const wrapper = setup({ mainContentId: 'header-skip-link' });

    const skipLink = findByTestId(wrapper, 'link-skip-to-main-content');
    expect(skipLink.exists()).toBeFalsy();
  });

  it('should render skip link when isAccessible and mainContentId are present', () => {
    const wrapper = setup({ mainContentId: 'header-skip-link', isAccessible: true });

    const skipLink = findByTestId(wrapper, 'link-skip-to-main-content');
    expect(skipLink.exists()).toBeTruthy();
  });
});
