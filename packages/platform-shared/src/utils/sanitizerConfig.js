/**
 * Copyright (c) 2022-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import sanitizeHtml from 'sanitize-html';

// tags to allow svg and basic shapes drawing
const svgShapeTags = ['svg', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'image', 'text'];
// presentation attributes for svg shapes tags
const presentationAttributes = ['stroke', 'stroke-width', 'fill'];
// aria attributes for creating accessible html
const ariaAttributes = ['aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-braillelabel', 'aria-brailleroledescription', 'aria-busy', 'aria-checked', 'aria-colcount', 'aria-colindex', 'aria-colindextext', 'aria-colspan', 'aria-controls', 'aria-current', 'aria-describedby', 'aria-description', 'aria-details', 'aria-disabled', 'aria-dropeffectDeprecated', 'aria-errormessage', 'aria-expanded', 'aria-flowto', 'aria-grabbedDeprecated', 'aria-haspopup', 'aria-hidden', 'aria-invalid', 'aria-keyshortcuts', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-live', 'aria-modal', 'aria-multiline', 'aria-multiselectable', 'aria-orientation', 'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed', 'aria-readonly', 'aria-relevant', 'aria-required', 'aria-roledescription', 'aria-rowcount', 'aria-rowindex', 'aria-rowindextext', 'aria-rowspan', 'aria-selected', 'aria-setsize', 'aria-sort', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext', 'role'];
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

function docodeLinks(tagName, attribs) {
  const element = { tagName, attribs };
  try {
    element.attribs.href = decodeURIComponent(attribs.href);
  } catch (e) {
    element.attribs.href = attribs.href;
  }
  return element;
}

export const baseSanitizerConfig = {
  ...sanitizeHtml.defaults,
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': [...ariaAttributes, 'class', 'style', 'data-testid', 'id', 'tabindex'],
    a: ['href', 'name', 'target'],
    img: [...sanitizeHtml.defaults.allowedAttributes.img, 'height', 'alt'],
  },
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'html', 'head', 'body', 'style', 'img'],
  allowVulnerableTags: true, // removes the warning for style tag please use with caution
  allowedSchemesByTag: {
    ...sanitizeHtml.defaults.allowedSchemesByTag,
    img: [...sanitizeHtml.defaults.allowedSchemes, 'data'],
  },
  transformTags: {
    a: (tagName, attribs) => docodeLinks(tagName, attribs),
    link: (tagName, attribs) => docodeLinks(tagName, attribs),
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

export const emailTemplateSanitizerConfig = {
  ...baseSanitizerConfig,
  allowedTags: [
    ...baseSanitizerConfig.allowedTags,
    'title', 'meta', 'link',
  ],
  allowedAttributes: {
    ...baseSanitizerConfig.allowedAttributes,
    '*': [
      ...baseSanitizerConfig.allowedAttributes['*'],
      'lang', 'dir', 'style', 'align', 'border',
      'cellpadding', 'cellspacing', 'bgcolor',
      'width', 'height', 'valign',
    ],
    html: ['xmlns*'],
    link: ['rel', 'href', 'type'],
    meta: ['name', 'content', 'http-equiv'],
    style: ['type'],
  },
};

export function sanitize(content, config = baseSanitizerConfig) {
  return sanitizeHtml(content, config);
}
