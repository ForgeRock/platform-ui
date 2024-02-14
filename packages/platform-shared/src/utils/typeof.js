/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * A more sophisticated way of checking types of non-primitives
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#custom_method_that_gets_a_more_specific_type
 *
 * @param name - Parameter description.
 * @returns Type and description of the returned parameter.
 */

/* eslint-disable import/prefer-default-export */
export function type(value) {
  if (value === null) {
    return 'null';
  }
  const baseType = typeof value;
  // Primitive types
  if (!['object', 'function'].includes(baseType)) {
    return baseType;
  }

  // Symbol.toStringTag often specifies the "display name" of the
  // object's class. It's used in Object.prototype.toString().
  const tag = value[Symbol.toStringTag];
  if (typeof tag === 'string') {
    return tag;
  }

  // If it's a function whose source code starts with the "class" keyword
  if (
    baseType === 'function'
    && Function.prototype.toString.call(value).startsWith('class')
  ) {
    return 'class';
  }

  // The name of the constructor; for example `Array`, `GeneratorFunction`,
  // `Number`, `String`, `Boolean` or `MyCustomClass`
  const className = value.constructor.name;
  if (typeof className === 'string' && className !== '') {
    return className;
  }

  // At this point there's no robust way to get the type of value,
  // so we use the base implementation.
  return baseType;
}
