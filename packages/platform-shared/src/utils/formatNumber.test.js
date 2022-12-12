/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import formatNumber from './formatNumber';

const amount = 5_273;

describe('Format Number', () => {
  it('should call Intl.NumberFormat format with the default locale - options and return the value', () => {
    const numberFormatSpy = jest.spyOn(Intl, 'NumberFormat');

    const formattedNumber = formatNumber(amount);

    expect(numberFormatSpy).toHaveBeenCalledWith('en-US', {});
    expect(formattedNumber).toEqual('5,273');
  });

  it('should call Int.NumberFormat format with the locale - options custom and return the value', () => {
    const numberFormatSpy = jest.spyOn(Intl, 'NumberFormat');
    const options = {
      style: 'percent',
    };

    const formattedNumber = formatNumber(amount, 'en-US', options);

    expect(numberFormatSpy).toHaveBeenCalledWith('en-US', options);
    expect(formattedNumber).toEqual('527,300%');
  });
});
