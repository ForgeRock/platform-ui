/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import RejectRequest from './index';
import i18n from '@/i18n';

describe('RejectRequest', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(RejectRequest, {
      mocks: {
        $t: (text, prop) => i18n.t(text, prop),
      },
    });
  });

  it('Subtitle should contain reject', async () => {
    expect(wrapper.vm.subtitle()).toEqual('Are you sure you want to reject this request?');
  });
});
