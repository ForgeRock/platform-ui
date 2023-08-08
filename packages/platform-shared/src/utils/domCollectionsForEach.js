/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import global from 'core-js/internals/global';
import DOMIterables from 'core-js/internals/dom-iterables';
import forEach from 'core-js/internals/array-for-each';
import createNonEnumerableProperty from 'core-js/internals/create-non-enumerable-property';

// Adds the forEach method to all DOMIterables elements to avoid problems in custom customer scripts due to a bug in an older version of core-js previously used in the project.
// @see {@link https://github.com/zloirock/core-js/issues/988}
Object.keys(DOMIterables).forEach((collectionName) => {
  const Collection = global[collectionName];
  const CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach) {
    try {
      createNonEnumerableProperty(CollectionPrototype, 'forEach', forEach);
    } catch (error) {
      CollectionPrototype.forEach = forEach;
    }
  }
});
