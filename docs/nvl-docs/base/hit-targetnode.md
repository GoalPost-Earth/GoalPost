Interface HitTargetNode
A node that has been hit by a pointer event

interface HitTargetNode {
    data: Node;
    distance: number;
    distanceVector: Point;
    insideNode: boolean;
    pointerCoordinates: Point;
    targetCoordinates: Point;
}
Properties
P
data
P
distance
P
distanceVector
P
insideNode
P
pointerCoordinates
P
targetCoordinates
data
data: Node
The node that was hit

distance
distance: number
The distance between the node and the pointer event

distanceVector
distanceVector: Point
The distance vector between the node and the pointer event

insideNode
insideNode: boolean
Whether the pointer event is inside the node

pointerCoordinates
pointerCoordinates: Point
The coordinates of the pointer event

targetCoordinates
targetCoordinates: Point
The coordinates of the node that was hit