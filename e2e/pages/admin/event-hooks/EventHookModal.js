/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class EventHookModal {
  // ── Shared ────────────────────────────────────────────────────────────────────

  static get modal() {
    return cy.findByRole('dialog');
  }

  static get heading() {
    return EventHookModal.modal.findByRole('heading', { level: 2 });
  }

  static get closeButton() {
    return EventHookModal.modal.findByRole('button', { name: 'Close' });
  }

  // ── Form Fields ───────────────────────────────────────────────────────────────

  static get nameInput() {
    return EventHookModal.modal.findByRole('textbox', { name: /^name$/i });
  }

  static get descriptionInput() {
    return EventHookModal.modal.findByRole('textbox', { name: /description/i });
  }

  // ── Condition ─────────────────────────────────────────────────────────────────

  static get objectNameCombobox() {
    return EventHookModal.modal.findByRole('combobox', { name: /object name/i });
  }

  static objectNameOption(objectName) {
    return EventHookModal.modal.findByRole('option', { name: objectName });
  }

  static get eventCombobox() {
    return EventHookModal.modal.findByRole('combobox', { name: /^event$/i });
  }

  // The listbox shown when the Object Name combobox is expanded
  static get objectNameOptionsListbox() {
    return EventHookModal.modal.findByRole('listbox');
  }

  // The listbox shown when the Event combobox is expanded
  static get eventOptionsListbox() {
    return EventHookModal.modal.findByRole('listbox');
  }

  static eventOption(eventName) {
    return EventHookModal.modal.findByRole('option', { name: eventName });
  }

  // ── Edit Mode ─────────────────────────────────────────────────────────────────
  // In edit mode, Object Name and Event are rendered as disabled textboxes

  static get objectNameDisplay() {
    return EventHookModal.modal.findByRole('textbox', { name: /object name/i });
  }

  static get eventDisplay() {
    return EventHookModal.modal.findByRole('textbox', { name: /^event$/i });
  }

  // ── Script Editor ─────────────────────────────────────────────────────────────

  static get scriptEditor() {
    return EventHookModal.modal.findByLabelText('Press ESC followed by tab for keyboard navigation out of editor');
  }

  // The underlying textarea inside the first VuePrismEditor — use .invoke('val') for value checks
  static get scriptEditorTextarea() {
    return EventHookModal.modal.find('.fr-script-editor:not(.fr-script-editor-vars) .prism-editor__textarea');
  }

  // ── Variables Section ─────────────────────────────────────────────────────────
  // "Variables" button is only shown when no variable rows exist yet

  static get variablesButton() {
    return EventHookModal.modal.findByRole('button', { name: /variables/i });
  }

  // Variable name/value inputs use the VeeValidate `name` prop as identifier
  // (no accessible label rendered — name attribute is "Name-{index}" / "Value-{index}")

  static variableNameInput(index) {
    return EventHookModal.modal.find(`input[name="Name-${index}"]`);
  }

  static variableValueInput(index) {
    return EventHookModal.modal.find(`input[name="Value-${index}"]`);
  }

  // FrIcon (remove/add) is aria-hidden; each row's add button is the last .max-height-50 button
  static get addVariableRowButton() {
    return EventHookModal.modal.find('.fr-script-editor-vars .max-height-50').last();
  }

  // JSON toggle switch (role="switch") visible once at least one variable row exists
  static get jsonToggle() {
    return EventHookModal.modal.findByRole('switch', { name: /^json$/i });
  }

  // Second VuePrismEditor in the modal — the variables JSON editor (first is the script editor)
  static get jsonVariablesEditor() {
    return EventHookModal.modal
      .findAllByLabelText('Press ESC followed by tab for keyboard navigation out of editor')
      .last();
  }

  // ── Footer ────────────────────────────────────────────────────────────────────

  static get cancelButton() {
    return EventHookModal.modal.findByRole('button', { name: 'Cancel' });
  }

  static get saveButton() {
    return EventHookModal.modal.findByRole('button', { name: 'Save' });
  }
}
