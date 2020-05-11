/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { mount } from '@vue/test-utils';
import DeleteResource from './index';

describe('Delete Managed Resource', () => {
  const wrapper = mount(DeleteResource, {
    mocks: {
      $t: (msg) => msg,
    },
    propsData: {
      deleteManagedResource: () => ({
        then: (fn) => {
          fn();
          return {
            catch: () => {},
          };
        },
      }),
      deleteInternalResource: () => {},
      resourceName: 'user',
      resourceToDeleteId: '',
      resourceType: 'managed',
      isTesting: true,
    },
  });
  it('does not call delete method when cancel is clicked', () => {
    const cancelButton = wrapper.find('[data-test-id="cancelButton"]');
    cancelButton.trigger('click');
    expect(wrapper.emitted()['resource-deleted']).toBe(undefined);
  });
  it('calls appropriate delete method when delete button is clicked', () => {
    const deleteButton = wrapper.find('[data-test-id="deleteButton"]');
    deleteButton.trigger('click');
    expect(wrapper.emitted()['resource-deleted']).toBeTruthy();
  });
});
