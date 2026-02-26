Interface NvlMouseEvent
Extends the MouseEvent interface with the HitTargets property. The result of a NVL.getHits call.

interface NvlMouseEvent {
    nvlTargets: HitTargets;
}
Hierarchy
MouseEvent
NvlMouseEvent
Properties
P
nvlTargets
nvlTargets
nvlTargets: HitTargets
The graph elements that have been hit by the pointer event.