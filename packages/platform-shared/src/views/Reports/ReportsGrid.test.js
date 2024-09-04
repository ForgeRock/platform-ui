/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import { findByText, findAllByTestId, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import { mount, flushPromises } from '@vue/test-utils';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import i18n from '@/i18n';
import ReportsGrid from './ReportsGrid';
import store from '../../store';

store.state.SharedStore.currentPackage = 'admin';
store.state.SharedStore.autoCustomReportsEnabled = true;

ValidationRules.extendRules({
  alpha_num_spaces: ValidationRules.getRules(i18n).alpha_num_spaces,
  unique: ValidationRules.getRules(i18n).unique,
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
  const returnDataSuccessDraft = {
    result: [
      {
        name: 'DRAFT-TEMPLATE-NAME',
        description: 'Lorem ipsum.',
        version: 0,
        reportConfig: {},
        owner: null,
        ootb: false,
        type: 'draft',
        createDate: '2010-10-10T10:10:10.123456789Z',
        updateDate: '2010-10-10T10:10:10.123456789Z',
      },
      {
        name: 'PUBLISHED-TEMPLATE-NAME',
        description: 'Lorem ipsum.',
        version: 0,
        reportConfig: {},
        owner: null,
        ootb: false,
        type: 'published',
        createDate: '2010-10-10T10:10:10.123456789Z',
        updateDate: '2010-10-10T10:10:10.123456789Z',
      },
    ],
  };
  const returnDataFail = {
    result: [],
  };

  beforeEach(() => {
    AutoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve(returnDataSuccessDraft));
  });

  it('Report cards displayed successfully', async () => {
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
    const wrapper = setup();
    await flushPromises();

    const showSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    const deleteButton = findByText(wrapper, 'span', 'Delete');
    await deleteButton.trigger('click');
    expect(showSpy).toHaveBeenCalledWith('deleteModal');
  });

  it('deletes a report', async () => {
    AutoApi.deleteAnalyticsReport = jest.fn().mockReturnValue(Promise.resolve({}));
    const wrapper = setup();
    await flushPromises();

    // Opens delete modal
    await findByText(wrapper, 'span', 'Delete').trigger('click');

    const { name, type } = returnDataSuccessDraft.result[0];
    const deleteAnalyticsReportSpy = jest.spyOn(AutoApi, 'deleteAnalyticsReport');
    const deleteModal = wrapper.find('#deleteModal');
    const deleteButton = findByText(deleteModal, 'button', 'Delete');
    await deleteButton.trigger('click');
    expect(deleteAnalyticsReportSpy).toHaveBeenCalledWith(name, type);
  });

  it('routes to expected location when the edit report button is clicked for a draft report', async () => {
    const wrapper = setup();
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.router, 'push');
    const editButton = findByText(wrapper, 'span', 'Edit');
    await editButton.trigger('click');
    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'EditReportTemplate',
      params: { state: 'draft', template: 'draft-template-name' },
    });
  });

  it('routes to expected location when the edit report button is clicked for a published report', async () => {
    AutoApi.editAnalyticsReport = jest.fn().mockReturnValue(Promise.resolve({}));
    const wrapper = setup();
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.router, 'push');
    const editButton = findByText(wrapper, 'span', 'Edit');
    await editButton.trigger('click');
    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'EditReportTemplate',
      params: { state: 'draft', template: 'draft-template-name' },
    });
  });

  it('hides the "New Report" button if the autoCustomReportsEnabled property in the store is set to false', async () => {
    let wrapper = setup();
    await flushPromises();

    let newReportButton = findByText(wrapper, 'button', 'add New Report');
    expect(newReportButton.exists()).toBe(true);

    store.state.SharedStore.autoCustomReportsEnabled = false;
    wrapper = setup();
    await flushPromises();

    newReportButton = findByText(wrapper, 'button', 'add New Report');
    expect(newReportButton).toBeUndefined();

    // Setting this property back to true so further tests do not fail unexpectedly
    store.state.SharedStore.autoCustomReportsEnabled = true;
  });

  it('opens the new report modal when the "Duplicate" button is clicked', async () => {
    const wrapper = setup();
    await flushPromises();

    const showSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    const duplicateButton = findByText(wrapper, 'span', 'Duplicate');
    await duplicateButton.trigger('click');
    expect(showSpy).toHaveBeenCalledWith('new-report-modal');
  });

  it('ensures that the new report modal form name field throws a validation error when a duplicate name input is part of the overall list but not part of the search report list', async () => {
    jest.useFakeTimers();
    const wrapper = setup();
    await flushPromises();

    let reportTemplateCards = findAllByTestId(wrapper, 'report-card');
    expect(reportTemplateCards.length).toBe(2);

    const [draftTemplate, publishedTemplate] = reportTemplateCards;
    expect(draftTemplate.find('h2').text()).toBe('Draft Template Name');
    expect(publishedTemplate.find('h2').text()).toBe('Published Template Name');

    // Opens new report modal
    const newReportButton = findByText(wrapper, 'button', 'add New Report');
    await newReportButton.trigger('click');

    // Expects that the name input does not have a validation error on load
    const [, newReportModal] = wrapper.findAll('div[role="dialog"]');
    let validationError = findByText(newReportModal, 'p', 'Must be unique');
    expect(validationError).toBeUndefined();

    // Inputs an existing template name
    const nameInput = newReportModal.find('input[name="name-field"]');
    await nameInput.setValue('Published template name');
    await flushPromises();

    // Expects that the name input has a validation error letting the user know that the name is not unique
    validationError = findByText(newReportModal, 'p', 'Must be unique');
    expect(validationError).toBeDefined();

    // Clears the name input field
    await nameInput.setValue('');

    // Cancels the new report modal
    const cancelButton = findByText(newReportModal, 'button', 'Cancel');
    await cancelButton.trigger('click');

    // We want to search and filter out the report template list to include only the second result that matches the search string
    AutoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve({ result: [returnDataSuccessDraft.result[1]] }));
    const reportSearchField = wrapper.find('input[type="search"]');
    await reportSearchField.setValue('Published template name');
    await flushPromises();
    // debounce timer
    jest.runAllTimers();
    // renders skeleton loader
    await nextTick();
    // renders search results
    await nextTick();

    // There should only be the Published report card displayed after searching
    reportTemplateCards = findAllByTestId(wrapper, 'report-card');
    expect(reportTemplateCards.length).toBe(1);
    const [draftTemplateAfterSearch] = reportTemplateCards;
    expect(draftTemplateAfterSearch.find('h2').text()).toBe('Published Template Name');

    // We want to open the new report modal again and ensure that we still get a validation error when we type
    // "Draft template name" into the name input field, even though the search results only show one report card
    await newReportButton.trigger('click');

    // Expects that the name input does not have a validation error on load
    validationError = findByText(newReportModal, 'p', 'Must be unique');
    expect(validationError).toBeUndefined();

    // Inputs an existing template name that is not part of the search results
    await nameInput.setValue('Draft template name');
    await flushPromises();

    // Expects that we get the same validation error letting the user know that the
    // name is not unique even though the search results only shows the published template
    validationError = findByText(newReportModal, 'p', 'Must be unique');
    expect(validationError).toBeDefined();
  });
});
