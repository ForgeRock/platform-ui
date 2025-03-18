@forgeops @cloud
Feature: Check scripted ConfirmationCallbacks correctly handle translation
  Scripted Decision Nodes can be configured to add custom messages and buttons to the login flow.
  This feature tests that the custom elements correctly accept translations from both 'login' and 'shared' translations block.

  # Preparation:
  #   Add translation overrides for Scripted ConfirmationCallbacks for 'en' locale

  Scenario: Scripted ConfirmationCallbacks translations are handled correctly with the "Legacy" Journey Decision Node Script
    Given journey template "QA-Scripted_Decision_Node_with_ConfirmationCallbacks" is imported with "Legacy" Decision Node Script
    When user navigates to "Scripted ConfirmationCallbacks" page
    Then translations for Scripted ConfirmationCallbacks for "en" locale are correct
    And cleanup "QA-Scripted_Decision_Node_with_ConfirmationCallbacks" Journey with all dependencies

  Scenario: Scripted ConfirmationCallbacks translations are handled correctly with the "Next Generation" Journey Decision Node Script
    Given journey template "QA-Scripted_Decision_Node_with_ConfirmationCallbacks" is imported with "Next Generation" Decision Node Script
    When user navigates to "Scripted ConfirmationCallbacks" page
    Then translations for Scripted ConfirmationCallbacks for "en" locale are correct
    And cleanup "QA-Scripted_Decision_Node_with_ConfirmationCallbacks" Journey with all dependencies

  # Cleanup:
  #   Delete translation overrides for 'en' locale
