/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import AdminsApiSteps from './api/AdminsApiSteps';
import AIAgentApiSteps from './api/AIAgentApiSteps';
import ApplicationApiSteps from './api/ApplicationApiSteps';
import AssignmentApiSteps from './api/AssignmentApiSteps';
import AuthenticationMethodsApiSteps from './api/AuthenticationMethodsApiSteps';
import AuthScriptApiSteps from './api/AuthScriptApiSteps';
import CspApiSteps from './api/CspApiSteps';
import CustomDomainApiSteps from './api/CustomDomainApiSteps';
import CustomEndpointApiSteps from './api/CustomEndpointApiSteps';
import CustomNodesApiSteps from './api/CustomNodesApiSteps';
import EmailProviderApiSteps from './api/EmailProviderApiSteps';
import EndUserApiSteps from './api/EndUserApiSteps';
import EventHookApiSteps from './api/EventHookApiSteps';
import FederationApiSteps from './api/FederationApiSteps';
import InviteAdminsApiSteps from './api/InviteAdminsApiSteps';
import JobsApiSteps from './api/JobsApiSteps';
import JourneyApiSteps from './api/JourneyApiSteps';
import JourneyNodeApiSteps from './api/JourneyNodeApiSteps';
import LocalizationApiSteps from './api/LocalizationApiSteps';
import ManagedObjectApiSteps from './api/ManagedObjectApiSteps';
import Oauth2ClientApiSteps from './api/Oauth2ClientApiSteps';
import OAuth2ProviderApiSteps from './api/OAuth2ProviderApiSteps';
import OrganizationApiSteps from './api/OrganizationApiSteps';
import RealmApiSteps from './api/RealmApiSteps';
import RelationshipApiSteps from './api/RelationshipApiSteps';
import RoleApiSteps from './api/RoleApiSteps';
import ServiceAccountApiSteps from './api/ServiceAccountApiSteps';
import SamlApplicationApiSteps from './api/SamlApplicationApiSteps';
import SecretMappingsApiSteps from './api/SecretMappingsApiSteps';
import ThemeApiSteps from './api/ThemeApiSteps';
import UserApiSteps from './api/UserApiSteps';

export default {
  admins: AdminsApiSteps,
  aiAgents: AIAgentApiSteps,
  application: ApplicationApiSteps,
  applications: ApplicationApiSteps,
  assignments: AssignmentApiSteps,
  authenticationMethods: AuthenticationMethodsApiSteps,
  authScripts: AuthScriptApiSteps,
  csp: CspApiSteps,
  customDomain: CustomDomainApiSteps,
  customEndpoints: CustomEndpointApiSteps,
  customNodes: CustomNodesApiSteps,
  emailProvider: EmailProviderApiSteps,
  endUser: EndUserApiSteps,
  eventHooks: EventHookApiSteps,
  federation: FederationApiSteps,
  inviteAdmins: InviteAdminsApiSteps,
  jobs: JobsApiSteps,
  journey: JourneyApiSteps,
  journeyNode: JourneyNodeApiSteps,
  journeys: JourneyApiSteps,
  localization: LocalizationApiSteps,
  managedObject: ManagedObjectApiSteps,
  oauth2Clients: Oauth2ClientApiSteps,
  oauth2Provider: OAuth2ProviderApiSteps,
  organizations: OrganizationApiSteps,
  realm: RealmApiSteps,
  relationships: RelationshipApiSteps,
  roles: RoleApiSteps,
  samlApplications: SamlApplicationApiSteps,
  secretMappings: SecretMappingsApiSteps,
  serviceAccounts: ServiceAccountApiSteps,
  themes: ThemeApiSteps,
  user: UserApiSteps,
};
