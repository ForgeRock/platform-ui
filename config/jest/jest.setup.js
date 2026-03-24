/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import 'jest-axe/extend-expect'; // extends expect with toHaveNoViolations
import { config, RouterLinkStub } from '@vue/test-utils';

const noopDirective = {
  beforeMount: () => {},
  mounted: () => {},
  updated: () => {},
};

config.global.stubs = {
  ...(config.global.stubs || {}),
  RouterLink: RouterLinkStub,
  RouterView: true,
};

config.global.directives = {
  ...(config.global.directives || {}),
  'resizable-table': noopDirective,
};
