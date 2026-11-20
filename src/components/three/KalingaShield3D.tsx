import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  attachStudioEnvironment,
  createAfterDrawHelper,
  createStudioRenderer,
  detectSoftwareGl,
  disposeObject3D,
} from './webglUtils';

interface KalingaShield3DProps {
  progressPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
}

function createShieldShape(scale = 1): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 1.05 * scale);
  s.lineTo(0.84 * scale, 0.72 * scale);
  s.quadraticCurveTo(0.86 * scale, -0.25 * scale, 0, -1.08 * scale);
  s.quadraticCurveTo(-0.86 * scale, -0.25 * scale, -0.84 * scale, 0.72 * scale);
  s.closePath();
  return s;
}

function createBeaconStarShape(outerR: number, innerR: number): THREE.Shape {
  const s = new THREE.Shape();
  const points = 4;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points + Math.PI / 4;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

export const KalingaShield3D: React.FC<KalingaShield3DProps> = ({
  progressPercent = 68,
  size = 'md',
  interactive = true,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(progressPercent);
  const requestRenderRef = useRef<(() => void) | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    progressRef.current = progressPercent;
    requestRenderRef.current?.();
  }, [progressPercent]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = createStudioRenderer(container, isSoftwareGl);
    } catch {
      setWebglFailed(true);
      return;
    }

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const envTex = attachStudioEnvironment(renderer, scene);

    const width = Math.max(container.clientWidth, 160);
    const height = Math.max(container.clientHeight, 160);
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    camera.position.set(0, 0.15, 4.35);
    camera.lookAt(0, 0, 0);

    // Warm key + cool hemisphere + teal rim lighting
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x071426, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e0, 1.9);
    keyLight.position.set(3.2, 4.2, 4.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x14b8a6, 1.4);
    rimLight.position.set(-3.5, 1.8, -3.0);
    scene.add(rimLight);

    // Composite multi-part 3D KALINGA Shield Group
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    // 1. Primary outer armored shell (Deep Midnight Navy brushed alloy)
    const outerGeo = new THREE.ExtrudeGeometry(createShieldShape(1.0), {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 4,
      curveSegments: 24,
    });
    outerGeo.center();
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x0d213f,
      metalness: 0.55,
      roughness: 0.35,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.castShadow = !isSoftwareGl;
    outerMesh.receiveShadow = !isSoftwareGl;
    shieldGroup.add(outerMesh);

    // 2. Metallic Teal chamfered inner bezel
    const midGeo = new THREE.ExtrudeGeometry(createShieldShape(0.84), {
      depth: 0.27,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.035,
      bevelSegments: 3,
      curveSegments: 24,
    });
    midGeo.center();
    const midMat = new THREE.MeshPhysicalMaterial({
      color: 0x14b8a6,
      metalness: 0.72,
      roughness: 0.2,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
    });
    const midMesh = new THREE.Mesh(midGeo, midMat);
    midMesh.position.z = 0.02;
    shieldGroup.add(midMesh);

    // 3. Recessed Deep Navy Inner Crest Plate
    const crestGeo = new THREE.ExtrudeGeometry(createShieldShape(0.71), {
      depth: 0.29,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 2,
      curveSegments: 24,
    });
    crestGeo.center();
    const crestMat = new THREE.MeshStandardMaterial({
      color: 0x08172e,
      metalness: 0.25,
      roughness: 0.65,
    });
    const crestMesh = new THREE.Mesh(crestGeo, crestMat);
    crestMesh.position.z = 0.04;
    shieldGroup.add(crestMesh);

    // 4. Soft Orange 3D Protective Beacon Emblem at core
    const starGeo = new THREE.ExtrudeGeometry(createBeaconStarShape(0.35, 0.14), {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    starGeo.center();
    const starMat = new THREE.MeshPhysicalMaterial({
      color: 0xfb923c,
      emissive: 0xf97316,
      emissiveIntensity: 0.28,
      metalness: 0.35,
      roughness: 0.22,
      clearcoat: 0.9,
    });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.position.set(0, 0.05, 0.21);
    shieldGroup.add(starMesh);

    // 5. Center sapphire/teal precision cap
    const capGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.06, 24);
    capGeo.rotateX(Math.PI / 2);
    const capMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.12,
    });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.set(0, 0.05, 0.31);
    shieldGroup.add(capMesh);

    // 6. Orbital Preparedness Progress Ring (tilted halo behind shield)
    const trackGeo = new THREE.TorusGeometry(1.26, 0.028, 12, 64);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      metalness: 0.6,
      roughness: 0.35,
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = Math.PI * 0.38;
    trackMesh.rotation.y = -Math.PI * 0.14;
    shieldGroup.add(trackMesh);

    let activeArcGeo = new THREE.TorusGeometry(1.26, 0.044, 14, 64, Math.PI * 1.4);
    const activeArcMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x0d9488,
      emissiveIntensity: 0.35,
      metalness: 0.45,
      roughness: 0.25,
    });
    const activeArcMesh = new THREE.Mesh(activeArcGeo, activeArcMat);
    activeArcMesh.rotation.copy(trackMesh.rotation);
    shieldGroup.add(activeArcMesh);

    // 7. Ground contact shadow disc
    const shadowGeo = new THREE.CircleGeometry(1.1, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.position.set(0, -1.25, 0);
    scene.add(shadowDisc);

    // Interaction & Smooth Damping State
    let targetRotY = -0.22;
    let targetRotX = 0.08;
    let curRotY = -0.22;
    let curRotX = 0.08;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastRenderedPct = -1;

    let frameId = 0;
    let timerId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    const afterDraw = createAfterDrawHelper(renderer, isSoftwareGl, (id) => {
      timerId = id;
    });

    const updateProgressArc = (pct: number) => {
      if (pct === lastRenderedPct) return;
      lastRenderedPct = pct;
      const clamped = Math.max(0.05, Math.min(1, pct / 100));
      const newGeo = new THREE.TorusGeometry(
        1.26,
        0.044,
        14,
        64,
        Math.PI * 2 * clamped
      );
      activeArcMesh.geometry.dispose();
      activeArcMesh.geometry = newGeo;
      activeArcGeo = newGeo;
      activeArcMat.color.setHex(pct >= 75 ? 0x2dd4bf : pct >= 40 ? 0x14b8a6 : 0xfb923c);
    };

    let lastTimeMs = performance.now();

    const drawFrame = () => {
      if (disposed) return;
      renderDirty = false;
      const nowMs = performance.now();
      const dt = Math.min((nowMs - lastTimeMs) / 1000, 0.05);
      lastTimeMs = nowMs;

      updateProgressArc(progressRef.current);

      if (!isDragging) {
        // Gentle spring return toward hero 3/4 showcase angle
        targetRotY = THREE.MathUtils.damp(targetRotY, -0.2, 1.5, dt);
        targetRotX = THREE.MathUtils.damp(targetRotX, 0.08, 1.5, dt);
      }

      curRotY = THREE.MathUtils.damp(curRotY, targetRotY, 8, dt);
      curRotX = THREE.MathUtils.damp(curRotX, targetRotX, 8, dt);

      shieldGroup.rotation.y = curRotY;
      shieldGroup.rotation.x = curRotX;
      starMesh.rotation.z = curRotY * 0.25;

      renderer.render(scene, camera);

      const settled =
        !isDragging &&
        Math.abs(curRotY - targetRotY) < 0.002 &&
        Math.abs(curRotX - targetRotX) < 0.002 &&
        Math.abs(targetRotY - -0.2) < 0.002;

      afterDraw(() => {
        renderBusy = false;
        if (!disposed && (renderDirty || !settled)) {
          requestRender();
        }
      });
    };

    const requestRender = () => {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(drawFrame);
    };

    requestRenderRef.current = requestRender;

    // Initial render
    updateProgressArc(progressRef.current);
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.setPointerCapture?.(e.pointerId);
      requestRender();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      targetRotY += dx * 0.012;
      targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.01, -0.55, 0.55);
      requestRender();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      renderer.domElement.releasePointerCapture?.(e.pointerId);
      requestRender();
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
    };

    const onContextRestored = () => {
      requestRender();
    };

    const onResize = () => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 160);
      const h = Math.max(container.clientHeight, 160);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };

    const resizeObs = new ResizeObserver(onResize);
    resizeObs.observe(container);

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('webglcontextlost', onContextLost);
    dom.addEventListener('webglcontextrestored', onContextRestored);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
      resizeObs.disconnect();
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('webglcontextlost', onContextLost);
      dom.removeEventListener('webglcontextrestored', onContextRestored);
      disposeObject3D(scene);
      activeArcGeo.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  const sizeClass =
    size === 'sm' ? 'h-32 w-32' : size === 'lg' ? 'h-60 w-60' : 'h-44 w-44';

  if (webglFailed) {
    return (
      <div
        className={`flex items-center justify-center rounded-3xl bg-[#0D213F] border border-teal-500/30 ${sizeClass} ${className}`}
        data-testid="kalinga-shield-fallback"
      >
        <svg viewBox="0 0 120 120" className="h-24 w-24" aria-label="KALINGA Shield Emblem">
          <path
            d="M60 10L102 27V58C102 85 83 103 60 112C37 103 18 85 18 58V27L60 10Z"
            fill="#0D213F"
            stroke="#14B8A6"
            strokeWidth="5"
          />
          <path d="M60 34L68 52H86L72 64L78 82L60 71L42 82L48 64L34 52H52L60 34Z" fill="#FB923C" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      data-testid="kalinga-shield-3d"
      data-progress={progressPercent}
      aria-label={`Interactive 3D KALINGA shield showing ${progressPercent}% readiness`}
      className={`relative select-none cursor-grab active:cursor-grabbing ${sizeClass} ${className}`}
    />
  );
};
