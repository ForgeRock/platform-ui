/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import getPriorityImageSrc from '@/components/utils/governance/AccessRequestUtils';
import RequestModal, { REQUEST_MODAL_TYPES } from './index';
import i18n from '@/i18n';

jest.mock('@/components/utils/governance/AccessRequestUtils');

describe('RequestModal', () => {
  const typicalPropsData = {
    isTesting: true,
    type: REQUEST_MODAL_TYPES.DETAILS,
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
        },
        request: {
          common: {
            justification: 'this is the right thing to do',
          },
        },
      },

    },
  };

  const mountGovernanceRequestModal = (propsData) => mount(RequestModal, {
    attachTo: document.body,
    mocks: {
      $t: (text, prop) => i18n.t(text, prop),
    },
    propsData,
  });

  beforeEach(() => {
    getPriorityImageSrc.mockClear();
  });

  it('Details type should display approve, reject and forward buttons', async () => {
    const wrapper = mountGovernanceRequestModal(typicalPropsData);

    const approveButton = await findByTestId(wrapper, 'governance-request-modal-goto-approve-btn');
    const rejectButton = await findByTestId(wrapper, 'governance-request-modal-goto-reject-btn');
    const forwardButton = await findByTestId(wrapper, 'governance-request-modal-goto-forward-btn');
    const doneButton = await findByTestId(wrapper, 'governance-request-modal-done-btn');

    expect(approveButton.exists()).toBeTruthy();
    expect(rejectButton.exists()).toBeTruthy();
    expect(forwardButton.exists()).toBeTruthy();
    expect(doneButton.exists()).toBeTruthy();
  });

  it('Approve type should display details, confirm and cancel buttons', async () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData, type: REQUEST_MODAL_TYPES.APPROVE });

    const detailsButton = await findByTestId(wrapper, 'governance-request-modal-goto-details-link');
    const confirmButton = await findByTestId(wrapper, 'governance-request-modal-confirm-btn');
    const cancelButton = await findByTestId(wrapper, 'governance-request-modal-cancel-btn');

    expect(detailsButton.exists()).toBeTruthy();
    expect(confirmButton.exists()).toBeTruthy();
    expect(cancelButton.exists()).toBeTruthy();
  });

  it('Can navigate to other modal views and back', async () => {
    const wrapper = mountGovernanceRequestModal(typicalPropsData);

    let approveButton = await findByTestId(wrapper, 'governance-request-modal-goto-approve-btn');
    expect(approveButton.exists()).toBeTruthy();

    await approveButton.trigger('click');

    const detailsButton = await findByTestId(wrapper, 'governance-request-modal-goto-details-link');
    expect(detailsButton.exists()).toBeTruthy();

    await approveButton.trigger('click');

    approveButton = await findByTestId(wrapper, 'governance-request-modal-goto-approve-btn');
    expect(approveButton.exists()).toBeTruthy();
  });
  it('changeModal should change the current component type', async () => {
    const wrapper = mountGovernanceRequestModal(typicalPropsData);
    expect(wrapper.vm.modalType).toEqual('DETAILS');
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
    expect(wrapper.vm.actors).toEqual('');
    wrapper.vm.updateActors('testActor');
    expect(wrapper.vm.actors).toEqual('testActor');
  });
  it('modal got updateComment emition and will update information', () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    expect(wrapper.vm.comment).toEqual('');
    wrapper.vm.updateComment('testComment');
    expect(wrapper.vm.comment).toEqual('testComment');
  });
  it('reset modal will reset Modal type to original type', () => {
    const wrapper = mountGovernanceRequestModal({ ...typicalPropsData });
    expect(wrapper.vm.modalType).toEqual('DETAILS');
    wrapper.vm.modalType = 'APPROVE';
    expect(wrapper.vm.modalType).toEqual('APPROVE');
    wrapper.vm.resetModal();
    expect(wrapper.vm.modalType).toEqual('DETAILS');
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
});
