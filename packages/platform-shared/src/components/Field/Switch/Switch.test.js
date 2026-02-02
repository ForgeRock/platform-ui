/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import Switch from './index';
import { runA11yTest } from '../../../utils/testHelpers';

describe('Switch', () => {
  it('renders switch component', () => {
    const wrapper = mount(Switch);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders with default props', () => {
    const wrapper = mount(Switch);
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  describe('@a11y', () => {
    it('should have no accessibility violations', async () => {
      const wrapper = mount(Switch, {
        props: {
          label: 'Test Switch Label',
        },
      });
      await runA11yTest(wrapper);
    });
  });
});
