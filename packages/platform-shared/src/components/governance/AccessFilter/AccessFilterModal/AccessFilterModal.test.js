/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, shallowMount } from '@vue/test-utils';
import { BModal } from 'bootstrap-vue';
import AccessFilterModal from './AccessFilterModal';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

let wrapper;

const filterSchema = {
  user: [
    {
      key: 'description',
      name: 'description',
      displayName: 'Description',
      description: 'Description',
      type: 'string',
      isMultiValue: false,
    },
    {
      key: 'userName',
      name: 'userName',
      displayName: 'User Name',
      description: 'userName',
      type: 'string',
      isMultiValue: false,
    },
  ],
};

function mountComponent() {
  wrapper = shallowMount(AccessFilterModal, {
    global: {
      mocks: {
        $t: (t) => t,
      },
      plugins: [],
      stubs: {
        BModal: {
          name: 'BModal',
          template: `
            <div>
              <slot />
              <slot name="modal-footer" />
            </div>
          `,
        },
        FrField: {
          name: 'FrField',
          template: '<div />',
        },
        BButton: true,
      },
    },
    props: {
      selectedItem: 'user',
      filterSchema,
      isTesting: true,
    },
  });
}
describe('AccessFilterModal', () => {
  beforeEach(() => {
    mountComponent();
  });
  describe('getUserInfoFilter', () => {
    it('sets initial data', async () => {
      await flushPromises();
      wrapper.findComponent(BModal).vm.$emit('show');
      await wrapper.vm.$nextTick();

      const { selectedFilter } = wrapper.vm;
      expect(selectedFilter).toEqual(filterSchema.user[0]);
    });
    it('sets initial data', async () => {
      await flushPromises();
      wrapper.findComponent(BModal).vm.$emit('show');
      await wrapper.vm.$nextTick();

      const field = wrapper.findComponent({ name: 'FrField' });
      expect(field.exists()).toBe(true);
      await field.vm.$emit('select', {
        value: {
          key: 'userName',
          name: 'userName',
          displayName: 'User Name',
          description: 'userName',
          type: 'string',
          isMultiValue: false,
        },
      });

      expect(wrapper.vm.selectedFilter).toEqual(filterSchema.user[1]);
    });
  });
});
