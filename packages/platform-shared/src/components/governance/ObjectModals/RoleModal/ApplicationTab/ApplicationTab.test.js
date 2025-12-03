/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import ApplicationsTab from './ApplicationTab';

describe('applicationsTab', () => {
  function mountComponent({ applications }) {
    return shallowMount(ApplicationsTab, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        applications,
      },
    });
  }

  describe('component loaded', () => {
    let wrapper;

    it('Shows FrNoData component when have no applications', () => {
      wrapper = mountComponent({ applications: [] });
      const applicationsTable = findByRole(wrapper, 'table');
      expect(applicationsTable.exists()).toBeFalsy();
      expect(wrapper.findComponent(FrNoData).exists()).toBe(true);
      expect(wrapper.findComponent(FrNoData).props('subtitle')).toBe('governance.certificationDetails.noApplications');
    });

    it('Shows applications table and not FrNoData when component have applications information', () => {
      wrapper = mountComponent({
        applications: [
          {
            id: '5ef1b662-db86-4e6d-8e5f-41db789bf43f',
            name: 'TargetAzureADApp',
            icon: 'https://openam-gov-v2-3.forgeblocks.com/platform/img/microsoft.8a785075.svg',
          },
        ],
      });

      expect(wrapper.findComponent(FrNoData).exists()).toBe(false);
      const applicationsTable = findByRole(wrapper, 'table');
      expect(applicationsTable.exists()).toBeTruthy();
    });
  });
});
