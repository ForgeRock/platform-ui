/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import CertificationMixin from './index';

const store = createStore({
  state: {
    setCertificationCount: 0,
  },
  getters: {
    setCertificationCount: (state) => state.setCertificationCount,
  },
  mutations: {
    setCertificationCount: (state) => state.setCertificationCount,
  },
});
describe('CertificationMixin', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount({}, {
      render() {},
      data() {
        return {
          currentPage: 1,
          statusSort: {
            param: 'test',
          },
        };
      },
      global: {
        mocks: {
          $t: (id) => id,
          getItems: jest.fn().mockReturnValue(Promise.resolve({
            data: {
              result: ['test'],
              totalCount: 2,
            },
          })),
        },
        plugins: [store],
        mixins: [CertificationMixin],
      },
    });
  });

  it('Should return governance.status.complete if the status is signed-off ', () => {
    const statusLabel = wrapper.vm.getStatusCampaignTranslationLabel('signed-off');
    expect(statusLabel).toBe('governance.status.complete');
  });

  it('Should return governance.status.complete if the status is completed ', () => {
    const statusLabel = wrapper.vm.getStatusCampaignTranslationLabel('completed');
    expect(statusLabel).toBe('governance.status.complete');
  });

  it('Should return the status param nested with the governance.status', () => {
    const statusLabel = wrapper.vm.getStatusCampaignTranslationLabel('staging');
    expect(statusLabel).toBe('governance.status.staging');
  });

  it('Reset view when search is cleared', () => {
    wrapper.setData({
      searchQuery: 'testquery',
    });
    const getListSpy = jest.spyOn(wrapper.vm, 'getList');
    wrapper.vm.clear();

    expect(getListSpy).toHaveBeenCalled();
    expect(wrapper.vm.searchQuery).toBeFalsy();
  });
  it('Handles status sort', () => {
    const getListSpy = jest.spyOn(wrapper.vm, 'getList');
    wrapper.vm.handleStatusSort({ type: 'completed' });

    expect(getListSpy).toHaveBeenCalled();
    expect(wrapper.vm.statusSort).toEqual(expect.objectContaining({
      param: 'complete',
      type: 'completed',
    }));
  });

  it('Gets items list', async () => {
    const setAccessReviewListSpy = jest.spyOn(wrapper.vm, 'setAccessReviewList');
    wrapper.vm.getList('in-progress');
    await new Promise(process.nextTick);

    expect(wrapper.vm.getItems).toHaveBeenCalledWith({
      pageNumber: 0,
      queryString: '',
      sortBy: 'deadline',
      sortDesc: false,
      status: 'test',
    });
    expect(setAccessReviewListSpy).toHaveBeenCalledWith({
      result: ['test'],
      totalCount: 2,
    });
  });

  it('Gets items list page 4', async () => {
    wrapper.setData({
      currentPage: 4,
      searchQuery: 'searching',
    });

    const setAccessReviewListSpy = jest.spyOn(wrapper.vm, 'setAccessReviewList');
    wrapper.vm.$store.commit = jest.fn();
    wrapper.vm.$store.state.certificationCount = 1;
    expect(wrapper.vm.$store.commit).not.toHaveBeenCalled();
    wrapper.vm.getList();
    await new Promise(process.nextTick);
    expect(wrapper.vm.$store.commit).toHaveBeenCalledWith('setCertificationCount', 2);
    expect(wrapper.vm.getItems).toHaveBeenCalledWith({
      pageNumber: 3,
      queryString: 'searching',
      sortBy: 'deadline',
      sortDesc: false,
      status: 'test',
    });
    expect(setAccessReviewListSpy).toHaveBeenCalledWith({
      result: ['test'],
      totalCount: 2,
    });
  });

  it('Gets resets page with search', async () => {
    wrapper.setData({
      currentPage: 3,
      searchQuery: 'alphabet',
    });

    const setAccessReviewListSpy = jest.spyOn(wrapper.vm, 'setAccessReviewList');

    wrapper.vm.search();
    await new Promise(process.nextTick);

    expect(wrapper.vm.getItems).toHaveBeenCalledWith({
      pageNumber: 0,
      queryString: 'alphabet',
      sortBy: 'deadline',
      sortDesc: false,
      status: 'test',
    });

    expect(setAccessReviewListSpy).toHaveBeenCalledWith({
      result: ['test'],
      totalCount: 2,
    });
  });

  describe('setAccessReviewList', () => {
    it('handles totals for enduser', () => {
      const data = {
        result: [
          {
            a: 'a',
            deadline: '2022-12-19T22:51:51+00:00',
            totals: {
              total: 10,
              'in-progress': 3,
            },
          },
          {
            b: 'b',
            deadline: '2022-12-19T22:51:51+00:00',
            totals: {
              total: 20,
              'in-progress': 5,
            },
          },
        ],
        totalCount: 11,
      };

      wrapper.vm.setAccessReviewList(data);

      expect(wrapper.vm.accessReviewList).toEqual([
        {
          a: 'a',
          deadline: '2022-12-19T22:51:51+00:00',
          formattedDeadline: 'Dec 19, 2022',
          totals: {
            total: 10,
            'in-progress': 3,
            completed: 7,
          },
        },
        {
          b: 'b',
          deadline: '2022-12-19T22:51:51+00:00',
          formattedDeadline: 'Dec 19, 2022',
          totals: {
            total: 20,
            'in-progress': 5,
            completed: 15,
          },
        },
      ]);
      expect(wrapper.vm.totalRows).toEqual(11);
      expect(wrapper.vm.tableLoading).toBeFalsy();
    });

    it('handles totals for admin', () => {
      const data = {
        result: [
          {
            a: 'a',
            deadline: '2022-12-19T22:51:51+00:00',
            total: 10,
            inProgress: 3,
          },
          {
            b: 'b',
            deadline: '2022-12-19T22:51:51+00:00',
            total: 20,
            inProgress: 5,
          },
        ],
        totalCount: 11,
      };

      wrapper.vm.setAccessReviewList(data);

      expect(wrapper.vm.accessReviewList).toEqual([
        {
          a: 'a',
          deadline: '2022-12-19T22:51:51+00:00',
          formattedDeadline: 'Dec 19, 2022',
          total: 10,
          inProgress: 3,
        },
        {
          b: 'b',
          deadline: '2022-12-19T22:51:51+00:00',
          formattedDeadline: 'Dec 19, 2022',
          total: 20,
          inProgress: 5,
        },
      ]);
      expect(wrapper.vm.totalRows).toEqual(11);
      expect(wrapper.vm.tableLoading).toBeFalsy();
    });
  });

  describe('sortingChanged', () => {
    it('should normalize sort by when is formattedDeadline', () => {
      wrapper.vm.sortingChanged({ sortBy: 'formattedDeadline', sortDesc: true });

      expect(wrapper.vm.sortBy).toEqual('formattedDeadline');
      expect(wrapper.vm.sortDesc).toEqual(true);
      expect(wrapper.vm.getItems).toHaveBeenCalledWith({
        pageNumber: 0,
        queryString: '',
        sortBy: 'deadline',
        sortDesc: true,
        status: 'test',
      });
    });

    it('should sort items by name in descending order and update getItems query with correct parameters', () => {
      wrapper.vm.sortingChanged({ sortBy: 'name', sortDesc: true });

      expect(wrapper.vm.sortBy).toEqual('name');
      expect(wrapper.vm.sortDesc).toEqual(true);
      expect(wrapper.vm.getItems).toHaveBeenCalledWith({
        pageNumber: 0,
        queryString: '',
        sortBy: 'name',
        sortDesc: true,
        status: 'test',
      });
    });

    it('should sort items by name in ascending order and update getItems query with correct parameters', () => {
      wrapper.vm.sortingChanged({ sortBy: 'name', sortDesc: false });

      expect(wrapper.vm.sortBy).toEqual('name');
      expect(wrapper.vm.sortDesc).toEqual(false);
      expect(wrapper.vm.getItems).toHaveBeenCalledWith({
        pageNumber: 0,
        queryString: '',
        sortBy: 'name',
        sortDesc: false,
        status: 'test',
      });
    });
  });

  it('isActiveLikeStatus computed prop true by default', () => {
    expect(wrapper.vm.isActiveLikeStatus).toBe(true);
    expect(wrapper.vm.isClosedLikeStatus).toBe(false);
  });

  it('isActiveLikeStatus computed prop true when statuses are in-progress, active, expiring, creating and overdue', async () => {
    const statuses = ['in-progress', 'active', 'expiring', 'creating', 'overdue'];

    for await (const status of statuses) {
      await wrapper.setData({
        statusSort: wrapper.vm.statuses.get(status),
      });

      expect(wrapper.vm.isActiveLikeStatus).toBe(true);
      expect(wrapper.vm.isClosedLikeStatus).toBe(false);
    }
  });

  it('isClosedLikeStatus computed prop true when statuses are closed, expired, cancelled and completed', async () => {
    const statuses = ['closed', 'expired', 'cancelled', 'completed'];

    for await (const status of statuses) {
      await wrapper.setData({
        statusSort: wrapper.vm.statuses.get(status),
      });

      expect(wrapper.vm.isActiveLikeStatus).toBe(false);
      expect(wrapper.vm.isClosedLikeStatus).toBe(true);
    }
  });
});
