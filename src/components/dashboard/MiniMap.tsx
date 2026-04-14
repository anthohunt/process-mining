import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { useClusters } from '../../hooks/useClusters'
import { LoadingSpinner } from '../common/LoadingSpinner'

function clusterPosition(i: number, total: number, radius = 8): THREE.Vector3 {
  const phi = Math.acos(1 - 2 * (i + 0.5) / total)
  const theta = Math.PI * (1 + Math.sqrt(5)) * i
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta) * 0.6,
    radius * Math.cos(phi),
  )
}

export function MiniMap() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: clusters, isLoading, isError } = useClusters()
  const mountRef = useRef<HTMLDivElement>(null)

  const handleClick = () => navigate('/map')

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !clusters || clusters.length === 0) return

    const width = mount.clientWidth
    const height = mount.clientHeight
    if (width === 0 || height === 0) return

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0c1b33, 0.025)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    camera.position.set(0, 4, 18)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0c1b33)
    mount.appendChild(renderer.domElement)

    // Lights
    scene.add(new THREE.AmbientLight(0x334466, 0.6))
    const point = new THREE.PointLight(0xffffff, 0.8, 50)
    point.position.set(8, 12, 8)
    scene.add(point)

    // Stars
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(900)
    for (let i = 0; i < 900; i++) starPos[i] = (Math.random() - 0.5) * 80
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.6 })))

    // Clusters
    const radius = Math.max(6, clusters.length * 1.5)
    const nebulas: { mesh: THREE.Mesh; particles: THREE.Mesh[] }[] = []

    clusters.forEach((cluster, ci) => {
      const group = new THREE.Group()
      group.position.copy(clusterPosition(ci, clusters.length, radius))
      const color = new THREE.Color(cluster.color)
      const nR = 1.5 + cluster.researcher_count * 0.18

      const nebMesh = new THREE.Mesh(
        new THREE.SphereGeometry(nR, 24, 24),
        new THREE.MeshPhongMaterial({
          color, transparent: true, opacity: 0.1, emissive: color, emissiveIntensity: 0.4,
          side: THREE.DoubleSide, depthWrite: false,
        }),
      )
      group.add(nebMesh)

      const innerMesh = new THREE.Mesh(
        new THREE.SphereGeometry(nR * 0.5, 16, 16),
        new THREE.MeshPhongMaterial({
          color, transparent: true, opacity: 0.18, emissive: color, emissiveIntensity: 0.6,
          side: THREE.DoubleSide, depthWrite: false,
        }),
      )
      group.add(innerMesh)

      // A few representative particles
      const particles: THREE.Mesh[] = []
      const memberCount = Math.min(cluster.members.length, 8)
      for (let mi = 0; mi < memberCount; mi++) {
        const phi = Math.acos(1 - 2 * (mi + 0.5) / memberCount)
        const theta = Math.PI * (1 + Math.sqrt(5)) * mi
        const r = nR * 0.6
        const p = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          new THREE.MeshPhongMaterial({
            color: 0xffffff, emissive: color, emissiveIntensity: 0.9,
            transparent: true, opacity: 0.95,
          }),
        )
        p.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        )
        group.add(p)
        particles.push(p)
      }

      scene.add(group)
      nebulas.push({ mesh: nebMesh, particles })
    })

    // Connection ring
    for (let i = 0; i < clusters.length; i++) {
      const a = clusterPosition(i, clusters.length, radius)
      const b = clusterPosition((i + 1) % clusters.length, clusters.length, radius)
      const geo = new THREE.BufferGeometry().setFromPoints([a, b])
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.05, depthWrite: false,
      })))
    }

    let frameId = 0
    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()
      // Slowly orbit the camera
      const a = time * 0.15
      camera.position.x = Math.sin(a) * 18
      camera.position.z = Math.cos(a) * 18
      camera.lookAt(0, 0, 0)
      // Pulse nebula
      nebulas.forEach((n, i) => {
        ;(n.mesh.material as THREE.MeshPhongMaterial).opacity = 0.08 + Math.sin(time * 0.5 + i * 1.2) * 0.04
      })
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameId)
      renderer.dispose()
      nebulas.forEach(n => {
        n.mesh.geometry.dispose()
        ;(n.mesh.material as THREE.Material).dispose()
        n.particles.forEach(p => {
          p.geometry.dispose()
          ;(p.material as THREE.Material).dispose()
        })
      })
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [clusters])

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mini-map-placeholder">
          <LoadingSpinner message={t('dashboard.minimap.loading')} />
        </div>
      )
    }
    if (isError) {
      return (
        <div className="mini-map-placeholder">
          <span>{t('dashboard.minimap.fallback')}</span>
        </div>
      )
    }
    if (!clusters || clusters.length === 0) {
      return (
        <div className="mini-map-placeholder">
          <span>{t('dashboard.minimap.noData')}</span>
        </div>
      )
    }
    return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} aria-hidden="true" />
  }

  return (
    <div
      className="mini-map-container"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={t('dashboard.minimap.clickHint')}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {renderContent()}
      {!isLoading && !isError && clusters && clusters.length > 0 && (
        <div className="mini-map-overlay">
          {t('dashboard.minimap.clickHint')}
        </div>
      )}
    </div>
  )
}
