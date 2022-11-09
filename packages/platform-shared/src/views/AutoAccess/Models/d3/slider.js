/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as d3 from 'd3';
// eslint-disable-next-line import/no-extraneous-dependencies
import { sliderBottom } from 'd3-simple-slider';
import { dim } from '../data/meta';
// eslint-disable-next-line import/no-cycle
import { setHypothetical } from './state';

let slider = null;

const updateSlider = (data) => {
  const svg = d3.select('#roc-pr-chart-threshold-slider');

  svg.selectAll('*').remove();

  const sliderInit = sliderBottom()
    .min(0)
    .max(100)
    .width(dim.detailWidth - 24)
    .ticks(10)
    .step(1);

  svg.call(sliderInit);

  slider = sliderInit;

  slider.on('onchange', (val) => {
    const d = data.find((el) => el.t === val);

    if (d) {
      setHypothetical(d);
    }
  });
};

function setSliderVal(value) {
  slider.value(value);
}

const getSlider = () => slider;

export { getSlider, setSliderVal, updateSlider };
