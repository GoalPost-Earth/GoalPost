Interface ForceDirectedOptions
The options for the force directed layout

interface ForceDirectedOptions {
    enableCytoscape?: boolean;
    enableVerlet?: boolean;
    intelWorkaround?: boolean;
}
Properties
P
enableCytoscape?
P
enableVerlet?
P
intelWorkaround?
Optional
enableCytoscape
enableCytoscape?: boolean
Whether to enable automatic switching to CoseBilkent layout for small graphs. When enabled, small graphs will automatically use the CoseBilkent layout algorithm which can provide better initial positioning for smaller datasets.

Optional
Internal
enableVerlet
enableVerlet?: boolean
Wether to use the new physics engine instead of the legacy one.

Default Value
true
@internal
Copy
Optional
intelWorkaround
intelWorkaround?: boolean
Enables a workaround for Intel GPU compatibility issues in WebGL shader compilation. When enabled, this flag modifies how physics simulation shaders are compiled to avoid rendering problems on Intel graphics hardware.

Remarks
Requires a restart of NVL as shaders need to be recompiled.