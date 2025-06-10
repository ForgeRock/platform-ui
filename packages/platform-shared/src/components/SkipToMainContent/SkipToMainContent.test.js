/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import SkipToMainContent from './index';

describe('SkipToMainContent component', () => {
  let mainContentElement;
  let focusSpy;

  function setup(options = {}) {
    return mount(SkipToMainContent, {
      global: {
        plugins: [i18n],
      },
      ...options,
    });
  }

  beforeEach(() => {
    mainContentElement = document.createElement('main');
    mainContentElement.id = 'main-content';
    mainContentElement.tabIndex = -1;
    document.body.appendChild(mainContentElement);
    focusSpy = jest.spyOn(mainContentElement, 'focus');
  });

  afterEach(() => {
    document.body.removeChild(mainContentElement);
    focusSpy.mockRestore();
  });

  it('should not render skip to main content element when no main element id is provided', () => {
    const wrapper = setup();

    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('renders skip to main content element with correct text', () => {
    const wrapper = setup({ props: { mainContentId: 'main-content' } });

    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.find('button').text()).toBe('Skip to main content');
  });

  it('focuses main-content element when clicked', async () => {
    const wrapper = setup({ props: { mainContentId: 'main-content' } });

    await wrapper.find('button').trigger('click');

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(focusSpy).toHaveBeenCalledWith();
    expect(document.activeElement).toBe(mainContentElement);
  });

  it('do nothing if main-content element does not exist', async () => {
    const wrapper = setup({ props: { mainContentId: 'main-content-not-exist' } });

    await wrapper.find('button').trigger('click');

    expect(focusSpy).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(mainContentElement);
  });
});
