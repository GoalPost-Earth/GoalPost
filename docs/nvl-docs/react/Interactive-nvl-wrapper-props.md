Interface InteractiveNvlWrapperProps
The properties that can be passed to the InteractiveNvlWrapper component.

interface InteractiveNvlWrapperProps {
    interactionOptions?: InteractionOptions;
    layout?: Layout;
    layoutOptions?: LayoutOptions;
    mouseEventCallbacks?: MouseEventCallbacks;
    nodes: Node[];
    nvlCallbacks?: ExternalCallbacks;
    nvlOptions?: NvlOptions;
    onInitializationError?: ((error: unknown) => void);
    pan?: {
        x: number;
        y: number;
    };
    positions?: Node[];
    rels: Relationship[];
    zoom?: number;
}
Hierarchy (view full)
BasicReactWrapperProps
InteractiveNvlWrapperProps
Properties
P
interactionOptions?
P
layout?
P
layoutOptions?
P
mouseEventCallbacks?
P
nodes
P
nvlCallbacks?
P
nvlOptions?
P
onInitializationError?
P
pan?
P
positions?
P
rels
P
zoom?
Optional
interactionOptions
interactionOptions?: InteractionOptions
InteractionOptions for the underlying interaction handlers

Optional
layout
layout?: Layout
The layout, can be 'forceDirected' or 'hierarchical'

Inherited from BasicReactWrapperProps.layout

Optional
layoutOptions
layoutOptions?: LayoutOptions
Options for the current layout

Inherited from BasicReactWrapperProps.layoutOptions

Optional
mouseEventCallbacks
mouseEventCallbacks?: MouseEventCallbacks
MouseEventCallbacks containing functions for callbacks on certain actions

nodes
nodes: Node[]
The nodes of the graph of type Node[]

Inherited from BasicReactWrapperProps.nodes

Optional
nvlCallbacks
nvlCallbacks?: ExternalCallbacks
an Object containing functions for callbacks on certain actions

Inherited from BasicReactWrapperProps.nvlCallbacks

Optional
nvlOptions
nvlOptions?: NvlOptions
An object containing options for the Nvl instance

Inherited from BasicReactWrapperProps.nvlOptions

Optional
onInitializationError
onInitializationError?: ((error: unknown) => void)
A callback to handle any errors that happen during NVL initialization

Inherited from BasicReactWrapperProps.onInitializationError

Optional
pan
pan?: {
    x: number;
    y: number;
}
Sets the pan coordinates of the viewport using the setPan method.

Type declaration
x: number
The x coordinate of the pan.

y: number
The y coordinate of the pan.

Remarks
If both zoom and pan are provided, the setZoomAndPan method will be used.

Inherited from BasicReactWrapperProps.pan

Optional
positions
positions?: Node[]
Sets the positions of the nodes in the graph using the setNodePositions method.

Inherited from BasicReactWrapperProps.positions

rels
rels: Relationship[]
The rels of the graph of type Relationship[]

Inherited from BasicReactWrapperProps.rels

Optional
zoom
zoom?: number
Sets the zoom level of the viewport using the setZoom method.

Remarks
If both zoom and pan are provided, the setZoomAndPan method will be used.

Inherited from BasicReactWrapperProps.zoom