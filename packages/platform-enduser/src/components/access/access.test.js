import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import ListResource from '@/components/access';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('ListResource.vue', () => {
	Vue.use(BootstrapVue);

	beforeEach(() => {
		jest.spyOn(ListResource, 'mounted')
			.mockImplementation(() => { });
	});

	const $route = {
		path: '/test',
		meta: {},
		params: {
			resourceName: 'test',
			resourceType: 'test',
		},
	};

	it('Access page loaded', () => {
		const wrapper = shallowMount(ListResource, {
			localVue,
			i18n,
			stubs: {
				'router-link': true,
			},
			mocks: {
				$route,
			},
		});

		expect(wrapper.name()).toBe('Access');
		expect(wrapper).toMatchSnapshot();
	});

	it('Access resource URL generated', () => {
		const wrapper = shallowMount(ListResource, {
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

		expect(wrapper.vm.buildGridUrl('test', ['test'], ['test'], 2)).toBe('test/test?_queryFilter=test&_pageSize=10&_totalPagedResultsPolicy=EXACT&_sortKeys=test&_fields=test&_pagedResultsOffset=10');
	});

	it('Access sort column', () => {
		const wrapper = shallowMount(ListResource, {
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

		expect(wrapper.vm.calculateSort(false, 'test')).toBe('-test');
		expect(wrapper.vm.calculateSort(true, 'test')).toBe('test');
	});

	it('Sorting change reset', () => {
		const wrapper = shallowMount(ListResource, {
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
		wrapper.vm.sortingChanged({
			sortDesc: false,
			sortBy: 'test',
		});

		expect(wrapper.vm.currentPage).toBe(1);
	});

	it('New search entered', () => {
		const wrapper = shallowMount(ListResource, {
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
		wrapper.vm.search();

		expect(wrapper.vm.sortBy).toBeNull();
		expect(wrapper.vm.currentPage).toBe(1);
	});

	it('Generated query filter for search', () => {
		const wrapper = shallowMount(ListResource, {
			localVue,
			i18n,
			stubs: {
				'router-link': true,
			},
			mocks: {
				$route,
			},
		});

		expect(wrapper.vm.generateSearch('test', ['test1', 'test2'])).toBe('test1+sw+"test"+OR+test2+sw+"test"');
		expect(wrapper.vm.generateSearch('', ['test1', 'test2'])).toBe('true');
	});

	it('Clear search and sort', () => {
		const wrapper = shallowMount(ListResource, {
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
		wrapper.vm.clear();

		expect(wrapper.vm.sortBy).toBeNull();
		expect(wrapper.vm.currentPage).toBe(1);
	});
});
