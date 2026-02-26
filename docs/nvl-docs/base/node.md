Interface Node
A node inside the graph visualization.

interface Node {
    activated?: boolean;
    caption?: string;
    captionAlign?: "center" | "top" | "bottom";
    captions?: StyledCaption[];
    captionSize?: number;
    color?: string;
    disabled?: boolean;
    hovered?: boolean;
    html?: HTMLElement;
    icon?: string;
    id: string;
    overlayIcon?: {
        position?: number[];
        size?: number;
        url: string;
    };
    pinned?: boolean;
    selected?: boolean;
    size?: number;
}
Hierarchy
GraphElement
Node
Properties
P
activated?
P
caption?
P
captionAlign?
P
captions?
P
captionSize?
P
color?
P
disabled?
P
hovered?
P
html?
P
icon?
P
id
P
overlayIcon?
P
pinned?
P
selected?
P
size?
Optional
activated
activated?: boolean
Whether or not the current node is activated.

Optional
caption
caption?: string
The text to display inside on node or relationship. @note: If both caption and captions are provided, captions takes precedence. @note: To provide multiple captions with custom styles, use the captions property. @note: Captions are only visible when using the 'canvas' renderer.

Inherited from GraphElement.caption

Optional
captionAlign
captionAlign?: "center" | "top" | "bottom"
The caption align. Has no affect on self-referring relationships.

Inherited from GraphElement.captionAlign

Optional
captions
captions?: StyledCaption[]
The caption text and font styles. @note: To provide a single caption without custom styles, you can also use the caption property. @note: Captions are only visible when using the 'canvas' renderer.

Inherited from GraphElement.captions

Optional
captionSize
captionSize?: number
The caption text size.

Inherited from GraphElement.captionSize

Optional
color
color?: string
The color of the graph element.

Inherited from GraphElement.color

Optional
disabled
disabled?: boolean
Whether or not the current node or relationship is disabled.

Inherited from GraphElement.disabled

Optional
hovered
hovered?: boolean
Whether or not the current node or relationship is hovered.

Inherited from GraphElement.hovered

Optional
Experimental
html
html?: HTMLElement
The DOM element to display on top of a node.

Optional
icon
icon?: string
The url to an icon to display inside the node. Icons are expected to be black. If the node's background color is dark, the icon will be inverted to white. Icons are expected to be square.

Readonly
id
id: string
The id of the current node or relationship. Ids need to be unique across all nodes and relationships. Ids need to be strings and cannot be empty.

Inherited from GraphElement.id

Optional
overlayIcon
overlayIcon?: {
    position?: number[];
    size?: number;
    url: string;
}
An icon to be displayed anywhere on top of the graph element. Icons are expected to be square.

Type declaration
Optionalposition?: number[]
The position of the icon relative to the node or relationship. The position is a percentage of the node or relationship size. [1, 1] is the bottom right corner of the node or relationship. [-1, -1] is the top left corner of the node or relationship.

Default Value
[0, 0], the center of the node or relationship.

Optionalsize?: number
The size of the icon relative to the node size or relationship caption size. The size is a percentage of the node size or relationship caption size.

Default Value
1, the same size as the node size or relationship caption size.

url: string
The url to the icon.

Inherited from GraphElement.overlayIcon

Optional
pinned
pinned?: boolean
Whether or not the current node is pinned.

Optional
selected
selected?: boolean
Whether or not the current node or relationship is selected.

Inherited from GraphElement.selected

Optional
size
size?: number
The size of the node.