/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const fs = require('fs').promises;

module.exports = (on, config) => {
  on('task', {
    async readFileWithFallback({ globalFile, projectFile, encoding = 'utf8' }) {
      try {
        const data = await fs.readFile(globalFile, encoding);
        return data.toString();
      } catch (error) {
        try {
          const data = await fs.readFile(projectFile, encoding);
          return data.toString();
        } catch (fallbackError) {
          return null;
        }
      }
    },
  });

  return config;
};
