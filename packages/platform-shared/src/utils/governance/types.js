/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const CAMPAIGN_EXPIRING_DAYS = 2;

export const CampaignStates = Object.freeze({
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  CLOSED: 'closed',
  COMPLETE: 'complete',
  SIGNED_OFF: 'signed-off',
  CREATING: 'creating',
  EXPIRED: 'expired',
  EXPIRING: 'expiring',
  IN_PROGRESS: 'in-progress',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  STAGING: 'staging',
});

export const ResourceType = Object.freeze({
  ROLE: 'role',
  USER: 'user',
});
