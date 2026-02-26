Class NVL
Class for a NVL instance.

Example
This is a basic setup for a NVL instance.

import { NVL } from '@neo4j-nvl/base'

const nodes = [{ id: '1' }, { id: '2' }]
const relationships = [{ id: '12', from: '1', to: '2' }]

const options = { initialZoom: 0.5 }

const callbacks = {
  onLayoutDone: () => console.log('Layout done')
}

const nvl = new NVL(document.getElementById('frame'), nodes, relationships, options, callbacks)
Copy
Constructors
C
constructor
Methods
M
addAndUpdateElementsInGraph
M
addElementsToGraph
M
deselectAll
M
destroy
M
fit
M
getContainer
M
getCurrentOptions
M
getHits
M
getImageDataUrl
M
getNodeById
M
getNodePositions
M
getNodes
M
getNodesOnScreen
M
getPan
M
getPositionById
M
getRelationshipById
M
getRelationships
M
getScale
M
getSelectedNodes
M
getSelectedRelationships
M
getZoomLimits
M
isLayoutMoving
M
pinNode
M
removeNodesWithIds
M
removeRelationshipsWithIds
M
resetZoom
M
restart
M
saveFullGraphToLargeFile
M
saveToFile
M
saveToSvg
M
setDisableWebGL
M
setLayout
M
setLayoutOptions
M
setNodePositions
M
setPan
M
setRenderer
M
setZoom
M
setZoomAndPan
M
unPinNode
M
updateElementsInGraph
constructor
new NVL(frame, nvlNodes?, nvlRels?, options?, callbacks?): NVL
Creates a new NVL instance.

Parameters
frame: HTMLElement
The DOM element to display the graph in.

nvlNodes: Node[] = []
An array of nodes.

nvlRels: Relationship[] = []
An array of relationships.

options: NvlOptions = {}
The options for the NVL instance.

callbacks: ExternalCallbacks = {}
Callbacks triggered on NVL events.

Returns NVL
addAndUpdateElementsInGraph
addAndUpdateElementsInGraph(nodes?, relationships?): void
Adds nodes and relationships to NVL and updates existing nodes and relationships.

Parameters
nodes: Node[] | PartialNode[] = []
An Array of nodes to be added or updated.

relationships: Relationship[] | PartialRelationship[] = []
An Array of relationships to be added or updated. To update nodes or relationships, they must have an id that matches the id of the node or relationship to be updated. Only the properties that are provided will be updated. If an existing property is not provided, it will not be changed.

Returns void
Example
Adding and updating nodes and relationships

import { NVL } from '@neo4j-nvl/base'

const nvl = new NVL(document.getElementById('frame'), [{ id: '0' }], [])

const nodes = [
{ id: '1', label: 'Node 1', color: '#e04141' },
{ id: '2', label: 'Node 2', color: '#e09c41' }
]
const relationships = [
{ id: '12', from: '1', to: '2' }
]
// Adds new nodes and relationships
nvl.addAndUpdateElementsInGraph(nodes, relationships)
// Updates an existing relationship
nvl.addAndUpdateElementsInGraph([], [{ id: '12', color: '#e0df41' }])
Copy
addElementsToGraph
addElementsToGraph(nodes, relationships): void
Adds nodes and relationships in the current scene.

Parameters
nodes: Node[]
The nodes to be added.

relationships: Relationship[]
The relationships to be added.

Returns void
deselectAll
deselectAll(): void
De-selects all nodes and relationships.

Returns void
destroy
destroy(): void
Removes the graph visualization from the DOM and cleans up everything.

Returns void
fit
fit(nodeIds, zoomOptions?): void
Updates pan and zoom fit the specified nodes in the viewport.

Parameters
nodeIds: string[]
The ids of the nodes to fit on the screen.

OptionalzoomOptions: ZoomOptions
Specific options on how to transition the zoom.

Returns void
Remarks
If the zoom level required to fit the provided nodes is outside of the range provided by the minZoom and maxZoom options, and the allowDynamicMinZoom option is set to false, the zoom level will be set to the closest valid zoom level, even if the given nodes do not fit the viewport yet.

getContainer
getContainer(): HTMLElement
Provides the container DOM element the graph is rendered in.

Returns HTMLElement
The container element of the NVL instance.

getCurrentOptions
getCurrentOptions(): NvlOptions
Returns the current options.

Returns NvlOptions
The current options.

getHits
getHits(evt, targets?, hitOptions?): NvlMouseEvent
Gets the nodes and relationships that have been hit by a pointer event.

Parameters
evt: MouseEvent
The mouse event.

targets: ("node" | "relationship")[] = ...
The graph elements to check for hits. Defaults to ['node', 'relationship'].

