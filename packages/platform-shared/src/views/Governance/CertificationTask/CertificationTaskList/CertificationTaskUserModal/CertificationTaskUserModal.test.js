/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CertificationTaskUserModal from './index';

describe('CertificationTaskUserModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(CertificationTaskUserModal, {
      mocks: {
        $t: (t) => t,
      },
      propsData: {
        user: {
          givenName: 'firstname',
          sn: 'sntest',
          username: 'test',
        },
      },
    });
  });

  it('component should load correclty', () => {
    expect(wrapper.name()).toBe('CertificationTaskUserModal');
  });
});
