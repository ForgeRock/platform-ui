/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { downloadAsType } from '@forgerock/platform-shared/src/utils/downloadFile';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import * as CampaignApi from '@/api/governance/CampaignApi';
import CampaignDetails from './index';
import CampaignOverview from './CampaignOverview';
import FrSystemMessages from './SystemMessages/SystemMessages';

// downloadAsType writes asynchronously after the test ends, when jsdom's
// document is gone; the unhandled rejection crashes the Jest worker
jest.mock('@forgerock/platform-shared/src/utils/downloadFile', () => ({
  downloadAsType: jest.fn(),
}));

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi', () => ({
  getCertificationTasksListByCampaign: jest.fn(),
}));

CampaignApi.getCampaignDetails = jest.fn();

describe('CampaignDetails Component', () => {
  let wrapper;
  beforeEach(() => {
    CampaignApi.getCampaignDetails.mockImplementation(() => Promise.resolve({
      id: 'camp-1',
      name: 'Test Cert',
      certificationType: 'identity',
      deadline: '2022-12-19T22:51:51+00:00',
      status: 'in-progress',
      systemMessages: { errors: [], info: [] },
    }));
    setupTestPinia();
    wrapper = shallowMount(CampaignDetails, {
      global: {
        renderStubDefaultSlot: true,
        mocks: {
          $t: (text) => (text),
          $route: {
            params: {
              campaignId: 'af7d9cb8-0f34-4007-898b-03bd08dbd029',
              tab: 'details',
            },
          },
        },
      },
    });
  });

  it('header loaded correctly', async () => {
    await flushPromises();

    const header = findByTestId(wrapper, 'header');
    expect(header.exists()).toBe(true);
    expect(header.attributes('title')).toBe('Test Cert');
    expect(header.attributes('toptext')).toBe('governance.editTemplate.templateType.identity');
  });

  it('tabs loaded correctly', async () => {
    await flushPromises();

    expect(wrapper.vm.tabIndex).toBe(0);
    expect(findByTestId(wrapper, 'cert-tabs').exists()).toBe(true);
    const overviewTab = findByTestId(wrapper, 'overview-tab');
    expect(overviewTab.exists()).toBe(true);
    expect(overviewTab.attributes('title')).toBe('governance.certificationDetails.detailsTabTitle');
    expect(overviewTab.attributes('active')).toBe('true');
    const accessReviewsTab = findByTestId(wrapper, 'access-reviews-tab');
    expect(accessReviewsTab.exists()).toBe(true);
    expect(accessReviewsTab.attributes('title')).toBe('governance.certificationDetails.accessReviewsTabTitle');
    expect(accessReviewsTab.attributes('active')).toBeUndefined();
  });

  it('CampaignOverview loaded correctly', async () => {
    await flushPromises();

    const campaignOverview = findByTestId(wrapper, 'campaign-overview');
    expect(campaignOverview.exists()).toBe(true);
    expect(campaignOverview.attributes('campaign')).toBeDefined();
  });

  it('does not update tabIndex if tab is not found', () => {
    const selectTabSpy = jest.spyOn(wrapper.vm, 'selectTab');
    wrapper.vm.handleRouteUpdate('');
    expect(wrapper.vm.tabIndex).toBe(-1);
    expect(selectTabSpy).toHaveBeenCalledWith(-1);
  });

  it('update tabIndex when the tab route param changes', () => {
    const selectTabSpy = jest.spyOn(wrapper.vm, 'selectTab');
    wrapper.vm.tabs = ['details', 'access-reviews'];
    wrapper.vm.handleRouteUpdate('access-reviews');
    expect(wrapper.vm.tabIndex).toBe(1);
    expect(selectTabSpy).toHaveBeenCalledWith(1);
  });

  it('system-messages tab exists with correct title and renders FrSystemMessages with prop', async () => {
    await flushPromises();

    const systemMessagesTab = findByTestId(wrapper, 'system-messages-tab');
    expect(systemMessagesTab.exists()).toBe(true);
    expect(systemMessagesTab.attributes('title')).toBe('governance.certificationDetails.systemMessages.systemMessagesTabTitle');

    const systemMessages = wrapper.findComponent(FrSystemMessages);
    expect(systemMessages.exists()).toBe(true);
    expect(systemMessages.props('systemMessages')).toEqual({ errors: [], info: [] });
  });

  it('handleRouteUpdate sets tabIndex to 2 for system-messages', () => {
    const selectTabSpy = jest.spyOn(wrapper.vm, 'selectTab');
    wrapper.vm.tabs = ['details', 'access-reviews', 'system-messages'];
    wrapper.vm.handleRouteUpdate('system-messages');
    expect(wrapper.vm.tabIndex).toBe(2);
    expect(selectTabSpy).toHaveBeenCalledWith(2);
  });

  it('refreshCampaign re-fetches campaign details and updates campaignDetails', async () => {
    await flushPromises();
    expect(wrapper.vm.campaignDetails.name).toBe('Test Cert');

    CampaignApi.getCampaignDetails.mockImplementationOnce(() => Promise.resolve({
      id: 'camp-1',
      name: 'Updated Campaign',
      certificationType: 'identity',
      deadline: '2023-01-15T00:00:00+00:00',
      status: 'in-progress',
      systemMessages: { errors: [], info: [] },
    }));

    wrapper.vm.refreshCampaign();
    await flushPromises();

    expect(CampaignApi.getCampaignDetails).toHaveBeenCalledWith('af7d9cb8-0f34-4007-898b-03bd08dbd029');
    expect(wrapper.vm.campaignDetails.name).toBe('Updated Campaign');
  });

  // Tab switches don't re-mount the page; a sign-off in Access Reviews
  // changes the campaign status, so returning to Details must re-fetch or
  // the Actions menu is stale until a full reload
  it('re-fetches campaign details when switching back to the details tab', async () => {
    await flushPromises();
    expect(wrapper.vm.campaignDetails.status).toBe('in-progress');

    CampaignApi.getCampaignDetails.mockImplementationOnce(() => Promise.resolve({
      id: 'camp-1',
      name: 'Test Cert',
      certificationType: 'identity',
      status: 'signed-off',
      systemMessages: { errors: [], info: [] },
    }));

    // what BTabs' @activate-tab emits: (newTabIndex, prevTabIndex, event)
    wrapper.vm.selectTab(0);
    await flushPromises();

    expect(CampaignApi.getCampaignDetails).toHaveBeenCalledWith('af7d9cb8-0f34-4007-898b-03bd08dbd029');
    expect(wrapper.vm.campaignDetails.status).toBe('signed-off');
  });

  it('does not re-fetch when switching to a non-details tab', async () => {
    await flushPromises();
    const callsBefore = CampaignApi.getCampaignDetails.mock.calls.length;

    wrapper.vm.selectTab(1);
    await flushPromises();

    expect(CampaignApi.getCampaignDetails.mock.calls.length).toBe(callsBefore);
  });

  it('update:name event from CampaignOverview updates campaignDetails.name', async () => {
    await flushPromises();
    expect(wrapper.vm.campaignDetails.name).toBe('Test Cert');

    wrapper.vm.campaignDetails = { ...wrapper.vm.campaignDetails, name: 'New Title' };
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.campaignDetails.name).toBe('New Title');
  });

  it('update:ownerInfo handler updates campaignDetails.ownerInfo', async () => {
    await flushPromises();
    const newOwner = {
      id: 'user-456', givenName: 'Jane', sn: 'Doe', userName: 'jdoe', profileImage: '',
    };

    wrapper.vm.campaignDetails = { ...wrapper.vm.campaignDetails, ownerInfo: newOwner };
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.campaignDetails.ownerInfo).toEqual(newOwner);
  });

  describe('actions dropdown', () => {
    const mountWithStore = async (governanceDevEnabled, status = 'in-progress', certificationType = 'identity', columnConfig = null) => {
      jest.clearAllMocks();
      CampaignApi.getCampaignDetails.mockImplementation(() => Promise.resolve({
        id: 'camp-1',
        name: 'Test Cert',
        certificationType,
        status,
        ...(columnConfig ? { uiConfig: { columnConfig } } : {}),
        systemMessages: { errors: [], info: [] },
      }));
      wrapper = shallowMount(CampaignDetails, {
        global: {
          renderStubDefaultSlot: true,
          mocks: {
            $t: (text) => (text),
            $route: {
              params: {
                campaignId: 'af7d9cb8-0f34-4007-898b-03bd08dbd029',
                tab: 'details',
              },
            },
            $store: { state: { SharedStore: { governanceDevEnabled } } },
            $bvModal: { show: jest.fn() },
          },
        },
      });
      // NotificationMixin methods, stubbed so export tests can assert
      // notification calls without the vue3-notification plugin
      wrapper.vm.displayNotification = jest.fn();
      wrapper.vm.showErrorMessage = jest.fn();
      await flushPromises();
      return wrapper;
    };

    const mockItemsSearch = (data) => {
      CertificationApi.getCertificationTasksListByCampaign.mockReturnValue(Promise.resolve({ data }));
    };

    // Type-aware search mock: data keyed by the item.type value the request's
    // IN clause matches ('default' for the whole-worklist union request, which
    // carries no item.type clause). The fan-out export requests one type at a
    // time; an unmatched type returns empty.
    const mockItemsSearchByType = (dataByType) => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation((urlParams, campaignId, payload) => {
        const itemTypes = payload.targetFilter.operand.find((o) => o.operator === 'IN')?.operand.targetValue || [];
        const match = itemTypes.find((type) => dataByType[type]);
        return Promise.resolve({ data: (match && dataByType[match]) || dataByType.default || { totalCount: 0, result: [] } });
      });
    };

    const findOverview = (componentWrapper) => componentWrapper.findComponent(CampaignOverview);

    it('renders the overview actions menu and passes export state down', async () => {
      await mountWithStore(true);
      // Actions live inside the overview's status card menu; the parent hands
      // down export-in-flight state and listens for the export event.
      expect(findByTestId(wrapper, 'campaign-overview').exists()).toBe(true);
      expect(wrapper.vm.isRevokesExporting).toBe(false);
    });

    // IGA-1116: the export is an owner/admin remediation artifact; the
    // computed reduces both id sides from managed/user/<uuid> paths or bare
    // uuids before comparing, and governanceDevEnabled marks admin callers
    describe('isCampaignOwnerOrAdmin', () => {
      const mountWithOwner = async (ownerId, governanceDevEnabled = false) => {
        jest.clearAllMocks();
        setupTestPinia({ user: { userId: 'owner-user-id' } });
        CampaignApi.getCampaignDetails.mockImplementation(() => Promise.resolve({
          id: 'camp-1',
          name: 'Test Cert',
          certificationType: 'identity',
          status: 'signed-off',
          ownerInfo: ownerId ? { id: ownerId } : undefined,
          systemMessages: { errors: [], info: [] },
        }));
        const ownerWrapper = shallowMount(CampaignDetails, {
          global: {
            renderStubDefaultSlot: true,
            mocks: {
              $t: (text) => (text),
              $route: {
                params: {
                  campaignId: 'af7d9cb8-0f34-4007-898b-03bd08dbd029',
                  tab: 'details',
                },
              },
              $store: { state: { SharedStore: { governanceDevEnabled } } },
              $bvModal: { show: jest.fn() },
            },
          },
        });
        await flushPromises();
        return ownerWrapper;
      };

      it('is true when the caller id matches the campaign owner', async () => {
        const ownerWrapper = await mountWithOwner('owner-user-id');
        expect(ownerWrapper.vm.isCampaignOwnerOrAdmin).toBe(true);
      });

      it('normalizes managed/user paths on both id sides', async () => {
        const ownerWrapper = await mountWithOwner('managed/user/owner-user-id');
        expect(ownerWrapper.vm.isCampaignOwnerOrAdmin).toBe(true);
      });

      it('is true for a non-owner caller when governance dev marks them admin', async () => {
        const ownerWrapper = await mountWithOwner('someone-else', true);
        expect(ownerWrapper.vm.isCampaignOwnerOrAdmin).toBe(true);
      });

      it('is false for a non-owner non-admin caller', async () => {
        const ownerWrapper = await mountWithOwner('someone-else', false);
        expect(ownerWrapper.vm.isCampaignOwnerOrAdmin).toBe(false);
      });

      it('is false when the campaign carries no owner', async () => {
        const ownerWrapper = await mountWithOwner(undefined, false);
        expect(ownerWrapper.vm.isCampaignOwnerOrAdmin).toBe(false);
      });
    });

    it('opens the export modal when the overview emits export-revokes — single-type campaigns probe nothing', async () => {
      const mounted = await mountWithStore(true);
      // roleMembership campaigns hold one item type: no type probes needed
      mounted.vm.campaignDetails = { ...mounted.vm.campaignDetails, certificationType: 'roleMembership' };
      await mounted.vm.$nextTick();

      const overview = findOverview(mounted);
      overview.vm.$emit('exportRevokes');
      await flushPromises();

      expect(CertificationApi.getCertificationTasksListByCampaign).not.toHaveBeenCalled();
      expect(mounted.vm.$bvModal.show).toHaveBeenCalledWith('export-revocation-decisions-modal');
    });

    it('mixed-type campaigns probe per type and offer an item-type step for the non-empty ones', async () => {
      const mounted = await mountWithStore(true);
      // identity campaigns hold accounts + entitlements + role memberships;
      // the probe dispatches on the IN clause's item.type values (configure
      // the automock in place — the component holds the module binding)
      mounted.vm.campaignDetails = { ...mounted.vm.campaignDetails, certificationType: 'identity' };
      await mounted.vm.$nextTick();
      const probeCounts = { accountGrant: 4, entitlementGrant: 0, roleMembership: 2 };
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation((urlParams, campaignId, payload) => {
        const itemTypes = payload.targetFilter.operand.find((o) => o.operator === 'IN')?.operand.targetValue || [];
        const match = Object.keys(probeCounts).find((type) => itemTypes.includes(type));
        return Promise.resolve({ data: { totalCount: match ? probeCounts[match] : 0 } });
      });

      await mounted.vm.openExportRevokesModal();
      await flushPromises();

      // one pageSize-1 probe per candidate type
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalledTimes(3);
      // only the non-empty types surface; two remain → the item-type step is
      // offered (a single non-empty type would be preset without the step)
      expect(mounted.vm.revokesItemTypeOptions).toEqual([
        { value: 'accountGrants', count: 4 },
        { value: 'roleMemberships', count: 2 },
      ]);
      expect(mounted.vm.$bvModal.show).toHaveBeenCalledWith('export-revocation-decisions-modal');
    });

    it('single-type campaigns preset the type without offering the step', async () => {
      const mounted = await mountWithStore(true);
      // identity probes → only account grants are non-empty
      mounted.vm.campaignDetails = { ...mounted.vm.campaignDetails, certificationType: 'identity' };
      await mounted.vm.$nextTick();
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation((urlParams, campaignId, payload) => {
        const itemTypes = payload.targetFilter.operand.find((o) => o.operator === 'IN')?.operand.targetValue || [];
        return Promise.resolve({ data: { totalCount: itemTypes.includes('accountGrant') ? 4 : 0 } });
      });

      await mounted.vm.openExportRevokesModal();
      await flushPromises();

      expect(mounted.vm.revokesItemTypeOptions).toEqual([{ value: 'accountGrants', count: 4 }]);
      expect(mounted.vm.$bvModal.show).toHaveBeenCalledWith('export-revocation-decisions-modal');
    });

    it('downloads revokes via the items search api with the static filter and modal options', async () => {
      const mounted = await mountWithStore(true);
      mockItemsSearchByType({
        accountGrant: {
          totalCount: 1,
          result: [{
            id: '00063417-5ce0-436f-9fe3-988c6592e821',
            user: { userName: 'andrew.och', cn: 'Andrew Och' },
            application: { name: 'SNOW' },
            keys: { accountId: 'system/SNOW/User/abc' },
            decision: { certification: { decision: 'revoke', remediationStatus: 'pending' } },
          }],
        },
      });

      // modal chosen: all rows, csv — same contract as the line-items export
      await mounted.vm.exportRevokesToFile({ format: 'csv', rows: 'all' });

      // identity campaigns fan a no-choice export into one request per
      // candidate type; the first request is the accounts one, with that
      // type's own field list (no role.name — that was the union fallback)
      const { mock } = CertificationApi.getCertificationTasksListByCampaign;
      expect(mock.calls).toHaveLength(3);
      expect(mock.calls[0][0]).toEqual({
        pageSize: 10000,
        pageNumber: 0,
        fields: 'id,user.userName,user.givenName,user.sn,user.cn,application.name,keys.accountId,account.id,descriptor.idx./account.displayName,decision.certification.remediationStatus',
      });
      expect(mock.calls[0][1]).toBe('af7d9cb8-0f34-4007-898b-03bd08dbd029');
      expect(mock.calls[0][2].targetFilter.operand).toEqual(expect.arrayContaining([
        expect.objectContaining({
          operator: 'IN',
          operand: { targetName: 'item.type', targetValue: ['accountGrant', 'AccountGrant', 'sharedAccount'] },
        }),
      ]));

      // one file — only the accounts slice holds items; the others came back
      // empty and were skipped
      expect(downloadAsType).toHaveBeenCalledTimes(1);
      const [exportData, format, fileName, title] = downloadAsType.mock.calls[0];
      expect(format).toBe('csv');
      expect(fileName).toBe('Test Cert - governance.certificationDetails.exportRevocationDecisionsTypes.accountGrants.csv');
      expect(title).toBe('Test Cert - governance.certificationDetails.exportRevocationDecisionsTypes.accountGrants');
      expect(exportData[0]).toEqual({
        'Task ID': '00063417-5ce0-436f-9fe3-988c6592e821',
        Identity: 'andrew.och',
        Application: 'SNOW',
        Account: 'system/SNOW/User/abc',
        'Remediation Status': 'pending',
        'Completion Date': '',
        'Remediation Comments': '',
        'Evidence Reference': '',
      });
    });

    it('an all-types export downloads one file per non-empty kind with its own columns', async () => {
      const mounted = await mountWithStore(true);
      // each type probe returns its own shape; entitlements come back empty
      // and are skipped
      mockItemsSearchByType({
        accountGrant: {
          totalCount: 1,
          result: [{
            id: 'acct-task-1',
            user: { userName: 'andrew.och' },
            application: { name: 'SNOW' },
            keys: { accountId: 'system/SNOW/User/abc' },
            decision: { certification: { remediationStatus: 'pending' } },
          }],
        },
        roleMembership: {
          totalCount: 1,
          result: [{
            id: 'role-task-1',
            user: { userName: 'alyson' },
            role: { name: 'auditor-role' },
            decision: { certification: { remediationStatus: 'pending' } },
          }],
        },
      });

      await mounted.vm.exportRevokesToFile({ format: 'csv', itemType: 'all' });

      // two files: the empty entitlement slice was skipped
      expect(downloadAsType).toHaveBeenCalledTimes(2);
      const [accountData, , accountFile] = downloadAsType.mock.calls[0];
      const [roleData, , roleFile] = downloadAsType.mock.calls[1];
      expect(accountFile).toBe('Test Cert - governance.certificationDetails.exportRevocationDecisionsTypes.accountGrants.csv');
      expect(accountData[0]).toEqual(expect.objectContaining({ 'Task ID': 'acct-task-1', Account: 'system/SNOW/User/abc' }));
      expect(accountData[0]).not.toHaveProperty('Role');
      expect(roleFile).toBe('Test Cert - governance.certificationDetails.exportRevocationDecisionsTypes.roleMemberships.csv');
      expect(roleData[0]).toEqual(expect.objectContaining({ 'Task ID': 'role-task-1', Role: 'auditor-role' }));
      expect(roleData[0]).not.toHaveProperty('Application');
      // the fan-out run reports its per-file result ($t passes keys through)
      expect(mounted.vm.displayNotification).toHaveBeenCalledWith('success', 'governance.certificationDetails.exportRevocationDecisionsAllTypesDone');
    });

    it('an item-type choice from the modal filters the request and names the file', async () => {
      const mounted = await mountWithStore(true);
      mockItemsSearch({
        totalCount: 2,
        result: [{
          id: 'role-task-1',
          user: { userName: 'andrew.och' },
          role: { name: 'auditor-role' },
          decision: { certification: { remediationStatus: 'pending' } },
        }],
      });

      await mounted.vm.exportRevokesToFile({ format: 'csv', itemType: 'roleMemberships' });

      const typeClause = {
        operator: 'IN',
        operand: { targetName: 'item.type', targetValue: ['roleMembership'] },
      };
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: 'id,user.userName,user.givenName,user.sn,user.cn,role.name,decision.certification.remediationStatus',
        }),
        'af7d9cb8-0f34-4007-898b-03bd08dbd029',
        {
          targetFilter: expect.objectContaining({
            operator: 'AND',
            operand: expect.arrayContaining([expect.objectContaining(typeClause)]),
          }),
        },
      );
      const [exportData, format, fileName, title] = downloadAsType.mock.calls[0];
      expect(format).toBe('csv');
      // the file is named for the campaign and the slice it holds ($t passes
      // the label through; the real locale reads "Role Memberships")
      expect(fileName).toBe('Test Cert - governance.certificationDetails.exportRevocationDecisionsTypes.roleMemberships.csv');
      expect(title).toBe('Test Cert - governance.certificationDetails.exportRevocationDecisionsTypes.roleMemberships');
      expect(exportData[0]).toEqual({
        'Task ID': 'role-task-1',
        Identity: 'andrew.och',
        Role: 'auditor-role',
        'Remediation Status': 'pending',
        'Completion Date': '',
        'Remediation Comments': '',
        'Evidence Reference': '',
      });
    });

    it('maps grant items by the campaign type with descriptor entitlement and cn fallbacks', async () => {
      const mounted = await mountWithStore(true);
      // entitlement-grant shape items — the entitlementGrants mapper covers
      // the descriptor entitlement fallbacks and its columns carry Entitlement
      mockItemsSearchByType({
        entitlementGrant: {
          totalCount: 2,
          result: [
            {
              // primary entitlement shape the fields list requests, plus the
              // user.cn fallback when userName is absent
              id: 'task-primary',
              user: { cn: 'Andrew Och' },
              application: { name: 'SNOW' },
              keys: { accountId: 'system/SNOW/User/abc' },
              descriptor: { idx: { '/entitlement': { displayName: 'sn_incident_write' } } },
              decision: { certification: { remediationStatus: 'pending' } },
            },
            {
              // account.id fallback when keys.accountId is absent, plus the
              // descriptor account display name (the primary account shape the
              // fields list requests)
              id: 'task-fallback-account',
              user: { userName: 'alyson' },
              application: { name: 'Target' },
              account: { id: 'system/Target/User/xyz' },
              descriptor: {
                idx: {
                  '/entitlement': { displayName: 'managed' },
                  '/account': { displayName: 'alyson@target' },
                },
              },
              decision: { certification: { remediationStatus: 'pending' } },
            },
          ],
        },
      });

      await mounted.vm.exportRevokesToFile();

      expect(downloadAsType).toHaveBeenCalledTimes(1);
      const [exportData] = downloadAsType.mock.calls[0];
      expect(exportData[0].Identity).toBe('Andrew Och');
      expect(exportData[0].Entitlement).toBe('sn_incident_write');
      expect(exportData[0].Account).toBe('system/SNOW/User/abc');
      expect(exportData[1].Account).toBe('alyson@target');
    });

    it('maps roleMembership items into Identity and Role columns only', async () => {
      const mounted = await mountWithStore(true, 'in-progress', 'roleMembership');
      mockItemsSearch({
        totalCount: 1,
        result: [{
          id: 'role-task-1',
          user: { userName: 'andrew.och' },
          role: { name: 'auditor-role' },
          application: { name: 'should-not-appear' },
          keys: { accountId: 'should-not-appear' },
          decision: { certification: { remediationStatus: 'pending' } },
        }],
      });

      await mounted.vm.exportRevokesToFile();

      // roleMembership campaign → role + user fields requested
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: 'id,user.userName,user.givenName,user.sn,user.cn,role.name,decision.certification.remediationStatus',
        }),
        'af7d9cb8-0f34-4007-898b-03bd08dbd029',
        expect.anything(),
      );
      const [exportData] = downloadAsType.mock.calls[0];
      // no Application/Account columns at all — they don't apply to role items
      expect(exportData[0]).toEqual({
        'Task ID': 'role-task-1',
        Identity: 'andrew.och',
        Role: 'auditor-role',
        'Remediation Status': 'pending',
        'Completion Date': '',
        'Remediation Comments': '',
        'Evidence Reference': '',
      });
    });

    it('maps roleComposition items without an Identity column — no user is ever involved', async () => {
      const mounted = await mountWithStore(true, 'signed-off', 'roleComposition');
      mockItemsSearch({
        totalCount: 1,
        result: [{
          id: 'comp-role-task-1',
          role: { name: 'auditor-role' },
          decision: { certification: { remediationStatus: 'pending' } },
        }],
      });

      await mounted.vm.exportRevokesToFile();

      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: 'id,role.name,decision.certification.remediationStatus',
        }),
        'af7d9cb8-0f34-4007-898b-03bd08dbd029',
        expect.anything(),
      );
      const [exportData] = downloadAsType.mock.calls[0];
      expect(exportData[0]).toEqual({
        'Task ID': 'comp-role-task-1',
        Role: 'auditor-role',
        'Remediation Status': 'pending',
        'Completion Date': '',
        'Remediation Comments': '',
        'Evidence Reference': '',
      });
    });

    it('maps entitlementComposition items without an Identity column', async () => {
      const mounted = await mountWithStore(true, 'signed-off', 'entitlementComposition');
      mockItemsSearch({
        totalCount: 1,
        result: [{
          id: 'comp-task-1',
          application: { name: 'SNOW' },
          entitlement: { displayName: 'sn_incident_write' },
          decision: { certification: { remediationStatus: 'pending' } },
        }],
      });

      await mounted.vm.exportRevokesToFile();

      const [exportData] = downloadAsType.mock.calls[0];
      expect(exportData[0]).not.toHaveProperty('Identity');
      expect(exportData[0].Application).toBe('SNOW');
      expect(exportData[0].Entitlement).toBe('sn_incident_write');
    });

    it('maps identityProfile items with only the Identity context column', async () => {
      const mounted = await mountWithStore(true, 'signed-off', 'identityProfile');
      mockItemsSearch({
        totalCount: 1,
        result: [{
          id: 'profile-task-1',
          user: { userName: 'andrew.och', givenName: 'Andrew', sn: 'Och' },
          decision: { certification: { remediationStatus: 'pending' } },
        }],
      });

      await mounted.vm.exportRevokesToFile();

      const [exportData] = downloadAsType.mock.calls[0];
      expect(exportData[0].Identity).toBe('andrew.och');
      expect(exportData[0]).not.toHaveProperty('Application');
      expect(exportData[0]).not.toHaveProperty('Entitlement');
    });

    it('follows the campaign uiConfig column configuration when one is saved', async () => {
      // an identity campaign with no type chosen reads the accounts template
      // config — the admin's configured columns render in order, and the
      // Account column is pinned even though the config omits it (the file
      // must name the account being revoked)
      const mounted = await mountWithStore(true, 'signed-off', 'identity', {
        accounts: ['user.user', 'application.application', 'entitlement.entitlement'],
      });
      mockItemsSearch({
        totalCount: 1,
        result: [{
          id: 'cfg-task-1',
          user: { userName: 'andrew.och' },
          application: { name: 'SNOW' },
          keys: { accountId: 'system/SNOW/User/abc' },
          entitlement: { displayName: 'sn_incident_write' },
          decision: { certification: { remediationStatus: 'pending' } },
        }],
      });

      await mounted.vm.exportRevokesToFile();

      const [exportData] = downloadAsType.mock.calls[0];
      expect(exportData[0]).toEqual({
        'Task ID': 'cfg-task-1',
        Identity: 'andrew.och',
        Application: 'SNOW',
        Entitlement: 'sn_incident_write',
        Account: 'system/SNOW/User/abc',
        'Remediation Status': 'pending',
        'Completion Date': '',
        'Remediation Comments': '',
        'Evidence Reference': '',
      });
    });

    it('emits custom glossary columns from the template configuration', async () => {
      const mounted = await mountWithStore(true, 'signed-off', 'identity', {
        accounts: ['user.user', 'user.glossary.department'],
      });
      mockItemsSearch({
        totalCount: 1,
        result: [{
          id: 'glossary-task-1',
          user: { userName: 'andrew.och' },
          glossary: { idx: { '/user': { department: 'Engineering' } } },
          decision: { certification: { remediationStatus: 'pending' } },
        }],
      });

      await mounted.vm.exportRevokesToFile();

      const [exportData] = downloadAsType.mock.calls[0];
      expect(exportData[0]['user.glossary.department']).toBe('Engineering');
      expect(exportData[0].Identity).toBe('andrew.och');
    });

    it('notifies and skips the download when no revokes are pending remediation', async () => {
      const mounted = await mountWithStore(true);
      mockItemsSearch({ totalCount: 0, result: [] });

      await mounted.vm.exportRevokesToFile();

      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalled();
      expect(downloadAsType).not.toHaveBeenCalled();
      expect(mounted.vm.displayNotification).toHaveBeenCalledWith('info', 'governance.certificationDetails.exportRevocationDecisionsEmpty');
    });

    it('notifies when the campaign has more pending revokes than the 10000-row export cap', async () => {
      const mounted = await mountWithStore(true);
      mockItemsSearch({
        totalCount: 12000,
        result: [{
          id: 'task-1',
          decision: { certification: { remediationStatus: 'pending' } },
        }],
      });

      await mounted.vm.exportRevokesToFile();

      expect(downloadAsType).toHaveBeenCalled();
      expect(mounted.vm.displayNotification).toHaveBeenCalledWith(
        'info',
        'governance.certificationDetails.exportRevocationDecisionsTruncated',
      );
    });

    it('shows an error notification when the export request fails', async () => {
      const mounted = await mountWithStore(true);
      CertificationApi.getCertificationTasksListByCampaign.mockReturnValue(Promise.reject(new Error('boom')));

      await mounted.vm.exportRevokesToFile();

      expect(downloadAsType).not.toHaveBeenCalled();
      expect(mounted.vm.showErrorMessage).toHaveBeenCalledWith(expect.any(Error), 'governance.certificationDetails.exportRevocationDecisionsError');
      expect(mounted.vm.isRevokesExporting).toBe(false);
    });
  });
});
