/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import 'core-js/stable';
import './domCollectionsForEach';
import DOMIterables from 'core-js/internals/dom-iterables';
import global from 'core-js/internals/global';
import forEach from 'core-js/internals/array-for-each';

it('DOMCollection elements should have forEach method in their prototype', () => {
  Object.keys(DOMIterables).forEach((collectionName) => {
    const Collection = global[collectionName];
    const CollectionPrototype = Collection && Collection.prototype;
    if (CollectionPrototype) {
      expect(CollectionPrototype.forEach).toBe(forEach);
    }
  });
});
