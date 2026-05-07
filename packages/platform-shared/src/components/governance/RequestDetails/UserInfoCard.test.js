/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrGovernanceUserDetailsModal from '@forgerock/platform-shared/src/components/governance/UserDetailsModal';
import UserInfoCard from './UserInfoCard';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

const testUser = {
  id: 'managed/user/abc-123',
  givenName: 'Jane',
  sn: 'Doe',
  userName: 'jdoe',
  mail: 'jdoe@example.com',
  profileImage: '',
};

let modalShow;

const setup = (propsData = {}) => mount(UserInfoCard, {
  global: {
    plugins: [i18n],
  },
  props: { user: testUser, ...propsData },
});

describe('UserInfoCard', () => {
  beforeEach(() => {
    ({ modalShow } = mockModal());
    CommonsApi.getIgaUiConfig = jest.fn().mockResolvedValue({ data: { user: { displayProperties: ['userName', 'givenName', 'sn'] } } });
  });

  it('renders the Requested For header', () => {
    const wrapper = setup();
    expect(wrapper.text()).toContain('Requested For');
  });

  it('displays the user full name', () => {
    const wrapper = setup();
    expect(wrapper.text()).toContain('Jane Doe');
  });

  it('displays the username', () => {
    const wrapper = setup();
    expect(wrapper.text()).toContain('jdoe');
  });

  it('opens the modal when the user button is clicked', async () => {
    const wrapper = setup();
    await wrapper.find('button').trigger('click');
    expect(modalShow).toHaveBeenCalledWith('GovernanceUserDetailsModal');
  });

  it('does not render a manager section when manager prop is absent', () => {
    const wrapper = setup();
    expect(wrapper.text()).not.toContain('Manager');
  });

  it('renders the manager section when manager prop is provided', () => {
    const wrapper = setup({ manager: { givenName: 'John', sn: 'Smith', userName: 'jsmith' } });
    expect(wrapper.text()).toContain('Manager');
    expect(wrapper.text()).toContain('John Smith');
    expect(wrapper.text()).toContain('jsmith');
  });

  it('passes displayProperties from getIgaUiConfig to the modal', async () => {
    const wrapper = setup();
    await flushPromises();
    expect(CommonsApi.getIgaUiConfig).toHaveBeenCalled();
    expect(wrapper.findComponent(FrGovernanceUserDetailsModal).props('displayProperties')).toEqual(['userName', 'givenName', 'sn']);
  });

  it('falls back to default displayProperties when getIgaUiConfig fails', async () => {
    CommonsApi.getIgaUiConfig = jest.fn().mockRejectedValue(new Error('Network error'));
    const wrapper = setup();
    await flushPromises();
    expect(wrapper.findComponent(FrGovernanceUserDetailsModal).props('displayProperties')).toEqual(['userName', 'givenName', 'sn', 'mail', 'accountStatus']);
  });

  it('falls back to default displayProperties when getIgaUiConfig returns no user data', async () => {
    CommonsApi.getIgaUiConfig = jest.fn().mockResolvedValue({ data: {} });
    const wrapper = setup();
    await flushPromises();
    expect(wrapper.findComponent(FrGovernanceUserDetailsModal).props('displayProperties')).toEqual(['userName', 'givenName', 'sn', 'mail', 'accountStatus']);
  });
});
