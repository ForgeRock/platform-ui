/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { createAppContainer, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import store from '@/store';
import i18n from '@/i18n';
import Campaigns from './index';

describe('Campaigns', () => {
  let wrapper;
  beforeEach(() => {
    CertificationApi.getAdminCertificationItems = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
    CertificationApi.activateCertification = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
    CertificationApi.cancelCertification = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
    CertificationApi.deleteCertification = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
    CertificationApi.updateCertificationDeadline = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
    store.replaceState({
      SharedStore: {
        webStorageAvailable: true,
      },
    });
    wrapper = mount(Campaigns, {
      attachTo: createAppContainer(),
      global: {
        plugins: [i18n],
        directives: {
          'resizable-table': jest.fn(),
        },
      },
    });
  });

  it('should display noData component when no campaigns are found', async () => {
    await wrapper.vm.setAccessReviewList({ result: [], totalCount: 0 });

    const noData = findByTestId(wrapper, 'campaigns-no-data');
    expect(noData.exists()).toBeTruthy();
  });

  it('Calling getList calls getAdminCertificationItems', async () => {
    expect(wrapper.vm.statuses.get('signed-off')).toEqual(expect.objectContaining({ sortHide: true, type: 'signed-off' }));
    expect(wrapper.vm.statuses.get('staging')).toEqual(expect.objectContaining({ param: 'staging', type: 'staging' }));
  });

  it('Calling getList calls getAdminCertificationItems', async () => {
    expect(CertificationApi.getAdminCertificationItems).toHaveBeenCalledWith({
      pageNumber: 0, pageSize: 10, queryString: '', sortBy: 'deadline', sortDesc: false, status: 'active',
    });
  });

  it('should sort ascending or descending on name', async () => {
    await wrapper.vm.setAccessReviewList({ result: [{}], totalCount: 1 });
    const certTable = wrapper.find('.table');
    certTable.find('th').trigger('click');
    expect(CertificationApi.getAdminCertificationItems).toHaveBeenCalledWith({
      pageNumber: 0, pageSize: 10, queryString: '', sortBy: 'name', sortDesc: false, status: 'active',
    });
    certTable.find('th').trigger('click');
    expect(CertificationApi.getAdminCertificationItems).toHaveBeenCalledWith({
      pageNumber: 0, pageSize: 10, queryString: '', sortBy: 'name', sortDesc: true, status: 'active',
    });
  });

  it('clicking column picker button should show the column picker modal', async () => {
    wrapper.vm.openColumnsModal();
    expect(wrapper.vm.pickerProps.show).toBe(true);
  });

  it('should maintain all available columns in the picker when some are deselected and preserve actions column', async () => {
    // Total fields defined in tableFields is 6 (including actions)
    expect(wrapper.vm.tableFields.length).toBe(6);
    expect(wrapper.vm.activeColumns.length).toBe(6);

    // Simulate unticking a column by emitting update:activeColumns with only 4 columns (excluding actions and one other)
    const updatedColumns = wrapper.vm.tableFields.slice(0, 4);
    expect(updatedColumns.find((c) => c.key === 'actions')).toBeUndefined();

    const columnPicker = wrapper.findComponent({ name: 'ColumnPicker' });
    await columnPicker.vm.$emit('update:activeColumns', updatedColumns);

    // activeColumns should now have 5 (the 4 sent + the preserved actions)
    expect(wrapper.vm.activeColumns.length).toBe(5);
    expect(wrapper.vm.activeColumns.find((c) => c.key === 'actions')).toBeDefined();

    // Table fields should remain 6
    expect(wrapper.vm.tableFields.length).toBe(6);
    // Available columns passed to picker should still be 6
    expect(columnPicker.props('availableColumns').length).toBe(6);
  });

  it('Calling openModal resets modal values', () => {
    wrapper.vm.openModal('action', 'testId');

    expect(wrapper.vm.modalType).toEqual('action');
    expect(wrapper.vm.selectedCertId).toEqual('testId');
  });

  it('Calling closeModal resets modal values', () => {
    const getListSpy = jest.spyOn(wrapper.vm, 'getList');
    wrapper.setData({
      selectedCertId: 'testCertId',
      currentDeadline: '12-12-2022',
      isRequestLoading: true,
    });

    wrapper.vm.closeModal('campaign-modal');

    expect(wrapper.vm.selectedCertId).toBeFalsy();
    expect(wrapper.vm.currentDeadline).toBeFalsy();
    expect(wrapper.vm.isRequestLoading).toBeFalsy();
    expect(getListSpy).toHaveBeenCalled();
  });

  it('Calling activateCampaign calls api and closes modal', async () => {
    const closeModalSpy = jest.spyOn(wrapper.vm, 'closeModal');
    wrapper.setData({
      selectedCertId: 'testCertId',
    });

    wrapper.vm.activateCampaign();
    await new Promise(process.nextTick);

    expect(CertificationApi.activateCertification).toHaveBeenCalledWith('testCertId');
    expect(closeModalSpy).toHaveBeenCalled();
  });

  it('Calling cancelCampaign calls api and closes modal', async () => {
    const closeModalSpy = jest.spyOn(wrapper.vm, 'closeModal');
    wrapper.setData({
      selectedCertId: 'testCertId',
    });

    wrapper.vm.cancelCampaign();
    await new Promise(process.nextTick);

    expect(CertificationApi.cancelCertification).toHaveBeenCalledWith('testCertId');
    expect(closeModalSpy).toHaveBeenCalled();
  });

  it('Calling deleteCampaign calls api and closes modal', async () => {
    const closeModalSpy = jest.spyOn(wrapper.vm, 'closeModal');
    wrapper.setData({
      selectedCertId: 'testCertId',
    });

    wrapper.vm.deleteCampaign();
    await new Promise(process.nextTick);

    expect(CertificationApi.deleteCertification).toHaveBeenCalledWith('testCertId');
    expect(closeModalSpy).toHaveBeenCalled();
  });

  it('Calling updateCampaignDeadline calls api and closes modal', async () => {
    const closeModalSpy = jest.spyOn(wrapper.vm, 'closeModal');
    wrapper.setData({
      selectedCertId: 'testCertId',
      currentDeadline: '2023-01-26',
    });

    wrapper.vm.updateCampaignDeadline('2023-01-26');
    await new Promise(process.nextTick);

    expect(CertificationApi.updateCertificationDeadline).toHaveBeenCalledWith('testCertId', '2023-01-26');
    expect(closeModalSpy).toHaveBeenCalled();
  });
});
