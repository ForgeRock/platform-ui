/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import NormalViewToolbar from './NormalViewToolbar';
import i18n from '@/i18n';

describe('NormalViewToolbar', () => {
  const defaultProps = {
    hasCompare: false,
    filters: [],
  };

  function setup(props) {
    return mount(NormalViewToolbar, {
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
      const normalViewToolbar = wrapper.findComponent(NormalViewToolbar);

      expect(normalViewToolbar.exists()).toBeTruthy();
    });

    it('should render the component with the compare checkbox', () => {
      const wrapper = setup({ hasCompare: true });
      const compareCheckbox = wrapper.find('[role="switch"]');

      expect(compareCheckbox.exists()).toBeTruthy();
    });

    it('should emit compare when checkbox is checked', async () => {
      const wrapper = setup({ hasCompare: true, isLoading: false });
      const compareCheckbox = wrapper.find('.custom-switch');
      const compareCheckboxInput = wrapper.find('.custom-switch input');
      await compareCheckbox.trigger('click');
      await compareCheckboxInput.setChecked(true);

      expect(wrapper.emitted().compare).toBeTruthy();
    });
  });
});
