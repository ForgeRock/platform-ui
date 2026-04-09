/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
              govCertAdminGroup: true,
            },
          },
        },
      },
      data() {
        return {
          govCertAdminGroup: true,
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
