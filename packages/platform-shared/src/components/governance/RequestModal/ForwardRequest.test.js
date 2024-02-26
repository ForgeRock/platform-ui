/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ForwardRequest from './ForwardRequest';

describe('ForwardRequest', () => {
  let wrapper;

  describe('component shallow mounted', () => {
    beforeEach(() => {
      wrapper = shallowMount(ForwardRequest, {
        global: {
          mocks: {
            $t: (t) => t,
          },
        },
      });
    });

    it('component should change value on updated actor', () => {
      wrapper.vm.updateActors('testActor');
      expect(wrapper.emitted()['request-update-actors'][0]).toEqual(['testActor']);
    });

    it('component should change value on updated actor', () => {
      wrapper.vm.updateComment('testActor');
      expect(wrapper.emitted()['request-comment'][0]).toEqual(['testActor']);
    });
  });
});
