/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * This method creates a user data object with set credentials.
 * @returns {Object} - user data
 */
export default function generateUserData() {
  const userName = `testUser${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
  const userPassword = 'Rg_GRg9k&e';
  const userSN = 'test';
  return {
    userName,
    userPassword,
    userSN,
  };
}
