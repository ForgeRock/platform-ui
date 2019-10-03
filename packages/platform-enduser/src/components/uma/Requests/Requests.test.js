import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Requests from '@/components/uma/Requests';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

Requests.components['fr-fallback-image'] = jest.fn();

const requests = [
  {
    _id: 'be4cb21e-74a1-4498-aabd-310b6b5bb3415',
    user: 'phil',
    resource: 'Ultrasound',
    when: 1529937902420,
    allowed: false,
    decision: false,
    permissions: [
      'download',
    ],
  },
  {
    _id: '7de54a3b-1446-4ada-a8a5-3cd00739180613',
    user: 'steve',
    resource: 'Ultrasound',
    when: 1529937934625,
    allowed: false,
    decision: false,
    permissions: [
      'download',
    ],
  },
];

describe('UMA Requests Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Requests, {
      localVue,
      i18n,
      propsData: {
        requests,
      },
    });
  });

  afterEach(() => {
    wrapper = undefined;
  });

  it('Requests page loaded', () => {
    expect(wrapper.name()).toBe('Requests');
    expect(wrapper).toMatchSnapshot();
  });

  it('should format as relative time difference for events that occured today', () => {
    const eventToday = new Date();
    const offset = eventToday.getHours() - 1;

    expect(wrapper.vm.$options.filters.formatTime(eventToday.setHours(offset))).toBe('an hour ago');
  });

  it('should use actual time for events on previous days', () => {
    const eventDifferentDay = new Date('2018-06-06');
    const formattedTime = wrapper.vm.$options.filters.formatTime(eventDifferentDay);

    // eslint-disable-next-line
    expect(formattedTime.match(/\d{1,2}:\d{1,2} [AP]M/)).toBeTruthy();
  });

  it('should emit "finalizeResourceAccess" event', () => {
    wrapper.vm.finalizeAccess('12345', 0, 'approve');

    expect(wrapper.emitted('finalizeResourceAccess').length).toBe(1);
  });
});
