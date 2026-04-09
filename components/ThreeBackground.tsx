'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.Fog(0x050510, 25, 80);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(0, 18, 35);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(1);
    renderer.domElement.style.pointerEvents = 'none';
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0x0a0a1a, 2);
    scene.add(ambient);

    const warmLight = new THREE.DirectionalLight(0xffd090, 1.2);
    warmLight.position.set(25, 35, 15);
    scene.add(warmLight);

    const rimLight = new THREE.PointLight(0x1a2a6c, 1, 80);
    rimLight.position.set(-25, 10, -15);
    scene.add(rimLight);

    // Buildings — shared material for performance
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c1a,
      metalness: 0.1,
      roughness: 0.9,
    });

    const group = new THREE.Group();
    const gridSize = 5;

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        if (Math.random() < 0.3) continue;
        const h = 2 + Math.random() * 14;
        const w = 0.6 + Math.random() * 0.8;
        const d = 0.6 + Math.random() * 0.8;
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, buildingMat);
        mesh.position.set(
          x * 2.5 + (Math.random() - 0.5) * 0.8,
          h / 2,
          z * 2.5 + (Math.random() - 0.5) * 0.8
        );
        group.add(mesh);
      }
    }

    scene.add(group);

    // Animation
    let frame: number;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      group.rotation.y += 0.0012;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
