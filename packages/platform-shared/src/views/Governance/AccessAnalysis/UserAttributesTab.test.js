/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { createAppContainer, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import UserAttributesTab from './UserAttributesTab';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

// standard user attributes as returned by get-filter-schema (key + displayName)
const filterSchema = {
  data: {
    user: [
      {
        key: 'accountStatus', displayName: 'Account Status', name: 'accountStatus', type: 'string',
      },
      {
        key: 'cn', displayName: 'Common Name', name: 'cn', type: 'string',
      },
      {
        key: 'compositeId', displayName: 'Composite ID', name: 'compositeId', type: 'string',
      },
      {
        key: 'fr', displayName: 'FR', name: 'fr', type: 'string',
      },
      {
        key: 'givenName', displayName: 'First Name', name: 'givenName', type: 'string',
      },
      {
        key: 'id', displayName: 'Id', name: 'id', type: 'string',
      },
      {
        key: 'mail', displayName: 'Email', name: 'mail', type: 'string',
      },
      {
        key: 'sn', displayName: 'Last Name', name: 'sn', type: 'string',
      },
      {
        key: 'userName', displayName: 'Username', name: 'userName', type: 'string',
      },
      {
        key: 'city', displayName: 'City', name: 'city', type: 'string',
      },
      {
        key: 'department', displayName: 'Department', name: 'department', type: 'string',
      },
      {
        key: 'manager', displayName: 'Manager', name: 'manager', type: 'string',
      },
      {
        key: 'telephoneNumber', displayName: 'Telephone Number', name: 'telephoneNumber', type: 'string',
      },
    ],
  },
};

// expected default-active rows: DEFAULT_ACTIVE_ATTRIBUTES ∩ schema
const defaultActiveKeys = ['accountStatus', 'cn', 'compositeId', 'fr', 'givenName', 'id', 'mail', 'sn', 'userName'];
const inactiveByDefaultKeys = ['city', 'department', 'manager', 'telephoneNumber'];

const userA = {
  _id: 'userA',
  userName: 'jdoe',
  givenName: 'Jane',
  sn: 'Doe',
  mail: 'jdoe@example.com',
  accountStatus: 'active',
  city: 'London',
  manager: { givenName: 'Ann', sn: 'Smith', userName: 'asmith' },
};
const userB = {
  _id: 'userB',
  userName: 'jsmith',
  givenName: 'John',
  sn: 'Smith',
  mail: 'jsmith@example.com',
  accountStatus: 'inactive',
  city: 'Paris',
  department: 'Engineering',
  manager: { givenName: 'Ann', sn: 'Smith', userName: 'asmith' },
};

describe('UserAttributesTab', () => {
  let wrapper;

  const app = createAppContainer();
  function mountComponent() {
    wrapper = mount(UserAttributesTab, {
      attachTo: app,
      global: {
        plugins: [i18n],
      },
      props: {
        userAId: 'userA',
        userBId: 'userB',
        userAName: 'Jane Doe',
        userBName: 'John Smith',
      },
    });
    return wrapper;
  }

  beforeEach(() => {
    CommonsApi.getFilterSchema.mockResolvedValue(filterSchema);
    CommonsApi.getUserById.mockImplementation((id) => Promise.resolve({
      data: { result: [id === 'userA' ? { ...userA } : { ...userB }] },
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.unmount();
  });

  it('loads the user filter schema and both users', async () => {
    wrapper = mountComponent();
    await flushPromises();
    expect(CommonsApi.getFilterSchema).toHaveBeenCalled();
    expect(CommonsApi.getUserById).toHaveBeenCalledTimes(2);
  });

  it('shows only the default-active attributes as rows, schema-labeled and covering all listed users', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const keys = wrapper.findAll('tbody tr td:first-child').map((cell) => cell.text());
    expect(keys).toEqual(defaultActiveKeys);
    // attributes outside the default set exist in the picker but are not shown
    const organizer = wrapper.findComponent({ name: 'ListOrganizer' });
    const pickerKeys = organizer.props('value').map((attribute) => attribute.key);
    expect(pickerKeys).toEqual(expect.arrayContaining([...defaultActiveKeys, ...inactiveByDefaultKeys]));
    // rows are labeled in the picker by the schema's displayName, not the raw key
    const cityEntry = organizer.props('value').find((attribute) => attribute.key === 'city');
    expect(cityEntry.label).toBe('City');
  });

  it('emits update:count with the number of displayed rows', async () => {
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.emitted('update:count').at(-1)).toEqual([defaultActiveKeys.length]);
  });

  it('highlights rows that differ between the two users', async () => {
    wrapper = mountComponent();
    await flushPromises();
    // accountStatus and mail differ between the fixtures; givenName/sn share values per attribute name
    const rows = wrapper.findAll('tbody tr');
    const statusRow = rows.filter((row) => row.text().startsWith('accountStatus'))[0];
    const mailRow = rows.filter((row) => row.text().startsWith('mail'))[0];
    expect(statusRow.classes()).toContain('fr-attributes-tab__row--diff');
    expect(mailRow.classes()).toContain('fr-attributes-tab__row--diff');
  });

  it('removes and re-adds rows through the picker without refetching', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const organizer = wrapper.findComponent({ name: 'ListOrganizer' });
    // 9 default-active rows; only 'mail' is disabled in the updated selection
    let updatedList = organizer.props('value').map((attribute) => ({
      ...attribute,
      enabled: attribute.key === 'mail' ? false : attribute.enabled,
    }));
    organizer.vm.$emit('list-updated', updatedList);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('tbody tr td:first-child').map((cell) => cell.text())).not.toContain('mail');
    expect(wrapper.emitted('update:count').at(-1)).toEqual([8]);

    // re-add it
    updatedList = updatedList.map((attribute) => ({
      ...attribute,
      enabled: attribute.key === 'mail' ? true : attribute.enabled,
    }));
    organizer.vm.$emit('list-updated', updatedList);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('tbody tr td:first-child').map((cell) => cell.text())).toContain('mail');
    // no additional user fetches happened
    expect(CommonsApi.getUserById).toHaveBeenCalledTimes(2);
  });

  it('shows a non-default attribute once the picker enables it', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const organizer = wrapper.findComponent({ name: 'ListOrganizer' });
    const updatedList = organizer.props('value').map((attribute) => ({
      ...attribute,
      enabled: attribute.key === 'city' || defaultActiveKeys.includes(attribute.key),
    }));
    organizer.vm.$emit('list-updated', updatedList);
    await wrapper.vm.$nextTick();

    const cityRow = wrapper.findAll('tbody tr').filter((row) => row.text().startsWith('city'))[0];
    expect(cityRow.exists()).toBe(true);
    expect(cityRow.text()).toContain('London');
    expect(cityRow.text()).toContain('Paris');
  });

  it('keeps the picker selection when the users are reloaded', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const organizer = wrapper.findComponent({ name: 'ListOrganizer' });
    const updatedList = organizer.props('value').map((attribute) => ({
      ...attribute,
      enabled: attribute.key === 'mail' ? false : attribute.enabled,
    }));
    organizer.vm.$emit('list-updated', updatedList);
    await wrapper.vm.$nextTick();

    // users change -> reload -> selection survives
    await wrapper.setProps({ userAId: 'userA2' });
    await flushPromises();
    expect(wrapper.findAll('tbody tr td:first-child').map((cell) => cell.text())).not.toContain('mail');
    expect(wrapper.findAll('tbody tr td:first-child').map((cell) => cell.text())).toContain('userName');
  });

  it('renders the empty state when neither user has attributes', async () => {
    CommonsApi.getFilterSchema.mockResolvedValue({ data: { user: [] } });
    CommonsApi.getUserById.mockResolvedValue({ data: { result: [{}] } });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain(i18n.global.t('governance.accessAnalysis.attributes.noAttributes'));
  });

  it('passes accessibility checks', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await runA11yTest(wrapper);
  });
});
