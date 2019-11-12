import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import ListResource from '@/components/access';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('ListResource.vue', () => {
  let wrapper;

  beforeEach(() => {
    const $route = {
      path: '/test',
      meta: {},
      params: {
        resourceName: 'test',
        resourceType: 'test',
      },
    };

    wrapper = shallowMount(ListResource, {
      localVue,
      i18n,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
      },
    });
    wrapper.setMethods({ loadGrid: () => { } });

    jest.spyOn(ListResource, 'mounted')
      .mockImplementation(() => { });
  });

  it('Access page loaded', () => {
    expect(wrapper.name()).toBe('Access');
    expect(wrapper).toMatchSnapshot();
  });

  it('Access resource URL generated', () => {
    expect(wrapper.vm.buildGridUrl('test', ['test'], ['test'], 2)).toBe('test/test?_queryFilter=test&_pageSize=10&_totalPagedResultsPolicy=EXACT&_sortKeys=test&_fields=test&_pagedResultsOffset=10');
  });

  it('Access sort column', () => {
    expect(wrapper.vm.calculateSort(false, 'test')).toBe('-test');
    expect(wrapper.vm.calculateSort(true, 'test')).toBe('test');
  });

  it('Sorting change reset', () => {
    wrapper.vm.sortingChanged({
      sortDesc: false,
      sortBy: 'test',
    });

    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('New search entered', () => {
    wrapper.vm.search();

    expect(wrapper.vm.sortBy).toBeNull();
    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('Generated query filter for search', () => {
    expect(wrapper.vm.generateSearch('test', ['test1', 'test2'])).toBe('test1+sw+"test"+OR+test2+sw+"test"');
    expect(wrapper.vm.generateSearch('', ['test1', 'test2'])).toBe('true');
  });

  it('Clear search and sort', () => {
    wrapper.vm.clear();

    expect(wrapper.vm.sortBy).toBeNull();
    expect(wrapper.vm.currentPage).toBe(1);
  });
});
