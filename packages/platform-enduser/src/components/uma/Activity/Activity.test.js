import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Activity from '@/components/uma/Activity';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

Activity.components['fr-fallback-image'] = jest.fn();

const history = [
  { eventTime: 1528304489098, activity: 'test', type: 'Policy_Created' },
  { eventTime: 1527877853977, activity: 'test', type: 'Policy_Created' },
  { eventTime: 1527877854977, activity: 'test', type: 'Policy_Created' },
];

describe('Uma Activity Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Activity, {
      localVue,
      i18n,
      propsData: {
        umaHistory: history,
      },
    });
  });

  afterEach(() => {
    wrapper = undefined;
  });

  describe('activityGroups', () => {
    it('Activity page loaded', () => {
      expect(wrapper.name()).toBe('UmaActivity');
      expect(wrapper).toMatchSnapshot();
    });

    it('should be sorted into day groups with events in reverse chrono order', () => {
      expect(Array.isArray(wrapper.vm.activityGroups)).toBe(true);
      expect(wrapper.vm.activityGroups).toHaveProperty('length');
      expect(wrapper.vm.activityGroups.length).toBe(2);
    });
  });

  describe('#formatDateTitle', () => {
    it('should format a date string to be "dddd, MMMM DD, YYYY" (e.g, Friday, June 01, 2018)', () => {
      const date = new Date();
      const formattedDate = wrapper.vm.formatDateTitle(date);

      expect(formattedDate.match(/[A-Z]\w+, [A-Z]\w+ \d{2}, \d{4}/)).toBeTruthy();
    });
  });

  describe('#formatTime', () => {
    it('should format as relative time difference for events that occured today', () => {
      let eventToday = new Date();
      const offset = eventToday.getHours() - 1;
      eventToday = eventToday.setHours(offset);

      expect(wrapper.vm.formatTime(eventToday)).toBe('an hour ago');
    });

    it('should use actual time for events on previous days', () => {
      const eventDifferentDay = new Date();
      eventDifferentDay.setDate(eventDifferentDay.getDate() - 2);
      const formattedTime = wrapper.vm.formatTime(eventDifferentDay);

      expect(formattedTime.match(/\d{1,2}:\d{1,2} [AP]M/)).toBeTruthy();
    });
  });
});
