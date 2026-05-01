/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const OUTCOME = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  ERROR: 'error',
  DENIED: 'denied',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown',
};

const OUTCOME_VARIANT = {
  success: [OUTCOME.SUCCESS],
  danger: [OUTCOME.FAILURE, OUTCOME.ERROR, OUTCOME.DENIED],
  warning: [OUTCOME.TIMEOUT],
  default: [OUTCOME.UNKNOWN],
};

export default {
  OUTCOME,
  OUTCOME_VARIANT,
};
