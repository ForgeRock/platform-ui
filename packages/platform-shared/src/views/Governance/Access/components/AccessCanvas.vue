<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="h-100 w-100">
    <div class="overflow-hidden h-100">
      <div class="h-100">
        <div
          class="fr-access-canvas-interactive"
          ref="frCanvasInteractive"
          :class="`fr-scale-${zoomValue}`">
          <svg
            :style="{ height: canvasHeight + 'px', width: canvasWidth + 'px' }"
            xmlns="http://www.w3.org/2000/svg"
            @mousedown="selectAccess"
            ref="accessCanvas">
            <FrConnection
              v-for="(line, key) in connectionLayout"
              :source="line.source"
              :target="line.target"
              :line-id="key"
              :key="`line-${key}`"
              :class="{ 'accented-connection': areLinesAccented(line), 'fade-connection': !areLinesAccented(line) }" />
          </svg>
          <div
            v-for="(node, key) in nodes"
            :key="`node-${key}`">
            <FrLabelCard
              v-if="node.displayType === 'LabelNode'"
              :card="node"
              :type="node.displayType" />
            <FrAccessCard
              v-else
              :selected="node.id === activeNodeId"
              @access-selected="selectAccess"
              @get-card-details="updateCardDetails"
              :access="node"
              :class="{ 'accented-connection': isCardAccented(node), 'fade-connection': !isCardAccented(node) }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * User access display component that takes the list of a user's access and formats it into a
 * format usable by node drawManager. Does not allow drag and drop of access, but does allow re-arranging access based
 * on pre-defined criteria.
 */
import {
  computed,
  nextTick,
  reactive,
  ref,
  watch,
} from 'vue';
import {
  each,
} from 'lodash';
import FrConnection from './connection';
import FrAccessCard from './accessCards/AccessCard';
import FrLabelCard from './accessCards/LabelCard';
import { generateNodeSkeleton, formatAccessGrants } from '../utils/accessUtility';

const props = defineProps({
  userAccess: {
    type: Array,
    default: () => [],
  },
  activeNodeId: {
    type: String,
    default: null,
  },
  zoomValue: {
    type: Number,
    default: 80,
  },
  selectedTypes: {
    type: Object,
    required: true,
  },
});

const frCanvasInteractive = ref({});
const nodes = ref({});
const nodeDetails = reactive({});
const connectionLayout = reactive({});
const emit = defineEmits([
  'change-selected-access',
]);
const canvasHeight = computed(() => frCanvasInteractive.value?.scrollHeight);
const canvasWidth = computed(() => frCanvasInteractive.value?.scrollWidth);
const zoomPercentage = computed(() => 100 / props.zoomValue);

/**
 * Creates base node using passed in node details and coordinates
 * @param {Object} node Current node being created
 * @param {Number} x Current node x coordinate
 * @param {Number} y Current node y coordinate
 * @param {String} displayType Type of node
 */
function generateNode(node, x, y, displayType = 'AccessNode') {
  const newNode = {
    ...generateNodeSkeleton(),
    id: node.id,
    name: node.id,
    displayType,
    ...node,
  };
  if (x !== undefined) {
    newNode.x = x;
  }
  if (y !== undefined) {
    newNode.y = y;
  }
  nodes.value[node.id] = newNode;
}

/**
 * Select an access grant to display its information panel.
 * @param {Object} access Selected access
*/
function selectAccess(access) {
  emit('change-selected-access', access.id);
}

/**
  * Takes an node id and target id and removes a specific line
  * @param {string} nodeId Unique associated node id
  * @param {string} targetId Unique associated target id
  */
function removeLine(nodeId, targetId) {
  delete connectionLayout[`${nodeId}.${targetId}`];
}

/**
 * Programmatically add a connection to the access graph
 * @param {String} sourceNodeId ID of the source node
 * @param {String} targetNodeId ID of the target node
 */
function addConnection(sourceNodeId, targetNodeId) {
  const sourceNode = nodeDetails[sourceNodeId];
  const targetNode = nodeDetails[targetNodeId];
  const line = {
    source: {
      ...sourceNode,
      y: sourceNode.y * zoomPercentage.value,
      x: sourceNode?.rightX * zoomPercentage.value,
    },
    target: {
      ...targetNode,
      y: targetNode.y * zoomPercentage.value,
      x: targetNode?.leftX * zoomPercentage.value,
    },
  };
  connectionLayout[`${sourceNodeId}.${targetNodeId}`] = line;
}

