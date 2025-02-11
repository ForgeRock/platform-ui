/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { findByTestId, findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import dayjs from 'dayjs';
import i18n from '@/i18n';
import RunHistoryDetailsModal from './RunHistoryDetailsModal';

const parameters = {
  OAuth2Applications: 'AD1, Adobe 1, AWS 1',
  Users: 'shin.daniel, joana.baxter, evia.kline, ena.ramos',
  'Start Date': '02/03/2025 11:59 PM',
  'End Date': '03/05/2025 11:59 PM',
};

describe('Run History Details modal component', () => {
  function setup(props) {
    return mount(RunHistoryDetailsModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        parameters,
        show: true,
        tableItem: {
          date: '10/15/2023',
          reportStatus: 'complete',
        },
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(async () => {
      wrapper = setup();
      await nextTick();
    });

    it('emits "modal-toggle" when the "showModal" computed property is updated', async () => {
      const modalElementShowing = findByRole(wrapper, 'dialog');
      expect(modalElementShowing.isVisible()).toBe(true);

      await wrapper.setProps({ show: false });
      expect(wrapper.vm.showModal).toEqual(false);

      const modalElementHidden = findByRole(wrapper, 'dialog');
      expect(modalElementHidden.isVisible()).toBe(false);
    });

    it('displays the started date with expected value', async () => {
      const dateElement = findByTestId(wrapper, 'fr-run-history-summary-modal-date');
      expect(dateElement.text()).toBe(dayjs('10/15/2023').format('MM/DD/YYYY h:mm A'));
    });

    it('displays the report status with expected value', async () => {
      const statusElement = findByTestId(wrapper, 'fr-complete-report-badge');
      expect(statusElement.text()).toBe('Complete');
    });
  });
});
