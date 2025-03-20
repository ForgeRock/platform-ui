/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import AccessReviews from './index';

describe('AccessReviews', () => {
  let wrapper;
  beforeEach(() => {
    CertificationApi.getCertificationItems = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));

    CertificationApi.searchCertificates = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
  });

  it('should display noData component when no access reviews are found', async () => {
    wrapper = mount(AccessReviews, {
      global: {
        mocks: {
          $t: (id) => id,
          getItems: () => jest.fn().mockReturnValue(Promise.resolve({
            data: {
              test: 'test',
            },
          })),
        },
      },
    });
    wrapper.vm.setAccessReviewList({ result: [], totalCount: 0 });
    await flushPromises();

    const noData = findByTestId(wrapper, 'access-review-no-data');
    expect(noData.exists()).toBeTruthy();
  });

  it('Calling getList with not search params calls getCertificationItems', () => {
    wrapper = shallowMount(AccessReviews, {
      global: {
        mocks: {
          $t: (id) => id,
          getItems: () => jest.fn().mockReturnValue(Promise.resolve({
            data: {
              test: 'test',
            },
          })),
        },
      },
    });
    expect(CertificationApi.searchCertificates).not.toHaveBeenCalled();
    expect(CertificationApi.getCertificationItems).toHaveBeenCalledWith({
      pageNumber: 0, pageSize: 10, sortBy: 'deadline', sortDesc: false, status: 'active',
    });
  });

  it('Calling getList with not search params calls getCertificationItems', () => {
    wrapper = shallowMount(AccessReviews, {
      data() {
        return {
          searchQuery: 'test search',
        };
      },
      global: {
        mocks: {
          $t: (id) => id,
          getItems: () => jest.fn().mockReturnValue(Promise.resolve({
            data: {
              test: 'test',
            },
          })),
        },
      },
    });
    expect(CertificationApi.getCertificationItems).not.toHaveBeenCalled();
    expect(CertificationApi.searchCertificates).toHaveBeenCalledWith('test search', {
      pageNumber: 0, pageSize: 10, sortBy: 'deadline', sortDesc: false, status: 'active',
    });
  });
});
