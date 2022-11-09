/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable no-undef */
import * as d3 from 'd3';

export const dim = {
  width: 168,
  height: 168,
};

const arc = d3.arc()
  .innerRadius((dim.width / 2) * 0.905)
  .outerRadius(dim.width / 2);

function arcTween(a) {
  const i = d3.interpolate(this._current, a);
  this._current = i(0);
  return (t) => arc(i(t));
}

export const init = (d3Container) => {
  d3.select(d3Container)
    .call((selection) => {
      selection.style('max-width', `${dim.width}`)
        .attr('viewBox', `0 0 ${dim.width} ${dim.height}`)
        .append('g')
        .style('transform', `translate(${dim.width / 2}px, ${dim.height / 2}px)`);

      const tooltip = selection.append('g')
        .attr('class', 'driving-factors-donut-chart-tooltip')
        .style('pointer-events', 'none')
        .style('opacity', 0);

      tooltip.append('rect')
        .attr('rx', 4);
      tooltip.append('g')
        .attr('class', 'text-group')
        .call((select) => {
          select.append('text')
            .attr('class', 'attr')
            .style('fill', '#fff')
            .style('font-size', '0.625rem');
          select.append('text')
            .attr('class', 'value')
            .style('fill', '#fff')
            .style('font-size', '0.625rem');
        });
    });
};

export const update = (d3Container) => {
  const data = [];
  const svg = d3.select(d3Container).select('g');

  const color = d3.scaleOrdinal()
    .domain(Object.keys(identitySchema).map((key) => key.toUpperCase()))
    .range(d3.schemeTableau10);

  const pie = d3.pie()
    .padAngle(0.02)
    .value((d) => d.count);

  const arcs = pie(data);

  svg.selectAll('path')
    .data(arcs)
    .join((enter) => enter
      .append('path')
      .attr('fill', (d) => color(d.data.attr))
      .attr('d', arc)
      .on('mouseover', (event, d) => {
        const mouse = d3.pointer(event);
        const tooltip = d3.select('.driving-factors-donut-chart-tooltip');

        tooltip.select('.attr')
          .text(`${identitySchema[d.data.attr.toLowerCase()].display.name}: `);
        tooltip.select('.value')
          .style('transform', `translate(0,${14}px)`)
          .text(d.data.value);

        const bbox = (tooltip.select('.text-group').node()).getBBox();

        tooltip.style('transform', `translate(${Math.max(mouse[0] + bbox.width / 2, -40)}px,${Math.max(mouse[1] + 50, 0)}px)`);

        tooltip.select('rect')
          .attr('width', bbox.width + 8)
          .attr('height', bbox.height + 6)
          .style('transform', `translate(${-4}px,${-bbox.height / 2}px)`)
          .style('fill', 'rgba(97, 97, 97, 0.9)');

        tooltip.transition()
          .style('opacity', 1)
          .duration(200);
      })
      .on('mouseout', () => {
        const tooltip = d3.select('.driving-factors-donut-chart-tooltip');

        tooltip.transition()
          .style('opacity', 0)
          .duration(200);
      }),
    (updateAttr) => updateAttr
      .attr('fill', (d) => color(d.data.attr))
      .attr('d', arc)
      .call((updateData) => updateData
        .transition()
        .duration(750)
        .attrTween('d', arcTween)));
};
