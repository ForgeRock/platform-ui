/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CertificationDetailsModal from './index';

let wrapper;
function mountComponent() {
  wrapper = shallowMount(CertificationDetailsModal, {
    global: {
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      campaignDetails: {
        userName: 'test',
        stageDuration: '12',
        startDate: '12/23/22',
        deadLine: '13/12/22',
        description: '22/12/22',
      },
    },
  });
}
describe('CertificationDetailsModal', () => {
  beforeEach(() => {
    mountComponent();
  });
  describe('formatDate', () => {
    it('Should format the date using the browser locale', () => {
      const date = '12/11/2022';
      const expected = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
      expect(wrapper.vm.formatDate(date)).toEqual(expected);
    });
  });
});
