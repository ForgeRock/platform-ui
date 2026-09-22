/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import CertificationDetailsModal from './index';

const campaignDetails = {
  ownerInfo: { userName: 'testUser' },
  stageDuration: '12',
  startDate: '2022-12-23',
  deadline: '2022-12-13',
  description: 'Quarterly access review',
};

describe('CertificationDetailsModal', () => {
  describe('formatDate', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallowMount(CertificationDetailsModal, {
        global: {
          mocks: {
            $t: (t) => t,
          },
        },
        props: {
          campaignDetails,
          isTesting: true,
        },
      });
    });

    it('Should format the date using the browser locale', () => {
      const date = '12/11/2022';
      const expected = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
      expect(wrapper.vm.formatDate(date)).toEqual(expected);
    });
  });

  describe('@a11y', () => {
    let wrapper;
    function mountComponent() {
      wrapper = mount(CertificationDetailsModal, {
        global: {
          mocks: {
            $t: (t) => t,
          },
        },
        props: {
          campaignDetails,
          isTesting: true,
        },
      });
      return wrapper;
    }

    it('renders campaign details as a description list with paired terms and values', () => {
      mountComponent();

      // The audit finding (IAM-11343) was that all content was announced "in one
      // go" — the label/value pairs were bare spans with no semantics. A dl gives
      // each pair a discrete, announced stop with term/value association.
      const terms = wrapper.findAll('dt');
      const descriptions = wrapper.findAll('dd');
      expect(terms).toHaveLength(5);
      expect(descriptions).toHaveLength(5);

      expect(terms[0].text()).toBe('governance.certificationTask.campaignDetails.campaignOwner');
      expect(descriptions[0].text()).toBe('testUser');

      expect(terms[1].text()).toBe('governance.certificationTask.campaignDetails.duration');
      expect(descriptions[1].text()).toBe('12');

      const expectedFormat = (date) => new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));

      expect(terms[2].text()).toBe('governance.certificationTask.campaignDetails.startDate');
      expect(descriptions[2].text()).toBe(expectedFormat('2022-12-23'));

      expect(terms[3].text()).toBe('common.deadline');
      expect(descriptions[3].text()).toBe(expectedFormat('2022-12-13'));

      expect(terms[4].text()).toBe('governance.certificationTask.campaignDetails.description');
      expect(descriptions[4].text()).toBe('Quarterly access review');
    });

    it('has no accessibility violations', async () => {
      mountComponent();

      // Static BModal renders hidden (aria-hidden + display:none) and axe skips
      // hidden subtrees — unhide the dialog so the dl is actually analyzed.
      const dialog = wrapper.find('[role="dialog"]');
      dialog.element.removeAttribute('aria-hidden');
      dialog.element.removeAttribute('style');

      await runA11yTest(wrapper);
    });
  });
});
