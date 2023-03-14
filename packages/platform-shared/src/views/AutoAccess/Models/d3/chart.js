/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as d3 from 'd3';

import { chartMeta, dim } from '../data/meta';
import { updateCrosshair, updateCrosshairHover } from './crosshair';
import { getHypothetical } from './state';

function appendAxes(svg, key) {
  const meta = chartMeta[key];

  const xAxis = svg
    .append('g')
    .attr('class', 'roc-pr-chart-axis-x')
    .style('pointer-events', 'none')
    .style('transform', `translate(0, ${dim.height - dim.padding.t}px)`);

  const yAxis = svg
    .append('g')
    .attr('class', 'roc-pr-chart-axis-y')
    .style('pointer-events', 'none')
    .style('transform', `translate(${dim.padding.l}px, 0)`);

  xAxis
    .append('text')
    .style('transform', `translate(${dim.padding.l + dim.width / 2}px, ${dim.padding.b - 12}px)`)
    .style('fill', 'var(--dark)')
    .style('text-anchor', 'middle')
    .attr('class', 'caption-text')
    .text(meta.labels.xAxis);

  yAxis
    .append('text')
    .style('transform', `translate(${-dim.padding.l + 12}px, ${(dim.height - dim.padding.b) / 2}px) rotate(-90deg)`)
    .style('fill', 'var(--dark)')
    .style('text-anchor', 'middle')
    .attr('class', 'caption-text')
    .text(meta.labels.yAxis);
}

const appendHoverArea = (key, svg) => {
  const hoverArea = svg
    .append('rect')
    .attr('width', dim.width - dim.padding.l - dim.padding.r)
    .attr('height', dim.height - dim.padding.t - dim.padding.b)
    .style('transform', `translate(${dim.padding.l + 1}px, ${dim.padding.t}px)`)
    .style('fill', 'transparent')
    .style('cursor', 'crosshair');

  const crosshair = svg.append('g');

  crosshair
    .append('line')
    .attr('class', 'roc-pr-chart-crosshair')
    .attr('data-axis', 'x');

  crosshair
    .append('line')
    .attr('class', 'roc-pr-chart-crosshair')
    .attr('data-axis', 'y');

  const selectedCrosshair = svg.append('g');

  selectedCrosshair
    .append('line')
    .attr('class', 'roc-pr-chart-selectedCrosshair')
    .attr('data-axis', 'x');

  selectedCrosshair
    .append('line')
    .attr('class', 'roc-pr-chart-selectedCrosshair')
    .attr('data-axis', 'y');

  hoverArea.on('mousemove', (e) => {
    const coords = d3.pointer(e);
    const x = coords[0] + dim.padding.l;
    const y = coords[1] + dim.padding.t;

    updateCrosshairHover(key, x, y);
  });

  hoverArea.on('mouseleave', (e) => {
    e.stopPropagation();
    updateCrosshair(key, getHypothetical());
  });
};

export const appendChart = (svg) => {
  svg
    .append('g')
    .attr('class', 'roc-pr-chart-noSkill-g')
    .append('path');
  svg
    .append('g')
    .attr('class', 'roc-pr-chart-steps-g')
    .append('path');
  svg.append('g').attr('class', 'roc-pr-chart-points-g');
};

export const initChart = (svg, key) => {
  svg
    .append('text')
    .text(chartMeta[key].labels.title)
    .style('transform', `translate(${dim.width / 2}px, 30px)`)
    .attr('class', 'roc-pr-chart-title');

  appendAxes(svg, key);
  appendHoverArea(key, svg);
  appendChart(svg);
};
