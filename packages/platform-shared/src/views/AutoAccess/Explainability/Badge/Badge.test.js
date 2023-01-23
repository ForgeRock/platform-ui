/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import Badge from './index';
import i18n from '@/i18n';

describe('ExplainabilityBadge', () => {
  let wrapper;
  const propsData = {
    title: 'is_automated_user_agent',
  };

  beforeEach(() => {
    wrapper = mount(Badge, {
      mocks: {
        $t: (key) => i18n.t(key),
      },
      propsData,
    });
  });

  it('component should render', () => {
    expect(wrapper).toBeTruthy();
  });

  it('Badge should contain the title prop text value', () => {
    const badgeTitle = wrapper.find('.badgeTitle').text();
    expect(badgeTitle).toBe(i18n.t(`autoAccess.access.reasons['${propsData.title}']`));
  });
});
