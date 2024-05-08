/**
 * Copyright (c) 2022-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import RiskScoreSlider from './index';

describe('RiskScoreSlider', () => {
  let wrapper;
  let sliders;
  let lowSliderDot;
  let highSliderDot;
  let lowSliderProcess;
  let mediumSliderProcess;
  let highSliderProcess;
  beforeEach(() => {
    wrapper = mount(RiskScoreSlider);
    sliders = wrapper.findAll('.vue-slider-dot');
    [lowSliderDot] = sliders;
    [, highSliderDot] = sliders;
    lowSliderProcess = wrapper.find('.low');
    mediumSliderProcess = wrapper.find('.medium');
    highSliderProcess = wrapper.find('.high');
  });

  describe('selectedRange', () => {
    it('should assign default values as initial value', () => {
      const lowSliderValue = lowSliderDot.attributes('aria-valuetext');
      expect(lowSliderValue).toBe('0');

      const highSliderValue = highSliderDot.attributes('aria-valuetext');
      expect(highSliderValue).toBe('100');
    });

    it('should use initial values when they are passed', async () => {
      const props = { value: [33, 67] };
      await wrapper.setProps(props);

      const lowSliderValue = lowSliderDot.attributes('aria-valuetext');
      expect(lowSliderValue).toBe(props.value[0].toString());

      const highSliderValue = highSliderDot.attributes('aria-valuetext');
      expect(highSliderValue).toBe(props.value[1].toString());
    });
  });

  describe('Styles', () => {
    it('should return the lowSliderStyles correctly', async () => {
      const props = { value: [33, 67] };
      await wrapper.setProps(props);
      expect(lowSliderProcess.element.style.width).toBe(`${props.value[0]}%`);
    });

    it('should return the mediumSliderStyles correctly', async () => {
      const props = { value: [33, 67] };
      await wrapper.setProps(props);
      expect(mediumSliderProcess.element.style.left).toBe(`${props.value[0]}%`);
      expect(mediumSliderProcess.element.style.width).toBe(`${props.value[1] - props.value[0]}%`);
    });

    it('should return the highSliderStyles correctly', async () => {
      const props = { value: [33, 67] };
      await wrapper.setProps(props);
      expect(highSliderProcess.element.style.right).toBe('0px');
      expect(highSliderProcess.element.style.width).toBe(`${100 - props.value[1]}%`);
    });
  });
});
