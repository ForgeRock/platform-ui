/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import sanitizeHtml from 'sanitize-html';

/**
  * HTML sanitization config, overrides the defaults and add the needed configuration for email templates
  * Default config ans docs on https://www.npmjs.com/package/sanitize-htm
  */
const config = {
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class', 'style', 'id'],
  },
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'html', 'head', 'body', 'style', 'img'],
  allowVulnerableTags: true, // removes the warnign for style tag please use with precaution
};

export default function santizeHtml(html) {
  return sanitizeHtml(html, config);
}
