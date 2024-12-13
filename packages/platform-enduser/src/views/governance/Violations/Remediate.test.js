/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { createRouter, createWebHistory } from 'vue-router';
import * as ViolationApi from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import * as Notification from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';
import Remediate from './Remediate';
import EntitlementsSearchableList from '@/components/governance/EntitlementsCart/EntitlementsSearchableList';
import * as store from '@/store';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/violations/remediate/:violationId',
      name: 'ViolationRemediate',
      component: Remediate,
    },
    {
      path: '/violations/:itemType/:violationId/remediate',
      name: 'ViolationEditRemediate',
      component: Remediate,
    },
  ],
});

function createViolationMock() {
  return {
    decision: {
      status: 'in-progress',
      startDate: '2024-05-23T20:55:02+00:00',
      phases: [
        {
          name: 'violationTask-df7f65b04ec3',
          displayName: 'Start Violation Task',
        },
      ],
      compositeIds: [
        [
          'compositeId1',
        ],
        [
          'compositeId2',
        ],
      ],
    },
    policyRule: {
      name: 'ALL SimulateFalse OR - Prev Det',
      description: 'ALL SimulateFalse OR - Prev Det',
      id: '14e59c8e-3680-45e1-8a6f-08edf6f9d12e',
      correctionAdvice: 'Advice test',
    },
    user: {
      cn: 'Robert2930 Mendoza',
      givenName: 'Robert2930',
      id: '54d5051b-0bb1-4a91-b04a-74a065b1742e',
      mail: 'Robert_2930@IGATestQA.onmicrosoft.com',
      sn: 'Mendoza',
      userName: 'Robert_2930@IGATestQA.onmicrosoft.com',
    },
    violatingAccess: [
      {
        compositeId: 'compositeId2',
        application: {
          description: 'Target AD App',
          icon: '',
          id: '18fc3005-19a2-4e46-8b10-64c9cbb13aaa',
          name: 'Targettestigaautom21',
          templateName: 'azure.ad',
          templateVersion: '2.2',
        },
        'descriptor.idx./entitlement.displayName': 'Teaching laboratory technician2866',
        'glossary.idx./entitlement.description': '767494e5-2868-4803-90a0-933b080fef62',
      },
      {
        compositeId: 'compositeId1',
        application: {
          description: 'Target AD App',
          icon: '',
          id: '18fc3005-19a2-4e46-8b10-64c9cbb13aaa',
          name: 'Targettestigaautom21',
          templateName: 'azure.ad',
          templateVersion: '2.2',
        },
        'descriptor.idx./entitlement.displayName': 'Careers information officer3583',
        'glossary.idx./entitlement.description': '2446621e-895f-4664-bb6e-c107706a4fd0',
      },
    ],
    id: '53feffce-1ade-4627-ac6c-b12ea7429ea6',
  };
}

