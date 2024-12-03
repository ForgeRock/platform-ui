/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
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
    return mount(AccessRequestTable, {
      ...stubProps,
      props: {
        accessRequests,
        ...props,
      },
    });
  };

  describe('@Component Tests', () => {
    beforeEach(() => {
      CommonsApi.getResource.mockReturnValue(Promise.resolve({
        data: {
          result: [],
        },
      }));
    });

    it('should list requests correctly', async () => {
      const wrapper = setup();
      await flushPromises();

      const requestRows = wrapper.findAll('table tbody [role="row"]');
      expect(requestRows).toHaveLength(1);
      const cellsFirstRow = requestRows[0].findAll('td');
      expect(cellsFirstRow[0].text()).toContain('entitlementRevoke');
      expect(cellsFirstRow[0].text()).toContain('ID: 1');
      expect(cellsFirstRow[1].text()).toContain('Jun 22, 2023');
      expect(cellsFirstRow[2].findAll('ul li')[2].text()).toContain('Cancel Request');
    });

    it('should filter by status correctly', async () => {
      const wrapper = setup();
      await flushPromises();

      const statusDropdown = findByTestId(wrapper, 'status-dropdown');
      const completedOption = statusDropdown.findAll('ul li a')[1];
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
      const wrapper = setup();
      await flushPromises();

      const viewDetailsButton = findByTestId(wrapper, 'view-details-button');
      expect(viewDetailsButton.exists()).toBe(true);
      await viewDetailsButton.trigger('click');

      expect(wrapper.emitted('navigate-to-details')).toHaveLength(1);
      expect(wrapper.emitted('navigate-to-details')[0][0].details.id).toBe(1);
    });
  });
});
