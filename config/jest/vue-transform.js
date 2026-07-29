/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/*
 * Thin wrapper around @vue/vue3-jest that re-attaches the source map to the
 * generated code as an inline `sourceMappingURL` comment.
 *
 * Why: vue3-jest builds an accurate source map (lib/generate-code.js composes
 * one via SourceNode) but returns it only as separate `map` data, after
 * explicitly stripping the inline comment from the code (lib/process.js). Jest
 * itself is fine with that — it writes the map to a sidecar cache file and uses
 * it for stack traces — but the V8 inspector only discovers a map by reading
 * the `sourceMappingURL` comment out of the script text. With no comment, V8
 * registers every .vue script as having no map.
 *
 * The consequence is worse than breakpoints simply not binding. vue3-jest pads
 * the generated output to roughly the authored line count, so a breakpoint set
 * on an authored line lands on a real-but-unrelated generated line: you get a
 * pause in the wrong place rather than an obviously-unbound breakpoint. Adding
 * the comment back makes `.vue` behave like `.js`, which babel-jest already
 * inlines its map into.
 */

const crypto = require('crypto');
const vue3Jest = require('@vue/vue3-jest');

// Mixed into the cache key so that changing this wrapper invalidates any
// previously cached .vue output. Without it, a developer with a warm Jest cache
// would keep getting comment-less code for unchanged files. Bump whenever the
// emitted code changes.
const WRAPPER_CACHE_VERSION = 'inline-source-map-1';

const SOURCE_MAP_PREFIX = '//# sourceMappingURL=data:application/json;charset=utf-8;base64,';

module.exports = {
  process(src, filename, options) {
    const result = vue3Jest.process(src, filename, options);

    // No result at all is not something Jest can recover from: passing the
    // falsy value on produces an opaque ScriptTransformer error that names
    // neither this wrapper nor the file. Fail loudly instead.
    if (!result) {
      throw new Error(`vue-transform: @vue/vue3-jest returned no result for ${filename}`);
    }

    // A result of an unexpected shape is different: returning it unchanged is
    // exactly today's behaviour without this wrapper, which beats attaching a
    // map that may not describe the code.
    if (typeof result.code !== 'string' || !result.map) {
      return result;
    }

    const map = typeof result.map === 'string' ? result.map : JSON.stringify(result.map);
    const inline = SOURCE_MAP_PREFIX + Buffer.from(map, 'utf8').toString('base64');

    return {
      ...result,
      code: `${result.code}\n${inline}\n`,
      // Still returned separately: Jest uses it for stack-trace remapping and
      // as `inputSourceMap` when instrumenting for coverage.
      map: result.map,
    };
  },

  getCacheKey(fileData, filename, options) {
    // getCacheKey is optional in Jest's transformer contract, so a version of
    // vue3-jest that stops exporting it would otherwise throw a TypeError here
    // and take down all 10 project configs before a single test loaded. The
    // fallback only needs to be stable and input-sensitive.
    const upstreamKey = typeof vue3Jest.getCacheKey === 'function'
      ? vue3Jest.getCacheKey(fileData, filename, options)
      : crypto.createHash('sha1')
        .update(fileData)
        .update('\0')
        .update(filename)
        .digest('hex');

    return `${upstreamKey}:${WRAPPER_CACHE_VERSION}`;
  },
};