describe('Remediate', () => {
  function setup() {
    setupTestPinia();
    return mount(Remediate, {
      global: {
        plugins: [i18n, router],
      },
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch correctly the violation data and load values', async () => {
    const violation = createViolationMock();
    ViolationApi.getViolation = jest.fn().mockImplementation(() => Promise.resolve({ data: violation }));

    const wrapper = setup();

    await flushPromises();

    expect(wrapper.vm.violation).toEqual(violation);
    expect(wrapper.vm.entitlements).toEqual([
      {
        app: {
          description: 'Target AD App',
          icon: '',
          id: '18fc3005-19a2-4e46-8b10-64c9cbb13aaa',
          name: 'Targettestigaautom21',
          templateName: 'azure.ad',
          templateVersion: '2.2',
        },
        appName: 'Targettestigaautom21',
        compositeId: 'compositeId1',
        description: '2446621e-895f-4664-bb6e-c107706a4fd0',
        name: 'Careers information officer3583',
      },
    ]);
    expect(wrapper.vm.conflictEntitlements).toEqual([
      {
        app: {
          description: 'Target AD App',
          icon: '',
          id: '18fc3005-19a2-4e46-8b10-64c9cbb13aaa',
          name: 'Targettestigaautom21',
          templateName: 'azure.ad',
          templateVersion: '2.2',
        },
        appName: 'Targettestigaautom21',
        compositeId: 'compositeId2',
        description: '767494e5-2868-4803-90a0-933b080fef62',
        name: 'Teaching laboratory technician2866',
      },
    ]);
    expect(wrapper.vm.selectedEntitlements).toEqual([]);
  });

  it('should setup breadcrumb to violations when the route is ViolationRemediate', async () => {
    const violation = createViolationMock();
    ViolationApi.getViolation = jest.fn().mockImplementation(() => Promise.resolve({ data: violation }));
    router.push('/violations/remediate/53feffce-1ade-4627-ac6c-b12ea7429ea6');
    await flushPromises();

    const wrapper = setup();

    await flushPromises();

    expect(wrapper.vm.breadcrumbPath).toEqual('/violations');
    expect(wrapper.vm.breadcrumbTitle).toEqual('Violations');
  });

  it('should setup breadcrumb to violation edit when the route is ViolationEditRemediate', async () => {
    const violation = createViolationMock();
    ViolationApi.getViolation = jest.fn().mockImplementation(() => Promise.resolve({ data: violation }));
    router.push('/violations/violation/53feffce-1ade-4627-ac6c-b12ea7429ea6/remediate');
    await flushPromises();

    const wrapper = setup();

    await flushPromises();

    expect(wrapper.vm.breadcrumbPath).toEqual('/violations/violation/53feffce-1ade-4627-ac6c-b12ea7429ea6');
    expect(wrapper.vm.breadcrumbTitle).toEqual('Violation');
  });

  it('should show error message if the violation data fetch fails', async () => {
    const error = new Error('ERROR');
    ViolationApi.getViolation = jest.fn().mockImplementation(() => Promise.reject(error));
    const showErrorMessageSpy = jest.spyOn(Notification, 'showErrorMessage');

    const wrapper = setup();

    await flushPromises();

    expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error getting the violation data');
    expect(wrapper.vm.violation).toBeNull();
  });

  it('should render the user and policy information', async () => {
    const violation = createViolationMock();
    ViolationApi.getViolation = jest.fn().mockImplementation(() => Promise.resolve({ data: violation }));

    const wrapper = setup();

    await flushPromises();

    const columns = wrapper.findAll('.col-lg-4');

    const userColumn = columns[0];
    expect(userColumn.find('h2').text()).toBe('Robert2930 Mendoza');
    expect(userColumn.find('p.h5').text()).toBe('Robert2930 Mendoza');
    expect(userColumn.findAll('small')[1].text()).toBe('Robert_2930@IGATestQA.onmicrosoft.com');

    const violationColumn = columns[1];
    expect(violationColumn.find('h2').text()).toBe('ALL SimulateFalse OR - Prev Det');
    expect(violationColumn.find('p').text()).toBe('ALL SimulateFalse OR - Prev Det');

    const remediationColumn = columns[2];
    expect(remediationColumn.find('p').text()).toBe('Advice test');
  });

  it('should add entitlements to the cart if a list is added', async () => {
    const violation = createViolationMock();
    ViolationApi.getViolation = jest.fn().mockImplementation(() => Promise.resolve({ data: violation }));

    const wrapper = setup();

    await flushPromises();

    const entitlementsLists = wrapper.findAllComponents(EntitlementsSearchableList);
    expect(entitlementsLists).toHaveLength(2);

    entitlementsLists[0].vm.$emit('add-all', [{
      name: 'testName',
      description: 'testDescription',
      appName: 'testAppName',
      app: 'testApp',
      compositeId: 'testCompositeId',
    },
    {
      name: 'testName2',
      description: 'testDescription2',
      appName: 'testAppName2',
      app: 'testApp2',
      compositeId: 'testCompositeId2',
    }]);
    await flushPromises();

    expect(wrapper.vm.selectedEntitlements).toEqual([
      {
        name: 'testName',
        description: 'testDescription',
        appName: 'testAppName',
        app: 'testApp',
        compositeId: 'testCompositeId',
      },
      {
        name: 'testName2',
        description: 'testDescription2',
        appName: 'testAppName2',
        app: 'testApp2',
        compositeId: 'testCompositeId2',
      },
    ]);
  });

  it('should replace entitlements in the cart if another list is added', async () => {
    const violation = createViolationMock();
    ViolationApi.getViolation = jest.fn().mockImplementation(() => Promise.resolve({ data: violation }));

    const wrapper = setup();

    await flushPromises();

    const entitlementsLists = wrapper.findAllComponents(EntitlementsSearchableList);
    expect(entitlementsLists).toHaveLength(2);

    entitlementsLists[0].vm.$emit('add-all', [{
      name: 'testName',
      description: 'testDescription',
      appName: 'testAppName',
      app: 'testApp',
      compositeId: 'testCompositeId',
    },
    {
      name: 'testName2',
      description: 'testDescription2',
      appName: 'testAppName2',
      app: 'testApp2',
      compositeId: 'testCompositeId2',
    }]);
    await flushPromises();

    expect(wrapper.vm.selectedEntitlements).toEqual([
      {
        name: 'testName',
        description: 'testDescription',
        appName: 'testAppName',
        app: 'testApp',
        compositeId: 'testCompositeId',
      },
      {
        name: 'testName2',
        description: 'testDescription2',
        appName: 'testAppName2',
        app: 'testApp2',
        compositeId: 'testCompositeId2',
      },
    ]);

    entitlementsLists[1].vm.$emit('add-all', [{
      name: 'testName3',
      description: 'testDescription3',
      appName: 'testAppName3',
      app: 'testApp3',
      compositeId: 'testCompositeId3',
    },
    {
      name: 'testName4',
      description: 'testDescription4',
      appName: 'testAppName4',
      app: 'testApp4',
      compositeId: 'testCompositeId4',
    }]);
    await flushPromises();

    expect(wrapper.vm.selectedEntitlements).toEqual([
      {
        name: 'testName3',
        description: 'testDescription3',
        appName: 'testAppName3',
        app: 'testApp3',
        compositeId: 'testCompositeId3',
      },
      {
        name: 'testName4',
        description: 'testDescription4',
        appName: 'testAppName4',
        app: 'testApp4',
        compositeId: 'testCompositeId4',
      },
    ]);
  });

  it('should revoke a violation correctly, this also should decrease the violations count on the store', async () => {
    const violation = createViolationMock();
    ViolationApi.getViolation = jest.fn().mockImplementation(() => Promise.resolve({ data: violation }));
    const pushSpy = jest.spyOn(router, 'push');

    const wrapper = setup();

    await flushPromises();

    wrapper.vm.selectedEntitlements = [{
      name: 'testName',
      description: 'testDescription',
      appName: 'testAppName',
      app: 'testApp',
      compositeId: 'testCompositeId',
    },
    {
      name: 'testName2',
      description: 'testDescription2',
      appName: 'testAppName2',
      app: 'testApp2',
      compositeId: 'testCompositeId2',
    }];
    await flushPromises();

    ViolationApi.remediate = jest.fn().mockImplementation(() => Promise.resolve());
    const displayNotificationSpy = jest.spyOn(Notification, 'displayNotification');
    store.default.replaceState({
      violationsCount: 1,
      SharedStore: {},
    });
    const storeSpy = jest.spyOn(store.default, 'commit').mockImplementation();

    const revokeButton = wrapper.find('.btn-primary');
    await revokeButton.trigger('click');

    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Violation successfully fixed');
    expect(pushSpy).toHaveBeenCalledWith({ name: 'Violations' });
    expect(storeSpy).toHaveBeenCalledWith('setViolationsCount', 0);
  });

  it('revoke button is disabled if there is no entitlements selected', async () => {
    const violation = createViolationMock();
    ViolationApi.getViolation = jest.fn().mockImplementation(() => Promise.resolve({ data: violation }));

    const wrapper = setup();

    await flushPromises();

    const revokeButton = wrapper.find('.btn-primary');

    expect(revokeButton.attributes('disabled')).toBe('');
  });

  it('should show error message if the violation cannot be revoked', async () => {
    const violation = createViolationMock();
    ViolationApi.getViolation = jest.fn().mockImplementation(() => Promise.resolve({ data: violation }));
    const pushSpy = jest.spyOn(router, 'push');

    const wrapper = setup();

    await flushPromises();

    wrapper.vm.selectedEntitlements = [{
      name: 'testName',
      description: 'testDescription',
      appName: 'testAppName',
      app: 'testApp',
      compositeId: 'testCompositeId',
    },
    {
      name: 'testName2',
      description: 'testDescription2',
      appName: 'testAppName2',
      app: 'testApp2',
      compositeId: 'testCompositeId2',
    }];
    await flushPromises();

    const error = new Error('ERROR');
    ViolationApi.remediate = jest.fn().mockImplementation(() => Promise.reject(error));

    const revokeButton = wrapper.find('.btn-primary');
    await revokeButton.trigger('click');

    expect(wrapper.vm.isError).toBe(true);
    expect(wrapper.vm.cartExpanded).toBe(true);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(pushSpy).not.toHaveBeenCalled();

    const errorMessage = wrapper.find('[role="alert"]');
    expect(errorMessage.text()).toBe('error_outlineRevoking the selected entitlements did not fix the violation. Revoke additional entitlements and try again');
  });
});
