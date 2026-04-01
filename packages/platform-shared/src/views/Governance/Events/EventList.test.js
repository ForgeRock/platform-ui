/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import * as EventApi from '@forgerock/platform-shared/src/api/governance/EventApi';
import i18n from '@/i18n';
import EventList from './EventList';

const getEventListResponse = {
  data: {
    result: [
      {
        name: 'User Creation Event',
        description: 'This event will kick off an orchestration for a new user upon creation.',
        entityType: 'user',
        mutationType: 'create',
        condition: {
          operator: 'ALL',
          operand: [],
        },
        action: {
          type: 'orchestration',
          name: 'IdentityCertificationKickOff',
        },
        status: 'active',
        owners: [
          {
            id: 'managed/user/ec010c84-9239-4327-8544-2a44a8c9634a',
            mail: 'test@email.com',
            givenName: 'test',
            sn: 'user',
            userName: 'a',
          },
        ],
        id: '858ec2b0-511d-44c8-a568-51c2c20edc11',
      },
    ],
  },
};

describe('EventList', () => {
  function mountComponent(props) {
    mockModal();
    const wrapper = mount(EventList, {
      attachTo: createAppContainer(document.body),
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
    return wrapper;
  }

  describe('Component Tests', () => {
    it('Displays api results in table', async () => {
      jest.spyOn(EventApi, 'getEventList').mockImplementation(() => Promise.resolve(getEventListResponse));
      const wrapper = mountComponent();
      const spinner = wrapper.find('[role="status"]');
      expect(spinner.exists()).toBe(true);
      await flushPromises();
      expect(wrapper.find('[role="status"]').exists()).toBe(false);

      // expect one header row and one data row
      expect(wrapper.findAll('tr').length).toBe(2);
    });

    it('should call updateEvent to update event status', async () => {
      const updateEventSpy = jest.spyOn(EventApi, 'updateEvent').mockReturnValue(Promise.resolve(''));
      const wrapper = mountComponent();
      wrapper.vm.actionEventId = '2';
      await flushPromises();

      wrapper.vm.updateStatusEventItem('active');
      await flushPromises();

      expect(updateEventSpy).toHaveBeenCalledWith('2', [{ field: '/status', operation: 'replace', value: 'active' }]);
    });

    it('should call deleteEventItem delete event with the right params', async () => {
      const updateEventSpy = jest.spyOn(EventApi, 'deleteEvent').mockReturnValue(Promise.resolve(''));
      const wrapper = mountComponent();
      wrapper.vm.actionEventId = '2';
      wrapper.vm.deleteEventItem();
      await flushPromises();
      expect(updateEventSpy).toHaveBeenCalledWith('2');
    });

    it('searches from search input', async () => {
      const getEventListSpy = jest.spyOn(EventApi, 'getEventList').mockImplementation(() => Promise.resolve(getEventListResponse));
      const wrapper = mountComponent();
      await flushPromises();

      const searchBox = wrapper.find('[role="searchbox"]');
      expect(searchBox.text()).toContain('');
      const searchInput = searchBox.find('input[type="search"]');
      searchInput.setValue('test');
      const myEvent = new KeyboardEvent('keydown');
      await searchInput.element.dispatchEvent(myEvent);
      searchInput.trigger('keydown.enter');
      await flushPromises();

      expect(getEventListSpy).toHaveBeenCalledWith({
        pageSize: 10,
        pagedResultsOffset: 0,
        queryFilter: "name co 'test'",
      });
    });

    it('sorts when column header is clicked', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      const getEventListSpy = jest.spyOn(EventApi, 'getEventList').mockImplementation(() => Promise.resolve(getEventListResponse));

      const columnheader = wrapper.findAll('[role="columnheader"]')[0];
      expect(columnheader.text()).toContain('Name (Click to sort ascending)');
      columnheader.trigger('click');
      await flushPromises();

      expect(getEventListSpy).toHaveBeenCalledWith({
        pageSize: 10,
        pagedResultsOffset: 0,
        sortKeys: '-name',
      });
    });

    it('should call the appropriate method when opening the new event modal', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const showSpy = jest.spyOn(wrapper.vm.bvModal.value, 'show');
      expect(showSpy).not.toHaveBeenCalled();

      wrapper.vm.openNewEventModal();
      await flushPromises();
      expect(showSpy).toHaveBeenCalledWith('newEventModal');
    });

    it('should call the deactivate confirm modal if the user wants to deactivate the event', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const showSpy = jest.spyOn(wrapper.vm.bvModal.value, 'show');
      expect(showSpy).not.toHaveBeenCalled();

      wrapper.vm.toggleEvent('1', 'active');
      await flushPromises();
      expect(showSpy).toHaveBeenCalledWith('deactivateModalEvent');
    });
  });
});