/**
 * Updates which connections are in the connectionLayout state based on which connections exist currently in the
 * passed-down nodes. Note this does not update the layout-related properties of these connections, only which connections exist.
 */
function updateConnectionLayout() {
  const seenConnections = new Set();
  each(nodes.value, (node, sourceId) => {
    each(node.connections, (targetId, outcome) => {
      const connectionId = `${sourceId}.${targetId}`;
      removeLine(sourceId, outcome);
      addConnection(sourceId, targetId);
      seenConnections.add(connectionId);
    });
  });

  each(connectionLayout, (connection, connectionId) => {
    if (!seenConnections.has(connectionId)) {
      removeLine(connection.source.nodeId, connection.target.nodeId);
    }
  });
}

/**
 * Takes the location details of a card and stores them
 * @param nodeRef Details of the card to update
 */
function updateCardDetails(nodeRef, nodeId) {
  const nodeBoundingBox = nodeRef.getBoundingClientRect();
  const canvasRect = frCanvasInteractive.value.getBoundingClientRect();
  const cardDetails = {
    leftX: nodeBoundingBox.left - canvasRect.left,
    rightX: nodeBoundingBox.right - canvasRect.left,
    y: nodeBoundingBox.top - canvasRect.top + nodeBoundingBox.height / 2,
    nodeId,
    nodeHeight: 65,
    nodeWidth: 250,
  };
  nodeDetails[nodeId] = cardDetails;
}

/**
 * Given a connection line, determine if it should be accented or not
 * @param line Connection line details
 */
function areLinesAccented(line) {
  return !props.activeNodeId || (line.source?.nodeId === props.activeNodeId || line.target?.nodeId === props.activeNodeId);
}

/**
 * Given an access card, determine if it should be accented or not
 * @param card Access card details
 */
function isCardAccented(card) {
  return !props.activeNodeId
         || (card?.id === props.activeNodeId
         || card?.connections?.[props.activeNodeId]
         || nodes.value[props.activeNodeId]?.connections?.[card.id]);
}

/**
 * Constructs access graph in the form of an object of nodes from the list of the user's current IGA grant structure
 */
async function buildAccessGraph() {
  const formattedGrants = await formatAccessGrants(props.userAccess);

  // Clear out non-label access
  nodes.value = Object.fromEntries(
    Object.entries(nodes.value).filter(([key]) => key.startsWith('access-')),
  );

  let startingX = 80;
  const coords = {};
  Object.keys(props.selectedTypes).forEach((type) => {
    if (props.selectedTypes[type] === true) {
      coords[type] = {
        x: startingX,
        y: 50,
      };
      startingX += 350;
    }
  });

  // Add label nodes
  Object.keys(coords).forEach((type) => {
    if (props.selectedTypes[type] === false) return;
    const typeCoords = coords[type];
    generateNode({ id: `label-${type}`, type }, typeCoords.x, typeCoords.y, 'LabelNode');
    typeCoords.y += 50;
  });

  // Add access nodes
  formattedGrants.forEach((node) => {
    if (props.selectedTypes[node.type] === false) return;
    const typeCoords = coords[node.type];
    generateNode(node, typeCoords.x, typeCoords.y);
    typeCoords.y += 85;
  });

  await nextTick();
  updateConnectionLayout();
}

/**
 * When new filter data is passed in, update the pendingFilters state
 */
watch(
  () => props.userAccess,
  async () => {
    buildAccessGraph();
  },
  { deep: true, immediate: true },
);
</script>

<style lang="scss" scoped>
/* Generate all classes required for zoom
 *    each created class will calculate the correct transform scale, width and height
 *    classes range from `fr-scale-50` (indicating 50% reduction in size from original)
 *        to `fr-scale-150` (indicating a 50% increase in size from original)
 *
 *    zoom classes either increase or decrease by 10%
 */
 $i: 40;

@while $i <=150 {
  $i: $i + 10;

  .fr-scale-#{$i} {
    transform: scale(calc($i/100));
    transform-origin: 0 0;
    width: calc(100% / (calc($i/100)));
    height: calc(100% / (calc($i/100)));
  }
}

:deep(.fr-node .fr-node-card .card-header) {
  text-align: left;

  .h5 {
    font-size: .875rem;
  }

  .h6 {
    font-size: .625rem;
    text-transform: uppercase;
    font-weight: 400;
  }
}

.fr-access-canvas-interactive {
  position: relative;
  user-select: none;
  overflow: auto;

  svg {
    overflow: visible;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
