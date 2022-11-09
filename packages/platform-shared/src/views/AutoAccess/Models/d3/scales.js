/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as d3 from 'd3';

import { ChartKey, dim } from '../data/meta';

let ROCPRScales = {};
let scalePPV = null;

class Scales {
  scaleX;

  scaleY;

  yMin;

  constructor(key) {
    if (key === ChartKey.PR) {
      this.yMin = 0;
      // this.yMin = d3.min(data, (d: ROCDataPoint) => d.ppv) * 0.9;
      // this.yMin = parseFloat((Math.ceil(this.yMin * 20) / 20).toFixed(2));
    } else {
      this.yMin = 0;
    }

    this.scaleX = d3
      .scaleLinear()
      .domain([0, 1])
      .range([dim.padding.l, dim.width - dim.padding.r]);
    this.scaleY = d3
      .scaleLinear()
      .domain([this.yMin, 1])
      .range([dim.height - dim.padding.b, dim.padding.t]);
  }
}

const setScales = (data) => {
  ROCPRScales = {
    [ChartKey.ROC]: new Scales(ChartKey.ROC, data),
    [ChartKey.PR]: new Scales(ChartKey.PR, data),
  };

  scalePPV = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.ppv), 1])
    .range([0, 1]);
};

const getScales = (key) => ROCPRScales[key];

const getPPVScale = () => scalePPV;

export { setScales, getScales, getPPVScale };
