'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import Link from 'next/link'
import { ArrowLeft, ZoomIn, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@apollo/client/react'
import {
  GET_GRAPH_PEOPLE,
  GET_GRAPH_SPACES,
} from '@/app/graphql/queries/GRAPH_QUERIES'

interface Node {
  id: string
  label: string
  type: 'Space' | 'Person' | 'Community' | 'Context' | 'Pulse'
  position?: THREE.Vector3
  object3d?: THREE.Mesh
}

interface Edge {
  source: string
  target: string
  type: string
}

export default function GraphExplorer3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const labelRendererRef = useRef<CSS2DRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const nodesRef = useRef<Map<string, Node>>(new Map())
  const edgesRef = useRef<Edge[]>([])
  const selectedNodeRef = useRef<Node | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hopDistance, setHopDistance] = useState(1)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  // Fetch real data from Neo4j
  const { data: peopleData, loading: peopleLoading } =
    useQuery(GET_GRAPH_PEOPLE)
  const { data: spacesData, loading: spacesLoading } =
    useQuery(GET_GRAPH_SPACES)

  const getNodeColor = (type: string): number => {
    const colors: Record<string, number> = {
      Space: 0x86efac,
      Person: 0x93c5fd,
      Community: 0x93c5fd,
      Context: 0xfde68a,
      Pulse: 0xf9a8d4,
    }
    return colors[type] || 0xc4b5fd
  }

  const createNode = useCallback((id: string, label: string, type: string) => {
    const geometry = new THREE.IcosahedronGeometry(0.5, 3)
    const material = new THREE.MeshPhongMaterial({ color: getNodeColor(type) })
    const mesh = new THREE.Mesh(geometry, material)

    // Create label
    const labelDiv = document.createElement('div')
    labelDiv.className = 'node-label'
    labelDiv.textContent = label
    labelDiv.style.color = '#ffffff'
    labelDiv.style.fontSize = '12px'
    labelDiv.style.fontFamily = 'sans-serif'
    labelDiv.style.padding = '4px 8px'
    labelDiv.style.background = 'rgba(0, 0, 0, 0.7)'
    labelDiv.style.borderRadius = '4px'
    labelDiv.style.pointerEvents = 'none'
    labelDiv.style.userSelect = 'none'

    const labelObject = new CSS2DObject(labelDiv)
    labelObject.position.set(0, 0.8, 0)
    mesh.add(labelObject)

    const node: Node = {
      id,
      label,
      type: type as Node['type'],
      object3d: mesh,
    }

    mesh.userData = { nodeId: id }
    nodesRef.current.set(id, node)
    return mesh
  }, [])

  const initScene = useCallback(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 15
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    )
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Label Renderer
    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    )
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.top = '0'
    labelRenderer.domElement.style.pointerEvents = 'none'
    containerRef.current.appendChild(labelRenderer.domElement)
    labelRendererRef.current = labelRenderer

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 5
    controls.maxDistance = 50
    controls.enablePan = true
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 10)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Create initial nodes from real database entities
    if (peopleData?.people) {
      peopleData.people.forEach(
        (person: { id: string; name?: string }, idx: number) => {
          const angle =
            (idx / Math.max(peopleData.people.length, 1)) * Math.PI * 2
          const x = Math.cos(angle) * 8
          const z = Math.sin(angle) * 8

          const mesh = createNode(
            person.id,
            person.name || 'Unknown Person',
            'Person'
          )
          mesh.position.set(x, 0, z)
          scene.add(mesh)
        }
      )
    }

    if (spacesData?.meSpaces) {
      spacesData.meSpaces.forEach(
        (space: { id: string; name?: string }, idx: number) => {
          const angle =
            (idx / Math.max(spacesData.meSpaces.length, 1)) * Math.PI * 2 +
            Math.PI / 4
          const x = Math.cos(angle) * 10
          const z = Math.sin(angle) * 10

          const mesh = createNode(space.id, space.name || 'MeSpace', 'Space')
          mesh.position.set(x, 1, z)
          scene.add(mesh)
        }
      )
    }

    if (spacesData?.weSpaces) {
      spacesData.weSpaces.forEach(
        (space: { id: string; name?: string }, idx: number) => {
          const angle =
            (idx / Math.max(spacesData.weSpaces.length, 1)) * Math.PI * 2 +
            Math.PI / 2
          const x = Math.cos(angle) * 10
          const z = Math.sin(angle) * 10

          const mesh = createNode(space.id, space.name || 'WeSpace', 'Space')
          mesh.position.set(x, -1, z)
          scene.add(mesh)
        }
      )
    }

    // Mouse click handler
    const onMouseClick = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, camera)

      const objects = Array.from(nodesRef.current.values())
        .map((n) => n.object3d)
        .filter((o): o is THREE.Mesh => o !== undefined)

      const intersects = raycasterRef.current.intersectObjects(objects)

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object as THREE.Mesh
        const nodeId = clickedObject.userData.nodeId
        const node = nodesRef.current.get(nodeId)

        if (node) {
          selectedNodeRef.current = node
          setSelectedNode(node)
          highlightNode(node)
        }
      }
    }

    renderer.domElement.addEventListener('click', onMouseClick)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update()
      }

      // Rotate nodes
      nodesRef.current.forEach((node) => {
        if (node.object3d) {
          node.object3d.rotation.x += 0.002
          node.object3d.rotation.y += 0.003
        }
      })

      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      labelRenderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', onMouseClick)
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
    }
  }, [createNode, peopleData, spacesData])

  const highlightNode = (node: Node) => {
    // Reset all nodes
    nodesRef.current.forEach((n) => {
      if (n.object3d) {
        ;(n.object3d.material as THREE.MeshPhongMaterial).emissive.setHex(
          0x000000
        )
      }
    })

    // Highlight selected
    if (node.object3d) {
      ;(node.object3d.material as THREE.MeshPhongMaterial).emissive.setHex(
        0xfbbf24
      )
    }
  }

  const expandNode = () => {
    if (!selectedNode || !sceneRef.current) return

    // Simulate loading related nodes
    const newNodeCount = hopDistance === 1 ? 3 : 6
    const angle = Math.random() * Math.PI * 2

    for (let i = 0; i < newNodeCount; i++) {
      const nodeId = `node-${Date.now()}-${i}`
      const x = selectedNode.object3d!.position.x + Math.cos(angle + i) * 5
      const z = selectedNode.object3d!.position.z + Math.sin(angle + i) * 5

      const mesh = createNode(
        nodeId,
        `Node ${i + 1}`,
        hopDistance === 1 ? 'Context' : 'Pulse'
      )
      mesh.position.set(x, 0, z)
      sceneRef.current.add(mesh)

      // Add edge
      edgesRef.current.push({
        source: selectedNode.id,
        target: nodeId,
        type: 'connected',
      })
    }
  }

  const resetView = () => {
    if (!sceneRef.current) return
    sceneRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.userData.nodeId) {
        sceneRef.current?.remove(child)
      }
    })
    nodesRef.current.clear()
    edgesRef.current = []
    selectedNodeRef.current = null
    setSelectedNode(null)
    initScene()
  }

  useEffect(() => {
    if (!peopleLoading && !spacesLoading) {
      initScene()
    }
  }, [initScene, peopleLoading, spacesLoading, peopleData, spacesData])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  3D Graph Explorer
                </h1>
                <p className="text-sm text-slate-300">
                  Click nodes to explore relationships
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4">
        {/* 3D Canvas */}
        <div
          ref={containerRef}
          className="flex-1 rounded-lg overflow-hidden border border-white/10"
        />

        {/* Control Panel */}
        <div className="w-80 space-y-4">
          {/* Controls */}
          <Card className="border-white/10 bg-slate-800/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-slate-300 block mb-2">
                  Hop Distance
                </label>
                <div className="flex gap-2">
                  {[1, 2].map((hop) => (
                    <Button
                      key={hop}
                      variant={hopDistance === hop ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHopDistance(hop)}
                      className={
                        hopDistance === hop
                          ? ''
                          : 'border-white/20 text-slate-100 hover:bg-white/10'
                      }
                    >
                      {hop} Hop{hop > 1 ? 's' : ''}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={expandNode}
                  disabled={!selectedNode}
                  size="sm"
                  className="flex-1"
                >
                  <ZoomIn className="w-4 h-4 mr-2" />
                  Expand
                </Button>
                <Button
                  onClick={resetView}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-slate-100 hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Node Details */}
          {selectedNode && (
            <Card className="border-white/10 bg-slate-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  {selectedNode.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-slate-400">Type</span>
                  <p className="text-sm text-slate-200">{selectedNode.type}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">ID</span>
                  <p className="text-xs font-mono text-slate-300">
                    {selectedNode.id}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-400">
                    Connections:{' '}
                    {
                      edgesRef.current.filter(
                        (e) =>
                          e.source === selectedNode.id ||
                          e.target === selectedNode.id
                      ).length
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card className="border-white/10 bg-slate-800/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#86efac' }}
                />
                <span className="text-slate-300">Spaces</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#93c5fd' }}
                />
                <span className="text-slate-300">People</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#fde68a' }}
                />
                <span className="text-slate-300">Contexts</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#f9a8d4' }}
                />
                <span className="text-slate-300">Pulses</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
