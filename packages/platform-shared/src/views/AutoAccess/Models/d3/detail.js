/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as d3 from 'd3';
import { chartMeta, dim } from '../data/meta';
import { getPPVScale } from './scales';

export const ModelConstants = {
  ensemble: 'Model C',
  vae: 'Model A',
  ae: 'Model B',
};

const hypotheticalHeight = 330;

const initDetail = (svg) => {
  const detail = svg
    .append('g')
    .attr('id', 'roc-pr-chart-detail')
    .style('transform', `translate(${dim.width + dim.detailMargin.lr}px, ${dim.padding.t}px)`);
  const hypothetical = detail.append('g').style('transform', `translate(0, ${dim.padding.t + 8}px)`)
    .attr('id', 'roc-pr-chart-detail-content');
  hypothetical
    .append('rect')
    .attr('height', `${hypotheticalHeight}px`)
    .attr('width', `${dim.detailWidth}px`)
    .style('fill', 'var(--light)');

  detail
    .append('g')
    .style('transform', 'translate(10px, 5px)')
    .attr('id', 'roc-pr-chart-threshold-slider');
};

const appendAUC = (node, auc) => {
  const g = node
    .append('g')
    .attr('id', 'roc-pr-chart-detail-auc')
    .style('transform', `translate(0, ${hypotheticalHeight + dim.padding.t + 30}px)`);

  g.append('rect')
    .attr('width', `${dim.detailWidth}px`)
    .attr('height', 50)
    .style('fill', 'var(--light)');
  g.append('text')
    .attr('class', 'caption-text')
    .style('font-weight', 600)
    .style('transform', 'translate(16px, 31px)')
    .text(`Area Under Curve: ${auc.toFixed(3)}`);
};

const removeAUC = () => {
  d3.select('#roc-pr-chart-detail-auc').remove();
};

const appendThreshold = (node, d, isSelected) => node
  .append('text')
  .attr('class', 'caption-text')
  .style('font-weight', 600)
  .text(`${isSelected ? 'Selected ' : ''}Threshold: ${d.t}`);

const appendConfusionMatrix = (node, d) => {
  const quadrantW = (dim.detailWidth - 40 - 44) / 2;
  const quadrantH = 40;

  const confusionMatrix = node.append('g').style('transform', 'translate(46px, 85px)');

  const quadrants = confusionMatrix
    .selectAll('g')
    .data(['tp', 'fp', 'fn', 'tn'])
    .enter()
    .append('g')
    .attr('class', 'confusion-quadrant')
    .style('transform', (_i, index) => `translate(${index % 2 === 1 ? quadrantW : 0}px, ${index > 1 ? quadrantH : 0}px)`);

  quadrants
    .append('rect')
    .attr('width', `${quadrantW}px`)
    .attr('height', `${quadrantH}px`)
    .style('stroke', 'var(--dark)')
    .style('fill', 'var(--white)');

  quadrants
    .append('text')
    .style('transform', 'translate(8px, 24px)')
    .text((key) => `${d[key]}`);

  const predicted = confusionMatrix
    .append('g')
    .style('transform', `translate(-28px, ${quadrantH}px) rotate(-90deg)`)
    .style('text-anchor', 'middle');

  predicted
    .append('text')
    .attr('class', 'caption-text')
    .style('transform', 'translate(0, -6px)')
    .text(chartMeta.common.labels.predicted);

  predicted
    .append('text')
    .text(chartMeta.common.labels.negative)
    .style('transform', `translate(${-quadrantH / 2}px, 14px) rotate(90deg)`)
    .attr('class', 'caption-text');

  predicted
    .append('text')
    .text(chartMeta.common.labels.positive)
    .attr('class', 'caption-text')
    .style('transform', `translate(${quadrantH / 2 - 4}px, 14px) rotate(90deg)`);

  const actual = confusionMatrix
    .append('g')
    .style('transform', `translate(${quadrantW}px, -24px)`)
    .style('text-anchor', 'middle');

  actual
    .append('text')
    .attr('class', 'caption-text')
    .style('transform', 'translate(0, -6px)')
    .text(chartMeta.common.labels.actual);

  actual
    .append('text')
    .text(chartMeta.common.labels.positive)
    .style('transform', `translate(${-quadrantW / 2}px, 14px)`)
    .attr('class', 'caption-text');

  actual
    .append('text')
    .text(chartMeta.common.labels.negative)
    .attr('class', 'caption-text')
    .style('transform', `translate(${quadrantW / 2}px, 14px)`);

  return confusionMatrix;
};

const appendPRLabels = (node, d) => {
  const parent = node.append('g');
  const scalePPV = getPPVScale();

  ['fpr', 'tpr', 'ppv'].forEach((key, i) => {
    const g = parent.append('g').style('transform', `translate(0, ${i * 24}px)`);

    const label = g.append('g')
      .style('transform', 'translate(26px, 0)');

    label.append('text')
      .attr('class', 'caption-text')
      .text(`${key.toUpperCase()}`);

    label.append('text')
      .style('transform', 'translate(38px, 0)')
      .attr('class', 'caption-text')
      .text(!Number.isNaN(d[key]) ? `${d[key].toFixed(3)}` : '—');

    if (!Number.isNaN(d[key])) {
      g.append('rect').style('fill', 'var(--white)');

      g.append('rect')
        .style('stroke', 'var(--dark)')
        .style('fill', key === 'fpr' ? `rgb(247, 32, 82, ${d[key]})` : `rgb(22, 252, 141, ${key === 'ppv' ? scalePPV(d[key]) : d[key]})`);

      g.selectAll('rect')
        .attr('height', 12)
        .attr('width', 12)
        .style('transform', 'translate(0, -12px)');
    }

    return g;
  });

  return parent;
};

export {
  initDetail, appendPRLabels, appendAUC, removeAUC, appendConfusionMatrix, appendThreshold,
};
