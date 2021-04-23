/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import MarkdownEditor from './index';

describe('MarkdownEditor', () => {
  it('MarkdownEditor successfully loaded', () => {
    const wrapper = shallowMount(MarkdownEditor, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        styles: '',
      },
    });

    expect(wrapper.name()).toEqual('MarkdownEditor');
  });
});
