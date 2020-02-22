/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { mount } from '@vue/test-utils';
import DeleteResource from './index';

describe('Delete Internal Resource', () => {
  const wrapper = mount(DeleteResource, {
    mocks: {
      $t: (msg) => msg,
    },
    propsData: {
      deleteManagedResource: () => {},
      deleteInternalResource: () => ({
        then: (fn) => {
          fn();
          return {
            catch: () => {},
          };
        },
      }),
      resourceName: 'test',
      resourceToDeleteId: '',
      resourceType: 'internal',
      isTesting: true,
    },
  });
  it('does not call delete method when cancel is clicked', () => {
    const cancelButton = wrapper.find('.test_cancelButton');
    cancelButton.trigger('click');
    expect(wrapper.emitted()['resource-deleted']).toBe(undefined);
  });
  it('calls appropriate delete method when delete button is clicked', () => {
    const deleteButton = wrapper.find('.test_deleteButton');
    deleteButton.trigger('click');
    expect(wrapper.emitted()['resource-deleted']).toBeTruthy();
  });
});
