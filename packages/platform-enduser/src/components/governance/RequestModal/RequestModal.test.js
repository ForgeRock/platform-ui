/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import RequestModal, { REQUEST_MODAL_TYPES } from './index';

describe('RequestModal', () => {
  const typicalPropsData = {
    isTesting: true,
    type: REQUEST_MODAL_TYPES.DETAILS,
    item: {
      key: 1,
    },
  };
  const mountGovernanceRequestModal = (propsData) => mount(RequestModal, {
    attachTo: document.body,
    mocks: {
      $t: () => {},
    },
    propsData,
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
});
