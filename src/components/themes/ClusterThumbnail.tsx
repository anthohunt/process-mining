import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  color: string
  memberCount: number
  size?: number
}

/** Tiny Three.js nebula thumbnail for a single cluster. Auto-rotates. */
export function ClusterThumbnail({ color, memberCount, size = 110 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(size, size)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0x445566, 0.7))
    const point = new THREE.PointLight(0xffffff, 0.6, 20)
    point.position.set(3, 4, 4)
    scene.add(point)

    const c = new THREE.Color(color)
    const nR = 1.6 + Math.min(memberCount, 10) * 0.08

    const group = new THREE.Group()

    const nebMesh = new THREE.Mesh(
      new THREE.SphereGeometry(nR, 24, 24),
      new THREE.MeshPhongMaterial({
        color: c, transparent: true, opacity: 0.18, emissive: c, emissiveIntensity: 0.5,
        side: THREE.DoubleSide, depthWrite: false,
      }),
    )
    group.add(nebMesh)

    const innerMesh = new THREE.Mesh(
      new THREE.SphereGeometry(nR * 0.55, 16, 16),
      new THREE.MeshPhongMaterial({
        color: c, transparent: true, opacity: 0.3, emissive: c, emissiveIntensity: 0.7,
        side: THREE.DoubleSide, depthWrite: false,
      }),
    )
    group.add(innerMesh)

    const particles: THREE.Mesh[] = []
    const memberCountClamped = Math.min(memberCount, 8)
    for (let i = 0; i < memberCountClamped; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / memberCountClamped)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const r = nR * 0.65
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshPhongMaterial({
          color: 0xffffff, emissive: c, emissiveIntensity: 1.2,
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

    let frameId = 0
    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      group.rotation.y = t * 0.4
      group.rotation.x = Math.sin(t * 0.2) * 0.15
      ;(nebMesh.material as THREE.MeshPhongMaterial).opacity = 0.15 + Math.sin(t * 0.7) * 0.05
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      renderer.dispose()
      nebMesh.geometry.dispose()
      ;(nebMesh.material as THREE.Material).dispose()
      innerMesh.geometry.dispose()
      ;(innerMesh.material as THREE.Material).dispose()
      particles.forEach(p => {
        p.geometry.dispose()
        ;(p.material as THREE.Material).dispose()
      })
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [color, memberCount, size])

  return <div ref={mountRef} style={{ width: size, height: size, flexShrink: 0 }} aria-hidden="true" />
}
