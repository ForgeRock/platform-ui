/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CertificationTaskDetails from './index';

let wrapper;

function mountComponent(options) {
  wrapper = shallowMount(CertificationTaskDetails, {
    methods: {
      cancel: jest.fn(),
    },
    mocks: {
      $t: (t) => t,
      $route: {
        params: {
          certifier: {
            cn: 'Test Test',
            givenName: 'Test',
            sn: 'Castillo',
            id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
            type: 'user',
            key: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
          },
        },
      },
      ...options,
    },
    propsData: {
      campaignDetails: {
        userName: 'test',
        stageDuration: '12',
        startDate: '12/23/22',
        deadLine: '13/12/22',
        description: '22/12/22',
      },
      isLoading: false,
    },
  });
}
describe('CertificationTaskDetails', () => {
  describe('Component mount', () => {
    it('CertificationTaskDetails successfully loaded', () => {
      mountComponent();
      expect(wrapper.name()).toEqual('CertificationTaskDetails');
    });
  });

  describe('formatDate', () => {
    it('Should return the param date with the format MMM D, YYYY', () => {
      const result = wrapper.vm.formatDate('12/11/2022');
      expect(result).toEqual('Dec 11, 2022');
    });
  });

  describe('getProgress', () => {
    const totals = {
      certify: 1,
      revoke: 2,
      NONE: 5,
      total: 8,
    };

    it('should call to set chart info', () => {
      const chartInfoSpy = jest.spyOn(wrapper.vm, 'setChartInfo');
      wrapper.vm.getProgress(totals);

      expect(chartInfoSpy).toBeCalled();
    });

    it('should set total number of decisions', () => {
      wrapper.vm.getProgress(totals);
      expect(wrapper.vm.total).toBe(8);
    });

    it('should sum of decisions made', () => {
      wrapper.vm.getProgress(totals);
      expect(wrapper.vm.sumOfDecisions).toBe(3);
    });

    it('progress is based on totals', () => {
      wrapper.vm.getProgress(totals);
      expect(wrapper.vm.progress).toBe(38);
    });
  });
});
