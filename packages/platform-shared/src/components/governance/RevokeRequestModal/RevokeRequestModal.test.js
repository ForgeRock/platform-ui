/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import RevokeRequestModal from './index';

describe('RevokeRequestModal', () => {
  const stubProps = {
    global: {
      plugins: [i18n],
    },
    props: {
      isTesting: true,
    },
  };

  const setup = (props) => (mount(RevokeRequestModal, {
    ...stubProps,
    ...props,
  }));

  describe('@Component Tests', () => {
    it('emits the expected payload when form is submitted', async () => {
      const wrapper = setup();
      const revokeRequestPayload = {
        expirationDate: '2023-07-07',
        justificationText: 'Justification reason',
        priorityOptions: [...wrapper.vm.priorityOptions],
        selectedPriority: 'high',
      };
      const revokeRequestSubmitButton = findByTestId(wrapper, 'revoke-request-submit-button');
      const justificationField = findByTestId(wrapper, 'justification-field');
      const priorityField = findByTestId(wrapper, 'priority-field');
      const datepicker = findByTestId(wrapper, 'datepicker');
      expect(justificationField.exists()).toBeTruthy();
      expect(priorityField.exists()).toBeTruthy();
      expect(datepicker.exists()).toBeTruthy();

      wrapper.setData(revokeRequestPayload);
      await revokeRequestSubmitButton.trigger('click');
      expect(wrapper.emitted('submission')).toEqual([[{
        expiryDate: revokeRequestPayload.expirationDate,
        justification: revokeRequestPayload.justificationText,
        priority: revokeRequestPayload.selectedPriority,
      }]]);
    });
  });
});
