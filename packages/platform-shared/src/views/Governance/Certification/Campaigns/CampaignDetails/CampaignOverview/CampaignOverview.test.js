/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createAppContainer, findByTestId, toggleActionsMenu } from '@forgerock/platform-shared/src/utils/testHelpers';
import { DOMWrapper, mount, flushPromises } from '@vue/test-utils';
import * as CampaignApi from '@/api/governance/CampaignApi';
import CampaignOverview from './index';
import i18n from '@/i18n';
import { uiTypeMap } from '../../../Templates/templateTypes';

const styles = {
  blue: '#1a73e8',
  green: '#22a75f',
  orchid: '#ba4de1',
  skyblue: '#61e2e2',
  yellow: '#ffb946',
};

describe('CampaignOverview Component', () => {
  const campaign = {
    ownerInfo: {
      givenName: 'firstname',
      sn: 'lastname',
      profileImage: 'profile-image',
    },
    statistics: {
      userCount: {
        new: 1139,
        previous: 235,
      },
      currentDecision: {
        revoke: 2600,
        abstain: 0,
        certify: 7800,
        exception: 20000,
        noDecision: 7,
      },
      decisionsByApplication: {
        'Active Directory': 5048,
        Salesforce: 2548,
        SAP: 20548,
        Adobe: 1548,
        Commerce: 18000,
        Matrix: 4000,
      },
      primaryReviewer: {
        complete: 2,
        total: 5,
      },
      usersMissingEmail: 454,
      actorsMissingEmail: 16,
      previousDecision: {
        total: 1374,
        previouslyReviewed: 235,
      },
    },
    progress: 0.5,
    status: 'expiring',
    stageDuration: 1,
    startDate: '2022-11-28',
    deadline: '2022-12-19',
    description: 'Test Cert description',
  };
  let wrapper;
  let domWrapper;
  beforeEach(() => {
    document.body.innerHTML = '';
    domWrapper = new DOMWrapper(document.body);
    wrapper = mount(CampaignOverview, {
      attachTo: createAppContainer(),
      global: {
        plugins: [i18n],
        stubs: ['FrVisualizationCard', 'BBadge'],
        mocks: {
          $router: { push: jest.fn() },
          $bvModal: {
            show: jest.fn(),
            hide: jest.fn(),
          },
          $store: { state: { SharedStore: { governanceDevEnabled: true } } },
        },
      },
      props: {
        campaign: { ...campaign },
      },
    });
  });

  it('status card loaded correctly', () => {
    const statusCard = findByTestId(wrapper, 'status-card');
    expect(statusCard.exists()).toBe(true);
    expect(statusCard.find('h5').text()).toBe('Status');

    const statusBadge = findByTestId(wrapper, 'status-badge');
    expect(statusBadge.exists()).toBe(true);
    expect(statusBadge.attributes('variant')).toBe('warning');
  });

  it('update deadline button works correctly', async () => {
    const updateDeadlineButton = findByTestId(wrapper, 'update-deadline-button');
    expect(updateDeadlineButton.exists()).toBe(true);
    expect(updateDeadlineButton.text()).toBe('Update Deadline');

    await updateDeadlineButton.trigger('click');
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('UpdateDeadlineModal');
  });

  it('update deadline button dropdown works correctly', async () => {
    await toggleActionsMenu(wrapper);

    const updateDeadlineButton = findByTestId(domWrapper, 'update-deadline-button-dropdown');
    expect(updateDeadlineButton.exists()).toBe(true);
    expect(updateDeadlineButton.text()).toBe('Update Deadline');

    await updateDeadlineButton.trigger('click');
    await flushPromises();
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('UpdateDeadlineModal');
  });

  it('update deadline successfully', async () => {
    jest.spyOn(CampaignApi, 'updateCampaignDeadline').mockImplementation(() => Promise.resolve({
      deadline: '2022-12-29',
    }));
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');

    wrapper.vm.updateDeadline('2022-12-29');
    await flushPromises();

    expect(wrapper.vm.campaignDeadline).toBe('2022-12-29');
    expect(displayNotificationSpy).toBeCalledWith('success', 'Campaign deadline updated');
    expect(wrapper.vm.isUpdateDeadlineInProgress).toBe(false);
    expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('UpdateDeadlineModal');

    jest.clearAllMocks();
  });

  it('update deadline fails', async () => {
    const error = new Error({ response: { message: 'Error message' } });
    jest.spyOn(CampaignApi, 'updateCampaignDeadline').mockImplementation(() => Promise.reject(error));
    const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

    wrapper.vm.updateDeadline('2022-12-29');

    await flushPromises();

    expect(wrapper.vm.campaignDeadline).toBe('2022-12-19');
    expect(showErrorMessageSpy).toBeCalledWith(error, 'Error updating the deadline for the campaign');
    expect(wrapper.vm.isUpdateDeadlineInProgress).toBe(false);

    jest.clearAllMocks();
  });

  it('edit details button shown when campaign is in-progress', async () => {
    await wrapper.setProps({ campaign: { ...campaign, status: 'in-progress' } });
    const btn = findByTestId(wrapper, 'edit-details-button');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toBe('Edit Details');
  });

  it('edit details button shown when campaign is expiring', () => {
    // default fixture has status: 'expiring'
    const btn = findByTestId(wrapper, 'edit-details-button');
    expect(btn.exists()).toBe(true);
  });

  it('edit details button not shown for staging status', async () => {
    await wrapper.setProps({ campaign: { ...campaign, status: 'staging' } });
    expect(findByTestId(wrapper, 'edit-details-button').exists()).toBe(false);
  });

  it('edit details button opens modal', async () => {
    await findByTestId(wrapper, 'edit-details-button').trigger('click');
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('EditDetailsModal');
  });

  it('edit details button dropdown opens modal', async () => {
    await toggleActionsMenu(wrapper);
    const btn = findByTestId(domWrapper, 'edit-details-button-dropdown');
    expect(btn.exists()).toBe(true);
    await btn.trigger('click');
    await flushPromises();
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('EditDetailsModal');
  });

  it('cancel campaign button works correctly', async () => {
    const cancelCampaignButton = findByTestId(wrapper, 'cancel-campaign-button');
    expect(cancelCampaignButton.exists()).toBe(true);
    expect(cancelCampaignButton.text()).toBe('Cancel Campaign');

    await cancelCampaignButton.trigger('click');
    await flushPromises();
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('CancelCampaignModal');
  });

  it('cancel campaign button dropdown works correctly', async () => {
    await toggleActionsMenu(wrapper);

    const cancelCampaignButton = findByTestId(domWrapper, 'cancel-campaign-button-dropdown');
    expect(cancelCampaignButton.exists()).toBe(true);
    expect(cancelCampaignButton.text()).toBe('Cancel Campaign');

    await cancelCampaignButton.trigger('click');
    await flushPromises();
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('CancelCampaignModal');
  });

  it('activate campaign button works correctly', async () => {
    await wrapper.setProps({
      campaign: {
        ...campaign,
        status: 'staging',
      },
    });

    const activateCampaignButton = findByTestId(wrapper, 'activate-campaign-button');
    expect(activateCampaignButton.exists()).toBe(true);
    expect(activateCampaignButton.text()).toBe('Activate');

    await activateCampaignButton.trigger('click');
    await flushPromises();
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('ActivateCampaignModal');
  });

  it('activate campaign button dropdown works correctly', async () => {
    await wrapper.setProps({
      campaign: {
        ...campaign,
        status: 'staging',
      },
    });

    await toggleActionsMenu(wrapper);

    const activateCampaignButton = findByTestId(domWrapper, 'activate-campaign-button-dropdown');
    expect(activateCampaignButton.exists()).toBe(true);
    expect(activateCampaignButton.text()).toBe('Activate');

    await activateCampaignButton.trigger('click');
    await flushPromises();
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('ActivateCampaignModal');
  });

  it('delete campaign button works correctly', async () => {
    await wrapper.setProps({
      campaign: {
        ...campaign,
        status: 'staging',
      },
    });

    const deleteCampaignButton = findByTestId(wrapper, 'delete-campaign-button');
    expect(deleteCampaignButton.exists()).toBe(true);
    expect(deleteCampaignButton.text()).toBe('Delete Campaign');

    await deleteCampaignButton.trigger('click');
    await flushPromises();
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('DeleteCampaignModal');
  });

  it('delete campaign button dropdown works correctly', async () => {
    await wrapper.setProps({
      campaign: {
        ...campaign,
        status: 'staging',
      },
    });
    await toggleActionsMenu(wrapper);

    const deleteCampaignButton = findByTestId(domWrapper, 'delete-campaign-button-dropdown');
    expect(deleteCampaignButton.exists()).toBe(true);
    expect(deleteCampaignButton.text()).toBe('Delete Campaign');

    await deleteCampaignButton.trigger('click');
    await flushPromises();
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('DeleteCampaignModal');
  });

  it('campaign details card loaded correctly', () => {
    const campaignDetailsCard = findByTestId(wrapper, 'campaign-details-card');
    expect(campaignDetailsCard.exists()).toBe(true);
    const heading = campaignDetailsCard.find('h2');
    expect(heading.text()).toBe('Campaign Details');
    expect(heading.classes()).toContain('h5');
  });

  it('campaign progress should load with the given parameters correctly', () => {
    const campaignProgressCard = findByTestId(wrapper, 'campaign-progress');
    expect(campaignProgressCard.exists()).toBe(true);
    expect(wrapper.vm.progress).toBe(50);
  });

  it('should display correct campaign progress caption text', () => {
    const campaignProgressCaptionText = findByTestId(wrapper, 'campaign-progress-caption-text');
    expect(campaignProgressCaptionText.text()).toEqual('2 of 5 complete');
  });

  it('owner info loaded correctly', () => {
    const ownerInfo = findByTestId(wrapper, 'owner-info');
    expect(ownerInfo.exists()).toBe(true);
    expect(ownerInfo.find('small').text()).toBe('Campaign Owner');
    expect(ownerInfo.find('img').attributes('alt')).toBe('firstname lastname');
    expect(ownerInfo.find('img').attributes('src')).toBe('profile-image');
  });

  it('campaign duration loaded correctly based on stage duration', async () => {
    const campaignDuration = findByTestId(wrapper, 'campaign-duration');
    expect(campaignDuration.exists()).toBe(true);
    expect(campaignDuration.find('small').text()).toBe('Duration');
    expect(campaignDuration.find('dd').text()).toBe('1 day');

    await wrapper.setProps({
      campaign: {
        ...campaign,
        stageDuration: 5,
      },
    });

    expect(campaignDuration.find('dd').text()).toBe('5 days');
  });

  it('campaign start date loaded correctly', () => {
    const campaignStartDate = findByTestId(wrapper, 'campaign-start-date');
    expect(campaignStartDate.exists()).toBe(true);
    expect(campaignStartDate.find('small').text()).toBe('Start Date');
    expect(campaignStartDate.find('dd').text()).toBe('Nov 28, 2022');
  });

  it('campaign deadline date loaded correctly based on campaign status', async () => {
    const campaignDeadlineDate = findByTestId(wrapper, 'campaign-deadline-date');
    expect(campaignDeadlineDate.exists()).toBe(true);
    expect(campaignDeadlineDate.find('small').text()).toBe('Deadline');
    expect(campaignDeadlineDate.find('dd').text()).toContain('Dec 19, 2022');
    expect(campaignDeadlineDate.find('dd').find('span span').element).toHaveClass('text-warning');

    await wrapper.setProps({
      campaign: {
        ...campaign,
        status: 'overdue',
      },
    });

    expect(campaignDeadlineDate.find('dd').find('span span').element).toHaveClass('text-danger');
  });

  it('campaign deadline date loaded correctly if the status is completed', async () => {
    await wrapper.setProps({
      campaign: {
        ...campaign,
        status: 'in-progress',
      },
    });

    const campaignDeadlineDate = findByTestId(wrapper, 'campaign-deadline-date');
    expect(campaignDeadlineDate.exists()).toBe(true);
    expect(campaignDeadlineDate.find('small').text()).toBe('Deadline');
    expect(campaignDeadlineDate.find('dd').text()).toContain('Dec 19, 2022');
  });

  it('campaign description loaded correctly', () => {
    const campaignDescription = findByTestId(wrapper, 'campaign-description');
    expect(campaignDescription.exists()).toBe(true);
    expect(campaignDescription.find('small').text()).toBe('Description');
    expect(campaignDescription.find('dd p').text()).toBe('Test Cert description');
  });

  it('show description button works correctly', async () => {
    const showDescriptionButton = findByTestId(wrapper, 'show-description-button');
    expect(showDescriptionButton.exists()).toBe(true);
    expect(showDescriptionButton.text()).toBe('Read more');
    await showDescriptionButton.trigger('click');
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('ShowDescription');
  });

  it('users visualization card loaded correctly', async () => {
    await wrapper.setProps({
      campaign: {
        ...campaign,
        certificationType: uiTypeMap.IDENTITY,
      },
    });
    await flushPromises();
    const chartUsers = findByTestId(wrapper, 'chart-users');
    expect(chartUsers.exists()).toBe(true);
    expect(chartUsers.attributes('title')).toBe('Users');
    expect(chartUsers.attributes('tooltip')).toBe('Never certified users vs previously certified users');
  });

  it('campaign users for pie chart data loaded correctly', () => {
    const localThis = {
      $t: (text) => text,
      campaign: {
        statistics: {
          userCount: {
            new: 1139,
            previous: 235,
          },
        },
      },
      styles: {
        blue: '#1a73e8',
        green: '#22a75f',
        orchid: '#ba4de1',
        skyblue: '#61e2e2',
        yellow: '#ffb946',
      },
    };

    expect(CampaignOverview.computed.campaignUsers.call(localThis)).toEqual([
      {
        color: styles.green,
        label: 'governance.certificationDetails.usersChartItemsLabel.new',
        value: 1139,
      },
      {
        color: styles.blue,
        label: 'governance.certificationDetails.usersChartItemsLabel.previous',
        value: 235,
      },
    ]);
  });

  it('decision breakdown visualization card loaded correctly', () => {
    const chartDecisionsBreakdown = findByTestId(wrapper, 'chart-decisions-breakdown');
    expect(chartDecisionsBreakdown.exists()).toBe(true);
    expect(chartDecisionsBreakdown.attributes('title')).toBe('Decisions Breakdown');
    expect(chartDecisionsBreakdown.attributes('tooltip')).toBe('Decisions made in this campaign');
  });

  it('decision breakdown for pie chart data loaded correctly', () => {
    const localThis = {
      $t: (text) => text,
      campaign: {
        statistics: {
          currentDecision: {
            revoke: 2600,
            abstain: 0,
            certify: 7800,
            exception: 20000,
            noDecision: 7,
          },
        },
      },
      styles: {
        blue: '#1a73e8',
        green: '#22a75f',
        orchid: '#ba4de1',
        skyblue: '#61e2e2',
        yellow: '#ffb946',
      },
    };

    expect(CampaignOverview.computed.decisionsBreakdown.call(localThis)).toEqual([
      {
        color: styles.blue,
        label: 'governance.certificationDetails.decisionsBreakdownChartItemsLabel.revoke',
        value: 2600,
      },
      {
        color: styles.green,
        label: 'governance.certificationDetails.decisionsBreakdownChartItemsLabel.certify',
        value: 7800,
      },
      {
        color: styles.yellow,
        label: 'governance.certificationDetails.decisionsBreakdownChartItemsLabel.exception',
        value: 20000,
      },
    ]);
  });

  it('decision breakdown visualization card loaded correctly', () => {
    const chartDecisionsByApp = findByTestId(wrapper, 'chart-decisions-by-app');
    expect(chartDecisionsByApp.exists()).toBe(true);
    expect(chartDecisionsByApp.attributes('title')).toBe('Access by Application');
    expect(chartDecisionsByApp.attributes('tooltip')).toBe('Number of accounts to be certified in this campaign by application');
  });

  it('decision by application for pie chart data loaded correctly', () => {
    const localThis = {
      $t: (text) => text,
      campaign: {
        statistics: {
          decisionsByApplication: {
            'Active Directory': 5048,
            Salesforce: 2548,
            SAP: 20548,
            Adobe: 1548,
            Commerce: 18000,
            Matrix: 4000,
          },
        },
      },
      styles: {
        blue: '#1a73e8',
        green: '#22a75f',
        orchid: '#ba4de1',
        skyblue: '#61e2e2',
        yellow: '#ffb946',
      },
    };

    expect(CampaignOverview.computed.decisionsByApp.call(localThis)).toEqual([
      {
        color: styles.green,
        label: 'SAP',
        value: 20548,
      },
      {
        color: styles.blue,
        label: 'Commerce',
        value: 18000,
      },
      {
        color: styles.yellow,
        label: 'Active Directory',
        value: 5048,
      },
      {
        color: styles.orchid,
        label: 'Matrix',
        value: 4000,
      },
      {
        color: styles.skyblue,
        label: 'governance.certificationDetails.decisionsBreakdownChartItemsLabelOther',
        value: 4096,
      },
    ]);
  });

  it('cancel campaign successfully', async () => {
    jest.spyOn(CampaignApi, 'cancelCampaign').mockImplementation(() => Promise.resolve({}));
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    const routerSpy = jest.spyOn(wrapper.vm.$router, 'push');

    wrapper.vm.cancelCampaign();

    await flushPromises();

    expect(displayNotificationSpy).toBeCalledWith('success', 'Campaign cancelled');
    expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('CancelCampaignModal');
    expect(wrapper.vm.isCancelCamapignInProgress).toBe(false);
    expect(routerSpy).toHaveBeenCalledWith({
      name: 'Certification',
      params: {
        certificationTab: 'overview',
      },
    });

    jest.clearAllMocks();
  });

  it('cancel campaign fails', async () => {
    const error = new Error({ response: { message: 'Error message' } });
    jest.spyOn(CampaignApi, 'cancelCampaign').mockImplementation(() => Promise.reject(error));
    const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

    wrapper.vm.cancelCampaign();

    await flushPromises();

    expect(showErrorMessageSpy).toBeCalledWith(error, 'Error canceling the campaign');
    expect(wrapper.vm.isCancelCamapignInProgress).toBe(false);

    jest.clearAllMocks();
  });

  it('activate campaign successfully', async () => {
    jest.spyOn(CampaignApi, 'activateCampaign').mockImplementation(() => Promise.resolve({ status: 'active' }));
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    wrapper.vm.activateCampaign();

    await flushPromises();

    expect(displayNotificationSpy).toBeCalledWith('success', 'Campaign activated');
    expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('ActivateCampaignModal');
    expect(wrapper.vm.isActivateCamapignInProgress).toBe(false);
    expect(wrapper.emitted('update:status')[0][0]).toEqual('active');

    jest.clearAllMocks();
  });

  it('activate campaign fails', async () => {
    const error = new Error({ response: { message: 'Error message' } });
    jest.spyOn(CampaignApi, 'activateCampaign').mockImplementation(() => Promise.reject(error));
    const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

    wrapper.vm.activateCampaign();

    await flushPromises();

    expect(wrapper.vm.campaign.status).toBe('expiring');
    expect(showErrorMessageSpy).toBeCalledWith(error, 'Error activating the campaign');
    expect(wrapper.vm.isActivateCamapignInProgress).toBe(false);

    jest.clearAllMocks();
  });

  it('delete campaign successfully', async () => {
    jest.spyOn(CampaignApi, 'deleteCampaign').mockImplementation(() => Promise.resolve({}));
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    const routerSpy = jest.spyOn(wrapper.vm.$router, 'push');

    wrapper.vm.deleteCampaign();

    await flushPromises();

    expect(displayNotificationSpy).toBeCalledWith('success', 'Campaign deleted');
    expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('DeleteCampaignModal');
    expect(wrapper.vm.isDeleteCamapignInProgress).toBe(false);
    expect(routerSpy).toHaveBeenCalledWith({ name: 'Certification' });

    jest.clearAllMocks();
  });

  it('delete campaign fails', async () => {
    const error = new Error({ response: { message: 'Error message' } });
    jest.spyOn(CampaignApi, 'deleteCampaign').mockImplementation(() => Promise.reject(error));
    const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

    wrapper.vm.deleteCampaign();

    await flushPromises();

    expect(showErrorMessageSpy).toBeCalledWith(error, 'Error deleting the campaign');
    expect(wrapper.vm.isDeleteCamapignInProgress).toBe(false);

    jest.clearAllMocks();
  });

  it('should show campaigns actions when status is different than excludedStatuses', async () => {
    await toggleActionsMenu(wrapper);

    const cancelCampaignBtn = findByTestId(domWrapper, 'cancel-campaign-button');
    const cancelCampaignBtnDropdown = findByTestId(domWrapper, 'cancel-campaign-button-dropdown');

    expect(cancelCampaignBtn.exists()).toBe(true);
    expect(cancelCampaignBtnDropdown.exists()).toBe(true);
  });

  it('should not show campaigns actions when status is staging', async () => {
    wrapper.setProps({
      campaign: {
        ...campaign,
        status: 'staging',
      },
    });
    await flushPromises();

    const cancelCampaignBtn = findByTestId(wrapper, 'cancel-campaign-button');
    const cancelCampaignBtnDropdown = findByTestId(wrapper, 'cancel-campaign-button-dropdown');

    expect(cancelCampaignBtn.exists()).toBe(false);
    expect(cancelCampaignBtnDropdown.exists()).toBe(false);
  });

  it('previous decision for pie chart data loaded correctly', () => {
    const localThis = {
      $t: (text) => text,
      campaign: {
        statistics: {
          previousDecision: {
            total: 1374,
            previouslyReviewed: 235,
          },
        },
      },
      styles: {
        blue: '#1a73e8',
        green: '#22a75f',
        orchid: '#ba4de1',
        skyblue: '#61e2e2',
        yellow: '#ffb946',
      },
    };

    expect(CampaignOverview.computed.previousDecisionChart.call(localThis)).toEqual([
      {
        color: styles.green,
        label: 'governance.certificationDetails.previousDecisionChartItemsLabel.previouslyReviewed',
        value: 235,
      },
      {
        color: styles.blue,
        label: 'governance.certificationDetails.previousDecisionChartItemsLabel.neverCertified',
        value: 1139,
      },
    ]);
  });

  it('previous decision visualization card loaded correctly', async () => {
    await wrapper.setProps({
      campaign: {
        ...campaign,
        certificationType: uiTypeMap.ENTITLEMENTCOMPOSITION,
      },
    });
    await flushPromises();

    const cards = wrapper.findAllComponents({ name: 'FrVisualizationCard' });
    const previousDecisionCard = cards.find((card) => card.props('title') === wrapper.vm.$t('governance.certificationDetails.previousDecisionChartLabel'));
    expect(previousDecisionCard).toBeTruthy();
  });

  describe('IGA-4702: Edit Details modal', () => {
    it('saveEditDetails with only title calls updateCampaign and emits update:name', async () => {
      jest.spyOn(CampaignApi, 'updateCampaign').mockResolvedValue({});
      const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');

      await wrapper.setProps({
        campaign: {
          ...campaign, id: 'camp-1', name: 'Old Title', status: 'in-progress',
        },
      });
      wrapper.vm.saveEditDetails({ title: 'New Title', ownerInfo: null });
      await flushPromises();

      expect(CampaignApi.updateCampaign).toHaveBeenCalledWith('camp-1', { name: 'New Title' });
      expect(wrapper.emitted('update:name')).toBeTruthy();
      expect(wrapper.emitted('update:name')[0]).toEqual(['New Title']);
      expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Campaign details updated');
      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('EditDetailsModal');
      expect(wrapper.emitted('refresh-campaign')).toBeTruthy();

      jest.clearAllMocks();
    });

    it('saveEditDetails with only owner calls updateCampaign and emits update:ownerInfo', async () => {
      jest.spyOn(CampaignApi, 'updateCampaign').mockResolvedValue({});
      const newOwner = {
        id: 'user-456',
        givenName: 'Jane',
        sn: 'Doe',
        userName: 'jdoe',
        profileImage: '',
      };

      await wrapper.setProps({ campaign: { ...campaign, id: 'camp-1', status: 'in-progress' } });
      wrapper.vm.saveEditDetails({ title: null, ownerInfo: newOwner });
      await flushPromises();

      expect(CampaignApi.updateCampaign).toHaveBeenCalledWith('camp-1', { ownerId: 'user-456' });
      expect(wrapper.emitted('update:ownerInfo')).toBeTruthy();
      expect(wrapper.emitted('update:ownerInfo')[0]).toEqual([newOwner]);

      jest.clearAllMocks();
    });

    it('saveEditDetails with both title and owner sends a single combined PATCH', async () => {
      jest.spyOn(CampaignApi, 'updateCampaign').mockResolvedValue({});
      const newOwner = {
        id: 'user-456',
        givenName: 'Jane',
        sn: 'Doe',
        userName: 'jdoe',
        profileImage: '',
      };

      await wrapper.setProps({
        campaign: {
          ...campaign, id: 'camp-1', name: 'Old Title', status: 'in-progress',
        },
      });
      wrapper.vm.saveEditDetails({ title: 'New Title', ownerInfo: newOwner });
      await flushPromises();

      expect(CampaignApi.updateCampaign).toHaveBeenCalledTimes(1);
      expect(CampaignApi.updateCampaign).toHaveBeenCalledWith('camp-1', { name: 'New Title', ownerId: 'user-456' });
      expect(wrapper.emitted('update:name')[0]).toEqual(['New Title']);
      expect(wrapper.emitted('update:ownerInfo')[0]).toEqual([newOwner]);

      jest.clearAllMocks();
    });

    it('saveEditDetails with no changes just hides modal', async () => {
      jest.spyOn(CampaignApi, 'updateCampaign').mockResolvedValue({});

      await wrapper.setProps({ campaign: { ...campaign, id: 'camp-1', status: 'in-progress' } });
      wrapper.vm.saveEditDetails({ title: null, ownerInfo: null });
      await flushPromises();

      expect(CampaignApi.updateCampaign).not.toHaveBeenCalled();
      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('EditDetailsModal');

      jest.clearAllMocks();
    });

    it('saveEditDetails shows error on failure', async () => {
      const error = new Error('API error');
      jest.spyOn(CampaignApi, 'updateCampaign').mockRejectedValue(error);
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

      await wrapper.setProps({
        campaign: {
          ...campaign, id: 'camp-1', name: 'Old', status: 'in-progress',
        },
      });
      wrapper.vm.saveEditDetails({ title: 'New', ownerInfo: null });
      await flushPromises();

      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'Error updating campaign details');
      expect(wrapper.vm.isEditDetailsInProgress).toBe(false);

      jest.clearAllMocks();
    });
  });
});
