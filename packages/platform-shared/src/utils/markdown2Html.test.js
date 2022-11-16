/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import sanitizeHtml from 'sanitize-html';
import { baseSanitizerConfig } from './sanitizerConfig';

describe('sanitizeHtml', () => {
  it('remove javascript from email html template', () => {
    const html = `
    <html>
      <head></head>
      <body style="background-color: #324054; color: #455469; padding: 60px; text-align: center;">
        <div class="content" style="background-color: #fff; border-radius: 4px; margin: 0 auto; padding: 48px; width: 235px;">
          <p>
            <img src="https://tinyurl.com/3mwewu3v" alt="alt text" title="Email Title Text">
          </p>
          <h1 id="emailtitle">Email Title</h1>
          <p>Message text lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor.</p>
          <button onclick="alert('Hello')">click me</button>
          <script>console.log('Hello')</script>
        </div>
      </body>
    </html>
    `;
    const sanitizedHtml = sanitizeHtml(html, baseSanitizerConfig);

    expect(sanitizedHtml).toBe(`
    <html>
      <head></head>
      <body style="background-color:#324054;color:#455469;padding:60px;text-align:center">
        <div class="content" style="background-color:#fff;border-radius:4px;margin:0 auto;padding:48px;width:235px">
          <p>
            <img src="https://tinyurl.com/3mwewu3v" alt="alt text" title="Email Title Text" />
          </p>
          <h1 id="emailtitle">Email Title</h1>
          <p>Message text lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor.</p>
          click me
          
        </div>
      </body>
    </html>
    `);
  });
});
