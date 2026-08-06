/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import EditDetailsModal from './index';

const currentOwner = {
  id: 'user-123',
  givenName: 'John',
  sn: 'Smith',
  userName: 'jsmith',
  profileImage: '',
};

function mountComponent(props = {}) {
  return shallowMount(EditDetailsModal, {
    global: {
      renderStubDefaultSlot: true,
      mocks: {
        $t: (text) => text,
      },
    },
    props: {
      isTesting: true,
      loading: false,
      currentTitle: 'My Campaign',
      currentOwner,
      ...props,
    },
  });
}

describe('EditDetailsModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mountComponent();
  });

  describe('initial state', () => {
    it('renders the modal with correct id and title', () => {
      const modal = wrapper.findComponent({ name: 'BModal' });
      expect(modal.exists()).toBe(true);
      expect(modal.attributes('id')).toBe('EditDetailsModal');
      expect(modal.attributes('title')).toBe('governance.certificationDetails.editDetailsModal.title');
    });

    it('renders FrField for title with correct label', () => {
      const titleField = wrapper.findComponent({ name: 'FrField' });
      expect(titleField.exists()).toBe(true);
      expect(titleField.attributes('label')).toBe('governance.certificationDetails.editDetailsModal.titleLabel');
    });

    it('renders FrGovResourceSelect for owner with correct label and initial-data', () => {
      const ownerSelect = wrapper.find('gov-resource-select-stub');
      expect(ownerSelect.exists()).toBe(true);
      expect(ownerSelect.attributes('label')).toBe('governance.certificationDetails.campaignOwnerLabel');
      // initial-data is bound via ownerInitialData computed
      expect(wrapper.vm.ownerInitialData).toEqual({ ...currentOwner, id: 'user-123' });
    });

    it('save button is disabled when there are no changes (hasChanges is false)', () => {
      expect(wrapper.vm.hasChanges).toBe(false);
    });

    it('loading prop is false by default', () => {
      expect(wrapper.props('loading')).toBe(false);
    });
  });

  describe('resetModal', () => {
    it('resets titleDraft to currentTitle', async () => {
      wrapper.vm.titleDraft = 'changed';
      wrapper.vm.resetModal();
      await flushPromises();
      expect(wrapper.vm.titleDraft).toBe('My Campaign');
    });

    it('resets ownerInfo and ownerChanged', () => {
      wrapper.vm.ownerInfo = { id: 'user-456' };
      wrapper.vm.ownerChanged = true;
      wrapper.vm.resetModal();
      expect(wrapper.vm.ownerInfo).toBeNull();
      expect(wrapper.vm.ownerChanged).toBe(false);
    });

    it('increments ownerSelectKey to remount the owner select', () => {
      const keyBefore = wrapper.vm.ownerSelectKey;
      wrapper.vm.resetModal();
      expect(wrapper.vm.ownerSelectKey).toBe(keyBefore + 1);
    });
  });

  describe('hasChanges computed', () => {
    it('is false when title is unchanged and no new owner selected', () => {
      expect(wrapper.vm.hasChanges).toBe(false);
    });

    it('is true when title is changed', async () => {
      wrapper.vm.titleDraft = 'New Title';
      await flushPromises();
      expect(wrapper.vm.hasChanges).toBe(true);
    });

    it('is false when titleDraft is the same as currentTitle', async () => {
      wrapper.vm.titleDraft = 'My Campaign';
      await flushPromises();
      expect(wrapper.vm.hasChanges).toBe(false);
    });

    it('is true when a different owner is selected', async () => {
      wrapper.vm.ownerChanged = true;
      await flushPromises();
      expect(wrapper.vm.hasChanges).toBe(true);
    });
  });

  describe('handleOwnerInfo', () => {
    it('sets ownerChanged true when a different user is selected', async () => {
      wrapper.vm.handleOwnerInfo({ id: 'user-456', givenName: 'Jane', sn: 'Doe' });
      await flushPromises();
      expect(wrapper.vm.ownerChanged).toBe(true);
      expect(wrapper.vm.ownerInfo).toEqual({ id: 'user-456', givenName: 'Jane', sn: 'Doe' });
    });

    it('sets ownerChanged false when the same owner is selected', async () => {
      wrapper.vm.handleOwnerInfo({ id: 'user-123', givenName: 'John', sn: 'Smith' });
      await flushPromises();
      expect(wrapper.vm.ownerChanged).toBe(false);
    });

    it('handles _id field as fallback', async () => {
      wrapper.vm.handleOwnerInfo({ _id: 'user-789', givenName: 'Bob', sn: 'Jones' });
      await flushPromises();
      expect(wrapper.vm.ownerChanged).toBe(true);
    });

    it('clears ownerInfo when null is emitted', async () => {
      wrapper.vm.handleOwnerInfo(null);
      await flushPromises();
      expect(wrapper.vm.ownerInfo).toBeNull();
      expect(wrapper.vm.ownerChanged).toBe(false);
    });
  });

  describe('save', () => {
    it('emits save with changed title and null ownerInfo when only title changes', async () => {
      wrapper.vm.titleDraft = 'New Title';
      await flushPromises();
      wrapper.vm.save();
      expect(wrapper.emitted('save')).toBeTruthy();
      expect(wrapper.emitted('save')[0]).toEqual([{ title: 'New Title', ownerInfo: null }]);
    });

    it('emits save with null title and ownerInfo when only owner changes', async () => {
      const newOwner = { id: 'user-456', givenName: 'Jane', sn: 'Doe' };
      wrapper.vm.handleOwnerInfo(newOwner);
      wrapper.vm.titleDraft = 'My Campaign';
      await flushPromises();
      wrapper.vm.save();
      expect(wrapper.emitted('save')[0]).toEqual([{ title: null, ownerInfo: newOwner }]);
    });

    it('emits save with both title and ownerInfo when both change', async () => {
      const newOwner = { id: 'user-456', givenName: 'Jane', sn: 'Doe' };
      wrapper.vm.titleDraft = 'Updated Title';
      wrapper.vm.handleOwnerInfo(newOwner);
      await flushPromises();
      wrapper.vm.save();
      expect(wrapper.emitted('save')[0]).toEqual([{ title: 'Updated Title', ownerInfo: newOwner }]);
    });

    it('emits save with null title when titleDraft equals currentTitle', async () => {
      const newOwner = { id: 'user-456', givenName: 'Jane', sn: 'Doe' };
      wrapper.vm.titleDraft = 'My Campaign';
      wrapper.vm.handleOwnerInfo(newOwner);
      await flushPromises();
      wrapper.vm.save();
      expect(wrapper.emitted('save')[0]).toEqual([{ title: null, ownerInfo: newOwner }]);
    });

    it('save button enables when title changes (hasChanges becomes true)', async () => {
      wrapper.vm.titleDraft = 'Changed Title';
      await flushPromises();
      expect(wrapper.vm.hasChanges).toBe(true);
    });
  });

  describe('ownerInitialData computed', () => {
    it('maps currentOwner to initialData with id field', () => {
      expect(wrapper.vm.ownerInitialData).toEqual({ ...currentOwner, id: 'user-123' });
    });

    it('returns empty object when currentOwner has no id', () => {
      wrapper = mountComponent({ currentOwner: { givenName: 'No', sn: 'Id' } });
      expect(wrapper.vm.ownerInitialData).toEqual({});
    });

    it('uses _id as fallback for id', () => {
      wrapper = mountComponent({ currentOwner: { _id: 'user-999', givenName: 'A', sn: 'B' } });
      expect(wrapper.vm.ownerInitialData.id).toBe('user-999');
    });

    it('returns empty object when currentOwner is null', () => {
      wrapper = mountComponent({ currentOwner: null });
      expect(wrapper.vm.ownerInitialData).toEqual({});
    });
  });
});
