/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import NormalViewHeader from './NormalViewHeader';
import i18n from '@/i18n';

describe('NormalViewHeader', () => {
  const defaultProps = {
    isLoading: false,
    subtitle: 'Test sub title',
    toptitle: 'Test top title',
    title: 'Test title',
  };

  function setup(props) {
    return mount(NormalViewHeader, {
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
    it('should render the component', () => {
      const wrapper = setup();
      const normalViewHeader = wrapper.findComponent(NormalViewHeader);
      expect(normalViewHeader.exists()).toBeTruthy();
    });

    it('should render the prop values with the default profile image', () => {
      const wrapper = setup();
      const profileImage = wrapper.findComponent(FrIcon);
      const subTitle = wrapper.find('[data-testid="header-subtitle"]');
      const title = wrapper.find('[data-testid="header-title"]');
      const topTitle = wrapper.find('[data-testid="header-toptitle"]');

      // Validate markup
      expect(subTitle.text()).toBe(defaultProps.subtitle);
      expect(title.text()).toBe(defaultProps.title);
      expect(topTitle.text()).toBe(defaultProps.toptitle);
      expect(profileImage.exists()).toBeTruthy();
    });

    it('should render the prop values with the provided profile image', () => {
      const wrapper = setup({ profileImage: 'test-profile-image.jpg' });
      const profileImage = wrapper.find('img');
      const subTitle = wrapper.find('[data-testid="header-subtitle"]');
      const title = wrapper.find('[data-testid="header-title"]');
      const topTitle = wrapper.find('[data-testid="header-toptitle"]');

      // Validate markup
      expect(subTitle.text()).toBe(defaultProps.subtitle);
      expect(title.text()).toBe(defaultProps.title);
      expect(topTitle.text()).toBe(defaultProps.toptitle);
      expect(profileImage.exists()).toBeTruthy();
    });
  });
});
