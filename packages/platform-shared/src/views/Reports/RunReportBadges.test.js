/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import RunReportBadges from './RunReportBadges';

describe('Run Report Badges modal component', () => {
  function setup(props) {
    return mount(RunReportBadges, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  let wrapper;

  describe('@renders', () => {
    it('ensures that on mount, the spinner is showing', () => {
      wrapper = setup();
      const spinnerElement = findByTestId(wrapper, 'fr-report-badge-spinner');
      expect(spinnerElement.exists()).toBe(true);
    });

    it('ensures that the badge shows as "Complete" when the "reportStatus" prop equals to "complete"', () => {
      wrapper = setup({ reportStatus: 'complete' });

      const spinnerElement = findByTestId(wrapper, 'fr-report-badge-spinner');
      expect(spinnerElement.exists()).toBe(false);

      const badgeElement = findByTestId(wrapper, 'fr-complete-report-badge');
      expect(badgeElement.text()).toBe('Complete');
    });

    it('ensures that the badge shows as "Expired" when the "reportStatus" prop equals to "expired"', () => {
      wrapper = setup({ reportStatus: 'expired' });

      const spinnerElement = findByTestId(wrapper, 'fr-report-badge-spinner');
      expect(spinnerElement.exists()).toBe(false);

      const badgeElement = findByTestId(wrapper, 'fr-expired-report-badge');
      expect(badgeElement.text()).toBe('Expired');
    });

    it('ensures that the badge shows as "Error" when the "reportStatus" prop equals to "error"', () => {
      wrapper = setup({ reportStatus: 'error' });

      const spinnerElement = findByTestId(wrapper, 'fr-report-badge-spinner');
      expect(spinnerElement.exists()).toBe(false);

      const badgeElement = findByTestId(wrapper, 'fr-error-report-badge');
      expect(badgeElement.text()).toBe('Error');
    });
  });
});
