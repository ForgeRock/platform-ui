/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import { findByText, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import { mount, flushPromises } from '@vue/test-utils';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import i18n from '@/i18n';
import ReportsGrid from './ReportsGrid';
import store from '../../store';

store.state.SharedStore.currentPackage = 'admin';

ValidationRules.extendRules({
  alpha_num_spaces: ValidationRules.getRules(i18n).alpha_num_spaces,
});

jest.mock('vue-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('@forgerock/platform-shared/src/composables/bvModal');

describe('ReportsGrid', () => {
  function setup(props) {
    const bvModalOptions = { show: jest.fn(), hide: jest.fn() };
    useBvModal.mockReturnValue({ bvModal: { value: bvModalOptions, ...bvModalOptions } });
    return mount(ReportsGrid, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        ...props,
      },
    });
  }
  const returnDataSuccess = {
    result: [
      {
        name: 'TEMPLATE-NAME',
        description: 'Lorem ipsum.',
        version: 0,
        reportConfig: {},
        owner: null,
        ootb: false,
        type: 'draft',
        createDate: '2010-10-10T10:10:10.123456789Z',
        updateDate: '2010-10-10T10:10:10.123456789Z',
      },
    ],
  };
  const returnDataFail = {
    result: [],
  };

  it('Report cards displayed successfully', async () => {
    AutoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve(returnDataSuccess));
    const wrapper = setup();
    await flushPromises();
    const templatesGrid = findByText(wrapper, 'h2', 'Template Name');
    const noData = findByTestId(wrapper, 'no-data');
    expect(templatesGrid.exists()).toBe(true);
    expect(noData.exists()).toBe(false);
  });

  it('No data div displayed when error', async () => {
    AutoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve(returnDataFail));
    const wrapper = setup();
    await flushPromises();
    const reportTemplatesGrid = findByTestId(wrapper, 'report-templates-grid');
    const noData = findByTestId(wrapper, 'no-data');
    expect(reportTemplatesGrid.exists()).toBe(false);
    expect(noData.exists()).toBe(true);
  });

  it('ensures that the confirm delete modal call is executed when the delete report button is clicked', async () => {
    AutoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve(returnDataSuccess));
    const wrapper = setup();
    await flushPromises();

    const showSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    const deleteButton = findByText(wrapper, 'span', 'Delete');
    await deleteButton.trigger('click');
    expect(showSpy).toHaveBeenCalledWith('deleteModal');
  });

  it('deletes a report', async () => {
    AutoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve(returnDataSuccess));
    AutoApi.deleteAnalyticsReport = jest.fn().mockReturnValue(Promise.resolve({}));
    const wrapper = setup();
    await flushPromises();

    // Opens delete modal
    await findByText(wrapper, 'span', 'Delete').trigger('click');

    const { name, type } = returnDataSuccess.result[0];
    const deleteAnalyticsReportSpy = jest.spyOn(AutoApi, 'deleteAnalyticsReport');
    const deleteModal = wrapper.find('#deleteModal');
    const deleteButton = findByText(deleteModal, 'button', 'Delete');
    await deleteButton.trigger('click');
    expect(deleteAnalyticsReportSpy).toHaveBeenCalledWith(name, type);
  });

  it('routes to expected location when the edit report button is clicked', async () => {
    AutoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve(returnDataSuccess));
    const wrapper = setup();
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.router, 'push');
    const editButton = findByText(wrapper, 'span', 'Edit');
    await editButton.trigger('click');
    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'EditReportTemplate',
      params: { state: 'draft', template: 'template-name' },
    });
  });
});
