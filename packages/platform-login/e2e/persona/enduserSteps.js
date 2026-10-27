/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import commonEnduserSteps from '@e2e/steps/commonEnduserSteps';
import MessageNodeStylingSteps from '../steps/login/MessageNodeStylingSteps';
import RegistrationSteps from '../steps/enduser/RegistrationSteps';
import RequiredInputsSteps from '../steps/enduser/RequiredInputsSteps';
import TermsAndConditionsSteps from '../steps/login/TermsAndConditionsSteps';
import EmailSuspendSteps from '../steps/login/EmailSuspendSteps';

export default {
  ...commonEnduserSteps,
  messageNodeStyling: MessageNodeStylingSteps,
  registration: RegistrationSteps,
  requiredInputs: RequiredInputsSteps,
  termsAndConditionsJourney: TermsAndConditionsSteps,
  emailSuspendJourney: EmailSuspendSteps,
};
