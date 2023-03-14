/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as d3 from 'd3';

import { ChartKey, dim } from '../data/meta';
import { initChart } from './chart';
import { initDetail, appendAUC, removeAUC } from './detail';
import { setScales } from './scales';
import { updateSlider } from './slider';
import { setHypothetical, setModelId, getHypothetical } from './state';
import { updateChartData, updateHypothetical } from './update';

const setDefaultValues = (data) => {
  setHypothetical(data.find((d) => d.t === 85) || data[Math.floor(data.length / 2)]);
};

const update = (d3Container, data, modelId, auc, isInit = false) => {
  setModelId(modelId);

  setScales(data);

  updateChartData(d3.select('#roc-chart'), ChartKey.ROC, data, isInit);

  updateChartData(d3.select('#pr-chart'), ChartKey.PR, data, isInit);

  removeAUC();
  if (auc) {
    appendAUC(d3.select('#roc-pr-chart-detail'), auc);
  }

  updateSlider(data);

  // TODO how to handle new default? can selected be null?
  d3.select(d3Container)
    .selectAll('.roc-pr-chart-selectedCrosshair, .roc-pr-chart-crosshair')
    .style('display', 'none');

  if (!getHypothetical().t || isInit) {
    setDefaultValues(data);
  } else {
    updateHypothetical();
    // updateSelected();
  }

  setTimeout(
    () => {
      d3.select(d3Container)
        .selectAll('.roc-pr-chart-selectedCrosshair, .roc-pr-chart-crosshair')
        .style('display', '');
    },
    isInit ? 1 : 800,
  );

  return d3Container;
};

const init = (d3Container, data, modelId, auc) => {
  const svg = d3
    .select(d3Container)
    .style('max-width', `${dim.width * 2 + dim.detailMargin.lr * 2 + dim.detailWidth}px`)
    .attr('viewBox', `0 0 ${dim.width * 2 + dim.detailMargin.lr * 2 + dim.detailWidth} ${dim.height}`);

  const roc = svg.append('g').attr('id', 'roc-chart');
  initChart(roc, ChartKey.ROC);

  const pr = svg
    .append('g')
    .attr('id', 'pr-chart')
    .style('transform', `translate(${dim.width + dim.detailWidth + dim.detailMargin.lr * 2}px, 0)`);
  initChart(pr, ChartKey.PR);

  initDetail(svg);

  update(d3Container, data, modelId, auc, true);

  return d3Container;
};

export { init, update };
