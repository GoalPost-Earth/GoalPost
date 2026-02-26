Interface CircularOptions
The options for the circular layout.

interface CircularOptions {
    sortFunction?: ((nodes: Node[]) => Node[]);
}
Properties
P
sortFunction?
Optional
sortFunction
sortFunction?: ((nodes: Node[]) => Node[])
Function which should return the sorted nodes.