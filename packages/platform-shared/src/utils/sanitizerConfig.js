/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import sanitizeHtml from 'sanitize-html';

// default sanitization config for login, admin and enduser apps, it's used in vue-sanitize plugin initialization on main.ls
export const defaultSanitizerConfig = {
  ...sanitizeHtml.defaults,
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class', 'style', 'data-testid'],
    img: [...sanitizeHtml.defaults.allowedAttributes.img, 'height', 'alt'],
  },
};

/**
  * HTML sanitization config for markdown edit panels,
  * overrides the defaults and add the needed configuration for email templates for instance
  * Default config and docs on https://www.npmjs.com/package/sanitize-html
  */
export const markdownPanelSanitizerConfig = {
  ...sanitizeHtml.defaults,
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class', 'style', 'id'],
  },
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'html', 'head', 'body', 'style', 'img'],
  allowVulnerableTags: true, // removes the warnign for style tag please use with caution
};

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

// sanitizer config with basic svg shapes drawing, used in login and enduser apps on custom footer edition
// allows the drawing of circles, lines, polygon, rects, text... all tags in svgShapeTags variable
export const svgShapesSanitizerConfig = {
  ...sanitizeHtml.defaults,
  allowedTags: [...sanitizeHtml.defaults.allowedTags, ...svgShapeTags, 'img'],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    ...svgShapeAttributes,
    '*': ['class', 'style', 'data-testid'],
    img: [...sanitizeHtml.defaults.allowedAttributes.img, 'height', 'alt'],
  },
};
