/**
 * Copyright (c) 2022-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import sanitizeHtml from 'sanitize-html';
import { baseSanitizerConfig } from './sanitizerConfig';
import { html2HtmlPreview } from './markdown2Html';

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

describe('html2HtmlPreview', () => {
  it('wraps html content in a .content div', () => {
    const result = html2HtmlPreview('<p>Hello world</p>', '');

    expect(result).toContain('class="content"');
    expect(result).toContain('<p>Hello world</p>');
  });

  it('includes the provided styles in a <style> tag', () => {
    const styles = 'p { color: red; }';
    const result = html2HtmlPreview('<p>Hello</p>', styles);

    expect(result).toContain('<style>');
    expect(result).toContain(styles);
  });

  it('does not double-wrap html already in a .content div', () => {
    const html = '<div class="content"><p>Hello</p></div>';
    const result = html2HtmlPreview(html, '');

    const contentDivCount = (result.match(/class="content"/g) || []).length;
    expect(contentDivCount).toBe(1);
  });

  it('sanitizes script tags from html input', () => {
    const html = '<p>Safe content</p><script>alert("xss")</script>';
    const result = html2HtmlPreview(html, '');

    expect(result).not.toContain('<script>');
    expect(result).toContain('Safe content');
  });

  it('sanitizes inline event handlers from html input', () => {
    const html = '<p onclick="alert(\'xss\')">Click me</p>';
    const result = html2HtmlPreview(html, '');

    expect(result).not.toContain('onclick');
    expect(result).toContain('Click me');
  });

  it('returns only the style tag when html is empty', () => {
    const styles = 'p { color: blue; }';
    const result = html2HtmlPreview('', styles);

    expect(result).toContain('<style>');
    expect(result).toContain(styles);
    expect(result).not.toContain('class="content"');
  });

  it('works with empty styles', () => {
    const result = html2HtmlPreview('<p>Hello</p>', '');

    expect(result).toContain('<style></style>');
    expect(result).toContain('Hello');
  });
});
