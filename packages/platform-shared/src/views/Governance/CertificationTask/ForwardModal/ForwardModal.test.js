/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import CertificationForwardModal from './index';

describe('CertificationForwardModal', () => {
  let wrapper;

  describe('component shallow mounted', () => {
    beforeEach(() => {
      wrapper = shallowMount(CertificationForwardModal, {
        global: {
          mocks: {
            $t: (t) => t,
          },
        },
      });
    });

    it('component should load correctly', () => {
      expect(wrapper.vm.comment).toBe('');
    });

    it('component should change value on updated actor', () => {
      wrapper.vm.updateActors('testActor');
      expect(wrapper.vm.newActorId).toBe('testActor');
    });

    it('component should change value on updated comment', () => {
      wrapper.vm.updateComment('testComment');
      expect(wrapper.vm.comment).toBe('testComment');
    });

    it('component should forwardItem with correct payload', async () => {
      await wrapper.setProps({
        bulk: true,
      });
      wrapper.vm.comment = 'testComment';
      wrapper.vm.newActorId = 'testId';
      const payload = {
        id: undefined,
        comment: wrapper.vm.comment,
        newActorId: wrapper.vm.newActorId,
      };
      wrapper.vm.forwardItem();
      await flushPromises();
      expect(wrapper.emitted()['forward-bulk']).toBeTruthy();
      expect(wrapper.emitted()['forward-bulk'][0]).toEqual([payload]);
    });
  });
});