hitOptions: {
    hitNodeMarginWidth: number;
} = ...
Options for the hit test.

hitNodeMarginWidth: number
Returns NvlMouseEvent
A NvlMouseEvent with the HitTargets property containing the nodes and relationships that have been hit by the pointer event.

Example
const container = document.getElementById('frame')
const nvl = new NVL(container, [{ id: '0' }], [])

// Get the nodes and relationships that have been hit by a pointer event.
container?.addEventListener('click', (evt) => {
  const { nvlTargets } = nvl.getHits(evt)
  console.log('clicked elements:', nvlTargets)
})
Copy
getImageDataUrl
getImageDataUrl(options?): string
Returns the current view of the graph visualization canvas as a data URL.

Parameters
options: {
    backgroundColor?: string;
} = {}
The options for the image.

OptionalbackgroundColor?: string
The background color of the data URL.

Returns string
A data URL of the current view of the graph visualization canvas.

getNodeById
getNodeById(id): Node
Returns the node data that is currently stored in the visualisation for a given id.

Parameters
id: string
The id of the node that should be returned.

Returns Node
The node or undefined if there is no node with the given id.

getNodePositions
getNodePositions(): (Node & Point)[]
Fetches and returns the current positions of all nodes as an array of coordinates.

Returns (Node & Point)[]
An array of node positions.

getNodes
getNodes(): Node[]
Returns all nodes that is currently stored in the visualisation.

Returns Node[]
The array of nodes.

getNodesOnScreen
getNodesOnScreen(): {
    nodes: Node[];
    rels: Relationship[];
}
Returns the nodes that are currently in the visualization. The rels property of the returned object is always empty.

Returns {
    nodes: Node[];
    rels: Relationship[];
}
An object containing the nodes and relationships in the visualization.

nodes: Node[]
The nodes in the visualization.

rels: Relationship[]
The relationships in the visualization.

getPan
getPan(): Point
Returns the current pan of the viewport.

Returns Point
The current pan of the viewport.

getPositionById
getPositionById(id): Node
Returns the node position that is currently stored in the visualisation for a given id.

Parameters
id: string
The id of the node position that should be returned.

Returns Node
The position information for the given id, or undefined if there is no such node. or the layout has not yet run with that node.

getRelationshipById
getRelationshipById(id): Relationship
Returns the relationship data that is currently stored in the visualisation for a given id.

Parameters
id: string
The id of the relationship that should be returned.

Returns Relationship
The relationship or undefined if there is no relationship with the given id.

getRelationships
getRelationships(): Relationship[]
Returns the relationships that are currently in the visualization.

Returns Relationship[]
An array of the relationships in the visualization.

getScale
getScale(): number
Get the current zoom level of the viewport.

Returns number
The current zoom level.

getSelectedNodes
getSelectedNodes(): (Node & Point)[]
Gets the currently selected nodes.

Returns (Node & Point)[]
An array of all currently selected nodes and their positions.

getSelectedRelationships
getSelectedRelationships(): Relationship[]
Gets the currently selected relationships.

Returns Relationship[]
An array of all currently selected relationships.

getZoomLimits
getZoomLimits(): {
    maxZoom: number;
    minZoom: number;
}
Returns {
    maxZoom: number;
    minZoom: number;
}
maxZoom: number
minZoom: number
isLayoutMoving
isLayoutMoving(): boolean
Checks and returns whether the current layout is still in flux.

Returns boolean
Whether or not the layout is moving.

pinNode
pinNode(nodeId): void
Pins the specified node so it is not affected by layout forces.

Parameters
nodeId: string
The id of the node to be pinned.

Returns void
removeNodesWithIds
removeNodesWithIds(nodeIds): void
Removes the specified nodes from the current scene.

Parameters
nodeIds: string[]
The node ids to be removed. Adjacent relationships will also be removed.

Returns void
removeRelationshipsWithIds
removeRelationshipsWithIds(relationshipIds): void
Removes the specified relationships from the current scene.

Parameters
relationshipIds: string[]
The relationship ids to be removed.

Returns void
resetZoom
resetZoom(): void
Resets the zoom of the viewport back to the default zoom level of 0.75.

Returns void
restart
restart(options?, retainPositions?): void
Restarts the NVL instance.

Parameters
options: NvlOptions = {}
New NvlOptions for the NVL instance.

retainPositions: boolean = false
Whether or not to retain the current node positions. New options will be merged with current options

Returns void
saveFullGraphToLargeFile
saveFullGraphToLargeFile(options?): void
Saves the entire graph visualization canvas as a png to the client.

Parameters
options: {
    backgroundColor?: string;
    filename?: string;
} = {}
The filename and background color of the png.

OptionalbackgroundColor?: string
The background color of the png file. The size of the png file will be as large as the entire graph at the default zoom level. Can result in a very large file.

