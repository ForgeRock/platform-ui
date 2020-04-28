/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import ObjectTypeEditor from './index';

ObjectTypeEditor.mounted = jest.fn();

describe('ObjectTypeEditor', () => {
  it('Object Type Editor successfully loaded', () => {
    const wrapper = shallowMount(ObjectTypeEditor, {
      mocks: {
        $t: () => {},
      },
      mounted: () => {},
    });

    expect(wrapper.name()).toEqual('ObjectTypeEditor');
  });
});
