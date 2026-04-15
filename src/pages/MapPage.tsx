import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useClusters } from '../hooks/useClusters'
import { useWebGLContextLoss } from '../hooks/useWebGLContextLoss'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'
import { ToastContainer, type ToastMessage } from '../components/common/Toast'

function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    setToasts(prev => [...prev, { id: Date.now().toString(), type, message }])
  }, [])
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  return { toasts, addToast, removeToast }
}

interface ActiveCluster {
  id: string
  name: string
  color: string
  subThemes: string[]
  members: { id: string; full_name: string; lab: string }[]
  membersLoading: boolean
}

// Deterministic 3D position for a cluster index (Fibonacci sphere)
function clusterPosition(i: number, total: number, radius = 10): THREE.Vector3 {
  const phi = Math.acos(1 - 2 * (i + 0.5) / total)
  const theta = Math.PI * (1 + Math.sqrt(5)) * i
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta) * 0.6,
    radius * Math.cos(phi),
  )
}

// Fibonacci distribution for researcher particles inside a nebula
function particleOffset(i: number, total: number, nR: number, seed: number): THREE.Vector3 {
  const phi = Math.acos(1 - 2 * (i + 0.5) / total)
  const theta = Math.PI * (1 + Math.sqrt(5)) * i
  // Deterministic pseudo-random radius based on index+seed to avoid SSR mismatch
  const pseudo = ((Math.sin((i + 1) * seed * 12.9898) + 1) / 2)
  const r = nR * 0.6 * (0.4 + pseudo * 0.6)
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  )
}

