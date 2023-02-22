/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CertificationTaskAccountModal from './index';

describe('CertificationTaskAccountModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(CertificationTaskAccountModal, {
      mocks: {
        $t: (t) => t,
      },
      propsData: {
        account: {
          id: 'test',
        },
      },
    });
  });

  it('component should load correclty', () => {
    expect(wrapper.name()).toBe('CertificationTaskAccountModal');
  });
});
