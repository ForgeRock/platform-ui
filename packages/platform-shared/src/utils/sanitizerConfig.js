/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import sanitizeHtml from 'sanitize-html';

// tags to allow svg and basic shapes drawing
const svgShapeTags = ['svg', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'image', 'text'];
// presentation attributes for svg shapes tags
const presentationAttributes = ['stroke', 'stroke-width', 'fill'];
// attributes for svg shapes tags
const svgShapeAttributes = {
  svg: ['height', 'width', 'viewBox'],
  circle: [...presentationAttributes, 'cx', 'cy', 'r'],
  ellipse: [...presentationAttributes, 'cx', 'cy', 'rx', 'ry'],
  line: [...presentationAttributes, 'x1', 'x2', 'y1', 'y2'],
  path: [...presentationAttributes, 'd'],
  polygon: [...presentationAttributes, 'points'],
  polyline: [...presentationAttributes, 'points'],
  rect: [...presentationAttributes, 'x', 'y', 'width', 'height', 'rx', 'ry'],
  text: [...presentationAttributes, 'x', 'y', 'dx', 'dy', 'rotate', 'lengthAdjust', 'textLength', 'font-size', 'font-family'],
  image: ['href', 'height', 'width', 'x', 'y'],
};

export const baseSanitizerConfig = {
  ...sanitizeHtml.defaults,
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class', 'style', 'data-testid', 'id'],
    a: ['href', 'name', 'target'],
    img: [...sanitizeHtml.defaults.allowedAttributes.img, 'height', 'alt'],
  },
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'html', 'head', 'body', 'style', 'img'],
  allowVulnerableTags: true, // removes the warning for style tag please use with caution
  allowedSchemesByTag: {
    ...sanitizeHtml.defaults.allowedSchemesByTag,
    img: [...sanitizeHtml.defaults.allowedSchemes, 'data'],
  },
};

export const svgShapesSanitizerConfig = {
  ...baseSanitizerConfig,
  allowedTags: [...baseSanitizerConfig.allowedTags, ...svgShapeTags],
  allowedAttributes: {
    ...baseSanitizerConfig.allowedAttributes,
    ...svgShapeAttributes,
  },
};

export function sanitize(content, config = baseSanitizerConfig) {
  return sanitizeHtml(content, config);
}
