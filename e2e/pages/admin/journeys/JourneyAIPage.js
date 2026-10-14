/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Selectors for the Journey AI surfaces in the journey editor: the toolbar
 * toggle, the canvas context menu, the multi-select action bar, and the AI
 * chat panel. All selectors verified against:
 *   - JourneyToolbarContent.vue (toolbar AI button)
 *   - ContextMenu.vue (`.dropdown-menu.position-fixed`, no testids)
 *   - FloatingActionBar.vue (`[role="alert"]` bar)
 *   - AIChatPanel.vue (ids `#new-conversation-btn`, `#query-input`,
 *     `#submit-query-btn`)
 *   - SelectWithActions/index.vue (`.multiselect__option` Explain buttons)
 */
export default class JourneyAIPage {
  // ── Toolbar ───────────────────────────────────────────────────────────────

  // BButton with the auto_awesome icon + "AI Assistant" text (only rendered
  // when SharedStore.journeyAIEnabled — its presence doubles as the UI probe
  // for the flag). `d-none d-xl-inline` keeps the text hidden on narrow
  // viewports, so anchor on the icon class rather than role+name alone.
  static get toolbarAiButton() {
    return cy.get('.fr-saving-toolbar')
      .find('button.btn-link:has(span.material-icons-outlined:contains("auto_awesome"))');
  }

  // ── Canvas context menu (right click) ─────────────────────────────────────

  // FrContextMenu renders `.dropdown-menu.position-fixed d-block` at the
  // click coordinates. The node's list-row dropdown stays mounted in the DOM,
  // so `.dropdown-menu:visible` alone can match the wrong one — the
  // position-fixed class is the context menu's unique signature.
  static get contextMenu() {
    return cy.get('.dropdown-menu.position-fixed');
  }

  static contextMenuItem(label) {
    return JourneyAIPage.contextMenu.find('li').filter(`:contains("${label}")`);
  }

  // ── Multi-select action bar ───────────────────────────────────────────────

  // FloatingActionBar renders `[role="alert"]` with `.floating-action-bar`;
  // the alert wrapper stays mounted — only the inner bar is v-if'd.
  static get actionBarSelector() {
    return '[role="alert"].floating-action-bar, [role="alert"] .floating-action-bar';
  }

  static get actionBar() {
    return cy.get(JourneyAIPage.actionBarSelector).first();
  }

  // Dismissible tenant error toasts (fr-alert alert-danger) slide over the
  // canvas bottom and cover the fixed-position action bar and context menu.
  // Exposed as a selector string (not a cy.get chainable) because the step
  // class queries it synchronously — a chainable would retry and fail when
  // no toast is present.
  static get dismissibleErrorAlertsSelector() {
    return '.fr-alert.alert-danger.alert-dismissible';
  }

  static actionBarDeleteButton() {
    return JourneyAIPage.actionBar.find('button').filter(':contains("Delete")');
  }

  static actionBarAskAiButton() {
    return JourneyAIPage.actionBar.find('button').filter(':contains("Ask AI")');
  }

  static actionBarDeselectButton() {
    return JourneyAIPage.actionBar.find('button').filter(':contains("Deselect")');
  }

  // ── AI chat panel ─────────────────────────────────────────────────────────

  // The panel host (VueDraggableResizable) keeps `.fr-ai-chat-panel` mounted
  // with `visibility: hidden` when closed; `.open` means visible.
  static get aiPanel() {
    return cy.get('.fr-ai-chat-panel.open');
  }

  static get aiPanelHeading() {
    return JourneyAIPage.aiPanel.find('h2').filter(':contains("AI Assistant")');
  }

  static get aiPanelCloseButton() {
    return JourneyAIPage.aiPanel.find('button.close');
  }

  // `#new-conversation-btn` is `v-show` — always in DOM while the panel is
  // open. Assert visibility, never existence.
  static get newConversationButton() {
    return cy.get('#new-conversation-btn');
  }

  static get queryInput() {
    return cy.get('#query-input');
  }

  static get submitQueryButton() {
    return cy.get('#submit-query-btn');
  }

  // Suggestion cards under the "Suggestions" label.
  static get suggestions() {
    return JourneyAIPage.aiPanel.find('.suggestions-container button');
  }

  static suggestionButton(text) {
    return JourneyAIPage.suggestions.filter(`:contains("${text}")`);
  }

  // Intro article shown when the thread is empty ("Enter a prompt below to
  // get started!" is the trailing part of ai.chatPanel.aiAssistantDescription).
  static get introText() {
    return JourneyAIPage.aiPanel.find('article');
  }

  // AI-transparency-statement link in the panel footer disclaimer.
  static get privacyLink() {
    return JourneyAIPage.aiPanel.find('.chat-disclaimer a');
  }

  // User-side entries in the thread.
  static userChatEntry(text) {
    return JourneyAIPage.aiPanel.find('.user-chat-entry').filter(`:contains("${text}")`);
  }

  // AI-side rendered responses.
  static aiChatEntry(text) {
    return JourneyAIPage.aiPanel.find('.ai-chat-entry').filter(`:contains("${text}")`);
  }

  // Copy button on the newest AI response (`#copy-button-${index}`).
  static get copyButton() {
    return JourneyAIPage.aiPanel.find('[id^="copy-button-"]');
  }

  // Context chip card above the prompt input (promptContext), with its own
  // remove button (FrIcon "close" inside a round BButton).
  static get contextChip() {
    return JourneyAIPage.aiPanel.find('.form-label-group .chat-attachment');
  }

  static get contextChipRemoveButton() {
    return JourneyAIPage.contextChip.find('button').last();
  }

  // ── Node edit panel Explain buttons ───────────────────────────────────────

  // The edit panel's multiselect options; Explain buttons carry
  // aria-label/title "Explain" (ai.explain) and sit inside
  // `.multiselect__option`. Click the BUTTON, never the row — the option row
  // would commit the select value (mousedown.stop.prevent only guards the
  // button itself).
  static editPanelOption(optionText) {
    return cy.findByTestId('tree-editpanel')
      .find('.multiselect__option')
      .filter(`:contains("${optionText}")`);
  }

  static editPanelOptionExplainButton(optionText) {
    return JourneyAIPage.editPanelOption(optionText).find('button[aria-label="Explain"]');
  }

  // Rows of the edit panel's currently open multiselect options list.
  static get editPanelOptions() {
    return cy.findByTestId('tree-editpanel').find('.multiselect__option');
  }

  // Open a multiselect inside the edit panel by its visible label text.
  // FrField renders the label slot and the input as children of `.fr-field`
  // (the custom #label slots used by AuthScriptNode/InnerTreeEvaluatorNode
  // sit outside InputLayout's `.form-label-group`), so anchor on `.fr-field`.
  // The filter is substring-based ('Script' also matches 'Script Imports');
  // the target field precedes its longer-named siblings, hence `.first()`.
  static editPanelMultiselectByLabel(labelText) {
    return cy.findByTestId('tree-editpanel')
      .find('.fr-field')
      .filter((_, el) => Cypress.$(el).find(`label:contains("${labelText}")`).length > 0)
      .find('.multiselect')
      .first();
  }
}
