/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import RiskScoreSlider from './index';

describe('RiskScoreSlider', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(RiskScoreSlider);
  });

  it('component should render', () => {
    expect(wrapper).toBeTruthy();
  });

  describe('selectedRange', () => {
    it('should assign default values as initial value', () => {
      expect(wrapper.vm.selectedRange).toEqual([0, 100]);
    });

    it('should use initial values when they are passed ', () => {
      wrapper.setProps({
        value: [10, 80],
      });

      expect(wrapper.vm.selectedRange).toEqual([10, 80]);
    });
  });

  describe('Styles', () => {
    it('should return the lowSliderStyles correctly', () => {
      expect(wrapper.vm.lowSliderStyles).toMatchObject({
        width: '0%',
      });
    });

    it('should return the mediumSliderStyles correctly', () => {
      expect(wrapper.vm.mediumSliderStyles).toMatchObject({
        width: '100%',
        left: '0%',
      });
    });

    it('should return the highSliderStyles correctly', () => {
      expect(wrapper.vm.highSliderStyles).toMatchObject({
        width: '0%',
        right: 0,
      });
    });
  });
});
