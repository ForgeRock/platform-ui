/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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

    expect(wrapper.name()).toEqual('Editor');
  });
});
