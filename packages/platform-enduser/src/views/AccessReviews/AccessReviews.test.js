/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
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

  it('is defined', () => {
    wrapper = shallowMount(AccessReviews, {
      mocks: {
        $t: (id) => id,
        getItems: () => jest.fn().mockReturnValue(Promise.resolve({
          data: {
            test: 'test',
          },
        })),
      },
    });
    expect(wrapper.name()).toEqual('AccessReviews');
  });
  it('Calling getList with not search params calls getCertificationItems', () => {
    wrapper = shallowMount(AccessReviews, {
      mocks: {
        $t: (id) => id,
        getItems: () => jest.fn().mockReturnValue(Promise.resolve({
          data: {
            test: 'test',
          },
        })),
      },
    });
    expect(CertificationApi.searchCertificates).not.toHaveBeenCalled();
    expect(CertificationApi.getCertificationItems).toHaveBeenCalledWith({ pageNumber: 0, status: 'active' });
  });

  it('Calling getList with not search params calls getCertificationItems', () => {
    wrapper = shallowMount(AccessReviews, {
      data() {
        return {
          searchQuery: 'test search',
        };
      },
      mocks: {
        $t: (id) => id,
        getItems: () => jest.fn().mockReturnValue(Promise.resolve({
          data: {
            test: 'test',
          },
        })),
      },
    });
    expect(CertificationApi.getCertificationItems).not.toHaveBeenCalled();
    expect(CertificationApi.searchCertificates).toHaveBeenCalledWith('test search', { pageNumber: 0, status: 'active' });
  });
});
