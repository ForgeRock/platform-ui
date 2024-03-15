/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { validEmailNonAscii } from './validators';

describe('validEmailNonAscii', () => {
  it('should return true for an email with non-ASCII characters', () => {
    const email = 'カタカナdカタカナ@カタカナ.タカ';
    const result = validEmailNonAscii(email);
    expect(result).toBe(true);
  });

  it('should return true for an email with ASCII characters', () => {
    const email = 'test.tets@mail.com';
    const result = validEmailNonAscii(email);
    expect(result).toBe(true);
  });

  it('should return false for an email with non-ASCII characters without domain', () => {
    const email = 'test@éxample';
    const result = validEmailNonAscii(email);
    expect(result).toBe(false);
  });
});
