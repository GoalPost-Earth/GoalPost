Interface NvlOptions
Configurations for a NVL instance

interface NvlOptions {
    allowDynamicMinZoom?: boolean;
    callbacks?: ExternalCallbacks;
    disableAria?: boolean;
    disableTelemetry?: boolean;
    disableWebWorkers?: boolean;
    initialZoom?: number;
    instanceId?: string;
    layout?: Layout;
    layoutOptions?: LayoutOptions;
    maxZoom?: number;
    minimapContainer?: HTMLElement;
    minZoom?: number;
    panX?: number;
    panY?: number;
    renderer?: Renderer;
    styling?: {
        defaultNodeColor?: string;
        defaultRelationshipColor?: string;
        disabledItemColor?: string;
        disabledItemFontColor?: string;
        dropShadowColor?: string;
        minimapViewportBoxColor?: string;
        nodeDefaultBorderColor?: string;
        selectedBorderColor?: string;
        selectedInnerBorderColor?: string;
    };
}
Properties
P
allowDynamicMinZoom?
P
callbacks?
P
disableAria?
P
disableTelemetry?
P
disableWebWorkers?
P
initialZoom?
P
instanceId?
P
layout?
P
layoutOptions?
P
maxZoom?
P
minimapContainer?
P
minZoom?
P
panX?
P
panY?
P
renderer?
P
styling?
Optional
allowDynamicMinZoom
allowDynamicMinZoom?: boolean
Whether or not to dynamically allow decreasing minimum zoom value if current graph does not fit on screen at minimum zoom. When set to true, zoom and fit operations will allow zooming out further than the minimum zoom value if the graph does not fit on screen. When set to false, zoom and fit operations will stop at the minimum zoom value, even if the full graph does not fit on screen at that zoom level.

Default Value
true
Copy
Optional
callbacks
callbacks?: ExternalCallbacks
Callbacks for various events in the NVL instance.

Optional
disableAria
disableAria?: boolean
Disables ARIA attributes on the graph. By default, NVL adds ARIA attributes to the graph container to make it more accessible. Attributes include role="image", aria-label="Graph visualization" and aria-describedby="nvl-${instanceId}-description". The description element is a live region that will announce changes to the graph.

Default Value
false
Copy
Optional
disableTelemetry
disableTelemetry?: boolean
Disables tracking of library usage

Default Value
false
Copy
Optional
disableWebWorkers
disableWebWorkers?: boolean
Disables the use of web workers for the layout calculations.

Optional
initialZoom
initialZoom?: number
Zoom value of the current viewport

Optional
instanceId
instanceId?: string
Id for uniquely identifying the instance of Nvl

Optional
layout
layout?: Layout
The graph layout algorithm to be used

Optional
layoutOptions
layoutOptions?: LayoutOptions
Configuration for the current layout

Optional
maxZoom
maxZoom?: number
The maximum zoom level allowed

Default
10
Copy
Optional
minimapContainer
minimapContainer?: HTMLElement
The DOM container in which to render the minimap.

Remarks
When using a React ref, make sure the attached element is rendered before the NVL instance is created. Otherwise, the minimap will not be displayed.

Optional
minZoom
minZoom?: number
The minimum zoom level allowed

Default
0.075
Copy
Optional
panX
panX?: number
X-coordinate for panning of the current viewport

Optional
panY
panY?: number
Y-coordinate for panning of the current viewport

Optional
renderer
renderer?: Renderer
What renderer to use

Default Value
'canvas'
WebGL renderer uses GPU and has better performance.
Captions and arrowheads are only displayed when using the canvas or svg renderer.
Copy
Optional
styling
styling?: {
    defaultNodeColor?: string;
    defaultRelationshipColor?: string;
    disabledItemColor?: string;
    disabledItemFontColor?: string;
    dropShadowColor?: string;
    minimapViewportBoxColor?: string;
    nodeDefaultBorderColor?: string;
    selectedBorderColor?: string;
    selectedInnerBorderColor?: string;
}
Styling options for the NVL instance.

Type declaration
OptionaldefaultNodeColor?: string
The default color for nodes.

OptionaldefaultRelationshipColor?: string
The default color for relationships.

OptionaldisabledItemColor?: string
The color to use for the disabled nodes and relationships

OptionaldisabledItemFontColor?: string
The color to use for the labels of the disabled nodes and relationships

OptionaldropShadowColor?: string
The color to use for the drop shadow of selected/hovered nodes and relationships

OptionalminimapViewportBoxColor?: string
The color to use for the viewport box in the minimap

OptionalnodeDefaultBorderColor?: string
The color to use for the default border of nodes

OptionalselectedBorderColor?: string
The color to use for the selected border of nodes and relationships

OptionalselectedInnerBorderColor?: string
The color to use for the selected inner border of nodes and relationships