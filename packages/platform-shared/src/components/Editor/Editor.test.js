/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Editor from './index';

describe('Editor', () => {
  it('Editor successfully loaded', () => {
    const wrapper = shallowMount(Editor, {
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.vm.editorCanRender).toEqual(false);
  });
});
