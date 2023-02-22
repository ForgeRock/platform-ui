/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import CertificationMixin from './index';

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({
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
      localVue,
      store,
      mixins: [CertificationMixin],
      data() {
        return {
          currentPage: 1,
          statusSort: {
            param: 'test',
          },
        };
      },
      mocks: {
        $t: () => {},
        getItems: jest.fn().mockReturnValue(Promise.resolve({
          data: {
            result: ['test'],
            totalCount: 2,
          },
        })),
      },
    });
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
      status: 'test',
    });

    expect(setAccessReviewListSpy).toHaveBeenCalledWith({
      result: ['test'],
      totalCount: 2,
    });
  });

  it('Sets access review list', () => {
    const data = {
      result: [
        {
          a: 'a',
          deadline: '2022-12-19T22:51:51+00:00',
        },
        {
          b: 'b',
          deadline: '2022-12-19T22:51:51+00:00',
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
      },
      {
        b: 'b',
        deadline: '2022-12-19T22:51:51+00:00',
        formattedDeadline: 'Dec 19, 2022',
      },
    ]);
    expect(wrapper.vm.totalRows).toEqual(11);
    expect(wrapper.vm.tableLoading).toBeFalsy();
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
