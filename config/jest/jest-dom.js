/**
 * Copyright 2021-2022 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Note: this function has been added, as this browser-window function is not available to our unit testing environment and causes tests that call it, to fail.
window.URL.createObjectURL = jest.fn();

// Note: for use with Jose as there is no TextEncoder in JSDOM as yet - there is an open ticket to add this: https://github.com/jsdom/jsdom/issues/2524
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
