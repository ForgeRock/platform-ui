/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { highlight } from 'prismjs/components/prism-core';
import Prism from 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-groovy';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup'; // markup, html

/**
 * For accessibility reasons, this check removes focus from editor on esc
 * @param {String} event - The input code of the key pressed
 */
export default function blurOnEscape(event) {
  if (event.code === 'Escape') {
    document.activeElement.blur();
  }
}

/**
 * Returns highlighting HTML used by vue-prism-editor for syntax highlighting
 *
 * @param {String} code - The code to be highlighted
 * @param {String} lang - The language for the code. Supported language strings: css, groovy, javascript/js, json, html/markup, css
 * @returns {String} HTML used for code highlighting
 */
export function highlighter(code, lang) {
  return highlight(code, Prism.languages[lang]);
}
