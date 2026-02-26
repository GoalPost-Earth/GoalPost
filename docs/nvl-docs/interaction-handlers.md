Interaction handlers
In its basic form, the base library does not provide any graph interaction. NVL does provide interaction handler classes that can be used to enable various types of interactivity.

You can install NVL’s interaction handlers with the following command:

npm install @neo4j-nvl/interaction-handlers
If you are using React, you may want to consider using the InteractiveReactWrapper.

BoxSelectInteraction
An interaction handler for multi-selecting nodes and relationships. When dragging the cursor, it draws a box on the scene and all nodes and relationships inside the box are selected.

import { BoxSelectInteraction } from '@neo4j-nvl/interaction-handlers'
import { NVL } from '@neo4j-nvl/base'

const nvl = new NVL(document.createElement('div'), [{ id: '0' }], [])
const boxSelectInteraction = new BoxSelectInteraction(nvl)

boxSelectInteraction.updateCallback('onBoxSelect', ({ nodes, rels }) => {
 console.log('Selected elements:', nodes, rels)
})
ClickInteraction
The click interaction handler handles click, double-click, and right-click events on nodes, relationships, and the scene.

import { ClickInteraction } from '@neo4j-nvl/interaction-handlers',
import { NVL } from '@neo4j-nvl/base'

const nvl = new NVL(document.createElement('div'), [{ id: '0' }], [])
const clickInteraction = new ClickInteraction(nvl)
clickInteraction.updateCallback('onNodeClick', (node) => {
  console.log('Node clicked', node)
})
DragNodeInteraction
A handler for dragging nodes, which is achieved by clicking and moving the node. Note that when multiple nodes are selected, they are all dragged.

import { DragNodeInteraction } from '@neo4j-nvl/interaction-handlers'
import { NVL } from '@neo4j-nvl/base'

const nvl = new NVL(document.createElement('div'), [{ id: '0' }], [])
const dragNodeInteraction = new DragNodeInteraction(nvl)

dragNodeInteraction.updateCallback('onDrag', (nodes) => {
  console.log('Dragged nodes:', nodes)
})
HoverInteraction
An interaction handler for hovering nodes and relationships.

import { HoverInteraction } from '@neo4j-nvl/interaction-handlers'
import { NVL } from '@neo4j-nvl/base'

const nvl = new NVL(document.createElement('div'), [{ id: '0' }], [])
const hoverInteraction = new HoverInteraction(nvl)

hoverInteraction.updateCallback('onHover', (element, hitElements, event) => {
 console.log('Hovered element:', element)
 console.log('Hit elements:', hitElements)
 console.log('Mouse event:', event)
})
LassoInteraction
An interaction handler that lets you select nodes and relationships by drawing a lasso around them. When dragging, a line is drawn on the scene and all elements inside are selected.

import { LassoInteraction } from '@neo4j-nvl/interaction-handlers'
import { NVL } from '@neo4j-nvl/base'

const nvl = new NVL(document.createElement('div'), [{ id: '0' }], [])
const lassoInteraction = new LassoInteraction(nvl)

lassoInteraction.updateCallback('onLassoSelect', ({ nodes, rels }) => {
 console.log('Selected elements:', nodes, rels)
})
PanInteraction
A handler for panning the scene, which is achieved by clicking and moving the scene.

import { PanInteraction } from '@neo4j-nvl/interaction-handlers'
import { NVL } from '@neo4j-nvl/base'

const nvl = new NVL(document.createElement('div'), [{ id: '0' }], [])
const panInteraction = new PanInteraction(nvl)

panInteraction.updateCallback('onPan', (panning) => {
  console.log('Panning:', panning)
})
ZoomInteraction
A handler for zooming the scene, which is achieved by scrolling the mouse wheel on the scene.

import { ZoomInteraction } from '@neo4j-nvl/interaction-handlers'
import { NVL } from '@neo4j-nvl/base'

const nvl = new NVL(document.createElement('div'), [{ id: '0' }], [])
const zoomInteraction = new ZoomInteraction(nvl)

zoomInteraction.updateCallback('onZoom', (zoomLevel) => {
  console.log('Zoom level:', zoomLevel)
})
