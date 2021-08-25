/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import DeleteResource from './index';

let wrapper;

describe('Delete Resource', () => {
  function createWrapper() {
    wrapper = mount(DeleteResource, {
      mocks: {
        $t: (msg) => msg,
      },
      propsData: {
        resourceDisplayName: 'test',
        resourceToDeleteId: '',
        isTesting: true,
      },
    });
  }

  it('Emits the cancel-resource-deletion event when cancelled', async () => {
    createWrapper();

    const cancelButton = wrapper.find('[data-test-id="cancelButton"]');
    cancelButton.trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['cancel-resource-deletion']).toBeTruthy();
  });

  it('Emits the delete-resource event when the delete button is clicked', async () => {
    createWrapper();

    const deleteButton = wrapper.find('[data-test-id="deleteButton"]');
    deleteButton.trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['delete-resource']).toBeTruthy();
  });

  it('shows and hides modal', () => {
    const showModalSpy = jest.spyOn(wrapper.vm.$refs.resourceDeleteModal, 'show');
    const hideModalSpy = jest.spyOn(wrapper.vm.$refs.resourceDeleteModal, 'hide');
    wrapper.setProps({ resourceToDeleteId: true });
    expect(showModalSpy).toHaveBeenCalled();
    wrapper.setProps({ resourceToDeleteId: false });
    expect(hideModalSpy).toHaveBeenCalled();
  });
});
