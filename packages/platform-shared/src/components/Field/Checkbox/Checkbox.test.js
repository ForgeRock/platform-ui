/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { runA11yTest } from '../../../utils/testHelpers';
import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('renders checkbox input', () => {
    const wrapper = mount(Checkbox);
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  it('renders label when provided', () => {
    const label = 'Test Label';
    const wrapper = mount(Checkbox, {
      props: { label },
    });
    expect(wrapper.text()).toContain(label);
  });

  it('applies disabled state', () => {
    const wrapper = mount(Checkbox, {
      props: { disabled: true },
    });
    expect(wrapper.find('input').element.disabled).toBe(true);
  });

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = mount(Checkbox, {
        props: { label: 'Accessible Checkbox' },
      });
      await runA11yTest(wrapper);
    });
  });
});
