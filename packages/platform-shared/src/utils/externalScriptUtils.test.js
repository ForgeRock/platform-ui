/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import createScriptTags from './externalScriptUtils';

describe('externalScriptUtils', () => {
  describe('should return empty list', () => {
    const testCases = [
      ['given false', false],
      ['given zero', 0],
      ['given empty string', ''],
      ['given null', null],
      ['given undefined', undefined],
      ['given empty object', {}],
      ['given empty array', []],
    ];
    it.each(testCases)('%s', (name, invalidScriptStr) => {
      const scriptTags = createScriptTags(invalidScriptStr);
      expect(scriptTags.length).toBe(0);
    });

    it('given no scriptStr', () => {
      const scriptTags = createScriptTags();
      expect(scriptTags.length).toBe(0);
    });

    it('given non script tag provided', () => {
      const divStr = btoa('<div>I am not a script tag</div>');

      const scriptTags = createScriptTags(divStr);
      expect(scriptTags.length).toBe(0);
    });
  });

  describe('given script string', () => {
    const scriptStr = btoa('<script>alert("some code");</script>');

    it('should parse simple script tag', () => {
      const scriptTags = createScriptTags(scriptStr);

      expect(scriptTags[0].text).toBe('alert("some code");');
    });

    it('should parse script tag with attributes', () => {
      const scriptStrWithAttrs = btoa('<script src="path/to/some/resource" data-domain-script="stub-token" async></script>');
      const scriptTags = createScriptTags(scriptStrWithAttrs);

      expect(scriptTags[0].getAttribute('src')).toBe('path/to/some/resource');
      expect(scriptTags[0].getAttribute('data-domain-script')).toBe('stub-token');
      expect(scriptTags[0].hasAttribute('async')).toBe(true);
    });

    it('should parse multiple script tags', () => {
      const scriptStrWithAttrs = btoa(`
        <script src="/first/script"></script>
        <script src="/second/script"></script>
      `);
      const scriptTags = createScriptTags(scriptStrWithAttrs);

      expect(scriptTags.length).toBe(2);
      // Note: test that the order was preserved
      expect(scriptTags[0].getAttribute('src')).toBe('/first/script');
      expect(scriptTags[1].getAttribute('src')).toBe('/second/script');
    });
  });
});
