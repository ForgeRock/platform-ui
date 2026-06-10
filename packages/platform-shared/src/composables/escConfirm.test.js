/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import useBvModal from './bvModal';
import useEscConfirm from './escConfirm';

jest.mock('./bvModal');

const mockShow = jest.fn();
const mockHide = jest.fn();

describe('escConfirm composable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useBvModal.mockReturnValue({ bvModal: { value: { show: mockShow, hide: mockHide } } });
  });

  it('returns the three handler functions and escConfirmId', () => {
    const result = useEscConfirm('myModal');
    expect(typeof result.handleEscHide).toBe('function');
    expect(typeof result.confirmDiscard).toBe('function');
    expect(result.escConfirmId).toBe('myModal-esc-confirm');
  });

  it('delegates to createEscConfirm — handleEscHide shows the confirm modal on esc', () => {
    const { handleEscHide } = useEscConfirm('myModal');
    const bvEvent = { trigger: 'esc', preventDefault: jest.fn() };
    handleEscHide(bvEvent);
    expect(mockShow).toHaveBeenCalledWith('myModal-esc-confirm');
  });

  it('delegates to createEscConfirm — confirmDiscard hides both modals', () => {
    const { confirmDiscard } = useEscConfirm('myModal');
    confirmDiscard();
    expect(mockHide).toHaveBeenCalledWith('myModal-esc-confirm');
    expect(mockHide).toHaveBeenCalledWith('myModal');
  });

  it('passes onConfirm callback through to createEscConfirm', () => {
    const onConfirm = jest.fn();
    const { confirmDiscard } = useEscConfirm('myModal', onConfirm);
    confirmDiscard();
    expect(onConfirm).toHaveBeenCalled();
  });
});
