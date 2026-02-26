Function BasicNvlWrapper
A basic React wrapper that wraps the NVL base library within a React component. It takes the class' arguments as properties, which are passed to the NVL constructor. Any changes in properties will be reflected in the NVL instance by calling the corresponding methods.

For examples, head to the Basic React wrapper documentation page.

BasicNvlWrapper(props): ReactNode
Parameters
props: Omit<Omit<BasicReactWrapperProps & HTMLProps<HTMLDivElement>, "ref"> & RefAttributes<Partial<Pick<NVL,
    | "restart"
    | "destroy"
    | "addAndUpdateElementsInGraph"
    | "getSelectedNodes"
    | "getSelectedRelationships"
    | "removeNodesWithIds"
    | "removeRelationshipsWithIds"
    | "getNodes"
    | "getRelationships"
    | "getNodeById"
    | "getRelationshipById"
    | "getPositionById"
    | "getCurrentOptions"
    | "deselectAll"
    | "fit"
    | "resetZoom"
    | "setRenderer"
    | "setDisableWebGL"
    | "pinNode"
    | "unPinNode"
    | "setLayout"
    | "setLayoutOptions"
    | "getNodesOnScreen"
    | "getNodePositions"
    | "setNodePositions"
    | "isLayoutMoving"
    | "saveToFile"
    | "saveToSvg"
    | "getImageDataUrl"
    | "saveFullGraphToLargeFile"
    | "getZoomLimits"
    | "setZoom"
    | "getScale"
    | "getPan"
    | "getHits"
    | "getContainer">>>, "ref"> & {}
Returns ReactNode