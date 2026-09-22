/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/** Escapes a value for safe interpolation into an XML attribute value. */
function escapeXmlAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * Builds a minimal SAML 2.0 Service Provider metadata XML document that can be
 * uploaded in the "Set Up Single Sign-on" modal of a SAML application.
 *
 * @param {string} entityId unique entity id for the SP (must be unique per tenant)
 * @returns {string} SP metadata XML
 */
export default function buildSpMetadata(entityId) {
  const escapedEntityId = escapeXmlAttribute(entityId);
  return `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${escapedEntityId}">
  <SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</NameIDFormat>
    <AssertionConsumerService index="0" isDefault="true" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${escapedEntityId}/acs"/>
  </SPSSODescriptor>
</EntityDescriptor>`;
}

/**
 * Selects the given XML content as the metadata file in the currently open
 * SSO setup / update metadata modal.
 * @param {string} xml metadata file content
 * @param {string} fileName name to give the uploaded file
 */
export function attachMetadataFile(xml, fileName = 'sp-metadata.xml') {
  cy.get('#setupSsoModal input[type="file"]').selectFile({
    contents: Cypress.Buffer.from(xml),
    fileName,
    mimeType: 'text/xml',
  }, { force: true });
}
