/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
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
    it('Should return the param date with the format MMM D, YYYY', () => {
      const result = wrapper.vm.formatDate('12/11/2022');
      expect(result).toEqual('Dec 11, 2022');
    });
  });
});
