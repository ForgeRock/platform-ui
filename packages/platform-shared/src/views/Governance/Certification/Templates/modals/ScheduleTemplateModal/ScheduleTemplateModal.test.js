/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { patchScheduleTemplate } from '@/api/governance/TemplateApi';
import scheduleTemplateFormModal from './index';
import scheduleIntervals from './scheduleIntervalsConstants';

jest.mock('@/api/governance/TemplateApi');

let wrapper;
function mountComponent(data = {}, props = {}) {
  wrapper = shallowMount(scheduleTemplateFormModal, {
    global: {
      mocks: {
        $t: (t) => t,
        $bvModal: {
          show: jest.fn(),
          hide: jest.fn(),
        },
      },
    },
    data() {
      return {
        ...data,
      };
    },
    props: {
      templateId: 'test',
      ...props,
    },
  });
}

describe('scheduleTemplateFormModal', () => {
  describe('Methods', () => {
    describe('onTemplateScheduleChanges', () => {
      it('should call setDefaultData if templateSchedule is null or undefined', () => {
        mountComponent();
        const setDefaultDataSpy = jest.spyOn(wrapper.vm, 'setDefaultData');
        wrapper.vm.onTemplateScheduleChanges();
        expect(setDefaultDataSpy).toHaveBeenCalled();
      });
      it('should call setScheduleData if templateSchedule is not null or undefined', () => {
        mountComponent({}, { templateSchedule: { data: '' } });
        const setScheduleDataSpy = jest.spyOn(wrapper.vm, 'setScheduleData');
        wrapper.vm.onTemplateScheduleChanges();
        expect(setScheduleDataSpy).toHaveBeenCalled();
      });
    });
    describe('onTemplateScheduleChanges', () => {
      it('should define the right default values', () => {
        mountComponent();
        wrapper.vm.setDefaultData();
        expect(wrapper.vm.intervalTime).toEqual(scheduleIntervals.DAY);
        expect(wrapper.vm.interval).toEqual('30');
        expect(wrapper.vm.temporalconstraint).toEqual('');
      });
    });
    describe('setScheduleData', () => {
      it('should set temporalconstraint with the start and endtime formated', () => {
        const templateSchedule = {
          repeatInterval: '1',
          startTime: '12/12/12:15:30',
          endTime: '11/11/13:11:00',
        };
        const expectedTemporalConstraint = `${templateSchedule.startTime}/${templateSchedule.endTime}`;
        mountComponent({}, { templateSchedule });
        wrapper.vm.setScheduleData();
        expect(wrapper.vm.temporalconstraint).toEqual(expectedTemporalConstraint);
      });
    });
    describe('getDateTimeValues', () => {
      it('Should return the startTime and endTime from the temporal constraint', () => {
        mountComponent();
        const expectedValue = {
          endTime: '2023-11-10T17:03:00.000Z',
          startTime: '2022-11-17T17:03:00.000Z',
        };
        const temporalconstraintVal = '2022-11-17T17:03:00.000Z/2023-11-10T17:03:00.000Z';
        wrapper.vm.temporalconstraint = temporalconstraintVal;
        const result = wrapper.vm.getDateTimeValues();
        expect(result).toEqual(expectedValue);
      });
    });
    describe('getSchedulePatchParams', () => {
      it('Should return the params used to save the schedule update', () => {
        const templateSchedule = {
          repeatInterval: '1',
          startTime: '12/12/12:15:30',
          endTime: '11/11/13:11:00',
        };
        mountComponent({}, { templateSchedule });
        wrapper.vm.setScheduleData();
        const expectedValue = {
          schedule: {
            enabled: true,
            endTime: '13:11:00',
            id: null,
            repeatCount: 0,
            repeatInterval: 2592000000,
            schedule: null,
            startTime: '12/12/12:15:30/11/11',
            type: 'simple',
          },
        };
        const result = wrapper.vm.getSchedulePatchParams();
        expect(result).toEqual(expectedValue);
      });
      it('Should return the params used to delete the schedule', () => {
        mountComponent();
        const expectedValue = {
          schedule: null,
        };
        const result = wrapper.vm.getSchedulePatchParams(true);
        expect(result).toEqual(expectedValue);
      });
    });
    describe('confirmDeleteSchedule', () => {
      it('should emit the event to show the delete modal', () => {
        mountComponent();
        wrapper.vm.confirmDeleteSchedule();
        expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('deleteModal');
      });
    });
    describe('scheduleTemplate', () => {
      beforeEach(() => {
        patchScheduleTemplate.mockImplementation(() => Promise.resolve({ data: 'results' }));
      });
      it('should call getSchedulePatchParams with false when updating the schedule', () => {
        mountComponent({ temporalconstraint: '213/123' });
        const getSchedulePatchParamsSpy = jest.spyOn(wrapper.vm, 'getSchedulePatchParams');
        wrapper.vm.scheduleTemplate(false);
        expect(getSchedulePatchParamsSpy).toHaveBeenCalledWith(false);
      });
      it('should call getSchedulePatchParams with true when deleting the schedule', () => {
        mountComponent();
        const getSchedulePatchParamsSpy = jest.spyOn(wrapper.vm, 'getSchedulePatchParams');
        wrapper.vm.scheduleTemplate(true);
        expect(getSchedulePatchParamsSpy).toHaveBeenCalledWith(true);
      });
      it('should call patchScheduleTemplate with the template id and params to update the schedule', () => {
        mountComponent({ temporalconstraint: '213/123' });
        wrapper.vm.scheduleTemplate();
        expect(patchScheduleTemplate).toHaveBeenCalledWith('test', {
          schedule: {
            enabled: true,
            endTime: '123',
            id: null,
            repeatCount: 0,
            repeatInterval: 2592000000,
            schedule: null,
            startTime: '213',
            type: 'simple',
          },
        });
      });
      it('should call refreshSchedule with the new schedule data', async () => {
        mountComponent({ temporalconstraint: '213/123' });
        const refreshScheduleSpy = jest.spyOn(wrapper.vm, 'refreshSchedule');
        wrapper.vm.scheduleTemplate({ data: 'results' });

        await flushPromises();
        expect(refreshScheduleSpy).toHaveBeenCalledWith({ data: 'results' });
      });
      it('should emit the load-template-list to refresh the info', async () => {
        mountComponent({ temporalconstraint: '213/123' });
        wrapper.vm.scheduleTemplate();

        await flushPromises();
        expect(wrapper.emitted()).toHaveProperty('load-template-list');
      });
      it('should emit the bv::hide::modal to hide the delete modal', async () => {
        mountComponent({ temporalconstraint: '213/123' });
        wrapper.vm.scheduleTemplate();

        await flushPromises();
        expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('deleteModal');
      });
      it('should emit the bv::hide::modal to hide the schedule modal', async () => {
        mountComponent();
        wrapper.vm.scheduleTemplate(true);

        await flushPromises();
        expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('scheduleTemplateFormModal');
      });
    });
  });
});
