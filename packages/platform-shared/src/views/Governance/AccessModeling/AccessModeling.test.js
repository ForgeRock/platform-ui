/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { toHaveNoViolations } from 'jest-axe';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { createAppContainer, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as PermissionsApi from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import * as AccessModelingApi from '@forgerock/platform-shared/src/api/governance/AccessModelingApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import AccessModeling from './AccessModeling';
import i18n from '@/i18n';

expect.extend(toHaveNoViolations);

jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  displayNotification: jest.fn(),
  showErrorMessage: jest.fn(),
}));

const rolesMock = [
  {
    role: {
      description: 'Test role 1',
      id: 'roleId1',
      status: 'candidate',
      name: 'Test Role 1',
      justifications: [],
      entitlements: [
        'entitlementId1',
        'entitlementId2',
        'entitlementId3',
      ],
    },
    permissions: {
      modifyRole: true,
      publishRole: true,
      deleteRole: true,
    },
  },
  {
    role: {
      id: 'roleId2',
      name: 'Test Role 2',
      status: 'candidate',
      roleOwner: 'managed/user/001',
      justifications: [],
    },
    glossary: {
      idx: {
        '/role': {
          roleOwner: 'managed/user/001',
        },
      },
    },
    permissions: {
      modifyRole: true,
      publishRole: true,
      deleteRole: true,
    },
  },
  {
    role: {
      applications: [
        {
          _ref: 'managed/alpha_application/001',
          _refResourceCollection: 'managed/alpha_application',
        },
      ],
      description: 'Test Role 3',
      id: 'roleId3',
      name: 'Test Role 3',
      status: 'candidate',
      justifications: [],
    },
    permissions: {
      modifyRole: true,
      publishRole: true,
      deleteRole: true,
    },
  },
];

AccessModelingApi.getRoleMetrics = jest.fn().mockResolvedValue({
  data: {},
});

AccessModelingApi.getRoleMiningConfig = jest.fn().mockResolvedValue({
  data: {
    roleMiningConfidenceThreshold: 0.85,
    roleMiningEntitlementThreshold: 3,
    roleMiningMembershipThreshold: 5,
  },
});

AccessModelingApi.putRoleMiningConfig = jest.fn().mockResolvedValue({});

PermissionsApi.getPrivileges = jest.fn().mockResolvedValue(({
  data: {
    permissions: [
      'createRole',
      'modifyRole',
      'publishRole',
      'deleteRole',
    ],
  },
}));

RoleApi.getRoleList = jest.fn().mockResolvedValue({
  data: {
    totalHits: 3,
    result: rolesMock,
  },
});

