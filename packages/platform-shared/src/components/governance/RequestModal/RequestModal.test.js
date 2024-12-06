/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';
import RequestModal from './RequestModal';

jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');

const requestActionSpy = jest.spyOn(AccessRequestApi, 'requestAction').mockReturnValue(Promise.resolve({ data: {} }));
ManagedResourceApi.getManagedResourceList.mockResolvedValue({
  data: {
    result: [
      {
        _id: 'd34a9575-c714-4cf3-8b62-f975af04a0b9',
        givenName: 'Alyson',
        mail: 'Alyson@IGATestQA.onmicrosoft.com',
        sn: 'Skelly',
        userName: 'Alyson@IGATestQA.onmicrosoft.com',
      },
    ],
  },
});

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

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
        requestedFor: {
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
    global: {
      mocks: {
        $t: (text, prop) => i18n.global.t(text, prop),
      },
    },
    props,
  });

  it('Approve type should display confirm and cancel buttons', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.APPROVE });

    const confirmButton = await findByTestId(wrapper, 'governance-request-modal-confirm-btn');
    const cancelButton = await findByTestId(wrapper, 'governance-request-modal-cancel-btn');

    expect(confirmButton.exists()).toBeTruthy();
    expect(cancelButton.exists()).toBeTruthy();
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

    const loader = findByTestId(wrapper, 'loading-modal');
    expect(loader.exists()).toBeTruthy();
    const loadingText = findByTestId(wrapper, 'loading-text');
    expect(loadingText.text()).toEqual('Approving Request...');
    const detailsFooter = findByTestId(wrapper, 'details-footer');
    expect(detailsFooter.exists()).toBeFalsy();
    const othersFooter = findByTestId(wrapper, 'others-footer');
    expect(othersFooter.exists()).toBeFalsy();
  });
  it('test comment loading modal', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.COMMENT });
    wrapper.vm.loading = true;
    await flushPromises();

    const loader = findByTestId(wrapper, 'loading-modal');
    expect(loader.exists()).toBeTruthy();
    const loadingText = findByTestId(wrapper, 'loading-text');
    expect(loadingText.text()).toEqual('Adding Comment...');
  });
  it('test reassign loading modal', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.REASSIGN });
    wrapper.vm.loading = true;
    await flushPromises();

    const loader = findByTestId(wrapper, 'loading-modal');
    expect(loader.exists()).toBeTruthy();
    const loadingText = findByTestId(wrapper, 'loading-text');
    expect(loadingText.text()).toEqual('Forwarding Request...');
  });
  it('test reject loading modal', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.REJECT });
    wrapper.vm.loading = true;
    await flushPromises();

    const loader = findByTestId(wrapper, 'loading-modal');
    expect(loader.exists()).toBeTruthy();
    const loadingText = findByTestId(wrapper, 'loading-text');
    expect(loadingText.text()).toEqual('Rejecting Request...');
  });
  it('test deny loading modal', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.DENY });
    wrapper.vm.loading = true;
    await flushPromises();

    const loader = findByTestId(wrapper, 'loading-modal');
    expect(loader.exists()).toBeTruthy();
    const loadingText = findByTestId(wrapper, 'loading-text');
    expect(loadingText.text()).toEqual('Rejecting Task...');
  });
  it('test fulfill loading modal', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.FULFILL });
    wrapper.vm.loading = true;
    await flushPromises();

    const loader = findByTestId(wrapper, 'loading-modal');
    expect(loader.exists()).toBeTruthy();
    const loadingText = findByTestId(wrapper, 'loading-text');
    expect(loadingText.text()).toEqual('Completing Task...');
  });
  it('closing comment modal should call cancel and emit update-item event', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.COMMENT });
    const cancel = jest.fn();
    await flushPromises();
    wrapper.vm.close(cancel);
    await flushPromises();
    expect(cancel).toHaveBeenCalled();
    expect(wrapper.emitted()['update-item'][0]).toEqual([1]);
  });
  it('closing non comment modal should call cancel enad emit update-list event', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.REASSIGN });
    const cancel = jest.fn();
    wrapper.vm.close(cancel);
    await flushPromises();
    expect(wrapper.emitted()['update-list']).toBeTruthy();
    expect(cancel).toHaveBeenCalled();
  });
  it('calls requestAction with justification from reject modal', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.REJECT });
    await flushPromises();

    const justificationField = wrapper.find('textarea');
    justificationField.setValue('test justification');
    const rejectButton = wrapper.findAllComponents('[type="button"]').filter((x) => x.text().includes('Reject'))[0];
    rejectButton.trigger('click');

    expect(requestActionSpy).toHaveBeenCalledWith(1, 'reject', 'phaseTest', { justification: 'test justification' });
  });
  it('will forward a request with the correct permissions', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.REASSIGN });
    await flushPromises();
    wrapper.findComponent('#request_modal___BV_modal_outer_').vm.$emit('shown');
    await flushPromises();

    const justificationField = wrapper.find('textarea');
    justificationField.setValue('test justification');
    await flushPromises();

    const forwardButton = wrapper.findAllComponents('[type="button"]').filter((x) => x.text().includes('Forward'))[0];
    forwardButton.trigger('click');

    await flushPromises();

    expect(requestActionSpy).toHaveBeenCalledWith(1, 'reassign', 'phaseTest', {
      comment: 'test justification',
      updatedActors: [
        {
          id: 'managed/user/d34a9575-c714-4cf3-8b62-f975af04a0b9',
          permissions: {
            approve: true,
            comment: true,
            modify: true,
            reject: true,
            reassign: true,
          },
        },
      ],
    });
  });
  it('will forward a fulfill task with the correct permissions', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.REASSIGN, isTask: true });
    await flushPromises();
    wrapper.findComponent('#request_modal___BV_modal_outer_').vm.$emit('shown');
    await flushPromises();

    const justificationField = wrapper.find('textarea');
    justificationField.setValue('test justification');
    await flushPromises();

    const forwardButton = wrapper.findAllComponents('[type="button"]').filter((x) => x.text().includes('Forward'))[0];
    forwardButton.trigger('click');

    await flushPromises();

    expect(requestActionSpy).toHaveBeenCalledWith(1, 'reassign', 'phaseTest', {
      comment: 'test justification',
      updatedActors: [
        {
          id: 'managed/user/d34a9575-c714-4cf3-8b62-f975af04a0b9',
          permissions: {
            comment: true,
            deny: true,
            fulfill: true,
            modify: true,
            reassign: true,
          },
        },
      ],
    });
  });
});
