Interface HitTargetRelationship
A relationship that has been hit by a pointer event

interface HitTargetRelationship {
    data: Relationship;
    distance: number;
    fromTargetCoordinates: Point;
    pointerCoordinates: Point;
    toTargetCoordinates: Point;
}
Properties
P
data
P
distance
P
fromTargetCoordinates
P
pointerCoordinates
P
toTargetCoordinates
data
data: Relationship
The relationship that was hit

distance
distance: number
The distance between the relationship and the pointer event

fromTargetCoordinates
fromTargetCoordinates: Point
The coordinates of the source node of the relationship that was hit

pointerCoordinates
pointerCoordinates: Point
The coordinates of the pointer event

toTargetCoordinates
toTargetCoordinates: Point
The coordinates of the target node of the relationship that was hit