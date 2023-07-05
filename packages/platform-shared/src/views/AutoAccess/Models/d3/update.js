/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable import/no-cycle */
import * as d3 from 'd3';

import { ChartKey, chartMeta, dim } from '../data/meta';
import { updateCrosshair } from './crosshair';
import { appendThreshold, appendConfusionMatrix, appendPRLabels } from './detail';
import { getScales } from './scales';
import { getHypothetical, setHypothetical } from './state';

function updateHypothetical() {
  const d = getHypothetical();
  const detail = d3.select('#roc-pr-chart-detail');

  const content = detail.select('#roc-pr-chart-detail-content');

  content.selectAll('*').remove();

  appendThreshold(content, d);

  appendConfusionMatrix(content, d);

  const rates = content.append('g').style('transform', 'translate(0, 226px)');

  appendPRLabels(rates, d);

  updateCrosshair(ChartKey.ROC, d);
  updateCrosshair(ChartKey.PR, d);
}

const updateDataPoints = (svg, key, data) => {
  const scales = getScales(key);
  const noSkillPath = svg.select('.roc-pr-chart-noSkill-g path');
  const stepsPath = svg.select('.roc-pr-chart-steps-g path');
  const pointsG = svg.select('.roc-pr-chart-points-g');

  const nonZeroData = data.filter((point) => (
    point.tpr !== 0
    || point.fpr !== 0
    || point.ppv !== 0
  ));

  const { y } = chartMeta[key];
  const { x } = chartMeta[key];
  const path = [];

  const lineGenerator = d3
    .line()
    .x((d) => scales.scaleX(d.x))
    .y((d) => scales.scaleY(d.y));

  if (key === ChartKey.ROC) {
    noSkillPath
      .attr(
        'd',
        lineGenerator([
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ]),
      )
      .attr('class', 'roc-pr-chart-noSkill');
  } else {
    // const yMin = d3.min(data, (d: ROCDataPoint) => d[chartMeta[key].y])
    // noSkillPath.attr('d', lineGenerator([{x: 0, y: yMin}, {x: 1, y: yMin}]))
    //     .attr('class', 'roc-pr-chart-noSkill')
    noSkillPath
      .attr(
        'd',
        lineGenerator([
          { x: 0, y: 0.5 },
          { x: 1, y: 0.5 },
        ]),
      )
      .attr('class', 'roc-pr-chart-noSkill');
  }

  nonZeroData.forEach((d, i) => {
    path.push({ x: d[x], y: d[y] });
    if (nonZeroData[i + 1]) {
      path.push({ x: nonZeroData[i + 1][x], y: d[y] });
    }
  });

  while (path.length < 100) {
    path.unshift({ x: nonZeroData[0][x], y: nonZeroData[0][y] });
  }

  stepsPath
    .transition()
    .duration(500)
    .attr('d', lineGenerator(path));

  let points = pointsG.selectAll('.roc-pr-chart-point').data(nonZeroData);

  points.exit().remove();

  const enter = points
    .enter()
    .append('g')
    .attr('class', 'roc-pr-chart-point');
  // .style('transform', (d: ROCDataPoint) => `translate(${scales.scaleX(d[x])}px, ${scales.scaleY(d[y])}px)`)

  enter
    .append('circle')
    .attr('class', 'roc-pr-chart-point-touchpoint')
    .attr('r', 0);
  // .attr('r', 18)

  enter
    .append('circle')
    .attr('class', 'roc-pr-chart-point-dot')
    .attr('r', 0);

  points = points.merge(enter);

  points
    .style('transform', (d) => `translate(${scales.scaleX(d[x])}px, ${scales.scaleY(d[y])}px)`)
    .selectAll('circle')
    .attr('r', 0);

  points
    .select('.roc-pr-chart-point-dot')
    .transition()
    .delay(250)
    .duration(500)
    .attr('r', dim.point.size);

  points
    .select('.roc-pr-chart-point-touchpoint')
    .transition()
    .delay(250)
    .duration(500)
    .attr('r', 18);

  points
    .on('mouseenter', (i, d) => {
      setHypothetical(d);
    })
    .on('click', (i, d) => {
      setHypothetical(d);
    });

  return points;
};

const updateAxes = (svg, key, isInit = false) => {
  const scales = getScales(key);

  const yAxisLeft = d3.axisLeft(scales.scaleY);

  const xAxisBottom = d3.axisBottom(scales.scaleX);

  const xAxis = svg
    .selectAll('.roc-pr-chart-axis-x')
    .transition()
    .duration(isInit ? 0 : 500)
    .call(xAxisBottom);

  const yAxis = svg
    .selectAll('.roc-pr-chart-axis-y')
    .transition()
    .duration(isInit ? 0 : 500)
    .call(yAxisLeft);

  svg.selectAll('.domain').remove();

  yAxis
    .selectAll('line')
    .attr('x1', 0)
    .attr('x2', dim.width - dim.padding.l - dim.padding.r)
    .style('stroke', '#e7eef4');

  xAxis
    .selectAll('line')
    .attr('y1', 0)
    .attr('y2', -(dim.height - dim.padding.t - dim.padding.b))
    .style('stroke', '#e7eef4');

  yAxis.selectAll('text').attr('class', 'caption-text');

  xAxis.selectAll('text').attr('class', 'caption-text');
};

const updateChartData = (svg, key, data, isInit = false) => {
  updateDataPoints(svg, key, data);
  updateAxes(svg, key, isInit);
};

export { updateHypothetical, updateChartData };
