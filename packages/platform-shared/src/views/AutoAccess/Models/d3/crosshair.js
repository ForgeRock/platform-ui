/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as d3 from 'd3';

import { ChartKey, chartMeta } from '../data/meta';
import { getScales } from './scales';
// eslint-disable-next-line import/no-cycle
import { setSliderVal } from './slider';

export function updateCrosshair(key, d = { t: -1 }, setOtherChart = true) {
  const scales = getScales(key);
  const svg = d3.select(`#${key}-chart`);
  const x = scales.scaleX(d[chartMeta[key].x]);
  const y = scales.scaleY(d[chartMeta[key].y]);

  svg
    .select('.roc-pr-chart-crosshair[data-axis="x"]')
    .attr('x1', x)
    .attr('x2', x)
    .attr('y1', scales.scaleY(scales.yMin))
    .attr('y2', y)
    .style('opacity', 1);

  svg
    .select('.roc-pr-chart-crosshair[data-axis="y"]')
    .attr('x1', scales.scaleX(0))
    .attr('x2', x)
    .attr('y1', y)
    .attr('y2', y)
    .style('opacity', 1);

  setSliderVal(d.t);

  // selected from chart, update other chart too
  if (setOtherChart) {
    const otherKey = key === ChartKey.ROC ? ChartKey.PR : ChartKey.ROC;

    updateCrosshair(otherKey, d, false);
  }
}

export function updateCrosshairHover(key, x, y) {
  const scales = getScales(key);
  const svg = d3.select(`#${key}-chart`);

  svg
    .select('.roc-pr-chart-crosshair[data-axis="x"]')
    .attr('x1', x)
    .attr('x2', x)
    .attr('y1', scales.scaleY(scales.yMin))
    .attr('y2', y)
    .style('opacity', 0.3);

  svg
    .select('.roc-pr-chart-crosshair[data-axis="y"]')
    .attr('x1', scales.scaleX(0))
    .attr('x2', x)
    .attr('y1', y)
    .attr('y2', y)
    .style('opacity', 0.3);
}

export function updateSelectedCrosshair() {
  [ChartKey.ROC, ChartKey.PR].forEach((key) => {
    const scales = getScales(key);
    // eslint-disable-next-line no-undef
    const selectedVal = getSelected();

    const x = scales.scaleX(selectedVal[chartMeta[key].x]);
    const y = scales.scaleY(selectedVal[chartMeta[key].y]);

    d3.select(`#${key}-chart`)
      .select('.roc-pr-chart-selectedCrosshair[data-axis="x"]')
      .attr('x1', x)
      .attr('y1', scales.scaleY(scales.yMin))
      .attr('x2', x)
      .attr('y2', y);

    d3.select(`#${key}-chart`)
      .select('.roc-pr-chart-selectedCrosshair[data-axis="y"]')
      .attr('x1', scales.scaleX(0))
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y);
  });
}

export default {
  updateCrosshair,
  updateCrosshairHover,
  updateSelectedCrosshair,
};
