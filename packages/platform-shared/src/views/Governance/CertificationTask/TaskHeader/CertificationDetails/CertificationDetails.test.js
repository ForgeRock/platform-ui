/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import CertificationDetails from './index';

let wrapper;

function mountComponent(options, certifier) {
  wrapper = shallowMount(CertificationDetails, {
    global: {
      mocks: {
        $t: (t) => t,
        $route: {
          params: {
            certifier,
          },
        },
        ...options,
      },
      renderStubDefaultSlot: true,
    },
    props: {
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
describe('CertificationDetails', () => {
  describe('Component mount', () => {
    it('should show the certifier image correctly when is a user', () => {
      mountComponent({}, {
        cn: 'Test Test',
        givenName: 'Test',
        sn: 'Castillo',
        id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        type: 'user',
        key: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
      });

      const certifierImage = findByTestId(wrapper, 'certifier-image-user');

      expect(certifierImage.attributes('alt')).toEqual('governance.certificationDetails.ownerNameLabel');
    });

    it('should show the certifier image correctly when is a role', () => {
      mountComponent({}, {
        name: 'Test Role',
        id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        key: 'managed/role/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
      });

      const certifierImage = findByTestId(wrapper, 'certifier-image-role');

      expect(certifierImage).toBeTruthy();
    });
  });

  beforeEach(() => {
    mountComponent();
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
  describe('certifierName', () => {
    it('should return the certifier name when is a user', () => {
      mountComponent({}, {
        cn: 'Test Test',
        givenName: 'Test',
        sn: 'Castillo',
        id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        type: 'user',
        key: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
      });

      const result = wrapper.vm.certifierName();

      expect(result.givenName).toEqual('Test');
      expect(result.sn).toEqual('Castillo');
    });

    it('should return the certifier name when is a role', () => {
      mountComponent({}, {
        name: 'Test Role',
        id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        key: 'managed/role/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
      });

      const result = wrapper.vm.certifierName();

      expect(result.givenName).toEqual('Test Role');
      expect(result.sn).toEqual('');
    });
  });
});
