/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const path = require('path');
const fs = require('fs');

exports.getPackages = function getPackages() {
  const packagesRoot = path.resolve(__dirname, '..', 'packages');
  const packageNames = fs.readdirSync(packagesRoot);

  return packageNames.filter((packageName) => fs.existsSync(path.join(packagesRoot, packageName, 'package.json')));
};
