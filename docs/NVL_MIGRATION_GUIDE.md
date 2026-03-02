# NVL Canvas Migration Implementation Summary

## Completed Phase 1: Foundation

### What Was Done
1. ✅ Installed `@neo4j-nvl/interaction-handlers` package
2. ✅ Created `NvlCanvas` component ([nvl-canvas.tsx](src/components/canvas/nvl-canvas.tsx))
   - Wraps InteractiveNvlWrapper from @neo4j-nvl/react
   - Provides built-in zoom/pan/drag/hover interactions
   - Maintains your design aesthetic (background decoration, styling)
   - Supports callbacks for node clicks, hovers, and background interactions
3. ✅ Refactored node components to remove position-based props:
   - **PulseNode**: Removed `position` prop, added `isSelected` and `isHovered` props
   - **PersonNode**: Removed `position` prop, added `isSelected` and `isHovered` props
   - **ResonanceNode**: Removed `position` prop, added `isSelected` and `isHovered` props
4. ✅ Created NVL utilities ([lib/nvl-utils.ts](src/lib/nvl-utils.ts))
   - `createNvlNodeElement()` - Renders React components into NVL nodes
   - `createNvlNode()` - Converts application node data to NVL format
   - `createNvlNodes()` - Batch converts array of nodes
   - `createNvlRelationships()` - Converts relationship data to NVL format
   - `updateNvlNodeElement()` - Reactive updates for node components
5. ✅ All TypeScript compilation successful

## Phase 2: Integration Pattern (Next Steps)

### How to Use NVL Canvas in Your Pages

Replace your `GenericPulseCanvas` with `NvlCanvas` in pages like `we-space/[id]/fields/[field]/page.tsx`.

#### Basic Setup

```tsx
import { NvlCanvas } from '@/components/canvas/nvl-canvas'
import { createNvlNodes, createNvlRelationships } from '@/lib/nvl-utils'
import { PulseNode } from '@/components/ui/pulse-node'
import { PersonNode } from '@/components/ui/person-node'

export function FieldPage() {
  // Your existing pulses and relationships data
  const [pulses, setPulses] = useState([])
  const [relationships, setRelationships] = useState([])

  // Convert application data to NVL format
  const nvlNodes = useMemo(() => 
    createNvlNodes(pulses, (pulse) => (
      <PulseNode
        label={pulse.name}
        type={pulse.type}
        icon={pulse.icon}
        onClick={() => handlePulseClick(pulse.id)}
        onEditClick={(e) => handlePulseEdit(e, pulse.id)}
        isSelected={selectedId === pulse.id}
        isHovered={hoveredId === pulse.id}
      />
    )),
    [pulses, selectedId, hoveredId]
  )

  const nvlRelationships = useMemo(() => 
    createNvlRelationships(relationships),
    [relationships]
  )

  return (
    <NvlCanvas
      nodes={nvlNodes}
      relationships={nvlRelationships}
      layout="forceDirected"
      minZoom={0.35}
      maxZoom={3}
      enableZoomControls
      showBackgroundDecor
      onNodeClick={(node) => {
        // Handle node selection
        setSelectedId(node.id)
      }}
      onNodeHover={(node) => {
        // Handle node hover
        setHoveredId(node?.id ?? null)
      }}
      onBackgroundClick={() => {
        setSelectedId(null)
        setHoveredId(null)
      }}
      actionButton={
        <button onClick={handleCreatePulse}>
          Create Pulse
        </button>
      }
    />
  )
}
```

### Key Differences from react-zoom-pan-pinch

| Feature | Old (react-zoom-pan-pinch) | New (NVL) |
|---------|--------------------------------|-----------|
| **Node positioning** | Manual via `position` prop in state | Automatic via force-directed layout |
| **Dragging nodes** | Manual GSAP animations in DraggablePulseNode | Built-in via DragNodeInteraction |
| **Zoom/Pan** | TransformWrapper with manual state | InteractiveNvlWrapper handles it |
| **Click handling** | Component onClick handlers | `onNodeClick` callback |
| **Node animations** | GSAP-based floating | Tailwind animations still supported |
| **Selection state** | Manual state management | Can use node's `selected` property |

### NVL Canvas Props

```typescript
interface NvlCanvasProps {
  nodes: Node[]                              // NVL nodes with html property
  relationships: Relationship[]              // Connections between nodes
  className?: string                         // Additional CSS classes
  minZoom?: number                          // Default: 0.35
  maxZoom?: number                          // Default: 3
  enableZoomControls?: boolean               // Show +/- buttons
  showBackgroundDecor?: boolean              // Show animated background blobs
  isLoading?: boolean                        // Show loading state
  layout?: 'forceDirected' | 'hierarchical'  // Default: forceDirected
  onNodeClick?: (node: Node) => void         // Node clicked
  onNodeDoubleClick?: (node: Node) => void   // Node double-clicked
  onNodeHover?: (node: Node | null) => void  // Node hover change
  onBackgroundClick?: () => void             // Empty canvas clicked
  onScaleChange?: (scale: number) => void    // Zoom level changed
  nvlOptions?: Partial<NvlOptions>           // Advanced NVL config
  layoutOptions?: Record<string, unknown>    // Layout algorithm config
  interactionOptions?: ...                   // Interaction settings
  toolbar?: ReactNode                        // Custom toolbar
  actionButton?: ReactNode                   // Primary action button
}
```

