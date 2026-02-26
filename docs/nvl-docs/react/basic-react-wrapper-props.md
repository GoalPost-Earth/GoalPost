Interface BasicReactWrapperProps
The properties that can be passed to the BasicNvlWrapper component.

interface BasicReactWrapperProps {
    layout?: Layout;
    layoutOptions?: LayoutOptions;
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
layout?
P
layoutOptions?
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
layout
layout?: Layout
The layout, can be 'forceDirected' or 'hierarchical'

Optional
layoutOptions
layoutOptions?: LayoutOptions
Options for the current layout

nodes
nodes: Node[]
The nodes of the graph of type Node[]

Optional
nvlCallbacks
nvlCallbacks?: ExternalCallbacks
an Object containing functions for callbacks on certain actions

Optional
nvlOptions
nvlOptions?: NvlOptions
An object containing options for the Nvl instance

Optional
onInitializationError
onInitializationError?: ((error: unknown) => void)
A callback to handle any errors that happen during NVL initialization

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

Optional
positions
positions?: Node[]
Sets the positions of the nodes in the graph using the setNodePositions method.

rels
rels: Relationship[]
The rels of the graph of type Relationship[]

Optional
zoom
zoom?: number
Sets the zoom level of the viewport using the setZoom method.

Remarks
If both zoom and pan are provided, the setZoomAndPan method will be use

