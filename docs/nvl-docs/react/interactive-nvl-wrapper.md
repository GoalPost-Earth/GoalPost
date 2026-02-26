Function InteractiveNvlWrapper
The interactive React wrapper component contains a collection of interaction handlers by default and provides a variety of common functionality and callbacks. It is an extension of the BasicNvlWrapper component and incorporates the @neo4j-nvl/interaction-handlers module's decorators to provide a set of interaction events.

The mouseEventCallbacks property takes an object where various callbacks can be defined and behavior can be toggled on and off.

For examples, head to the Interactive React wrapper documentation page.

InteractiveNvlWrapper(props): ReactNode
Parameters
props: Omit<Omit<InteractiveNvlWrapperProps & HTMLProps<HTMLDivElement>, "ref"> & RefAttributes<NVL>, "ref"> & {}
Returns ReactNode