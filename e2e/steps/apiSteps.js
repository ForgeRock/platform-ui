/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import AdminsApiSteps from './api/AdminsApiSteps';
import AuthScriptApiSteps from './api/AuthScriptApiSteps';
import CspApiSteps from './api/CspApiSteps';
import CustomDomainApiSteps from './api/CustomDomainApiSteps';
import CustomEndpointApiSteps from './api/CustomEndpointApiSteps';
import EndUserApiSteps from './api/EndUserApiSteps';
import EventHookApiSteps from './api/EventHookApiSteps';
import InviteAdminsApiSteps from './api/InviteAdminsApiSteps';
import JobsApiSteps from './api/JobsApiSteps';
import JourneyApiSteps from './api/JourneyApiSteps';
import ServiceAccountApiSteps from './api/ServiceAccountApiSteps';
import UserApiSteps from './api/UserApiSteps';

export default {
  admins: AdminsApiSteps,
  authScripts: AuthScriptApiSteps,
  csp: CspApiSteps,
  customDomain: CustomDomainApiSteps,
  customEndpoints: CustomEndpointApiSteps,
  endUser: EndUserApiSteps,
  eventHooks: EventHookApiSteps,
  inviteAdmins: InviteAdminsApiSteps,
  jobs: JobsApiSteps,
  journey: JourneyApiSteps,
  journeys: JourneyApiSteps,
  serviceAccounts: ServiceAccountApiSteps,
  user: UserApiSteps,
};
