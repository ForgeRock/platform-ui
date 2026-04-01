/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import dayjs from 'dayjs';
import * as CampaignsApi from './CampaignApi';

const get = jest.fn();
const post = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({ get, post }));

const ACTIVE_CAMPAIGNS_QUERY = {
  groupBy: [[
    'status',
    'certificationType',
  ]],
  entityPath: '/repo/governance/certification',
  pageSize: '0',
  targetFilter: {
    operator: 'AND',
    operand: [
      {
        operator: 'EQUALS',
        operand: {
          targetName: 'status',
          targetValue: 'in-progress',
        },
      },
    ],
  },
};

describe('Campaigns API', () => {
  it('searchQuery called with right args', async () => {
    await CampaignsApi.searchQuery(ACTIVE_CAMPAIGNS_QUERY);

    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(post).toBeCalledWith('/governance/search', ACTIVE_CAMPAIGNS_QUERY);
  });

  it('getActiveCampaignsCount calls searchQuery properly', async () => {
    post.mockReturnValue(Promise.resolve({ data: { total: 10 } }));
    const response = await CampaignsApi.getActiveCampaignsCount();
    expect(post).toBeCalledWith('/governance/search', ACTIVE_CAMPAIGNS_QUERY);
    expect(response).toBe('10');
  });

  it('getExpiringCampaigns calls searchQuery properly', async () => {
    const mockedDate = new Date('2022-12-05');
    const expectedDate = dayjs(mockedDate).add(2, 'week');
    jest.useFakeTimers().setSystemTime(mockedDate);
    const query = {
      entityPath: 'repo/governance/certification',
      targetFilter: {
        operator: 'AND',
        operand: [
          {
            operator: 'LT',
            operand: {
              targetName: 'deadline',
              targetValue: expectedDate,
            },
          },
          {
            operator: 'EQUALS',
            operand: {
              targetName: 'status',
              targetValue: 'in-progress',
            },
          },
        ],
      },
      pageSize: '0',
    };
    post.mockReturnValue(Promise.resolve({ data: { total: 4 } }));
    const response = await CampaignsApi.getExpiringCampaigns();
    expect(post).toBeCalledWith('/governance/search', query);
    expect(response).toBe('4');
  });

  it('getCampaignsByType calls searchQuery properly', async () => {
    const query = {
      groupBy: [[
        'certificationType',
      ]],
      entityPath: '/repo/governance/certification',
      pageSize: '0',
    };
    post.mockReturnValue(Promise.resolve({
      data: {
        aggregation: {
          certificationType: [
            {
              key: 'identity',
              count: 30,
            },
            {
              key: 'application',
              count: 40,
            },
            {
              key: 'entitlement',
              count: 50,
            },
            {
              key: 'roleMembership',
              count: 40,
            },
          ],
        },
      },
    }));
    const response = await CampaignsApi.getCampaignsByType();
    expect(post).toBeCalledWith('/governance/search', query);
    expect(response).toEqual([
      {
        color: '#2ed47a',
        label: 'Identity',
        value: 30,
      },
      {
        color: '#2ed47a',
        label: 'Application',
        value: 40,
      },
      {
        color: '#109cf1',
        label: 'Entitlement',
        value: 50,
      },
      {
        color: '#ba4de1',
        label: 'Role Membership',
        value: 40,
      },
    ]);
  });

  it('getCampaignsByStatus calls searchQuery properly', async () => {
    const query = {
      groupBy: [[
        'status',
      ]],
      entityPath: '/repo/governance/certification',
      pageSize: '0',
    };
    post.mockReturnValue(Promise.resolve({
      data: {
        aggregation: {
          status: [
            {
              key: 'in-progress',
              count: 20,
            },
            {
              key: 'signed-off',
              count: 10,
            },
            {
              key: 'staging',
              count: 60,
            },
          ],
        },
      },
    }));
    const response = await CampaignsApi.getCampaignsByStatus();
    expect(post).toBeCalledWith('/governance/search', query);
    expect(response).toEqual([
      {
        color: '#2ed47a',
        label: 'Active',
        value: 20,
      },
      {
        color: '#109cf1',
        label: 'Signed Off',
        value: 10,
      },
      {
        color: '#ffb946',
        label: 'Staged',
        value: 60,
      },
    ]);
  });

  it('getCampaignDetails called correctly', async () => {
    const id = 'af7d9cb8-0f34-4007-898b-03bd08dbd029';
    const data = {
      id,
      name: 'Test',
    };
    get.mockReturnValue(Promise.resolve({ data }));
    const campaignDetail = await CampaignsApi.getCampaignDetails(id);
    expect(get).toBeCalledWith(`/governance/admin/certification/${id}`);
    expect(campaignDetail).toEqual(data);
  });

  it('updateCampaignDeadline called correctly', async () => {
    const id = 'af7d9cb8-0f34-4007-898b-03bd08dbd029';
    const newDeadline = '2022-12-28';
    const data = {
      id,
      name: 'Test',
      newDeadline,
    };
    post.mockReturnValue(Promise.resolve({ data }));
    const response = await CampaignsApi.updateCampaignDeadline(id, newDeadline);
    expect(post).toBeCalledWith(`/governance/certification/${id}/update-deadline`, { newDeadline });
    expect(response).toEqual(data);
  });

  it('cancelCampaign called correctly', async () => {
    const id = 'af7d9cb8-0f34-4007-898b-03bd08dbd029';
    post.mockReturnValue(Promise.resolve({ data: { id } }));
    const response = await CampaignsApi.cancelCampaign(id);
    expect(post).toBeCalledWith(`/governance/certification/${id}/cancel`);
    expect(response).toEqual({ id });
  });

  it('getCampaignTasks called correctly', async () => {
    const campaignId = 'af7d9cb8-0f34-4007-898b-03bd08dbd029';
    const data = {
      data: [{
        id: '12345',
      }],
    };
    get.mockReturnValue(Promise.resolve(data));
    const response = await CampaignsApi.getCampaignTasks(campaignId, { status: 'in-progress' });
    expect(get).toBeCalledWith(`/governance/admin/certification/${campaignId}/tasks`, { params: { pageNumber: 0, pageSize: 10, status: 'in-progress' } });
    expect(response).toEqual(data);
  });
});
