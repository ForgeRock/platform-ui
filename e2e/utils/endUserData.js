/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { faker } from '@faker-js/faker';

/**
 * This method generates an enduser object with random data provided from faker-js library.
 * @returns {Object} - enduser data
 */
export default function generateRandomEndUser() {
  const endUser = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    password: `${faker.internet.password({ pattern: /^[a-zA-Z0-9!@#$%^&*()+=._-]$/ })}aZ9+`,
  };
  endUser.emailAddress = faker.internet.email({ firstName: endUser.firstName, lastName: endUser.lastName, provider: 'example.pingidentity.com' }).toLowerCase();
  endUser.username = faker.internet.username({ firstName: endUser.firstName, lastName: endUser.lastName }).toLowerCase();
  return endUser;
}
