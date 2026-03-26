# ColumnPicker & useColumnPicker

The `ColumnPicker` component provides a unified interface for users to customize, reorder, and persist table columns. It supports both simple flat lists and complex categorized attribute sets (Governance style).

The `useColumnPicker` composable acts as a headless orchestrator, managing the selection state, `localStorage` persistence, and schema synchronization.

## Basic Usage

### 1. Simple Flat List
Use this for standard tables where you have a simple list of available columns.

```vue
<template>
  <div>
    <!-- Button to open the picker -->
    <BButton @click="open">Customize Columns</BButton>

    <!-- The Picker Modal -->
    <FrColumnPicker
      v-bind="pickerProps"
      :available-columns="allPossibleColumns" />

    <!-- Your Table -->
    <BTable :fields="activeColumns" :items="items" />
  </div>
</template>

<script setup>
import FrColumnPicker from '@forgerock/platform-shared/src/components/ColumnPicker/ColumnPicker';
import useColumnPicker from '@forgerock/platform-shared/src/composables/useColumnPicker';

const allPossibleColumns = [
  { key: 'userName', label: 'User Name' },
  { key: 'email', label: 'Email' },
  { key: 'actions', label: 'Actions' },
];

const {
  activeColumns,
  pickerProps,
  open,
} = useColumnPicker(allPossibleColumns, {
  storageKey: 'my-unique-storage-key',
});
</script>
```

### 2. Categorized Columns
To group columns into categories, provide an array where top-level items have a `children` property. The component will automatically switch to an accordion view and display toggle between categories/list view.

```javascript
const categorizedColumns = [
  {
    key: 'user',
    label: 'User Info',
    children: [
      { key: 'userName', label: 'Username', value: 'user.userName' },
      { key: 'email', label: 'Email', value: 'user.email' },
    ],
  },
];

const { activeColumns, pickerProps, open } = useColumnPicker(
  // initialColumns can be a getter for reactivity
  () => (isAdmin ? adminFields : userFields),
  {
    // storageKey can be a getter to maintain context isolation (e.g. tabbed tables)
    storageKey: () => `my-table-${currentTab}`,
  }
);
```

## Composable API: `useColumnPicker`

### Arguments
- `initialColumns` (`Array|Ref|Function`): The default set of columns. If a getter or ref is provided, the hook will react to changes in the source schema.
- `options` (`Object`):
    - `storageKey` (`String|Ref|Function`): The `localStorage` key. If provided, the selection is persisted automatically. Use a getter to ensure the key updates if the parent context changes.

### Return Values
- `activeColumns`: Reactive array of currently selected column objects. Use this as the `fields` prop for your table.
- `show`: Boolean ref controlling modal visibility.
- `open`: Method to show the modal.
- `pickerProps`: Computed object containing all necessary bindings for `<FrColumnPicker />`.
- `syncWithOriginalList(active, original)`: Utility to map a flat list of active columns back to a full list using `enabled: true/false` flags (useful for legacy `ListOrganizer` patterns).

## Actions columns
- **Note:** Columns with the key `'actions'` are automatically hidden from the customization UI to prevent users from disabling them, but they are preserved in the underlying `activeColumns` state so the table always renders correctly.