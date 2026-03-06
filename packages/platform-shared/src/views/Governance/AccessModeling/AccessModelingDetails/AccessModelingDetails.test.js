/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import AccessModelingDetails from './AccessModelingDetails';

const mockPush = jest.fn();
const mockSetBreadcrumb = jest.fn();

const mockRoute = {
  params: {
    roleId: 'role-1',
    status: 'draft',
    tab: 'details',
  },
};

jest.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@forgerock/platform-shared/src/composables/breadcrumb', () => ({
  __esModule: true,
  default: () => ({ setBreadcrumb: mockSetBreadcrumb }),
}));

const mockGetSchema = jest.fn();
jest.mock('@forgerock/platform-shared/src/api/SchemaApi', () => ({
  getSchema: (...args) => mockGetSchema(...args),
}));

const mockGetGlossarySchema = jest.fn();
jest.mock('@forgerock/platform-shared/src/utils/governance/glossary', () => ({
  getGlossarySchema: (...args) => mockGetGlossarySchema(...args),
}));

const mockGetFilterSchema = jest.fn();
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi', () => ({
  getFilterSchema: (...args) => mockGetFilterSchema(...args),
}));

const mockGetRoleDataById = jest.fn();
const mockGetRoleList = jest.fn();
const mockDeleteRole = jest.fn();
const mockCreateRole = jest.fn();
const mockModifyRole = jest.fn();
const mockGetMemberDistribution = jest.fn();

jest.mock('@forgerock/platform-shared/src/api/governance/RoleApi', () => ({
  getRoleDataById: (...args) => mockGetRoleDataById(...args),
  getRoleList: (...args) => mockGetRoleList(...args),
  deleteRole: (...args) => mockDeleteRole(...args),
  createRole: (...args) => mockCreateRole(...args),
  modifyRole: (...args) => mockModifyRole(...args),
  getMemberDistribution: (...args) => mockGetMemberDistribution(...args),
}));

const mockRequestAction = jest.fn();
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi', () => ({
  requestAction: (...args) => mockRequestAction(...args),
}));

const mockDownloadFile = jest.fn();
jest.mock('@forgerock/platform-shared/src/utils/downloadFile', () => ({
  downloadFile: (...args) => mockDownloadFile(...args),
}));

const mockDisplayNotification = jest.fn();
const mockShowErrorMessage = jest.fn();
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  displayNotification: (...args) => mockDisplayNotification(...args),
  showErrorMessage: (...args) => mockShowErrorMessage(...args),
}));

jest.mock('@forgerock/platform-shared/src/utils/governance/accessModeling', () => ({
  getRoleStatusVariant: () => 'primary',
  getRoleDateText: () => '2025-01-01',
}));

const baseRoleResponse = {
  role: {
    id: 'role-1',
    roleId: 'role-1',
    name: 'Finance Role',
    description: 'desc',
    status: 'draft',
    metadata: { modifiedDate: '2025-01-01' },
    memberCount: 10,
    totalSystemUsers: 20,
    confidence: 0.75,
    entitlementCount: 2,
    entitlements: ['e1'],
    addedRoleMembers: ['u1'],
    candidateRoleId: '',
    justifications: [],
  },
  glossary: {
    idx: {
      '/role': { category: 'finance' },
    },
  },
};

async function mountComponent(roleOverride = {}) {
  const mergedRole = {
    ...baseRoleResponse,
    ...roleOverride,
    role: {
      ...baseRoleResponse.role,
      ...(roleOverride.role || {}),
    },
    glossary: roleOverride.glossary || baseRoleResponse.glossary,
  };

  mockGetFilterSchema.mockResolvedValue({
    data: {
      user: [
        { key: 'department', displayName: 'Department' },
        { key: 'location', displayName: 'Location' },
      ],
    },
  });

  mockGetGlossarySchema.mockResolvedValue({ data: { properties: {} } });
  mockGetSchema.mockResolvedValue({ data: { properties: { name: { type: 'string' } } } });

  mockGetRoleDataById.mockImplementation((roleId, status, section, params = {}) => {
    if (section === 'entitlements') {
      return Promise.resolve({
        data: { result: [{ id: 'e1', descriptor: { idx: { '/entitlement': { displayName: 'Ent 1' } } } }], totalCount: 1 },
      });
    }
    if (section === 'members') {
      if (params._pageSize === 0) {
        return Promise.resolve({ data: { totalHits: 25, result: [] } });
      }
      return Promise.resolve({
        data: { result: [{ id: 'u1', userName: 'jdoe' }], totalHits: 1 },
      });
    }
    return Promise.resolve({ data: mergedRole });
  });

  mockGetMemberDistribution.mockResolvedValue({
    data: {
      memberProperties: ['department'],
      distribution: {
        department: [{ key: 'IT', count: 1 }],
      },
    },
  });

  mockGetRoleList.mockResolvedValue({ data: { result: [] } });
  mockDeleteRole.mockResolvedValue({});
  mockCreateRole.mockResolvedValue({ data: { role: { id: 'new-role-22' } } });
  mockModifyRole.mockResolvedValue({});
  mockRequestAction.mockResolvedValue({ data: { id: 'req-1' } });

  const wrapper = shallowMount(AccessModelingDetails, {
    global: {
      stubs: {
        FrHeader: true,
        FrSpinner: true,
        FrIcon: true,
        FrSearchInput: true,
        FrEntitlementModal: true,
        FrDetailsTab: true,
        FrEntitlementsTab: true,
        FrMembersTab: true,
        FrListOrganizer: true,
        FrCircleProgressBar: true,
        FrDeleteModal: true,
        FrRequestSubmitSuccessModal: true,
        FrAccessPatterns: true,
        FrRecommendations: true,
        FrField: true,
        BBadge: true,
      },
    },
  });

  await flushPromises();
  return wrapper;
}

