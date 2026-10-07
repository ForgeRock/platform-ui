/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * API client for the IGA agent configuration endpoint.
 *
 * This module is intentionally transport-only. It issues the request and returns the raw
 * axios response. Normalizing options, caching per session, and deriving safe empty states
 * from malformed or missing data belong to the consuming Details form, not here.
 *
 * Bounded response contract (assumed, pending backend contract confirmation):
 * `GET governance/agent/config` resolves to a response whose `data` contains a `templates`
 * property that is an array, where each accepted option entry has a non-empty string `id`
 * (for example `aws.bedrock`). Per the related agent-config backend work, `templates` is
 * the source of template entries and persisted/static template merging is keyed by `id`.
 * Consumers must treat `data.templates` as possibly absent, empty, or malformed and derive
 * an empty option list rather than supplying hardcoded IDs.
 *
 * Bounded UI contract assumption (not yet confirmed by backend documentation): the value a
 * user selects is stored as an optional, application-level `aiAgentSource` string on the
 * unmanaged application object, sourced only from current `templates[].id` values, and
 * omitted from the application update payload when cleared. Verification status as of
 * 2026-10-07: the public IGA endpoint reference and the IGA OpenAPI spec (both linked in
 * docs/backend-api-reference.md) document neither the application update endpoint nor an
 * `aiAgentSource` field, and internal sources could not be consulted. DetailsForm's
 * "clear by omission" behavior depends on `PUT governance/application/{id}` being a full
 * replace; if it is a partial merge, an omitted `aiAgentSource` leaves the stale value on
 * the server. Confirm with the backend team before release — until then, treat this
 * field as dev-flag-only and do not infer any additional backend semantics as verified
 * fact.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';

/**
 * Fetches the IGA agent configuration, including the list of available agent templates.
 *
 * The caller reads `data.templates[].id` from the resolved response to build source option
 * values; this wrapper exposes the raw response and introduces no option list of its own.
 *
 * @returns {Promise} - A promise that resolves to the raw axios response whose
 *   `data.templates` array contains the available agent template entries.
 */
export function getAgentConfig() {
  return generateIgaApi().get('governance/agent/config');
}
