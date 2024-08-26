/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  findByTestId,
  findByRole,
  findByText,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import ReportCard from './ReportCard';
import store from '../../store';

store.state.SharedStore.currentPackage = 'admin';
store.state.SharedStore.autoCustomReportsEnabled = true;

describe('Report Card', () => {
  let wrapper;

  const report = {
    name: 'TEMPLATE-NAME',
    version: 0,
    reportConfig: {},
    owner: null,
    type: 'draft',
    createDate: '2010-10-10T10:10:10.123456789Z',
    updateDate: '2010-10-10T10:10:10.123456789Z',
  };

  function setup(props) {
    return mount(ReportCard, {
      global: {
        plugins: [i18n],
      },
      props: {
        report,
        loading: false,
        ...props,
      },
    });
  }

  it('Report card displayed when finish loading and the component receives data', () => {
    wrapper = setup();
    const reportCard = findByTestId(wrapper, 'report-card');
    const skeletonCard = findByTestId(wrapper, 'skeleton-card');
    expect(reportCard.exists()).toBe(true);
    expect(skeletonCard.exists()).toBe(false);
  });

  it('Skeleton card displayed when loading', () => {
    wrapper = setup({ loading: true });
    const reportCard = findByTestId(wrapper, 'report-card');
    const skeletonCard = findByTestId(wrapper, 'skeleton-card');
    expect(reportCard.exists()).toBe(false);
    expect(skeletonCard.exists()).toBe(true);
  });

  it('Nothing is displayed when there is no data', () => {
    wrapper = setup({ report: {} });
    const reportCard = findByTestId(wrapper, 'report-card');
    const skeletonCard = findByTestId(wrapper, 'skeleton-card');
    expect(reportCard.exists()).toBe(false);
    expect(skeletonCard.exists()).toBe(false);
  });

  it('Shows the spinner icon instead of the actions menu when the component is processing', async () => {
    wrapper = setup({
      report: {
        ...report,
        ootb: false,
      },
    });

    let spinnerButton = findByRole(wrapper, 'status');
    expect(spinnerButton.exists()).toBe(false);

    await wrapper.setProps({ reportCurrentlyProcessing: { id: report.name, status: report.type } });
    spinnerButton = findByRole(wrapper, 'status');
    expect(spinnerButton.exists()).toBe(true);
  });

  it('shows the ellipse delete, duplicate, edit and publish options for out-of-the-box (ootb) reports', async () => {
    wrapper = setup({
      report: {
        ...report,
        ootb: false,
      },
    });

    const deleteButton = findByText(wrapper, 'li', 'deleteDelete');
    const duplicateButton = findByText(wrapper, 'li', 'control_point_duplicateDuplicate');
    const editButton = findByText(wrapper, 'li', 'editEdit');
    const publishButton = findByText(wrapper, 'li', 'published_with_changesPublish');

    expect(deleteButton.exists()).toBe(true);
    expect(duplicateButton.exists()).toBe(true);
    expect(editButton.exists()).toBe(true);
    expect(publishButton.exists()).toBe(true);

    // Run History button should always show regardless of out-of-the-box report state
    const runHistoryButton = findByText(wrapper, 'li', 'list_altRun History');
    expect(runHistoryButton.exists()).toBe(true);
  });

  it('hides the ellipse delete, duplicate, edit and publish options for out-of-the-box (ootb) reports', async () => {
    wrapper = setup({
      report: {
        ...report,
        ootb: true,
      },
    });

    const deleteButton = findByText(wrapper, 'li', 'deleteDelete');
    const duplicateButton = findByText(wrapper, 'li', 'control_point_duplicateDuplicate');
    const editButton = findByText(wrapper, 'li', 'editEdit');
    const publishButton = findByText(wrapper, 'li', 'published_with_changesPublish');

    expect(deleteButton).toBeUndefined();
    expect(duplicateButton).toBeUndefined();
    expect(editButton).toBeUndefined();
    expect(publishButton).toBeUndefined();

    // Run History button should always show regardless of out-of-the-box report state
    const runHistoryButton = findByText(wrapper, 'li', 'list_altRun History');
    expect(runHistoryButton.exists()).toBe(true);
  });

  it('hides the ellipse delete, duplicate, edit and publish options if the current package is not equal to "admin"', async () => {
    wrapper = setup({
      report: {
        ...report,
        ootb: false,
      },
    });

    let deleteButton = findByText(wrapper, 'li', 'deleteDelete');
    let duplicateButton = findByText(wrapper, 'li', 'control_point_duplicateDuplicate');
    let editButton = findByText(wrapper, 'li', 'editEdit');
    let publishButton = findByText(wrapper, 'li', 'published_with_changesPublish');

    expect(deleteButton.exists()).toBe(true);
    expect(duplicateButton.exists()).toBe(true);
    expect(editButton.exists()).toBe(true);
    expect(publishButton.exists()).toBe(true);

    // Run History button should always show regardless of the value of the current package
    let runHistoryButton = findByText(wrapper, 'li', 'list_altRun History');
    expect(runHistoryButton.exists()).toBe(true);

    // Sets the currentPackage to 'enduser'
    store.state.SharedStore.currentPackage = 'enduser';

    wrapper = setup({
      report: {
        ...report,
        ootb: false,
      },
    });

    deleteButton = findByText(wrapper, 'li', 'deleteDelete');
    duplicateButton = findByText(wrapper, 'li', 'control_point_duplicateDuplicate');
    editButton = findByText(wrapper, 'li', 'editEdit');
    publishButton = findByText(wrapper, 'li', 'published_with_changesPublish');
    expect(deleteButton).toBeUndefined();
    expect(duplicateButton).toBeUndefined();
    expect(editButton).toBeUndefined();
    expect(publishButton).toBeUndefined();

    // Run History button should always show regardless of the current package
    runHistoryButton = findByText(wrapper, 'li', 'list_altRun History');
    expect(runHistoryButton.exists()).toBe(true);

    // resets the package back to admin so further tests do not fail unexpectedly
    store.state.SharedStore.currentPackage = 'admin';
  });

  it('hides the ellipse delete, duplicate, edit and publish options if the autoCustomReportsEnabled property in the store is not set to true', async () => {
    wrapper = setup({
      report: {
        ...report,
        ootb: false,
      },
    });

    let deleteButton = findByText(wrapper, 'li', 'deleteDelete');
    let duplicateButton = findByText(wrapper, 'li', 'control_point_duplicateDuplicate');
    let editButton = findByText(wrapper, 'li', 'editEdit');
    let publishButton = findByText(wrapper, 'li', 'published_with_changesPublish');

    expect(deleteButton.exists()).toBe(true);
    expect(duplicateButton.exists()).toBe(true);
    expect(editButton.exists()).toBe(true);
    expect(publishButton.exists()).toBe(true);

    // Run History button should always show regardless of the value of the autoCustomReportsEnabled property value
    let runHistoryButton = findByText(wrapper, 'li', 'list_altRun History');
    expect(runHistoryButton.exists()).toBe(true);

    // Sets the store autoCustomReportsEnabled property to false
    store.state.SharedStore.autoCustomReportsEnabled = false;

    wrapper = setup({
      report: {
        ...report,
        ootb: false,
      },
    });

    deleteButton = findByText(wrapper, 'li', 'deleteDelete');
    duplicateButton = findByText(wrapper, 'li', 'control_point_duplicateDuplicate');
    editButton = findByText(wrapper, 'li', 'editEdit');
    publishButton = findByText(wrapper, 'li', 'published_with_changesPublish');
    expect(deleteButton).toBeUndefined();
    expect(duplicateButton).toBeUndefined();
    expect(editButton).toBeUndefined();
    expect(publishButton).toBeUndefined();

    // Run History button should always show regardless of the value of the autoCustomReportsEnabled property value
    runHistoryButton = findByText(wrapper, 'li', 'list_altRun History');
    expect(runHistoryButton.exists()).toBe(true);

    // resets the autoCustomReportsEnabled property back to true so further tests do not fail unexpectedly
    store.state.SharedStore.autoCustomReportsEnabled = true;
  });

  it('emits the correct information when the delete button is clicked', async () => {
    wrapper = setup({
      report: {
        ...report,
        ootb: false,
      },
    });

    const menu = findByRole(wrapper, 'menu');
    const deleteButton = findByText(menu, 'a', 'deleteDelete');
    await deleteButton.trigger('click');
    expect(wrapper.emitted()['delete-template'][0][0]).toEqual(report.name);
    expect(wrapper.emitted()['delete-template'][0][1]).toEqual(report.type);
  });
});
