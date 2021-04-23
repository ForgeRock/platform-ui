/**
 * Copyright 2021 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/* eslint-disable no-console */
const path = require('path');

const baseDir = path.dirname(path.dirname(__dirname));

beforeEach(() => {
  jest.spyOn(console, 'error');
  jest.spyOn(console, 'warn');
});

function cleanFilepaths(string) {
  return string.split(baseDir).join('');
}

function cleanMockCall(args) {
  return args.map((arg) => (typeof arg === 'string' ? cleanFilepaths(arg) : arg));
}

function snapshotCalls(fn, snapshotName) {
  if (fn.mock.calls.length > 0) {
    expect(fn.mock.calls.map(cleanMockCall)).toMatchSnapshot(snapshotName);
  }
}

afterEach(() => {
  snapshotCalls(console.error, 'console-error-snapshot');
  snapshotCalls(console.warn, 'console-warn-snapshot');
  console.error.mockRestore();
  console.warn.mockRestore();
});