Optionalfilename?: string
The filename of the png file.

Returns void
saveToFile
saveToFile(options?): void
Saves the current view of the graph visualization canvas as a png to the client.

Parameters
options: {
    backgroundColor?: string;
    filename?: string;
} = {}
The filename and background color of the png.

OptionalbackgroundColor?: string
The background color of the png file. The size of the png file will be the size of the canvas in the DOM.

Optionalfilename?: string
The filename of the png file.

Returns void
saveToSvg
saveToSvg(options?): void
Experimental
Saves the entire graph visualization as an SVG file to the client.

Parameters
options: {
    backgroundColor?: string;
    filename?: string;
} = {}
Options for the SVG export

OptionalbackgroundColor?: string
The background color of the SVG file.

Optionalfilename?: string
The filename of the SVG file.

Returns void
setDisableWebGL
setDisableWebGL(disabled?): void
Experimental
Restarts NVL with or without WebGL support.

Parameters
disabled: boolean = false
Whether or not WebGL should be disabled.

Returns void
setLayout
setLayout(layout): void
Changes the layout type.

Parameters
layout: Layout
The Layout type.

Returns void
setLayoutOptions
setLayoutOptions(options): void
Updates the configuration of the current layout.

Parameters
options: LayoutOptions
The LayoutOptions configuration.

Returns void
setNodePositions
setNodePositions(data, updateLayout?): void
Sets the node positions based on data provided.

Parameters
data: Node[]
The positions that the nodes should be set to.

updateLayout: boolean = false
Whether or not the current layout algorithm should update the graph after setting the node positions.

Returns void
Remarks
For node positions to be unaffected by layout algorithms, use the 'free' layout type or use pinNode to pin the nodes that should remain still. False by default.

setPan
setPan(panX, panY): void
Sets the zoom of the viewport to a specific value.

Parameters
panX: number
The desired panX value.

panY: number
The desired panY value.

Returns void
Remarks
When updating both the zoom level and pan coordinates, use setZoomAndPan instead of calling setZoom and setPan separately to avoid jittering.

setRenderer
setRenderer(renderer): void
Switches between rendering methods

Parameters
renderer: string
which rendering method to use

Returns void
setZoom
setZoom(zoomValue): void
Sets the zoom of the viewport to a specific value.

Parameters
zoomValue: number
The desired zoom level.

Returns void
Remarks
When updating both the zoom level and pan coordinates, use setZoomAndPan instead of calling setZoom and setPan separately to avoid jittering.

If the zoom level is outside of the range provided by the NvlOptions.minZoom and NvlOptions.maxZoom options, the zoom level will be set to the closest valid zoom level. If NvlOptions.allowDynamicMinZoom is set to true, the NvlOptions.minZoom option will be ignored of the current graph does not fit the viewport.

setZoomAndPan
setZoomAndPan(zoom, panX, panY): void
Sets the zoom and pan of the viewport to specific values.

Parameters
zoom: number
The desired zoom level.

panX: number
The desired panX value.

panY: number
The desired panY value.

Returns void
Remarks
When only updating zoom level or pan coordinates, use setZoom or setPan instead.

If the zoom level is outside of the range provided by the NvlOptions.minZoom and NvlOptions.maxZoom options, the zoom level will be set to the closest valid zoom level. If NvlOptions.allowDynamicMinZoom is set to true, the NvlOptions.minZoom option will be ignored of the current graph does not fit the viewport.

unPinNode
unPinNode(nodeIds): void
Un-pins the specified nodes so it is affected by layout forces again.

Parameters
nodeIds: string[]
The ids of the nodes to be un-pinned.

Returns void
updateElementsInGraph
updateElementsInGraph(nodes, relationships): void
Updates relationships in the current scene with the provided array of nodes and relationships.

Parameters
nodes: Node[] | PartialNode[]
The updated nodes.

relationships: Relationship[] | PartialRelationship[]
The updated relationships. Ignores any nodes or relationships that do not exist in the current scene. To update nodes or relationships, they must have an id that matches the id of the node or relationship to be updated. Only the properties that are provided will be updated. If an existing property is not provided, it will not be changed.

Returns void
Example
Updating nodes and relationships

import { NVL } from '@neo4j-nvl/base'

const nodes = [
  { id: '1', label: 'Node 1', color: '#e04141' },
  { id: '2', label: 'Node 2', color: '#e09c41' }
]
const relationships = [
  { id: '12', from: '1', to: '2' }
]
const nvl = new NVL(document.getElementById('frame'), nodes, relationships)
// Updates an existing node and relationship
nvl.updateElementsInGraph([{ id: '1', selected: true }], [{ id: '12', color: '#e0df41' }])