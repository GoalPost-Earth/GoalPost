Interface HierarchicalOptions
The options for the hierarchical layout

interface HierarchicalOptions {
    direction?:
        | "left"
        | "right"
        | "up"
        | "down";
    packing?: "bin" | "stack";
}
Properties
P
direction?
P
packing?
Optional
direction
direction?:
    | "left"
    | "right"
    | "up"
    | "down"
The direction in which the layout should be oriented

Optional
packing
packing?: "bin" | "stack"
The packing method to be used