describe('AccessModelingDetails.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoute.params = { roleId: 'role-1', status: 'draft', tab: 'details' };
  });

  it('loads required data on mount', async () => {
    await mountComponent();

    expect(mockGetFilterSchema).toHaveBeenCalledTimes(1);
    expect(mockGetGlossarySchema).toHaveBeenCalledWith('role');
    expect(mockGetGlossarySchema).toHaveBeenCalledWith('assignment');
    expect(mockGetSchema).toHaveBeenCalledWith('managed/alpha_role');
    expect(mockGetRoleDataById).toHaveBeenCalledWith('role-1', 'draft');
    expect(mockGetMemberDistribution).toHaveBeenCalledWith('role-1', 'draft');
  });

  it('exports role json with expected file metadata', async () => {
    const wrapper = await mountComponent();

    wrapper.vm.downloadRole();

    expect(mockDownloadFile).toHaveBeenCalledTimes(1);
    const [content, mime, filename] = mockDownloadFile.mock.calls[0];
    expect(mime).toBe('application/json');
    expect(filename).toBe('role-Finance Role.json');
    expect(content).toContain('"name": "Finance Role"');
  });

  it('saves role updates through modifyRole', async () => {
    const wrapper = await mountComponent();

    await wrapper.vm.saveRole();
    await flushPromises();

    expect(mockModifyRole).toHaveBeenCalledTimes(1);
    expect(mockModifyRole).toHaveBeenCalledWith(
      'role-1',
      'draft',
      expect.objectContaining({
        role: expect.objectContaining({
          id: 'role-1',
          name: 'Finance Role',
          entitlements: ['e1'],
        }),
        glossary: expect.any(Object),
      }),
    );
    expect(mockDisplayNotification).toHaveBeenCalled();
  });

  it('publishes role through requestAction', async () => {
    const wrapper = await mountComponent();

    await wrapper.vm.publishRole();
    await flushPromises();

    expect(mockRequestAction).toHaveBeenCalledWith(
      'publishRole',
      'publish',
      null,
      expect.objectContaining({
        role: expect.objectContaining({
          roleId: 'role-1',
          status: 'draft',
        }),
      }),
    );
  });

  it('creates draft role and redirects to new role details', async () => {
    const wrapper = await mountComponent({
      role: { status: 'candidate' },
    });

    await wrapper.vm.createDraftRole();
    await flushPromises();

    expect(mockCreateRole).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      name: 'AccessModelingDetails',
      params: {
        status: 'draft',
        roleId: 'new-role-22',
        tab: 'details',
      },
    });
  });

  it('deletes role and routes to AccessModeling list', async () => {
    const wrapper = await mountComponent();

    await wrapper.vm.deleteItem();
    await flushPromises();

    expect(mockDeleteRole).toHaveBeenCalledWith('role-1', 'draft');
    expect(mockPush).toHaveBeenCalledWith({ name: 'AccessModeling' });
  });

  it('updates entitlement relationships and persists deduplicated entitlements', async () => {
    const wrapper = await mountComponent();

    await wrapper.vm.updateRoleRelationships('entitlements', 'add', [{ id: 'e1' }, { id: 'e2' }]);
    await flushPromises();

    expect(mockModifyRole).toHaveBeenCalled();
    const payload = mockModifyRole.mock.calls[0][2];
    expect(payload.role.entitlements.sort()).toEqual(['e1', 'e2']);
  });

  it('updates member relationships and persists added members', async () => {
    const wrapper = await mountComponent();

    await wrapper.vm.updateRoleRelationships('members', 'add', [{ id: 'u1' }, { id: 'u2' }]);
    await flushPromises();

    expect(mockModifyRole).toHaveBeenCalled();
    const payload = mockModifyRole.mock.calls[0][2];
    expect(payload.role.addedRoleMembers.sort()).toEqual(['u1', 'u2']);
  });
});
