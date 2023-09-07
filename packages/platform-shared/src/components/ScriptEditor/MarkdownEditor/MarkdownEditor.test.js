/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import MarkdownEditor from './index';

describe('MarkdownEditor', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(MarkdownEditor, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        styles: '',
        isMarkdown: true,
      },
    });
  });

  it('MarkdownEditor successfully loaded', () => {
    expect(wrapper.vm.parsedHtml).toEqual('<style></style><div class="content"></div>');
  });
});