describe('AccessModeling', () => {
  let wrapper;
  let routerPush;

  const app = createAppContainer();
  // Unmount after each test: mounts attach to the shared app container, and leaked DOM
  // accumulates across tests, linearly slowing the axe scans (runA11yTest) down until they
  // exceed the default 5s jest timeout on slower CI machines.
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  function mountComponent(props = {}) {
    routerPush = mockRouter().routerPush;
    wrapper = mount(AccessModeling, {
      attachTo: app,
      global: {
        plugins: [i18n],
        mocks: {
          $store: {
            userId: 'testUserId',
            state: {
              SharedStore: {
                uiConfig: {},
              },
            },
          },
        },
      },
      props: {
        roles: [],
        ...props,
      },
    });
    return wrapper;
  }

  it('queries role metrics on mount', async () => {
    wrapper = mountComponent();
    await flushPromises();
    expect(AccessModelingApi.getRoleMetrics).toHaveBeenCalled();
  });

  it('displays each role in a table row', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const table = wrapper.find('table tbody');
    const rows = wrapper.findAll('table tbody tr');
    expect(table.exists()).toBe(true);
    expect(rows.length).toBe(3);
    expect(rows[0].text()).toContain('Test Role 1');
    expect(rows[1].text()).toContain('Test Role 2');
    expect(rows[2].text()).toContain('Test Role 3');
  });

  it('displays three cards with information on role metrics and role mining job', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const cards = wrapper.findAll('.card.access-card');
    expect(cards.length).toBe(3);
  });

  it('displays a button to launch the role mining job', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const runRoleMiningBtn = wrapper.find('button.btn-primary');
    expect(runRoleMiningBtn.exists()).toBe(true);
    expect(runRoleMiningBtn.text()).toContain('Run Role Mining Job');
  });

  it('navigates to access modeling role details page when clicking a table row', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const rows = wrapper.findAll('table tbody tr');
    rows[0].trigger('click');
    await flushPromises();

    expect(routerPush).toHaveBeenCalledWith({
      name: 'AccessModelingDetails',
      params: {
        roleId: 'roleId1',
        status: 'candidate',
        tab: 'details',
      },
    });
  });

  describe('role mining config', () => {
    afterEach(() => {
      // Reset getRoleMetrics to the default mock after each test in this block
      AccessModelingApi.getRoleMetrics = jest.fn().mockResolvedValue({ data: {} });
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockResolvedValue({
        data: {
          roleMiningConfidenceThreshold: 0.85,
          roleMiningEntitlementThreshold: 3,
          roleMiningMembershipThreshold: 5,
        },
      });
    });

    it('calls getRoleMiningConfig on mount', async () => {
      wrapper = mountComponent();
      await flushPromises();
      expect(AccessModelingApi.getRoleMiningConfig).toHaveBeenCalled();
    });

    it('populates jobInfo threshold fields from the getRoleMiningConfig response', async () => {
      wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.85);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(3);
      expect(wrapper.vm.jobInfo.minimumRoleMembership).toBe(5);
    });

    it('does not overwrite jobInfo threshold values when run_config threshold values are null', async () => {
      AccessModelingApi.getRoleMetrics = jest.fn().mockResolvedValue({
        data: {
          run_config: {
            conf_threshold: null,
            ent_threshold: null,
            freq_threshold: null,
          },
        },
      });
      wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.85);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(3);
      expect(wrapper.vm.jobInfo.minimumRoleMembership).toBe(5);
    });

    it('keeps run_config fallback values when the config resolves later with null for a field', async () => {
      // Metrics resolve first and populate the thresholds from run_config; the late config
      // response only has a value for one field — the null fields must not blank the fallbacks
      AccessModelingApi.getRoleMetrics = jest.fn().mockResolvedValue({
        data: {
          run_id: 'runId1',
          run_config: {
            conf_threshold: 0.9,
            ent_threshold: 4,
            freq_threshold: 6,
          },
        },
      });
      let resolveConfig;
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockImplementation(() => new Promise((resolve) => {
        resolveConfig = resolve;
      }));
      wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.9);

      resolveConfig({
        data: {
          roleMiningConfidenceThreshold: 0.85,
          roleMiningEntitlementThreshold: null,
          roleMiningMembershipThreshold: null,
        },
      });
      await flushPromises();
      // Non-nil config value takes over; null config fields keep the run_config values
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.85);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(4);
      expect(wrapper.vm.jobInfo.minimumRoleMembership).toBe(6);
    });

    it('falls back to run_config for fields the config left null when the config resolves first', async () => {
      // Config resolves with nulls for two fields; the late metrics run_config fills them.
      // This requires the fallback to check field emptiness rather than the config-load flag.
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockResolvedValue({
        data: {
          roleMiningConfidenceThreshold: 0.85,
          roleMiningEntitlementThreshold: null,
          roleMiningMembershipThreshold: null,
        },
      });
      let resolveMetrics;
      AccessModelingApi.getRoleMetrics = jest.fn().mockImplementation(() => new Promise((resolve) => {
        resolveMetrics = resolve;
      }));
      wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.85);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBeNull();

      resolveMetrics({
        data: {
          run_id: 'runId1',
          run_config: {
            conf_threshold: 0.9,
            ent_threshold: 4,
            freq_threshold: 6,
          },
        },
      });
      await flushPromises();
      // Config's non-null value survives; null fields are filled from run_config
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.85);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(4);
      expect(wrapper.vm.jobInfo.minimumRoleMembership).toBe(6);
    });

    it('does not let a late run_config overwrite run_config-derived values shown earlier', async () => {
      // Second metrics resolution (e.g. a refresh) must not stomp previously-shown values
      AccessModelingApi.getRoleMetrics = jest.fn()
        .mockResolvedValueOnce({
          data: {
            run_id: 'runId1',
            run_config: { conf_threshold: 0.9, ent_threshold: 4, freq_threshold: 6 },
          },
        })
        .mockResolvedValueOnce({
          data: {
            run_id: 'runId2',
            run_config: { conf_threshold: 0.95, ent_threshold: 8, freq_threshold: 9 },
          },
        });
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockResolvedValue({
        data: {
          roleMiningConfidenceThreshold: null,
          roleMiningEntitlementThreshold: null,
          roleMiningMembershipThreshold: null,
        },
      });
      wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.9);

      await wrapper.vm.queryRoleMetrics();
      await flushPromises();
      // All three fields were already populated from the first run_config — a second
      // fallback pass must not clobber them, even though the config resolved as null
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.9);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(4);
      expect(wrapper.vm.jobInfo.minimumRoleMembership).toBe(6);
    });

    it('shows a dedicated config error message when getRoleMiningConfig fails', async () => {
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockRejectedValue(new Error('API error'));
      wrapper = mountComponent();
      await flushPromises();
      expect(showErrorMessage).toHaveBeenCalledWith(
        expect.any(Error),
        i18n.global.t('governance.accessModeling.failedGettingRoleMiningConfig'),
      );
    });

    it('disables the inline edit buttons until getRoleMiningConfig succeeds', async () => {
      let resolveConfig;
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockImplementation(() => new Promise((resolve) => {
        resolveConfig = resolve;
      }));
      wrapper = mountComponent();
      await flushPromises();
      const editButtons = wrapper.findAll('.card.access-card')[2].findAll('button.btn-link');
      expect(editButtons.length).toBeGreaterThan(0);
      editButtons.forEach((button) => expect(button.attributes('disabled')).toBeDefined());

      resolveConfig({
        data: {
          roleMiningConfidenceThreshold: 0.85,
          roleMiningEntitlementThreshold: 3,
          roleMiningMembershipThreshold: 5,
        },
      });
      await flushPromises();
      wrapper.findAll('.card.access-card')[2].findAll('button.btn-link')
        .forEach((button) => expect(button.attributes('disabled')).toBeUndefined());
    });

    it('disables the inline edit buttons when getRoleMiningConfig fails', async () => {
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockRejectedValue(new Error('API error'));
      wrapper = mountComponent();
      await flushPromises();
      wrapper.findAll('.card.access-card')[2].findAll('button.btn-link')
        .forEach((button) => expect(button.attributes('disabled')).toBeDefined());
    });

    it('keeps the mining config values when a late-resolving getRoleMetrics has non-null run_config (mount-order race)', async () => {
      // onMounted fires queryRoleMetrics() and loadRoleMiningConfig() concurrently. The mining
      // config is authoritative: a late getRoleMetrics must not clobber values already shown
      // from the config, regardless of resolution order.
      let resolveMetrics;
      AccessModelingApi.getRoleMetrics = jest.fn().mockImplementation(() => new Promise((resolve) => {
        resolveMetrics = resolve;
      }));
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockResolvedValue({
        data: {
          roleMiningConfidenceThreshold: 0.85,
          roleMiningEntitlementThreshold: 3,
          roleMiningMembershipThreshold: 5,
        },
      });
      wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.85);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(3);
      expect(wrapper.vm.jobInfo.minimumRoleMembership).toBe(5);

      resolveMetrics({
        data: {
          run_id: 'runId1',
          run_config: {
            conf_threshold: 0.9,
            ent_threshold: 4,
            freq_threshold: 6,
          },
        },
      });
      await flushPromises();
      // Config values survive the late metrics resolution; runId still updates
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.85);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(3);
      expect(wrapper.vm.jobInfo.minimumRoleMembership).toBe(5);
      expect(wrapper.vm.jobInfo.runId).toBe('runId1');
    });

    it('uses run_config thresholds as a fallback when they resolve before the mining config', async () => {
      let resolveConfig;
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockImplementation(() => new Promise((resolve) => {
        resolveConfig = resolve;
      }));
      AccessModelingApi.getRoleMetrics = jest.fn().mockResolvedValue({
        data: {
          run_id: 'runId1',
          run_config: {
            conf_threshold: 0.9,
            ent_threshold: 4,
            freq_threshold: 6,
          },
        },
      });
      wrapper = mountComponent();
      await flushPromises();
      // Config load still pending: run_config values are shown
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.9);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(4);
      expect(wrapper.vm.jobInfo.minimumRoleMembership).toBe(6);

      resolveConfig({
        data: {
          roleMiningConfidenceThreshold: 0.85,
          roleMiningEntitlementThreshold: 3,
          roleMiningMembershipThreshold: 5,
        },
      });
      await flushPromises();
      // Config resolves and takes over
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.85);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(3);
      expect(wrapper.vm.jobInfo.minimumRoleMembership).toBe(5);
    });

    it('shows run_config thresholds when the mining config load fails', async () => {
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockRejectedValue(new Error('API error'));
      AccessModelingApi.getRoleMetrics = jest.fn().mockResolvedValue({
        data: {
          run_id: 'runId1',
          run_config: {
            conf_threshold: 0.9,
            ent_threshold: 4,
            freq_threshold: 6,
          },
        },
      });
      wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.9);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(4);
      expect(wrapper.vm.jobInfo.minimumRoleMembership).toBe(6);
    });
  });

  describe('inline editing', () => {
    beforeEach(() => {
      AccessModelingApi.putRoleMiningConfig = jest.fn().mockResolvedValue({});
      // Reset the config mock so tests that override it with nulls don't leak into this block
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockResolvedValue({
        data: {
          roleMiningConfidenceThreshold: 0.85,
          roleMiningEntitlementThreshold: 3,
          roleMiningMembershipThreshold: 5,
        },
      });
    });

    afterEach(() => {
      AccessModelingApi.putRoleMiningConfig = jest.fn().mockResolvedValue({});
    });

    it('startEdit sets editingField and editValue and clears editError', async () => {
      wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.startEdit('confidenceThreshold', 0.85);
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.editingField).toBe('confidenceThreshold');
      expect(wrapper.vm.editValue).toBe(0.85);
      expect(wrapper.vm.editError).toBeNull();
    });

    it('cancelEdit clears editingField, editValue, and editError', async () => {
      wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.startEdit('confidenceThreshold', 0.85);
      wrapper.vm.cancelEdit();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.editingField).toBeNull();
      expect(wrapper.vm.editValue).toBeNull();
      expect(wrapper.vm.editError).toBeNull();
    });

    it('blocks a second save while a threshold PUT is in flight', async () => {
      let resolvePut;
      AccessModelingApi.putRoleMiningConfig = jest.fn().mockImplementation(() => new Promise((resolve) => {
        resolvePut = resolve;
      }));
      wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.startEdit('entitlementsThreshold', 7);
      wrapper.vm.saveEdit('entitlementsThreshold');
      await flushPromises();
      expect(AccessModelingApi.putRoleMiningConfig).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.isSavingThreshold).toBe(true);

      // The first PUT is still pending: a second save, a new edit, and a cancel are all ignored
      wrapper.vm.editValue = 0.5;
      wrapper.vm.saveEdit('entitlementsThreshold');
      wrapper.vm.startEdit('minimumRoleMembership', 5);
      wrapper.vm.cancelEdit();
      await wrapper.vm.$nextTick();
      expect(AccessModelingApi.putRoleMiningConfig).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.editingField).toBeNull();

      resolvePut();
      await flushPromises();
      expect(wrapper.vm.isSavingThreshold).toBe(false);
      // Editing works again once the PUT resolves
      wrapper.vm.startEdit('confidenceThreshold', 0.85);
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.editingField).toBe('confidenceThreshold');
    });

    it('re-enables editing after a failed PUT and restores the original value', async () => {
      AccessModelingApi.putRoleMiningConfig = jest.fn().mockRejectedValue(new Error('API error'));
      wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.startEdit('entitlementsThreshold', 7);
      wrapper.vm.saveEdit('entitlementsThreshold');
      await flushPromises();
      expect(wrapper.vm.isSavingThreshold).toBe(false);
      expect(wrapper.vm.jobInfo.entitlementsThreshold).toBe(3); // rolled back
      wrapper.vm.startEdit('confidenceThreshold', 0.85);
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.editingField).toBe('confidenceThreshold');
    });

    it('saveEdit sets editError and does not call putRoleMiningConfig when confidenceThreshold is out of range', async () => {
      wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.startEdit('confidenceThreshold', 1.5); // outside 0.01-1 range
      await wrapper.vm.saveEdit('confidenceThreshold');
      expect(wrapper.vm.editError).not.toBeNull();
      expect(AccessModelingApi.putRoleMiningConfig).not.toHaveBeenCalled();
    });

    it('saveEdit sets editError and does not call putRoleMiningConfig when an integer field is invalid', async () => {
      wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.startEdit('entitlementsThreshold', 0); // must be integer > 0
      await wrapper.vm.saveEdit('entitlementsThreshold');
      expect(wrapper.vm.editError).not.toBeNull();
      expect(AccessModelingApi.putRoleMiningConfig).not.toHaveBeenCalled();
    });

    it('saveEdit calls putRoleMiningConfig with all three threshold values on a valid save', async () => {
      wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.startEdit('confidenceThreshold', 0.5);
      await wrapper.vm.saveEdit('confidenceThreshold');
      await flushPromises();
      expect(AccessModelingApi.putRoleMiningConfig).toHaveBeenCalledWith({
        roleMiningConfidenceThreshold: 0.5,
        roleMiningMembershipThreshold: 5,
        roleMiningEntitlementThreshold: 3,
      });
    });

    it('saveEdit omits unloaded (null) thresholds from the payload instead of sending Number(null) = 0', async () => {
      AccessModelingApi.getRoleMiningConfig = jest.fn().mockResolvedValue({
        data: {
          roleMiningConfidenceThreshold: 0.85,
          roleMiningEntitlementThreshold: null,
          roleMiningMembershipThreshold: null,
        },
      });
      wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.startEdit('confidenceThreshold', 0.5);
      await wrapper.vm.saveEdit('confidenceThreshold');
      await flushPromises();
      expect(AccessModelingApi.putRoleMiningConfig).toHaveBeenCalledWith({
        roleMiningConfidenceThreshold: 0.5,
        // membership/entitlement omitted — a 0 would clobber the stored values
        // (Number(null) === 0) and 0 is invalid for every threshold field
      });
    });

    it('saveEdit restores the original jobInfo value and shows a dedicated config error message when the API call fails', async () => {
      AccessModelingApi.putRoleMiningConfig = jest.fn().mockRejectedValue(new Error('API error'));
      wrapper = mountComponent();
      await flushPromises();
      const originalValue = wrapper.vm.jobInfo.confidenceThreshold; // 0.85
      wrapper.vm.startEdit('confidenceThreshold', 0.5);
      await wrapper.vm.saveEdit('confidenceThreshold');
      await flushPromises();
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(originalValue);
      expect(showErrorMessage).toHaveBeenCalledWith(
        expect.any(Error),
        i18n.global.t('governance.accessModeling.failedSavingRoleMiningConfig'),
      );
    });
  });

  describe('inline editing template wiring', () => {
    beforeEach(() => {
      AccessModelingApi.putRoleMiningConfig = jest.fn().mockResolvedValue({});
    });

    afterEach(() => {
      AccessModelingApi.putRoleMiningConfig = jest.fn().mockResolvedValue({});
    });

    /**
     * Find the jobInfo card row for a given setting label.
     * @param {Object} vueWrapper - The mounted wrapper.
     * @param {String} label - The i18n label rendered in the row.
     * @returns {Object} DOMWrapper for the row element.
     */
    function findJobInfoRow(vueWrapper, label) {
      const jobInfoCard = vueWrapper.findAll('.card.access-card')[2];
      return jobInfoCard
        .findAll('.d-flex.justify-content-between.mb-1')
        .find((row) => row.text().includes(label));
    }

    /**
     * Enter edit mode on a jobInfo row by clicking its rendered edit button.
     * @param {Object} vueWrapper - The mounted wrapper.
     * @param {String} label - The i18n label rendered in the row.
     * @returns {Object} DOMWrapper for the row element, in edit mode.
     */
    async function enterEditMode(vueWrapper, label) {
      const row = findJobInfoRow(vueWrapper, label);
      await row.find('button').trigger('click');
      return row;
    }

    it('clicking the edit button enters edit mode with the current value in the input', async () => {
      wrapper = mountComponent();
      await flushPromises();
      const row = await enterEditMode(wrapper, 'Confidence Threshold');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.editingField).toBe('confidenceThreshold');
      const input = row.find('input');
      expect(input.exists()).toBe(true);
      expect(input.element.value).toBe('0.85');
      expect(input.attributes('aria-label')).toBe('Confidence Threshold');
    });

    it('renders icon-only save and cancel buttons with accessible names in edit mode', async () => {
      wrapper = mountComponent();
      await flushPromises();
      const row = await enterEditMode(wrapper, 'Confidence Threshold');
      const buttons = row.findAll('button');
      // In edit mode the row renders the input plus two buttons: check (save), then close (cancel)
      expect(buttons.length).toBe(2);
      expect(buttons[0].attributes('aria-label')).toBe('Save');
      expect(buttons[1].attributes('aria-label')).toBe('Cancel');
    });

    it('renders the edit button with an accessible name in read mode', async () => {
      wrapper = mountComponent();
      await flushPromises();
      const row = findJobInfoRow(wrapper, 'Confidence Threshold');
      const editButton = row.find('button');
      expect(editButton.exists()).toBe(true);
      expect(editButton.attributes('aria-label')).toBe('Edit');
    });

    it('constrains the confidence input to the 0.01-1 decimal range and the integer inputs to step 1 from 1', async () => {
      wrapper = mountComponent();
      await flushPromises();

      const confidenceRow = await enterEditMode(wrapper, 'Confidence Threshold');
      const confidenceInput = confidenceRow.find('input');
      expect(confidenceInput.attributes('min')).toBe('0.01');
      expect(confidenceInput.attributes('max')).toBe('1');
      expect(confidenceInput.attributes('step')).toBe('0.01');

      // Leave edit mode via cancel before switching fields
      await confidenceRow.findAll('button')[1].trigger('click');

      const entitlementsInput = (await enterEditMode(wrapper, 'Entitlements Threshold')).find('input');
      expect(entitlementsInput.attributes('min')).toBe('1');
      expect(entitlementsInput.attributes('max')).toBeUndefined();
      expect(entitlementsInput.attributes('step')).toBe('1');
    });

    it('clicking the check button saves the rendered input value', async () => {
      wrapper = mountComponent();
      await flushPromises();
      const row = await enterEditMode(wrapper, 'Confidence Threshold');
      await row.find('input').setValue('0.5');
      // In edit mode the row has two buttons: check (save) then close (cancel)
      await row.findAll('button')[0].trigger('click');
      await flushPromises();
      expect(AccessModelingApi.putRoleMiningConfig).toHaveBeenCalledWith({
        roleMiningConfidenceThreshold: 0.5,
        roleMiningMembershipThreshold: 5,
        roleMiningEntitlementThreshold: 3,
      });
      expect(wrapper.vm.editingField).toBeNull();
      expect(row.find('input').exists()).toBe(false);
    });

    it('stores a number in jobInfo after a template-driven save, not the input\'s raw string', async () => {
      wrapper = mountComponent();
      await flushPromises();
      const row = await enterEditMode(wrapper, 'Entitlements Threshold');
      await row.find('input').setValue('7');
      await row.findAll('button')[0].trigger('click');
      await flushPromises();
      const stored = wrapper.vm.jobInfo.entitlementsThreshold;
      expect(stored).toBe(7);
      expect(stored).toEqual(expect.any(Number));
      // Read mode renders the numeric value
      expect(row.text()).toContain('7');
    });

    it('shows invalid state and error text after a failed save, and typing clears the error via @input', async () => {
      wrapper = mountComponent();
      await flushPromises();
      const row = await enterEditMode(wrapper, 'Confidence Threshold');
      await row.find('input').setValue('1.5');
      await row.findAll('button')[0].trigger('click'); // check: fails 0.01-1 validation
      expect(wrapper.vm.editError).not.toBeNull();
      const input = row.find('input');
      expect(input.classes()).toContain('is-invalid');
      expect(input.attributes('aria-invalid')).toBe('true');
      expect(input.attributes('aria-describedby')).toBe('jobInfo-confidenceThreshold-edit-error');
      const error = row.find('small[role="alert"]');
      expect(error.exists()).toBe(true);
      expect(error.attributes('id')).toBe('jobInfo-confidenceThreshold-edit-error');
      expect(error.text()).toContain('Confidence threshold must be between 0.01 and 1');
      // Input stays open after a failed save
      expect(row.find('input').exists()).toBe(true);

      // Typing in the input clears the error (template @input="editError = null")
      await row.find('input').setValue('0.5');
      expect(wrapper.vm.editError).toBeNull();
      expect(row.find('input').classes()).not.toContain('is-invalid');
      expect(row.find('input').attributes('aria-describedby')).toBeUndefined();
      expect(row.text()).not.toContain('Confidence threshold must be between 0.01 and 1');
    });

    it('clicking the close button cancels the edit and leaves the value unchanged', async () => {
      wrapper = mountComponent();
      await flushPromises();
      const row = await enterEditMode(wrapper, 'Confidence Threshold');
      await row.find('input').setValue('0.2');
      await row.findAll('button')[1].trigger('click'); // close (cancel)
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.editingField).toBeNull();
      expect(wrapper.vm.jobInfo.confidenceThreshold).toBe(0.85);
      expect(AccessModelingApi.putRoleMiningConfig).not.toHaveBeenCalled();
      expect(row.text()).toContain('0.85');
    });
  });

  it('does not have accessibility violations', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    await runA11yTest(wrapper);
  });

  it('edit mode does not have accessibility violations', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const jobInfoCard = wrapper.findAll('.card.access-card')[2];
    const confidenceRow = jobInfoCard
      .findAll('.d-flex.justify-content-between.mb-1')
      .find((row) => row.text().includes('Confidence Threshold'));
    await confidenceRow.find('button').trigger('click');
    // The edit input follows the FrBasicInput number-field pattern: type="text" + inputmode,
    // not type="number" (spinner buttons / browser validation quirks hurt a11y)
    const editInput = wrapper.find('input[aria-label]');
    expect(editInput.attributes('type')).toBe('text');
    expect(editInput.attributes('inputmode')).toBe('decimal');
    await runA11yTest(wrapper);
  });
});
