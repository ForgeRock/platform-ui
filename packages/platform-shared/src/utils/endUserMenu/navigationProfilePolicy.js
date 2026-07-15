/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Decodes a URI-encoded JSON navigationProfile attribute value.
 *
 * @param {string} encoded URI-encoded JSON string
 * @returns {{ id: string, name: string, menuItems: Array }|null}
 */
function decodeNavigationProfile(encoded) {
  try {
    return JSON.parse(decodeURIComponent(encoded));
  } catch {
    return null;
  }
}

/**
 * Resolves the winning navigation profile menu items from a policy evaluateTree result.
 *
 * The evaluateTree response may include attributes from multiple policies:
 *   - `navigationProfile`: one entry per matched nav profile, each encoding { id, name, menuItems }
 *   - `priorityOrder`: array of profile UUIDs in admin-defined priority order, from the
 *     special navigationProfilePriority policy
 *
 * Resolution: decode all navigationProfile values into a map keyed by profile id, then walk
 * priorityOrder and return the menuItems of the first id that appears in the map.
 *
 * @param {Array} policyResults Array of policy evaluation result objects from evaluateTree
 * @returns {Array|null} menuItems array from the highest-priority matched profile, or null if none
 */
export function resolveNavigationProfileMenuItems(policyResults) {
  const match = policyResults?.find((item) => item.resource?.startsWith('endUserMenuItems:/'));
  if (!match?.attributes) return null;

  const profileValues = match.attributes.navigationProfile;
  const priorityOrderValues = match.attributes.priorityOrder;

  if (!profileValues?.length) return null;

  // Build id → menuItems map from all returned navigationProfile attributes
  const profileMap = {};
  profileValues.forEach((encoded) => {
    const profile = decodeNavigationProfile(encoded);
    if (profile?.id && Array.isArray(profile.menuItems)) {
      profileMap[profile.id] = profile.menuItems;
    }
  });

  if (!Object.keys(profileMap).length) return null;

  // Walk priorityOrder to pick the highest-priority matched profile
  if (priorityOrderValues?.length) {
    let priorityOrder;
    try {
      priorityOrder = JSON.parse(decodeURIComponent(priorityOrderValues[0]));
    } catch {
      priorityOrder = null;
    }
    if (Array.isArray(priorityOrder)) {
      const winningId = priorityOrder.find((id) => profileMap[id]);
      if (winningId) return profileMap[winningId];
    }
  }

  // Fallback: no priority order available — return first profile found (consistent ordering from backend)
  return Object.values(profileMap)[0];
}

export default resolveNavigationProfileMenuItems;
