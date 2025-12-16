/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import RoleCard from './RoleCard';

const exampleRoleCard = {
  name: 'roleMembership-aa4623ee-c880-4967-af18-b766bb8dacb0',
  displayType: 'AccessNode',
  type: 'roleMembership',
  displayName: 'Example Role',
  icon: 'assignment_ind',
};

const mountComponent = () => mount(RoleCard, {
  global: {
    plugins: [i18n],
  },
  props: {
    access: exampleRoleCard,
  },
});

describe('Role Card Details', () => {
  it('should display correct role details', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const imgElement = wrapper.find('span');
    expect(imgElement.text()).toContain('assignment_ind');

    const appName = wrapper.find('h4');
    expect(appName.text()).toBe('Role');

    const accountName = wrapper.find('h3');
    expect(accountName.text()).toBe('Example Role');
  });
});
