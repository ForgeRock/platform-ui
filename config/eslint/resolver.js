/**
 * Copyright 2020-2021 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const path = require('path');
const fs = require('fs');
const nodeResolver = require('eslint-import-resolver-node');

exports.interfaceVersion = 2;

const packagesRoot = path.resolve(__dirname, '..', '..', 'packages');
const packageNames = fs.readdirSync(packagesRoot);

exports.resolve = function resolve(source, file, config) {
  if (source.startsWith('@/')) {
    for (const packageName of packageNames) {
      if (file.startsWith(path.join(packagesRoot, packageName))) {
        const newSource = path.join(packagesRoot, packageName, 'src', source.substring(1));
        return nodeResolver.resolve(newSource, file, config);
      }
    }
  }

  return nodeResolver.resolve(source, file, config);
};
