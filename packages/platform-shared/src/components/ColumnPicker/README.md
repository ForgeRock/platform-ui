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

## Dynamic / Filter-Property Columns (`columnRegistry`)

Some tables allow users to pick **dynamic columns** (e.g. filter-property attributes loaded from an API) that are not part of the table's default column set. Because the default `initialColumns` only contains the initial/OOTB columns, stored keys for dynamic columns cannot be resolved on page reload — they are silently dropped.

Pass `columnRegistry` (a full flat list of every column the picker can ever show) to ensure stored keys for dynamic columns survive a page refresh.

### When to use it

Use `columnRegistry` whenever:
- The column picker's **available columns** include items fetched asynchronously (e.g. from a schema or filter-properties API).
- Those dynamic columns are **not** present in the `initialColumns` default set.

### Example

```vue
<script setup>
import { ref, computed } from 'vue';
import useColumnPicker from '@forgerock/platform-shared/src/composables/useColumnPicker';

// Default/OOTB columns shown in the table
const defaultColumns = ref([
  { key: 'role',     value: 'role.role',     label: 'Role' },
  { key: 'comments', value: 'review.comments', label: 'Comments' },
]);

// Dynamic columns loaded from an API after mount
const dynamicColumns = ref([]);

// Flat registry of every column the picker can show (OOTB + dynamic)
const columnRegistry = computed(() => [...defaultColumns.value, ...dynamicColumns.value]);

const { activeColumns, pickerProps, open } = useColumnPicker(defaultColumns, {
  storageKey: 'my-table-columns',
  columnRegistry,     // ← key addition; falls back to initialColumns when omitted
});

// After the async fetch completes, set dynamicColumns.
// The watch inside useColumnPicker will automatically re-run loadColumns
// and resolve any stored keys that now exist in the registry.
onMounted(async () => {
  const schema = await fetchFilterSchema();
  dynamicColumns.value = schema.map((col) => ({
    key: col.name,
    value: `user.${col.name}`,
    label: col.displayName,
  }));
});
</script>
```

### How it works internally

1. On mount, `loadColumns` looks up each stored key in `columnRegistry` (not just `initialColumns`).  
2. A `watch` on `columnRegistry` re-triggers `loadColumns` whenever the registry changes — so keys that couldn't be resolved initially (registry was empty/partial) are resolved once the async fetch completes.  
3. Stale keys that still don't appear in the registry after resolution are pruned normally.  
4. When `columnRegistry` is **not** provided the behaviour is identical to before — `initialColumns` is used for both defaults and lookup.
