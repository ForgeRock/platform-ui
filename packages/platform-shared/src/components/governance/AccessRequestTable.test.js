/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, mount, flushPromises } from '@vue/test-utils';
import {
  createAppContainer,
  findByRole,
  toggleActionsMenu,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as store from '@/store';
import i18n from '@/i18n';
import AccessRequestTable from './AccessRequestTable';

jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

const accessRequests = [{
  application: {
    description: 'My Azure App',
    icon: '',
    id: '2',
    name: 'My Azure App',
    templateName: 'azure.ad',
    templateVersion: '2.0',
  },
  decision: {
    comments: [],
    completionDate: null,
    deadline: null,
    outcome: null,
    phases: [],
    startDate: '2023-06-22T19:23:26+00:00',
    status: 'in-progress',
  },
  entitlement: {
    description: 'Administers different groups',
    displayName: 'Groups Administrator',
    id: '2',
  },
  id: 1,
  request: {
    common: {
      endDate: '2023-07-15T19:23:26+00:00',
      priority: 'medium',
    },
  },
  requestType: 'entitlementRevoke',
  requester: {
    givenName: 'Andrew',
    id: '1234-456-2',
    mail: 'andrew.hertel@test.com',
    sn: 'Hertel',
    userName: 'andrew.hertel@test.com',
  },
  user: {
    givenName: 'Manuel',
    id: '1234-456-3',
    mail: 'manuel.escobar@test.com',
    sn: 'Escobar',
    userName: 'manuel.escobar@test.com',
  },
}];

describe('AccessRequestTable', () => {
  const stubProps = {
    global: {
      plugins: [i18n],
    },
  };

  const setup = (props) => {
    setupTestPinia({ user: { userId: '1234' } });
    return {
      wrapper: mount(AccessRequestTable, {
        attachTo: createAppContainer(),
        ...stubProps,
        props: {
          accessRequests,
          ...props,
        },
      }),
      domWrapper: new DOMWrapper(document.body),
    };
  };

  beforeEach(() => {
    document.body.innerHTML = '';
    sessionStorage.clear();
    store.default.replaceState({
      SharedStore: {
        webStorageAvailable: true,
      },
    });
  });

  describe('@Component Tests', () => {
    beforeEach(() => {
      CommonsApi.getResource.mockReturnValue(Promise.resolve({
        data: {
          result: [],
        },
      }));
    });

    it('should list requests correctly', async () => {
      const { domWrapper, wrapper } = setup();
      await flushPromises();

      const requestRows = wrapper.findAll('table tbody [role="row"]');
      expect(requestRows).toHaveLength(1);
      const cellsFirstRow = requestRows[0].findAll('td');
      expect(cellsFirstRow[0].text()).toContain('entitlementRevoke');
      expect(cellsFirstRow[0].text()).toContain('ID: 1');
      expect(cellsFirstRow[1].text()).toContain('Jun 22, 2023');

      await toggleActionsMenu(domWrapper);
      const viewDetailsButton = findByRole(domWrapper, 'menuitem', 'View Details');
      expect(viewDetailsButton).toBeDefined();
    });

    it('Navigates to request details page after clicking on "View Details"', async () => {
      const { domWrapper, wrapper } = setup();
      await flushPromises();

      await toggleActionsMenu(domWrapper);
      const viewDetailsButton = findByRole(domWrapper, 'menuitem', 'View Details');
      expect(viewDetailsButton).toBeDefined();
      await viewDetailsButton.trigger('click');
      expect(wrapper.emitted('navigate-to-details')).toHaveLength(1);
      expect(wrapper.emitted('navigate-to-details')[0][0].details.id).toBe(1);
    });
  });

  describe('Filter persistence via storageKey', () => {
    beforeEach(() => {
      CommonsApi.getResource.mockReturnValue(Promise.resolve({
        data: {
          result: [],
        },
      }));
    });

    it('uses default in-progress status when no storageKey is provided', async () => {
      const { wrapper } = setup();
      await flushPromises();
      expect(wrapper.vm.status).toBe('in-progress');
    });

    it('hydrates state from sessionStorage when storageKey is provided', async () => {
      sessionStorage.setItem('test.requests', JSON.stringify({
        status: 'complete',
        currentPage: 3,
        pageSize: 25,
        sortDir: 'asc',
        sortField: 'priority',
        sortKeys: 'priority',
        filter: { query: 'azure' },
        filterData: {
          status: { value: 'complete' },
          priorities: {
            value: {
              high: true, medium: false, low: false, none: false,
            },
          },
          requestType: { value: 'all' },
          query: { value: 'azure' },
          requester: { value: '' },
          user: { value: '' },
        },
      }));

      const { wrapper } = setup({ storageKey: 'test.requests' });
      await flushPromises();

      expect(wrapper.vm.status).toBe('complete');
      expect(wrapper.vm.currentPage).toBe(3);
      expect(wrapper.vm.pageSize).toBe(25);
      expect(wrapper.vm.sortDir).toBe('asc');
      expect(wrapper.vm.sortField).toBe('priority');
      expect(wrapper.vm.sortKeys).toBe('priority');
      expect(wrapper.vm.filter.query).toBe('azure');
    });

    it('falls back to defaults when sessionStorage contains malformed JSON', async () => {
      sessionStorage.setItem('test.requests', '{not valid json');
      const { wrapper } = setup({ storageKey: 'test.requests' });
      await flushPromises();
      expect(wrapper.vm.status).toBe('in-progress');
      expect(wrapper.vm.currentPage).toBe(1);
    });

    it('writes complete state to sessionStorage after debounce when filterData changes', async () => {
      jest.useFakeTimers();
      const { wrapper } = setup({ storageKey: 'test.requests' });
      await flushPromises();

      wrapper.vm.filterData.status.value = 'complete';
      await flushPromises(); // let Vue call the debounced fn (sets the 300ms timer)
      jest.advanceTimersByTime(300); // fire the debounce
      await flushPromises(); // let the persistence watcher write to storage

      const stored = JSON.parse(sessionStorage.getItem('test.requests'));
      expect(stored.filterData.status.value).toBe('complete');
      expect(stored.status).toBe('complete');
      expect(stored.currentPage).toBe(1);
      expect(stored.pageSize).toBe(10);
      expect(stored.sortDir).toBe('desc');
      jest.useRealTimers();
    });

    it('uses defaults when sessionStorage key is absent', async () => {
      const { wrapper } = setup({ storageKey: 'test.requests' });
      await flushPromises();

      expect(wrapper.vm.status).toBe('in-progress');
      expect(wrapper.vm.currentPage).toBe(1);
      expect(wrapper.vm.pageSize).toBe(10);
      expect(wrapper.vm.sortDir).toBe('desc');
    });

    it('swallows sessionStorage.setItem errors without breaking the component', async () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });
      const { wrapper } = setup({ storageKey: 'test.requests' });
      await flushPromises();

      wrapper.vm.filterData.status.value = 'complete';
      await flushPromises();

      expect(wrapper.vm.status).toBeDefined();
      Storage.prototype.setItem.mockRestore();
    });

    it('does not read or write sessionStorage when webStorageAvailable is false', async () => {
      store.default.replaceState({
        SharedStore: {
          webStorageAvailable: false,
        },
      });
      sessionStorage.setItem('test.requests', JSON.stringify({ status: 'complete', currentPage: 3 }));

      const { wrapper } = setup({ storageKey: 'test.requests' });
      await flushPromises();

      // status and currentPage would be hydrated from storage if the read was not skipped
      expect(wrapper.vm.status).toBe('in-progress');
      expect(wrapper.vm.currentPage).toBe(1);

      wrapper.vm.filterData.status.value = 'cancelled';
      await flushPromises();
      const stored = JSON.parse(sessionStorage.getItem('test.requests'));
      expect(stored.status).toBe('complete');
    });
  });
});
