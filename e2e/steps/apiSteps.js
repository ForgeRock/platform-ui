/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import CspApiSteps from './api/CspApiSteps';
import ServiceAccountApiSteps from './api/ServiceAccountApiSteps';
import UserApiSteps from './api/UserApiSteps';

export default {
  csp: CspApiSteps,
  serviceAccounts: ServiceAccountApiSteps,
  user: UserApiSteps,
};
