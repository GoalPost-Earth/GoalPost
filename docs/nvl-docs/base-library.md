Base library
Initialization
The base library is the core of NVL: a framework-agnostic JavaScript class that is constructed with five arguments — the container element, an array of nodes, an array of relationships, optional configuration, and optional callbacks.

This is a minimal typed example showing typical initialization:

import { NVL } from '@neo4j-nvl/base'
import type { Node, Relationship, NvlOptions, ExternalCallbacks } from '@neo4j-nvl/base'

const nodes: Node[] = [{ id: '1' }, { id: '2' }]
const relationships: Relationship[] = [{ id: '12', from: '1', to: '2' }]
const options: NvlOptions = { initialZoom: 2.0 }
const callbacks: ExternalCallbacks = { onLayoutDone: () => console.log('layout done') }

const container = document.getElementById('container') as HTMLElement
const nvl = new NVL(container, nodes, relationships, options, callbacks)
Below is a breakdown of the argument types.

Nodes
Every node must have an ID and it can be any unique string. Nodes may include optional properties to customize their appearance and behavior, such as caption, size, color, icon, etc. For a complete type definition and all available properties see the API docs for the Node interface.

Relationships
Relationships must have a unique ID, a from, and a to property which must correspond to existing node IDs in the graph. Additionally, the properties such as caption, width, color can be specified. For a complete type definition and all available properties see the API docs for the Relationship interface.

Options
NVL accepts an options object to control layout, zoom/pan limits, renderer selection, minimap container and other behavior. Typical options include layout type, initial/min/max zoom, and renderer choice. For a full list of options and defaults see the API docs for the NvlOptions.

Callbacks
NVL exposes callback hooks for lifecycle and error events (for example: onError, onLayoutComputing, onLayoutDone, etc). See the API docs for exact signatures of the ExternalCallbacks.

Interactivity
To interact with a graph, NVL provides methods that help get the nodes and relationships that have been hit by a pointer event. The method takes an event and returns the event with the HitTargets property containing the nodes and relationships that have been hit by the event. This is a basic example:

import { NVL } from '@neo4j-nvl/base'
const container = document.getElementById('frame')
const nodes = [{ id: '1' }, { id: '2' }]
const relationships = [{ id: '12', from: '1', to: '2' }]
const nvl = new NVL(container, nodes, relationships)

// Get the nodes and relationships that have been hit by a pointer event.
container.addEventListener('click', (evt) => {
  const { nvlTargets } = nvl.getHits(evt)
  console.log('clicked elements:', nvlTargets)
})
Based on the type of event, you can make updates to NVL through methods. The NVL class exposes a set of instance methods to inspect and manipulate the scene (add/remove/update elements, control zoom/pan, query hits and selection, change layout, save images, etc.). For a full list of methods and exact signatures see the API docs of the NVL class.

The following is an example that selects nodes when they are clicked and de-selectes nodes when clicking on empty space in the scene:

const nodes = [{ id: '0' }, { id: '1' }]
const rels = [{ id: '10', from: '0', to: '1' }]

const myNvl = new NVL(parentContainer, nodes, rels)

parentContainer.addEventListener('click', (e) => {
    const { nvlTargets } = myNvl.getHits(e)
    if (nvlTargets.nodes.length > 0) {
      myNvl.addAndUpdateElementsInGraph([{ id: nvlTargets.nodes[0].data.id, selected: true }], [])
    } else {
      myNvl.addAndUpdateElementsInGraph(
        nodes.map((node) => ({ ...node, selected: false })),
        []
      )
    }
})
If you don’t want to implement traditional graph interaction behavior from the start, NVL also provides a collection of interaction handlers.