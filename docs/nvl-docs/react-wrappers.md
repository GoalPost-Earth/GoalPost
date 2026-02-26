React wrappers
NVL provides React ready-to-use components to make integration with React easier.

You can install the NVL React wrappers the following way:

npm install @neo4j-nvl/react
Basic React wrapper
The basic React wrapper wraps the base library within a React component. It takes the class' arguments as properties, which are passed to the NVL constructor. Any changes in properties are reflected in the NVL instance by calling the corresponding methods.

import { BasicNvlWrapper } from '@neo4j-nvl/react'

export default () => <BasicNvlWrapper
 nodes={[{ id: '0' }, { id: '1' }]}
 rels={[{ id: '10', from: '0', to: '1' }]}
 nvlOptions={{ initialZoom: 2 }}
 nvlCallbacks={{ onLayoutDone: () => console.log('layout done') }}
/>
is equivalent to

import { NVL } from '@neo4j-nvl/base'

const myNvl = new NVL(
  document.getElementById('frame'),
  [{ id: '0' }, { id: '1' }],
  [{ id: '10', from: '0', to: '1' }],
  { initialZoom: 2 },
  { onLayoutDone: () => console.log('layout done') }
)
When nodes and/or relationships are updated in the React wrapper, the NVL instance is updated accordingly:

import { BasicNvlWrapper } from '@neo4j-nvl/react'

const [nodes, setNodes] = useState([{ id: '0' }, { id: '1' }])

const addElements = () => {
  const newNodes = [...nodes, { id: nodes.length }]
  setNodes(newNodes)
}

export default () => (<div>
  <BasicNvlWrapper nodes={nodes} />
  <button onClick={addElements}>Add Graph Elements</button>
</div>)
is equivalent to:

import { NVL } from '@neo4j-nvl/base'

const nodes = [{ id: '0' }, { id: '1' }]
let i = nodes.length
const myNvl = new NVL(document.getElementById('frame'), nodes, [])

myButton.addEventListener('click', () => {
 myNvl.addAndUpdateElementsInGraph({ id: i.toString() }, [])
 i++
})
If you want to access the NVL class outside of the React wrapper, you can use a reference to NVL to call its methods:

import { useRef } from 'react'
import { BasicNvlWrapper } from '@neo4j-nvl/react'

export default () => {
  const nvlRef = useRef()

  return (<div>
    <BasicNvlWrapper
      nodes={[{ id: '0' }, { id: '1' }]}
      rels={[{ from: '0', to: '1', id: '10' }]}
      ref={nvlRef}
    />
    <button onClick={() => nvlRef.current?.zoomToNodes(['0', '1'])}>Zoom to Nodes</button>
  </div>)
}
To pass events to the NVL instance, pass the events as properties to the React wrapper:

import { BasicNvlWrapper } from '@neo4j-nvl/react'

export default () => <BasicNvlWrapper
  nodes={[{ id: '0' }, { id: '1' }]}
  rels={[{ from: '0', to: '1', id: '10' }]}
 onClick={(event) => console.log(event)}
/>
is equivalent to:

import { NVL } from '@neo4j-nvl/base'

const myNvl = new NVL(container, [{ id: '0' }, { id: '1' }], [{ id: '10', from: '0', to: '1' }])
container.addEventListener('click', (event) => console.log(event))
Interactive React wrapper
The interactive React wrapper component contains a collection of interaction handlers by default and provides a variety of common functionality and callbacks. The mouseEventCallbacks property takes an object where various callbacks can be defined and behavior can be toggled on and off. For example, if you set onZoom to true/false, this turns zoom on/off. Providing a callback for onZoom turns the behavior on and calls the callback whenever the interaction happens. The following is an example on how to use it:

import type { HitTargets, Node, Relationship } from '@neo4j-nvl/base'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import React, { useState } from 'react'

export default () => {
  const [myNodes] = useState<Node[]>([
    { id: '0', size: 20 },
    { id: '1', size: 50 }
  ])
  const [relationships] = useState<Relationship[]>([{ id: '10', from: '0', to: '1' }])

  const mouseEventCallbacks: MouseEventCallbacks = {
    onHover: (element: Node | Relationship, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onHover', element, hitTargets, evt),
    onRelationshipRightClick: (rel: Relationship, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onRelationshipRightClick', rel, hitTargets, evt),
    onNodeClick: (node: Node, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onNodeClick', node, hitTargets, evt),
    onNodeRightClick: (node: Node, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onNodeRightClick', node, hitTargets, evt),
    onNodeDoubleClick: (node: Node, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onNodeDoubleClick', node, hitTargets, evt),
    onRelationshipClick: (rel: Relationship, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onRelationshipClick', rel, hitTargets, evt),
    onRelationshipDoubleClick: (rel: Relationship, hitTargets: HitTargets, evt: MouseEvent) =>
      console.log('onRelationshipDoubleClick', rel, hitTargets, evt),
    onCanvasClick: (evt: MouseEvent) => console.log('onCanvasClick', evt),
    onCanvasDoubleClick: (evt: MouseEvent) => console.log('onCanvasDoubleClick', evt),
    onCanvasRightClick: (evt: MouseEvent) => console.log('onCanvasRightClick', evt),
    onDrag: (nodes: Node[]) => console.log('onDrag', nodes),
    onPan: (evt: MouseEvent) => console.log('onPan', evt),
    onZoom: (zoomLevel: number) => console.log('onZoom', zoomLevel)
  }

  return <InteractiveNvlWrapper nodes={myNodes} rels={relationships} mouseEventCallbacks={mouseEventCallbacks} />
}