export function MapPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, addToast, removeToast } = useToast()

  const locationState = location.state as { researcherId?: string } | null
  const highlightedResearcherId = locationState?.researcherId ?? null

  const { data: clusters, isLoading, isError, refetch } = useClusters()
  const [themeFilter, setThemeFilter] = useState('')
  const [labFilter, setLabFilter] = useState('')
  const [appliedThemeFilter, setAppliedThemeFilter] = useState('')
  const [appliedLabFilter, setAppliedLabFilter] = useState('')
  const [activeCluster, setActiveCluster] = useState<ActiveCluster | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; lab: string; color: string } | null>(null)

  const mountRef = useRef<HTMLDivElement>(null)
  const webglContextLost = useWebGLContextLoss(mountRef)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const nebulaGroupsRef = useRef<Array<{
    group: THREE.Group
    nebMesh: THREE.Mesh
    innerMesh: THREE.Mesh
    label: THREE.Sprite
    particleMeshes: THREE.Mesh[]
    clusterId: string
    originalPos: THREE.Vector3
  }>>([])
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const animationIdRef = useRef<number | null>(null)
  const sidePanelOpenRef = useRef(false)
  const defaultCamPosRef = useRef(new THREE.Vector3(0, 8, 28))

  const allLabs = useMemo(() => {
    if (!clusters) return []
    const labs = new Set<string>()
    clusters.forEach(c => c.members.forEach(m => { if (m.lab) labs.add(m.lab) }))
    return Array.from(labs).sort()
  }, [clusters])

  const filteredClusters = useMemo(() => {
    let result = clusters ?? []
    if (appliedThemeFilter) {
      result = result.filter(c => c.id === appliedThemeFilter)
    }
    if (appliedLabFilter) {
      result = result.map(c => ({
        ...c,
        members: c.members.filter(m => m.lab === appliedLabFilter),
        researcher_count: c.members.filter(m => m.lab === appliedLabFilter).length,
      })).filter(c => c.members.length > 0)
    }
    return result
  }, [clusters, appliedThemeFilter, appliedLabFilter])

  // Show toast if navigated from profile but researcher not found on map
  useEffect(() => {
    if (highlightedResearcherId && clusters) {
      const found = clusters.some(c => c.members.some(m => m.id === highlightedResearcherId))
      if (!found) addToast('info', t('profile.noMapPosition'))
    }
  }, [highlightedResearcherId, clusters, addToast, t])

  // Build / rebuild the Three.js scene when filteredClusters changes
  useEffect(() => {
    const mount = mountRef.current
    if (!mount || filteredClusters.length === 0) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0c1b33, 0.012)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.copy(defaultCamPosRef.current)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0c1b33)
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.25
    controls.minDistance = 5
    controls.maxDistance = 60
    controls.target.set(0, 0, 0)
    controlsRef.current = controls

    // Lights
    scene.add(new THREE.AmbientLight(0x334466, 0.5))
    const pointLight = new THREE.PointLight(0xffffff, 1, 100)
    pointLight.position.set(10, 15, 10)
    scene.add(pointLight)

    // Stars background
    const starsGeo = new THREE.BufferGeometry()
    const starPositions = new Float32Array(3000)
    for (let i = 0; i < 3000; i++) starPositions[i] = (Math.random() - 0.5) * 200
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.1, transparent: true, opacity: 0.6,
    })))

    // Build each cluster
    const nebulas: typeof nebulaGroupsRef.current = []
    filteredClusters.forEach((cluster, ci) => {
      const group = new THREE.Group()
      const pos = clusterPosition(ci, filteredClusters.length, Math.max(8, filteredClusters.length * 2))
      group.position.copy(pos)
      const color = new THREE.Color(cluster.color)
      const nR = 2.5 + cluster.researcher_count * 0.3

      // Outer nebula (clickable)
      const nebMesh = new THREE.Mesh(
        new THREE.SphereGeometry(nR, 32, 32),
        new THREE.MeshPhongMaterial({
          color, transparent: true, opacity: 0.08, emissive: color, emissiveIntensity: 0.3,
          side: THREE.DoubleSide, depthWrite: false,
        }),
      )
      nebMesh.userData = { clickable: 'cluster', clusterIdx: ci }
      group.add(nebMesh)

      // Inner glow
      const innerMesh = new THREE.Mesh(
        new THREE.SphereGeometry(nR * 0.5, 24, 24),
        new THREE.MeshPhongMaterial({
          color, transparent: true, opacity: 0.12, emissive: color, emissiveIntensity: 0.5,
          side: THREE.DoubleSide, depthWrite: false,
        }),
      )
      group.add(innerMesh)

      // Label sprite
      const canvas = document.createElement('canvas')
      canvas.width = 256; canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.font = 'bold 24px Poppins, sans-serif'
      ctx.fillStyle = cluster.color
      ctx.textAlign = 'center'
      ctx.fillText(cluster.name, 128, 40)
      const label = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas), transparent: true, opacity: 0.85, depthWrite: false,
      }))
      label.scale.set(5, 1.25, 1)
      label.position.set(0, nR + 1, 0)
      group.add(label)

      // Researcher particles
      const particleMeshes: THREE.Mesh[] = []
      const seed = (ci + 1) * 3.7
      cluster.members.forEach((m, mi) => {
        const offset = particleOffset(mi, cluster.members.length, nR, seed)
        const isHighlighted = m.id === highlightedResearcherId
        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(isHighlighted ? 0.28 : 0.18, 12, 12),
          new THREE.MeshPhongMaterial({
            color: 0xffffff, emissive: color,
            emissiveIntensity: isHighlighted ? 1.6 : 0.8,
            transparent: true, opacity: 0.95,
          }),
        )
        particle.position.copy(offset)
        particle.userData = { clickable: 'particle', member: m, cluster }
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(isHighlighted ? 0.7 : 0.4, 8, 8),
          new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: isHighlighted ? 0.4 : 0.2, depthWrite: false,
          }),
        )
        particle.add(halo)
        group.add(particle)
        particleMeshes.push(particle)
      })

      scene.add(group)
      nebulas.push({ group, nebMesh, innerMesh, label, particleMeshes, clusterId: cluster.id, originalPos: pos.clone() })
    })

    // Connection beams between clusters (ring layout)
    for (let i = 0; i < filteredClusters.length; i++) {
      const a = clusterPosition(i, filteredClusters.length, Math.max(8, filteredClusters.length * 2))
      const b = clusterPosition((i + 1) % filteredClusters.length, filteredClusters.length, Math.max(8, filteredClusters.length * 2))
      const geo = new THREE.BufferGeometry().setFromPoints([a, b])
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.06, depthWrite: false,
      }))
      scene.add(line)
    }

    nebulaGroupsRef.current = nebulas
    raycasterRef.current.params.Points.threshold = 0.5

    // Camera fly-to-highlight on load
    if (highlightedResearcherId) {
      const found = nebulas.find(n => n.particleMeshes.some(p => (p.userData.member as { id: string }).id === highlightedResearcherId))
      if (found) {
        const target = found.originalPos.clone()
        const offset = new THREE.Vector3(6, 3, 6)
        camera.position.copy(target.clone().add(offset))
        controls.target.copy(target)
      }
    }

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()
      nebulas.forEach((n, i) => {
        n.nebMesh.material = n.nebMesh.material as THREE.MeshPhongMaterial
        ;(n.nebMesh.material as THREE.MeshPhongMaterial).opacity = 0.06 + Math.sin(time * 0.5 + i * 1.2) * 0.03
        // Gentle particle drift
        n.particleMeshes.forEach((p, j) => {
          p.position.x += Math.sin(time * 0.3 + j * 0.7) * 0.001
          p.position.y += Math.cos(time * 0.2 + j * 0.5) * 0.0008
        })
      })
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize handling
    const handleResize = () => {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current !== null) cancelAnimationFrame(animationIdRef.current)
      controls.dispose()
      renderer.dispose()
      nebulas.forEach(n => {
        n.nebMesh.geometry.dispose()
        ;(n.nebMesh.material as THREE.Material).dispose()
        n.innerMesh.geometry.dispose()
        ;(n.innerMesh.material as THREE.Material).dispose()
        n.particleMeshes.forEach(p => {
          p.geometry.dispose()
          ;(p.material as THREE.Material).dispose()
        })
      })
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [filteredClusters, highlightedResearcherId])

  const handleApplyFilter = () => {
    setAppliedThemeFilter(themeFilter)
    setAppliedLabFilter(labFilter)
    closeActiveCluster()
  }

  const handleResetFilter = () => {
    setThemeFilter('')
    setLabFilter('')
    setAppliedThemeFilter('')
    setAppliedLabFilter('')
    closeActiveCluster()
  }

  const animateCamera = useCallback((toPos: THREE.Vector3, toTarget: THREE.Vector3, duration = 900) => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return
    const fromPos = camera.position.clone()
    const fromTarget = controls.target.clone()
    const start = performance.now()
    const tick = () => {
      const t = Math.min((performance.now() - start) / duration, 1)
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      camera.position.lerpVectors(fromPos, toPos, e)
      controls.target.lerpVectors(fromTarget, toTarget, e)
      if (t < 1) requestAnimationFrame(tick)
    }
    tick()
  }, [])

  const flyToCluster = useCallback((clusterIdx: number) => {
    const controls = controlsRef.current
    const neb = nebulaGroupsRef.current[clusterIdx]
    if (!controls || !neb) return
    controls.autoRotate = false
    const target = neb.originalPos.clone()
    const offset = new THREE.Vector3(8, 4, 8)
    animateCamera(target.clone().add(offset), target)
    // Spread particles
    neb.particleMeshes.forEach(p => {
      const orig = (p.userData._origPos as THREE.Vector3 | undefined) ?? p.position.clone()
      p.userData._origPos = orig
      const expanded = orig.clone().multiplyScalar(1.6)
      const start = performance.now()
      const from = p.position.clone()
      const tick = () => {
        const t = Math.min((performance.now() - start) / 500, 1)
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        p.position.lerpVectors(from, expanded, e)
        if (t < 1) requestAnimationFrame(tick)
      }
      tick()
    })
  }, [animateCamera])

  const resetCamera = useCallback(() => {
    const controls = controlsRef.current
    if (!controls) return
    controls.autoRotate = true
    animateCamera(defaultCamPosRef.current, new THREE.Vector3(0, 0, 0), 700)
    // Restore particles
    nebulaGroupsRef.current.forEach(n => {
      n.particleMeshes.forEach(p => {
        const orig = p.userData._origPos as THREE.Vector3 | undefined
        if (!orig) return
        const start = performance.now()
        const from = p.position.clone()
        const tick = () => {
          const t = Math.min((performance.now() - start) / 400, 1)
          const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
          p.position.lerpVectors(from, orig, e)
          if (t < 1) requestAnimationFrame(tick)
        }
        tick()
      })
    })
  }, [animateCamera])

  const closeActiveCluster = useCallback(() => {
    sidePanelOpenRef.current = false
    setActiveCluster(null)
    resetCamera()
  }, [resetCamera])

  const openCluster = useCallback((clusterIdx: number) => {
    const cluster = filteredClusters[clusterIdx]
    if (!cluster) return
    flyToCluster(clusterIdx)
    sidePanelOpenRef.current = true
    setActiveCluster({
      id: cluster.id,
      name: cluster.name,
      color: cluster.color,
      subThemes: cluster.sub_themes,
      members: [],
      membersLoading: true,
    })

    // Lazy fetch full member list for this cluster
    supabase
      .from('researchers')
      .select('id, full_name, lab, cluster_id')
      .eq('cluster_id', cluster.id)
      .eq('status', 'approved')
      .then(({ data, error }) => {
        if (!sidePanelOpenRef.current) return
        if (error) {
          setActiveCluster(prev => prev && prev.id === cluster.id
            ? { ...prev, membersLoading: false, members: cluster.members }
            : prev)
          return
        }
        const members = (data ?? []).map(r => ({ id: r.id, full_name: r.full_name, lab: r.lab }))
        setActiveCluster(prev => prev && prev.id === cluster.id
          ? { ...prev, membersLoading: false, members }
          : prev)
      })
  }, [filteredClusters, flyToCluster])

  const navigateToProfile = useCallback(async (memberId: string) => {
    try {
      const { error } = await supabase.from('researchers').select('id').eq('id', memberId).single()
      if (error) {
        addToast('error', t('map.profileUnavailable'))
        return
      }
      navigate(`/researchers/${memberId}`)
    } catch {
      addToast('error', t('map.profileUnavailable'))
    }
  }, [navigate, addToast, t])

  // Mouse + click handling on the canvas
  useEffect(() => {
    const wrapper = canvasWrapperRef.current
    if (!wrapper) return

    const getIntersection = (event: MouseEvent) => {
      const camera = cameraRef.current
      const scene = sceneRef.current
      if (!camera || !scene) return null
      const rect = wrapper.getBoundingClientRect()
      const mx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const my = -((event.clientY - rect.top) / rect.height) * 2 + 1
      mouseRef.current.set(mx, my)
      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObjects(scene.children, true)
      let particle: THREE.Object3D | null = null
      let cluster: THREE.Object3D | null = null
      for (const i of intersects) {
        if (i.object.userData.clickable === 'particle' && !particle) particle = i.object
        if (i.object.userData.clickable === 'cluster' && !cluster) cluster = i.object
      }
      return particle || cluster
    }

    let hovered: THREE.Mesh | null = null
    const handleMove = (e: MouseEvent) => {
      const hit = getIntersection(e)
      if (hit && hit.userData.clickable === 'particle') {
        const member = hit.userData.member as { full_name: string; lab: string }
        const cluster = hit.userData.cluster as { name: string; color: string }
        setTooltip({ x: e.clientX, y: e.clientY, name: member.full_name, lab: `${member.lab} — ${cluster.name}`, color: cluster.color })
        document.body.style.cursor = 'pointer'
        if (hovered !== hit) {
          if (hovered) {
            hovered.scale.setScalar(1)
            ;(hovered.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.8
          }
          const m = hit as THREE.Mesh
          m.scale.setScalar(2)
          ;(m.material as THREE.MeshPhongMaterial).emissiveIntensity = 2
          hovered = m
        }
      } else if (hit && hit.userData.clickable === 'cluster') {
        document.body.style.cursor = 'pointer'
        setTooltip(null)
        if (hovered) {
          hovered.scale.setScalar(1)
          ;(hovered.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.8
          hovered = null
        }
      } else {
        setTooltip(null)
        document.body.style.cursor = 'grab'
        if (hovered) {
          hovered.scale.setScalar(1)
          ;(hovered.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.8
          hovered = null
        }
      }
    }

    const handleClick = (e: MouseEvent) => {
      // Ignore clicks on UI overlays
      const target = e.target as Element
      if (target.closest('.map-filter-panel') || target.closest('.side-panel') || target.closest('.map-tooltip')) return
      const hit = getIntersection(e)
      if (hit && hit.userData.clickable === 'particle') {
        const member = hit.userData.member as { id: string }
        void navigateToProfile(member.id)
      } else if (hit && hit.userData.clickable === 'cluster') {
        openCluster(hit.userData.clusterIdx as number)
      }
    }

    wrapper.addEventListener('mousemove', handleMove)
    wrapper.addEventListener('click', handleClick)
    return () => {
      wrapper.removeEventListener('mousemove', handleMove)
      wrapper.removeEventListener('click', handleClick)
      document.body.style.cursor = ''
    }
  }, [openCluster, navigateToProfile, filteredClusters])

  // Escape closes the side panel
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCluster) closeActiveCluster()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeCluster, closeActiveCluster])

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('map.title')}</h1>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/themes')}>
          {t('map.viewList')}
        </button>
      </div>

      <div
        ref={canvasWrapperRef}
        className="map-container"
        role="img"
        aria-label={t('map.ariaLabel')}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {webglContextLost && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(12,27,51,0.95)' }}>
            <p style={{ color: '#fff', marginBottom: 16 }}>Le contexte WebGL a ete perdu.</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Recharger la carte
            </button>
          </div>
        )}
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <LoadingSpinner message={t('common.loading')} />
          </div>
        )}
        {isError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <ErrorState message={t('map.error')} onRetry={() => void refetch()} retryLabel={t('map.retry')} />
          </div>
        )}
        {!isLoading && !isError && clusters && clusters.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <EmptyState message={t('map.noData')} />
          </div>
        )}

        {!isLoading && !isError && clusters && clusters.length > 0 && (
          <>
            {/* Filter panel */}
            <div className="map-filter-panel" style={{ zIndex: 3 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Filtres</div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>{t('map.filterTheme')}</label>
                <select
                  className="form-control"
                  style={{ fontSize: 12 }}
                  aria-label={t('map.filterTheme')}
                  value={themeFilter}
                  onChange={e => setThemeFilter(e.target.value)}
                >
                  <option value="">{t('map.resetFilter')}</option>
                  {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>{t('map.filterLab')}</label>
                <select
                  className="form-control"
                  style={{ fontSize: 12 }}
                  aria-label={t('map.filterLab')}
                  value={labFilter}
                  onChange={e => setLabFilter(e.target.value)}
                >
                  <option value="">{t('map.resetFilter')}</option>
                  {allLabs.map(lab => <option key={lab} value={lab}>{lab}</option>)}
                </select>
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleApplyFilter}
              >
                {t('map.apply')}
              </button>
              {(appliedThemeFilter || appliedLabFilter) && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                  onClick={handleResetFilter}
                >
                  {t('map.resetFilter')}
                </button>
              )}
            </div>

            {/* Three.js mount point */}
            <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

            {/* Hover tooltip */}
            {tooltip && (
              <div
                className="map-tooltip"
                style={{
                  position: 'fixed',
                  left: tooltip.x + 15,
                  top: tooltip.y - 10,
                  zIndex: 50,
                  background: 'rgba(12,27,51,0.95)',
                  color: '#fff',
                  padding: '8px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  pointerEvents: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: tooltip.color }}>{tooltip.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{tooltip.lab}</div>
              </div>
            )}

            {/* Side panel (Mode A) */}
            {activeCluster && (
              <aside
                className="side-panel"
                role="dialog"
                aria-label={activeCluster.name}
                style={{
                  position: 'absolute',
                  top: 0, right: 0, bottom: 0, width: 400,
                  background: 'rgba(12,27,51,0.98)',
                  borderLeft: `3px solid ${activeCluster.color}`,
                  padding: '30px 24px',
                  overflowY: 'auto',
                  zIndex: 5,
                  color: '#fff',
                  backdropFilter: 'blur(14px)',
                  animation: 'slideInRight 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <button
                  onClick={closeActiveCluster}
                  aria-label={t('map.closePanel') || 'Close'}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
                    cursor: 'pointer', fontSize: 13, padding: '8px 14px', borderRadius: 8,
                    marginBottom: 20, fontFamily: 'inherit',
                  }}
                >
                  ← {t('map.back') || 'Back to map'}
                </button>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: activeCluster.color, marginBottom: 4 }}>
                  {activeCluster.name}
                </h2>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
                  {activeCluster.members.length || '—'} {t('map.researchers') || 'researchers'} · {activeCluster.subThemes.length} {t('map.subThemes') || 'sub-themes'}
                </div>
                {activeCluster.subThemes.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                    {activeCluster.subThemes.map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 11, padding: '6px 12px', borderRadius: 12,
                          background: 'rgba(255,255,255,0.06)',
                          borderLeft: `3px solid ${activeCluster.color}`,
                          paddingLeft: 10,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                  {t('map.members') || 'Members'}
                </h4>
                {activeCluster.membersLoading ? (
                  <LoadingSpinner />
                ) : (
                  activeCluster.members.map(m => (
                    <button
                      key={m.id}
                      onClick={() => void navigateToProfile(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 6,
                        borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                        width: '100%', border: 'none', cursor: 'pointer', color: '#fff',
                        fontFamily: 'inherit', textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)' }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: 13, color: activeCluster.color,
                      }}>
                        {m.full_name.split(' ').slice(-1)[0]?.[0] ?? '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{m.full_name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{m.lab}</div>
                      </div>
                    </button>
                  ))
                )}
              </aside>
            )}

            {/* Legend */}
            <div className="map-legend" style={{ zIndex: 3 }}>
              {clusters.map(c => (
                <div key={c.id} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
