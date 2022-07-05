/**
 * Copyright 2021-2022 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Note: for use with Jose as there is no TextEncoder in JSDOM as yet - there is an open ticket to add this: https://github.com/jsdom/jsdom/issues/2524
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
