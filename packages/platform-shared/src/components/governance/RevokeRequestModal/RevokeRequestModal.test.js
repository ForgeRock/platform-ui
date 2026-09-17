/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
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

  describe('@a11y', () => {
    it('associates the Priority and request expiration labels with their controls', () => {
      const wrapper = setup();

      const labels = wrapper.findAll('label').map((label) => label.text());
      expect(labels).toContain('Priority');
      expect(labels).toContain('Request Expiration (optional)');

      // The expiration label must reference an existing labelable element —
      // bootstrap-vue renders the datepicker toggle <button> with the passed id
      const expirationLabel = wrapper.findAll('label').find((label) => label.attributes('for') === 'revokeExpirationDate');
      expect(expirationLabel).toBeTruthy();
      const expirationTarget = wrapper.find('#revokeExpirationDate');
      expect(expirationTarget.exists()).toBe(true);
      expect(expirationTarget.element.tagName).toBe('BUTTON');

      // The Priority select wrapper must be labelled by the Priority label
      const priorityLabel = wrapper.findAll('label').filter((label) => label.text() === 'Priority')[0];
      expect(priorityLabel.attributes('id')).toBeTruthy();
      const combobox = wrapper.find('[role="combobox"]');
      expect(combobox.exists()).toBe(true);
      expect(combobox.attributes('aria-labelledby')).toBe(priorityLabel.attributes('id'));
    });

    it('has no accessibility violations', async () => {
      const wrapper = setup();

      await runA11yTest(wrapper);
    });
  });
});
