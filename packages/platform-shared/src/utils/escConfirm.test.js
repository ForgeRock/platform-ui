/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import createEscConfirm from './escConfirm';

const mockShow = jest.fn();
const mockHide = jest.fn();
const bvModal = { show: mockShow, hide: mockHide };

describe('createEscConfirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handleEscHide calls preventDefault and shows the esc confirm modal when trigger is esc', () => {
    const { handleEscHide } = createEscConfirm('myModal', bvModal);
    const bvEvent = { trigger: 'esc', preventDefault: jest.fn() };
    handleEscHide(bvEvent);
    expect(bvEvent.preventDefault).toHaveBeenCalled();
    expect(mockShow).toHaveBeenCalledWith('myModal-esc-confirm');
  });

  it('handleEscHide does nothing when trigger is not esc', () => {
    const { handleEscHide } = createEscConfirm('myModal', bvModal);
    const bvEvent = { trigger: 'headerclose', preventDefault: jest.fn() };
    handleEscHide(bvEvent);
    expect(bvEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockShow).not.toHaveBeenCalled();
  });

  it('confirmDiscard hides the esc confirm modal and the parent modal', () => {
    const { confirmDiscard } = createEscConfirm('myModal', bvModal);
    confirmDiscard();
    expect(mockHide).toHaveBeenCalledWith('myModal-esc-confirm');
    expect(mockHide).toHaveBeenCalledWith('myModal');
  });

  it('confirmDiscard calls the optional onConfirm callback before hiding the parent modal', () => {
    const onConfirm = jest.fn();
    const { confirmDiscard } = createEscConfirm('myModal', bvModal, onConfirm);
    confirmDiscard();
    expect(onConfirm).toHaveBeenCalled();
    expect(mockHide).toHaveBeenCalledWith('myModal-esc-confirm');
    expect(mockHide).toHaveBeenCalledWith('myModal');
  });

  it('escConfirmId is derived from the modalId', () => {
    const { escConfirmId } = createEscConfirm('correlationModal', bvModal);
    expect(escConfirmId).toBe('correlationModal-esc-confirm');
  });
});
