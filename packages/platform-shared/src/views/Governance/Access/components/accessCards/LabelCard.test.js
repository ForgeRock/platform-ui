/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import LabelCard from './LabelCard';

const exampleCards = [
  {
    x: 430,
    y: 50,
    id: 'label-accountGrant',
    name: 'label-accountGrant',
    displayType: 'LabelNode',
    type: 'accountGrant',
  },
  {
    x: 80,
    y: 50,
    id: 'label-roleMembership',
    name: 'label-roleMembership',
    displayType: 'LabelNode',
    type: 'roleMembership',
  },
  {
    x: 780,
    y: 50,
    id: 'label-entitlementGrant',
    name: 'label-entitlementGrant',
    displayType: 'LabelNode',
    type: 'entitlementGrant',
  },
];

const mountComponent = (card) => mount(LabelCard, {
  global: {
    plugins: [i18n],
  },
  props: {
    card,
  },
});

describe('Label Card Details', () => {
  it('should display correct account label', async () => {
    const wrapper = mountComponent(exampleCards[0]);
    await flushPromises();

    const imgElement = wrapper.find('span');
    expect(imgElement.text()).toContain('apps');

    expect(wrapper.text()).toContain('Applications');
  });

  it('should display correct role label', async () => {
    const wrapper = mountComponent(exampleCards[1]);
    await flushPromises();

    const imgElement = wrapper.find('span');
    expect(imgElement.text()).toContain('assignment_ind');

    expect(wrapper.text()).toContain('Roles');
  });

  it('should display correct entitlement label', async () => {
    const wrapper = mountComponent(exampleCards[2]);
    await flushPromises();

    const imgElement = wrapper.find('span');
    expect(imgElement.text()).toContain('assignment_turned_in');

    expect(wrapper.text()).toContain('Entitlements');
  });
});