### Removing Old Components

These are no longer needed with NVL:
- ❌ `GenericPulseCanvas` - Replace with `NvlCanvas`
- ❌ `GenericCanvas` - Replace with `NvlCanvas`
- ⚠️ `DraggablePulseNode` - `draggable-pulse-node.tsx` - Mark for removal (NVL handles dragging)
- ⚠️ `DraggablePersonNode` - Mark for removal
- ⚠️ `DraggableResonanceNode` - Mark for removal
- ⚠️ `ResonanceLinksVisualization` - Can be replaced by NVL's relationship rendering

### Selection and Hover State

NVL nodes support `selected` and `hovered` properties:

```tsx
// Add selection tracking to your nodes
const nvlNodes = useMemo(() => 
  createNvlNodes(pulses, (pulse) => (
    <PulseNode
      label={pulse.name}
      type={pulse.type}
      isSelected={selectedNodeId === pulse.id}
      isHovered={hoveredNodeId === pulse.id}
      onClick={() => handleSelect(pulse.id)}
    />
  )),
  [pulses, selectedNodeId, hoveredNodeId]
)
```

You can also update NVL nodes programmatically:

```tsx
// Select a node in NVL
wrapperRef.current?.addAndUpdateElementsInGraph(
  [{ id: nodeId, selected: true }],
  []
)

// Get selected nodes
const selectedNodes = wrapperRef.current?.getSelectedNodes()
```

## Phase 3: What's Next

### For Your Pages (e.g., `we-space/[id]/fields/[field]/page.tsx`)

1. **Replace Canvas Component**
   - Remove `GenericPulseCanvas` import
   - Remove related state: `pulsePositions`, `displayPositions`, `canvasSize`
   - Remove position calculation logic
   - Add `NvlCanvas` import

2. **Convert Data Structure**
   - Keep your existing GraphQL queries
   - Use `createNvlNodes()` and `createNvlRelationships()` to format data
   - No need to manage node positions anymore

3. **Update Callbacks**
   - Move click handlers to `onNodeClick` callback
   - Move hover handlers to `onNodeHover` callback
   - Background click to `onBackgroundClick`

4. **Test**
   - Force-directed layout should auto-position nodes
   - Dragging nodes should work automatically
   - Zoom/pan should work automatically
   - Edit buttons should still be clickable
   - Modals should still open/close properly

### Testing Checklist

- [ ] Nodes display and auto-layout correctly
- [ ] Pan and zoom controls work
- [ ] Click on node triggers callback
- [ ] Edit button on node is clickable
- [ ] Drag node to reposition
- [ ] Hover shows/hides hover state
- [ ] Relationship lines render
- [ ] Performance is acceptable (no lag)

## File Changes Summary

### New Files
- [src/components/canvas/nvl-canvas.tsx](src/components/canvas/nvl-canvas.tsx) - NVL wrapper component
- [src/lib/nvl-utils.ts](src/lib/nvl-utils.ts) - Utility functions for NVL integration

### Modified Files
- [src/components/ui/pulse-node.tsx](src/components/ui/pulse-node.tsx) - Removed position prop
- [src/components/ui/person-node.tsx](src/components/ui/person-node.tsx) - Removed position prop
- [src/components/ui/resonance-node.tsx](src/components/ui/resonance-node.tsx) - Removed position prop
- [src/components/canvas/draggable-pulse-node.tsx](src/components/canvas/draggable-pulse-node.tsx) - Fixed prop passing
- [src/components/canvas/draggable-person-node.tsx](src/components/canvas/draggable-person-node.tsx) - Fixed prop passing
- [src/components/ui/connected-pulse-node.tsx](src/components/ui/connected-pulse-node.tsx) - Removed position prop
- [src/components/layout/field-detail.tsx](src/components/layout/field-detail.tsx) - Removed position prop

### To Be Deprecated
- [src/components/canvas/generic-pulse-canvas.tsx](src/components/canvas/generic-pulse-canvas.tsx)
- [src/components/canvas/generic-canvas.tsx](src/components/canvas/generic-canvas.tsx)
- [src/components/canvas/draggable-pulse-node.tsx](src/components/canvas/draggable-pulse-node.tsx)
- [src/components/canvas/draggable-person-node.tsx](src/components/canvas/draggable-person-node.tsx)

## Performance Notes

NVL is highly optimized for graph visualization:
- **WebGL rendering** for 1000+ nodes
- **Canvas rendering** (default) for ~100+ nodes
- **Automatic layout computation** using force-directed algorithm
- **Lazy rendering** of off-screen elements

Your custom React components inside nodes are rendered once during initialization, not on every frame, so performance should be excellent.

## Questions or Issues?

Refer to:
- [NVL React Wrapper Docs](docs/nvl-docs/react/interactive-nvl-wrapper.md)
- [NVL Base Library Docs](docs/nvl-docs/base-library.md)
- [NVL Interaction Handlers](docs/nvl-docs/interaction-handlers.md)
