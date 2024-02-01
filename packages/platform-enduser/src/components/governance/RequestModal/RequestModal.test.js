/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import Notifications from '@kyvg/vue3-notification';
import getPriorityImageSrc from '@/components/utils/governance/AccessRequestUtils';
import i18n from '@/i18n';
import RequestModal, { REQUEST_MODAL_TYPES } from './index';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

jest.mock('@/components/utils/governance/AccessRequestUtils');

describe('RequestModal', () => {
  const typicalPropsData = {
    isApprovals: true,
    isTesting: true,
    type: REQUEST_MODAL_TYPES.APPROVE,
    item: {
      details: {
        id: 1,
        type: 'Remove Entitlement',
        name: 'Groups Administrator',
        description: 'Administers different groups',
        date: '2023-06-22T19:23:26+00:00',
        priority: 'medium',
        icon: 'img/microsoft.8a785075.svg',
        requesteeInfo: {
          mail: 'manuel.escobar@test.com',
          givenName: 'Manuel',
          sn: 'Escobar',
          id: '1234-456-3',
          userName: 'manuel.escobar@test.com',
        },
      },
      rawData: {
        decision: {
          status: 'in-progress',
          comments: [{
            timeStamp: '2023-06-13T15:27:48+00:00',
            user: {
              mail: 'mkormann@frgov.net', givenName: 'Matt', sn: 'Kormann', id: 'managed/user/ae20eee7-89a6-40c6-a150-6797ae92bf2d', userName: 'mkormann',
            },
            comment: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
            action: 'comment',
          }, {
            timeStamp: '2023-06-13T15:27:48+00:00',
            user: {
              mail: 'mkormann@frgov.net', givenName: 'Matt', sn: 'Kormann', id: 'managed/user/ae20eee7-89a6-40c6-a150-6797ae92bf2d', userName: 'mkormann',
            },
            comment: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
            action: 'comment',
          }, {
            timeStamp: '2023-06-13T15:27:48+00:00',
            user: {
              mail: 'mkormann@frgov.net', givenName: 'Matt', sn: 'Kormann', id: 'managed/user/ae20eee7-89a6-40c6-a150-6797ae92bf2d', userName: 'mkormann',
            },
            comment: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
            action: 'comment',
          }, {
            timeStamp: '2023-06-13T15:27:48+00:00',
            user: {
              mail: 'mkormann@frgov.net', givenName: 'Matt', sn: 'Kormann', id: 'managed/user/ae20eee7-89a6-40c6-a150-6797ae92bf2d', userName: 'mkormann',
            },
            comment: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
            action: 'comment',
          }, {
            timeStamp: '2023-06-13T15:27:48+00:00',
            user: {
              mail: 'mkormann@frgov.net', givenName: 'Matt', sn: 'Kormann', id: 'managed/user/ae20eee7-89a6-40c6-a150-6797ae92bf2d', userName: 'mkormann',
            },
            comment: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
            action: 'comment',
          }],
        },
        request: {
          common: {
            justification: 'this is the right thing to do',
          },
        },
        phases: [{
          name: 'phaseTest',
        }],
      },

    },
  };

  const mountGovernanceRequestModal = (props) => mount(RequestModal, {
    attachTo: document.body,
    global: {
      mocks: {
        $t: (text, prop) => i18n.global.t(text, prop),
      },
      plugins: [Notifications],
    },
    props,
  });

  beforeEach(() => {
    getPriorityImageSrc.mockClear();
  });

  it('Approve type should display confirm and cancel buttons', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.APPROVE });

    const confirmButton = await findByTestId(wrapper, 'governance-request-modal-confirm-btn');
    const cancelButton = await findByTestId(wrapper, 'governance-request-modal-cancel-btn');

    expect(confirmButton.exists()).toBeTruthy();
    expect(cancelButton.exists()).toBeTruthy();
  });

  it('changeModal should change the current component type', async () => {
    const wrapper = mountGovernanceRequestModal(typicalPropsData);
    wrapper.vm.modalType = 'APPROVE';
    expect(wrapper.vm.modalType).toEqual('APPROVE');
    wrapper.vm.modalType = 'COMMENT';
    expect(wrapper.vm.modalType).toEqual('COMMENT');
    wrapper.vm.modalType = 'FORWARD';
    expect(wrapper.vm.modalType).toEqual('FORWARD');
    wrapper.vm.modalType = 'REJECT';
    expect(wrapper.vm.modalType).toEqual('REJECT');
  });
  it('modal got updateActors emition and will update information', () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    const defaultActor = {
      id: null,
      permissions: {
        approve: true,
        comment: true,
        modify: true,
        reject: true,
        reassign: true,
      },
    };
    const testActor = {
      id: 'testActor',
      permissions: {
        approve: true,
        comment: true,
        modify: true,
        reject: true,
        reassign: true,
      },
    };
    expect(wrapper.vm.actors).toEqual(defaultActor);
    wrapper.vm.updateActors('testActor');
    expect(wrapper.vm.actors).toEqual(testActor);
  });
  it('modal got updateComment emition and will update information', () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    expect(wrapper.vm.comment).toEqual('');
    wrapper.vm.updateComment('testComment');
    expect(wrapper.vm.comment).toEqual('testComment');
  });
  it('test loading modal', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    wrapper.vm.loading = true;
    await flushPromises();
    const loader = await findByTestId(wrapper, 'loading-modal');
    await wrapper.vm.$nextTick();
    const loadingText = await findByTestId(wrapper, 'loading-text');
    await wrapper.vm.$nextTick();
    const detailsFooter = await findByTestId(wrapper, 'details-footer');
    await wrapper.vm.$nextTick();
    const othersFooter = await findByTestId(wrapper, 'others-footer');
    await wrapper.vm.$nextTick();
    expect(detailsFooter.exists()).toBeFalsy();
    expect(othersFooter.exists()).toBeFalsy();
    expect(loader.exists()).toBeTruthy();
    expect(loadingText.text()).toEqual('Approving Request...');
  });
  it('test comment loading modal', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    wrapper.vm.loading = true;
    wrapper.vm.modalType = 'COMMENT';

    await flushPromises();
    const loader = await findByTestId(wrapper, 'loading-modal');
    await wrapper.vm.$nextTick();
    const loadingText = await findByTestId(wrapper, 'loading-text');
    await wrapper.vm.$nextTick();
    expect(loader.exists()).toBeTruthy();
    expect(loadingText.text()).toEqual('Adding Comment...');
  });
  it('test reassign loading modal', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    wrapper.vm.loading = true;
    wrapper.vm.modalType = 'REASSIGN';

    await flushPromises();
    const loader = await findByTestId(wrapper, 'loading-modal');
    await wrapper.vm.$nextTick();
    const loadingText = await findByTestId(wrapper, 'loading-text');
    await wrapper.vm.$nextTick();
    expect(loader.exists()).toBeTruthy();
    expect(loadingText.text()).toEqual('Forwarding Request...');
  });
  it('test reject loading modal', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    wrapper.vm.loading = true;
    wrapper.vm.modalType = 'REJECT';

    await flushPromises();
    const loader = await findByTestId(wrapper, 'loading-modal');
    await wrapper.vm.$nextTick();
    const loadingText = await findByTestId(wrapper, 'loading-text');
    await wrapper.vm.$nextTick();
    expect(loader.exists()).toBeTruthy();
    expect(loadingText.text()).toEqual('Rejecting Request...');
  });

  it('modalaction got called and called close function with undefined isSuccessfulAction, modaltype = DETAILS', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    const cancel = jest.fn();
    jest.spyOn(AccessRequestApi, 'requestAction').mockImplementation(() => Promise.resolve({ data: 'results' }));
    const closeSpy = jest.spyOn(wrapper.vm, 'close');
    wrapper.vm.modalAction(wrapper.vm.item, cancel);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(closeSpy).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalled();
  });
  it('modalaction got called and called close function with undefined isSuccessfulAction, modaltype = COMMENT', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    const cancel = jest.fn();
    jest.spyOn(AccessRequestApi, 'requestAction').mockImplementation(() => Promise.resolve({ data: 'results' }));
    const closeSpy = jest.spyOn(wrapper.vm, 'close');
    wrapper.vm.modalType = 'COMMENT';
    wrapper.vm.modalAction(wrapper.vm.item, cancel);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(closeSpy).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalled();
  });
  it('modalaction got called and called close function with undefined isSuccessfulAction, modaltype = CANCEL', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    const cancel = jest.fn();
    jest.spyOn(AccessRequestApi, 'requestAction').mockImplementation(() => Promise.resolve({ data: 'results' }));
    const closeSpy = jest.spyOn(wrapper.vm, 'close');
    wrapper.vm.modalType = 'CANCEL';
    wrapper.vm.modalAction(wrapper.vm.item, cancel);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(closeSpy).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalled();
  });
  it('close got called with comment and previousModal = DETAILS', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    const cancel = jest.fn();
    wrapper.vm.modalType = 'COMMENT';
    await flushPromises();
    wrapper.vm.close(cancel);
    await flushPromises();
    expect(cancel).toHaveBeenCalled();
    expect(wrapper.emitted()['update-item'][0]).toEqual([1]);
  });
  it('close got called with reassign and should update list, after calling Cancel', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    const cancel = jest.fn();
    wrapper.vm.modalType = 'REASSIGN';
    wrapper.vm.close(cancel);
    await flushPromises();
    expect(wrapper.emitted()['update-list']).toBeTruthy();
    expect(cancel).toHaveBeenCalled();
  });
});
