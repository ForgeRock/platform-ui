/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import Certification from './index';

describe('Certification View', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Certification, {
      global: {
        renderStubDefaultSlot: true,
        mocks: {
          $t: () => {},
          $route: {
            params: {
              certificationTab: 'overview',
            },
          },
          $store: {
            state: {
              govCertAdmin: true,
            },
          },
        },
      },
      data() {
        return {
          govCertAdmin: true,
        };
      },
    });
  });

  it('has tabs for overview, campaigns, certification', () => {
    const tabs = findByTestId(wrapper, 'cert-tabs');
    expect(tabs.exists()).toBeTruthy();

    const overview = findByTestId(wrapper, 'cert-overview');
    expect(overview.exists()).toBeTruthy();

    const campaigns = findByTestId(wrapper, 'cert-campaigns');
    expect(campaigns.exists()).toBeTruthy();

    const certification = findByTestId(wrapper, 'cert-template');
    expect(certification.exists()).toBeTruthy();
  });
});
