Interface ExternalCallbacks
An object specifying the required callback functions for certain actions

interface ExternalCallbacks {
    onError?: ((error: Error) => void);
    onInitialization?: (() => void);
    onLayoutComputing?: ((isComputing: boolean) => void);
    onLayoutDone?: (() => void);
    onLayoutStep?: ((p: Node[]) => void);
    onWebGLContextLost?: ((webGLContextEvent: WebGLContextEvent) => void);
    onZoomTransitionDone?: (() => void);
    restart?: (() => void);
}
Properties
P
onError?
P
onInitialization?
P
onLayoutComputing?
P
onLayoutDone?
P
onLayoutStep?
P
onWebGLContextLost?
P
onZoomTransitionDone?
P
restart?
Optional
onError
onError?: ((error: Error) => void)
Triggered when NVL throws an error after initialization.

Optional
onInitialization
onInitialization?: (() => void)
Triggered when NVL is initialized.

Optional
onLayoutComputing
onLayoutComputing?: ((isComputing: boolean) => void)
Triggered when a asynchronous layout calculation starts/stops.

Optional
onLayoutDone
onLayoutDone?: (() => void)
Triggered when a layout is done moving.

Optional
onLayoutStep
onLayoutStep?: ((p: Node[]) => void)
Triggered on each step of a layout.

Optional
onWebGLContextLost
onWebGLContextLost?: ((webGLContextEvent: WebGLContextEvent) => void)
Triggered when the WebGL context is lost. https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event

Optional
onZoomTransitionDone
onZoomTransitionDone?: (() => void)
Triggered when a zoom transition (e.g. NVL.fit or NVL.resetZoom) function is done.

Optional
restart
restart?: (() => void)
Triggered when NVL is restarted.