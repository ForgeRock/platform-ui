/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import addAttributesToDomNodeString from './stringDomNodeUtils';

describe('stringDomNodeUtils', () => {
  describe('addAttributesToDomNodeString', () => {
    describe('should throw error', () => {
      describe('when domNodeString is falsy', () => {
        const testCases = [
          ['given false', false],
          ['given zero', 0],
          ['given empty string', ''],
          ['given null', null],
          ['given undefined', undefined],
          ['given NaN', NaN],
        ];
        it.each(testCases)('%s', (name, domNodeString) => {
          expect(() => addAttributesToDomNodeString(domNodeString)).toThrowError('Please provide both parameters.');
        });
      });

      describe('when attributesMap is falsy', () => {
        const givenNodeString = '<p>given node string</p>';
        const testCases = [
          ['given false', false],
          ['given zero', 0],
          ['given empty string', ''],
          ['given null', null],
          ['given undefined', undefined],
          ['given NaN', NaN],
        ];
        it.each(testCases)('%s', (name, attributesMap) => {
          expect(() => addAttributesToDomNodeString(givenNodeString, attributesMap)).toThrowError('Please provide both parameters.');
        });
      });

      it('when domNodeString is not a string', () => {
        expect(() => addAttributesToDomNodeString(786, new Map())).toThrowError('Incorrect parameter type. Please provide a String for `domNodeString`');
      });

      it('when attributesMap is not a Map', () => {
        expect(() => addAttributesToDomNodeString('<p>stub-p</p>', { alt: '' })).toThrowError('Incorrect parameter type. Please provide a Map for `attributesMap`');
      });

      it('when there is no closing tag', () => {
        expect(() => addAttributesToDomNodeString('<p', new Map())).toThrowError('Non valid html string detected. Please provide a string representing valid html.');
      });
    });

    describe('should ignore attribute', () => {
      it('when attributesMap contains a key that is not a string', () => {
        const stubNode = '<p>stub-p</p>';
        const attributesMap = new Map();
        attributesMap.set('class', 'bold');
        attributesMap.set(7, 7);

        const returnedVal = addAttributesToDomNodeString(stubNode, attributesMap);
        expect(returnedVal).toBe('<p class="bold">stub-p</p>');
      });
    });

    describe('should add attribute to first dom node', () => {
      it('when one attribute', () => {
        const domNode = '<div>stub-div</div>';
        const returnedVal = addAttributesToDomNodeString(domNode, new Map().set('class', 'bold'));
        expect(returnedVal).toBe('<div class="bold">stub-div</div>');
      });

      it('when multiple attributes', () => {
        const domNode = '<a>hyperlink</a>';

        const attributes = new Map();
        attributes.set('class', 'bold');
        attributes.set('id', 'stub-id');
        attributes.set('href', 'http://forgerock.com');

        const returnedVal = addAttributesToDomNodeString(domNode, attributes);
        expect(returnedVal).toBe('<a class="bold" id="stub-id" href="http://forgerock.com">hyperlink</a>');
      });

      it('when node with children', () => {
        const domNode = '<div><span>child-1</span></div>';
        const returnedVal = addAttributesToDomNodeString(domNode, new Map().set('class', 'bold'));
        expect(returnedVal).toBe('<div class="bold"><span>child-1</span></div>');
      });

      it('when self closing tag', () => {
        const domNode = '<input name="stub-input"/>';

        const attributes = new Map();
        attributes.set('class', 'bold');

        const returnedVal = addAttributesToDomNodeString(domNode, attributes);
        expect(returnedVal).toBe('<input name="stub-input" class="bold"/>');
      });
    });
  });
});
