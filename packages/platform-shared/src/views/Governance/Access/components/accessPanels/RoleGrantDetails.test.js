/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import RoleGrantDetails from './RoleGrantDetails';

const exampleRoleGrant = {
  role: {
    name: 'Example Role',
  },
  item: {
    decision: {
      accessRequest: {
        grantStartDate: '2025-01-23T15:21:29Z',
        grantEndDate: '2025-05-11T15:21:29Z',
      },
    },
    type: 'roleMembership',
  },
};

const mountComponent = () => mount(RoleGrantDetails, {
  global: {
    plugins: [i18n],
  },
  props: {
    access: exampleRoleGrant,
  },
});

describe('Role Grant Details', () => {
  it('should display correct role details', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const imgElement = wrapper.find('span');
    expect(imgElement.text()).toContain('assignment_ind');

    const appName = wrapper.find('h4');
    expect(appName.text()).toBe('Role');

    const accountName = wrapper.find('h3');
    expect(accountName.text()).toBe('Example Role');

    const grantDates = wrapper.findAll('.mb-4');
    expect(grantDates[0].text()).toBe('Access Start Date Jan 23, 2025');
    expect(grantDates[1].text()).toBe('Access End Date May 11, 2025');
  });
});
