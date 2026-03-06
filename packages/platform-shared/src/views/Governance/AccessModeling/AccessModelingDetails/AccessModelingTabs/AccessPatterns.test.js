/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { getRoleDataById } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { convertRulesToDisplay } from '@forgerock/platform-shared/src/utils/governance/prediction';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import AccessPatterns from './AccessPatterns';

jest.mock('@forgerock/platform-shared/src/api/governance/RoleApi', () => ({
  getRoleDataById: jest.fn(),
}));

jest.mock('@forgerock/platform-shared/src/utils/governance/prediction', () => ({
  convertRulesToDisplay: jest.fn(),
}));

jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/utils/governance/accessModeling', () => ({
  patternSortByOptions: [
    { value: 'attributeCount', text: 'attributeCount' },
    { value: 'userCount', text: 'userCount' },
  ],
}));

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    global: {
      t: (key) => key,
    },
  },
}));

const defaultRole = {
  id: 'role-1',
  status: 'draft',
  justifications: ['J1', 'J2'],
  justificationMetadata: [
    { justification: 'J1', memberCount: 3 },
    { justification: 'J2', memberCount: 10 },
  ],
};

function factory(overrideProps = {}) {
  const savePatterns = jest.fn().mockResolvedValue();

  const wrapper = shallowMount(AccessPatterns, {
    props: {
      role: defaultRole,
      userSchema: { properties: {} },
      savePatterns,
      isSaving: false,
      availableAttributes: [
        { key: 'department', displayName: 'Department' },
        { key: 'country', displayName: 'Country' },
      ],
      ...overrideProps,
    },
    global: {
      stubs: {
        BCol: true,
        FrSpinner: true,
        FrField: true,
        FrPagination: true,
        FrIcon: true,
        FrButtonWithSpinner: true,
        FrSortDropdown: {
          template: '<div />',
        },
      },
      mocks: {
        $t: (k) => k,
      },
    },
  });

  return { wrapper, savePatterns };
}

describe('AccessPatterns.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    convertRulesToDisplay.mockReturnValue([
      [
        { key: 'department', value: 'IT', displayName: 'Department' },
        { key: 'location', value: 'US', displayName: 'Location' },
      ],
      [{ key: 'department', value: 'HR', displayName: 'Department' }],
    ]);

    getRoleDataById.mockImplementation((roleId, status, section, params) => {
      if (section !== 'members') return Promise.resolve({ data: {} });
      const filter = params?._queryFilter || '';
      const totalHits = filter.includes("department eq 'IT'") ? 5 : 2;
      return Promise.resolve({ data: { totalHits } });
    });
  });

  it('loads and maps pattern list with counts on mount', async () => {
    const { wrapper } = factory();
    await flushPromises();

    expect(convertRulesToDisplay).toHaveBeenCalledWith(
      defaultRole.justifications,
      { properties: {} },
      true,
    );
    expect(getRoleDataById).toHaveBeenCalledTimes(2);

    expect(wrapper.vm.patternList).toHaveLength(2);
    expect(wrapper.vm.patternList[0].count).toBe(5);
    expect(wrapper.vm.patternList[1].count).toBe(2);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('builds and sends correct query filters for member count requests', async () => {
    factory();
    await flushPromises();

    const call1 = getRoleDataById.mock.calls[0];
    const call2 = getRoleDataById.mock.calls[1];

    expect(call1[0]).toBe('role-1');
    expect(call1[1]).toBe('draft');
    expect(call1[2]).toBe('members');
    expect(call1[3]._queryFilter).toContain("department eq 'IT'");
    expect(call1[3]._queryFilter).toContain("location eq 'US'");

    expect(call2[3]._queryFilter).toBe("department eq 'HR'");
  });

  it('resorts data when sort field changes', async () => {
    const { wrapper } = factory();
    await flushPromises();

    await wrapper.vm.handleSortChange('userCount');
    await flushPromises();

    expect(wrapper.vm.sortField).toBe('userCount');
    expect(getRoleDataById).toHaveBeenCalledTimes(4);
    expect(wrapper.vm.patternList[0].id).toBe('J2');
  });

  it('toggles sort direction and refreshes pattern list', async () => {
    const { wrapper } = factory();
    await flushPromises();

    const before = wrapper.vm.sortDesc;
    await wrapper.vm.handleSortDirectionChange();
    await flushPromises();

    expect(wrapper.vm.sortDesc).toBe(!before);
    expect(getRoleDataById).toHaveBeenCalledTimes(4);
  });

  it('removes selected pattern through savePatterns', async () => {
    const { wrapper, savePatterns } = factory();
    await flushPromises();

    wrapper.vm.setPatternForModal(wrapper.vm.patternList[0], 'confirm');
    expect(wrapper.vm.confirmModalVisible).toBe(true);

    await wrapper.vm.updatePatterns('remove');
    await flushPromises();

    expect(savePatterns).toHaveBeenCalledWith('justifications', '', [
      { id: 'J1', operation: 'remove' },
    ]);
    expect(wrapper.vm.confirmModalVisible).toBe(false);
    expect(wrapper.vm.selectedPatterns).toEqual([]);
  });

  it('adds pattern and converts object to encoded pattern id', async () => {
    const { wrapper, savePatterns } = factory();
    await flushPromises();

    wrapper.vm.addPattern = {
      department: 'IT',
      location: '',
      country: 'US',
    };

    wrapper.vm.setPatternForModal({}, 'add');
    expect(wrapper.vm.addPatternModalVisible).toBe(true);

    await wrapper.vm.updatePatterns('add');
    await flushPromises();

    expect(savePatterns).toHaveBeenCalledWith('justifications', '', [
      { id: '0A_DEPARTMENT_IT 07_COUNTRY_US', operation: 'add' },
    ]);
    expect(wrapper.vm.addPatternModalVisible).toBe(false);
    expect(wrapper.vm.addPattern).toEqual({});
  });

  it('closeModal(add) clears selected patterns and addPattern model', async () => {
    const { wrapper } = factory();
    await flushPromises();

    wrapper.vm.selectedPatterns = [{ id: 'X' }];
    wrapper.vm.addPattern = { department: 'Finance' };
    wrapper.vm.addPatternModalVisible = true;

    wrapper.vm.closeModal('add');

    expect(wrapper.vm.addPatternModalVisible).toBe(false);
    expect(wrapper.vm.addPattern).toEqual({});
    expect(wrapper.vm.selectedPatterns).toEqual([]);
  });

  it('hides add/remove actions in read-only mode', async () => {
    const { wrapper } = factory({
      role: { ...defaultRole, status: 'published' },
    });
    await flushPromises();

    expect(wrapper.vm.readOnly).toBe(true);
    expect(wrapper.html()).not.toContain('"governance.accessModeling.patterns.addPattern"');
    expect(wrapper.html()).not.toContain('common.remove');
  });

  it('shows error notification when loading patterns fails', async () => {
    getRoleDataById.mockRejectedValueOnce(new Error('network'));

    factory();
    await flushPromises();

    expect(showErrorMessage).toHaveBeenCalledTimes(1);
  });
});
