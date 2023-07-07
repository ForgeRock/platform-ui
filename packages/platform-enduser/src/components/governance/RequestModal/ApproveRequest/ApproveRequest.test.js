/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ApproveRequest from './index';
import i18n from '@/i18n';

describe('ApproveRequest', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ApproveRequest, {
      mocks: {
        $t: (text, prop) => i18n.t(text, prop),
      },
    });
  });

  it('Subtitle should contain approve', async () => {
    expect(wrapper.vm.subtitle()).toEqual('Are you sure you want to approve this request?');
  });
});
