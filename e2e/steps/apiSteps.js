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
import CustomDomainApiSteps from './api/CustomDomainApiSteps';
import EventHookApiSteps from './api/EventHookApiSteps';
import CustomEndpointApiSteps from './api/CustomEndpointApiSteps';
import AuthScriptApiSteps from './api/AuthScriptApiSteps';
import JourneyApiSteps from './api/JourneyApiSteps';
import EndUserApiSteps from './api/EndUserApiSteps';
import InviteAdminsApiSteps from './api/InviteAdminsApiSteps';
import AdminsApiSteps from './api/AdminsApiSteps';

export default {
  csp: CspApiSteps,
  serviceAccounts: ServiceAccountApiSteps,
  user: UserApiSteps,
  customDomain: CustomDomainApiSteps,
  eventHooks: EventHookApiSteps,
  customEndpoints: CustomEndpointApiSteps,
  authScripts: AuthScriptApiSteps,
  journeys: JourneyApiSteps,
  endUser: EndUserApiSteps,
  inviteAdmins: InviteAdminsApiSteps,
  admins: AdminsApiSteps,
};
