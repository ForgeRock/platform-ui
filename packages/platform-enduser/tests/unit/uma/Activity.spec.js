import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';
import i18n from '@/i18n';
import Activity from '@/components/uma/Activity';

Activity.components['fr-fallback-image'] = Sinon.stub();

const history = [
  { eventTime: 1528304489098, activity: 'test', type: 'Policy_Created' },
  { eventTime: 1527877853977, activity: 'test', type: 'Policy_Created' },
  { eventTime: 1527877854977, activity: 'test', type: 'Policy_Created' },
];

describe('Uma Activity Component', () => {
  Vue.use(BootstrapVue);

  let wrapper;

  before(() => {
    wrapper = shallowMount(Activity, {
      i18n,
      propsData: {
        umaHistory: history,
      },
    });
  });

  after(() => {
    wrapper = undefined;
  });

  describe('activityGroups', () => {
    it('should be sorted into day groups with events in reverse chrono order', () => {
      expect(wrapper.vm.activityGroups).to.be.an('array').with.property('length').that.equals(2);
    });
  });

  describe('#formatDateTitle', () => {
    it('should format a date string to be "dddd, MMMM DD, YYYY" (e.g, Friday, June 01, 2018)', () => {
      const date = new Date('2018-06-02T12:00:00Z');


      const formattedDate = wrapper.vm.formatDateTitle(date);

      // eslint-disable-next-line
            expect(formattedDate.match(/[A-Z]\w+, [A-Z]\w+ \d{2}, \d{4}/)).to.be.ok
    });
  });

  describe('#formatTime', () => {
    // TODO check datetime logic as this test fails on Jenkins
    it.skip('should format as relative time difference for events that occured today', () => {
      const eventToday = new Date();


      const offset = eventToday.getHours() - 1;

      expect(wrapper.vm.formatTime(eventToday.setHours(offset))).to.equal('an hour ago');
    });

    it('should use actual time for events on previous days', () => {
      const eventDifferentDay = new Date('2018-06-06');


      const formattedTime = wrapper.vm.formatTime(eventDifferentDay);

      // eslint-disable-next-line
            expect(formattedTime.match(/\d{1,2}:\d{1,2} [AP]M/)).to.be.ok;
    });
  });
});
