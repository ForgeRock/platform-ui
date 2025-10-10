/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, mount, flushPromises } from '@vue/test-utils';
import {
  createAppContainer,
  findByRole,
  findByTestId,
  toggleActionsMenu,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
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

    it('should filter by status correctly', async () => {
      const { wrapper } = setup();
      await flushPromises();

      const statusMenu = findByTestId(wrapper, 'status-menu');
      const statusMenuButton = statusMenu.find('button');
      await statusMenuButton.trigger('click');
      const completedOption = statusMenu.findAll('ul li a')[1];

      await completedOption.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('load-requests')).toHaveLength(1);
      expect(wrapper.emitted('load-requests')[0][0]).toEqual({
        pageSize: 10,
        pagedResultsOffset: 0,
        sortDir: 'desc',
        sortKeys: 'decision.startDate',
        sortType: 'date',
      });
      expect(wrapper.emitted('load-requests')[0][1]).toEqual({
        operand: [
          {
            operand: {
              targetName: 'decision.status',
              targetValue: 'complete',
            },
            operator: 'EQUALS',
          },
        ],
        operator: 'AND',
      });
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
});
