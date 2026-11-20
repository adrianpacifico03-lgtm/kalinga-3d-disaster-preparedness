import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw } from 'lucide-react';
import {
  attachStudioEnvironment,
  createAfterDrawHelper,
  createStudioRenderer,
  detectSoftwareGl,
  disposeObject3D,
} from './webglUtils';

interface EmergencyKit3DProps {
  checkedIds: string[];
  className?: string;
}

export const EmergencyKit3D: React.FC<EmergencyKit3DProps> = ({
  checkedIds,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const checkedRef = useRef<string[]>(checkedIds);
  const requestRenderRef = useRef<(() => void) | null>(null);
  const resetViewRef = useRef<(() => void) | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    checkedRef.current = checkedIds;
    requestRenderRef.current?.();
  }, [checkedIds]);

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

    const width = Math.max(container.clientWidth, 240);
    const height = Math.max(container.clientHeight, 200);
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, 2.15, 4.9);
    camera.lookAt(0, 0.25, 0);

    // 3-point Studio Lighting
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x071426, 0.85);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff4e6, 1.85);
    key.position.set(3.5, 5.5, 4);
    if (!isSoftwareGl) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.bias = -0.0005;
      key.shadow.normalBias = 0.02;
    }
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x14b8a6, 1.25);
    rim.position.set(-4, 2.5, -3);
    scene.add(rim);

    const kitGroup = new THREE.Group();
    scene.add(kitGroup);

    // 1. Chamfered Pedestal Base
    const baseGeo = new THREE.CylinderGeometry(1.95, 2.12, 0.22, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0c1e38,
      metalness: 0.45,
      roughness: 0.45,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.11;
    baseMesh.receiveShadow = !isSoftwareGl;
    kitGroup.add(baseMesh);

    const ringGeo = new THREE.TorusGeometry(1.96, 0.025, 10, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      metalness: 0.7,
      roughness: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.01;
    kitGroup.add(ringMesh);

    // 2. Tactical Backpack (centerpiece)
    const packGroup = new THREE.Group();
    kitGroup.add(packGroup);

    const packBodyGeo = new THREE.BoxGeometry(1.12, 1.28, 0.62);
    const packBodyMat = new THREE.MeshStandardMaterial({
      color: 0x163159,
      roughness: 0.72,
      metalness: 0.15,
    });
    const packBody = new THREE.Mesh(packBodyGeo, packBodyMat);
    packBody.position.set(0, 0.66, -0.12);
    packBody.castShadow = !isSoftwareGl;
    packGroup.add(packBody);

    const packPocketGeo = new THREE.BoxGeometry(0.86, 0.56, 0.2);
    const packPocketMat = new THREE.MeshStandardMaterial({
      color: 0x0e8a8f,
      roughness: 0.55,
      metalness: 0.2,
    });
    const packPocket = new THREE.Mesh(packPocketGeo, packPocketMat);
    packPocket.position.set(0, 0.44, 0.24);
    packGroup.add(packPocket);

    const handleGeo = new THREE.TorusGeometry(0.18, 0.04, 10, 20, Math.PI);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xfb923c,
      roughness: 0.4,
      metalness: 0.2,
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, 1.32, -0.12);
    packGroup.add(handle);

    // Tracked individual kit sub-props mapped to checklist items
    interface TrackedPart {
      group: THREE.Group;
      baseY: number;
      itemIds: string[];
      matToHighlight: THREE.MeshStandardMaterial;
      defaultEmissive: number;
    }
    const trackedParts: TrackedPart[] = [];

    // 3. Stainless Steel Water Bottle (left)
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(-1.12, 0, 0.28);
    const bottleMat = new THREE.MeshPhysicalMaterial({
      color: 0xcbd5e1,
      metalness: 0.88,
      roughness: 0.18,
      clearcoat: 0.5,
    });
    const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.76, 20), bottleMat);
    bottleBody.position.y = 0.38;
    bottleGroup.add(bottleBody);
    const bottleNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.2, 0.16, 20), bottleMat);
    bottleNeck.position.y = 0.84;
    bottleGroup.add(bottleNeck);
    const bottleCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x14b8a6, roughness: 0.35 })
    );
    bottleCap.position.y = 0.96;
    bottleGroup.add(bottleCap);
    kitGroup.add(bottleGroup);
    trackedParts.push({
      group: bottleGroup,
      baseY: 0,
      itemIds: ['water'],
      matToHighlight: bottleMat,
      defaultEmissive: 0x000000,
    });

    // 4. First-Aid Pouch (right front)
    const medGroup = new THREE.Group();
    medGroup.position.set(1.06, 0, 0.32);
    medGroup.rotation.y = -0.35;
    const medMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.45,
      metalness: 0.1,
    });
    const medBox = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.54, 0.3), medMat);
    medBox.position.y = 0.27;
    medGroup.add(medBox);
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.04), crossMat);
    crossV.position.set(0, 0.28, 0.16);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.04), crossMat);
    crossH.position.set(0, 0.28, 0.16);
    medGroup.add(crossV, crossH);
    kitGroup.add(medGroup);
    trackedParts.push({
      group: medGroup,
      baseY: 0,
      itemIds: ['first-aid', 'hygiene'],
      matToHighlight: medMat,
      defaultEmissive: 0x000000,
    });

    // 5. LED Flashlight (front-left)
    const torchGroup = new THREE.Group();
    torchGroup.position.set(-0.62, 0, 0.86);
    torchGroup.rotation.z = Math.PI / 2;
    torchGroup.rotation.y = 0.4;
    const torchMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.25,
    });
    const torchShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.56, 16), torchMat);
    torchGroup.add(torchShaft);
    const torchHead = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.16, 16), torchMat);
    torchHead.position.y = 0.34;
    torchGroup.add(torchHead);
    const torchLensMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.4,
      roughness: 0.1,
    });
    const torchLens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), torchLensMat);
    torchLens.rotation.x = -Math.PI / 2;
    torchLens.position.y = 0.425;
    torchGroup.add(torchLens);
    torchGroup.position.y = 0.12;
    kitGroup.add(torchGroup);
    trackedParts.push({
      group: torchGroup,
      baseY: 0.12,
      itemIds: ['flashlight', 'batteries'],
      matToHighlight: torchLensMat,
      defaultEmissive: 0xfacc15,
    });

    // 6. Power Bank (front-center)
    const pbGroup = new THREE.Group();
    pbGroup.position.set(0.18, 0.09, 0.86);
    pbGroup.rotation.y = 0.15;
    const pbMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.65,
      roughness: 0.28,
    });
    const pbBox = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.72), pbMat);
    pbGroup.add(pbBox);
    const pbLedMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.5,
    });
    const pbLed = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.06), pbLedMat);
    pbLed.position.set(0, 0.085, 0.2);
    pbGroup.add(pbLed);
    kitGroup.add(pbGroup);
    trackedParts.push({
      group: pbGroup,
      baseY: 0.09,
      itemIds: ['power-bank'],
      matToHighlight: pbLedMat,
      defaultEmissive: 0x14b8a6,
    });

    // 7. Waterproof Document Folio (back-right beside backpack)
    const docGroup = new THREE.Group();
    docGroup.position.set(0.86, 0, -0.45);
    docGroup.rotation.y = 0.3;
    const docMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      roughness: 0.4,
      metalness: 0.2,
    });
    const docMesh = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.72, 0.12), docMat);
    docMesh.position.y = 0.36;
    docGroup.add(docMesh);
    kitGroup.add(docGroup);
    trackedParts.push({
      group: docGroup,
      baseY: 0,
      itemIds: ['important-documents', 'emergency-cash', 'emergency-contacts'],
      matToHighlight: docMat,
      defaultEmissive: 0x000000,
    });

    // Orbit Drag + Smooth Damping
    let targetYaw = -0.32;
    let curYaw = -0.32;
    let isDragging = false;
    let lastX = 0;

    let frameId = 0;
    let timerId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    const afterDraw = createAfterDrawHelper(renderer, isSoftwareGl, (id) => {
      timerId = id;
    });

    let lastTimeMs = performance.now();

    const drawFrame = () => {
      if (disposed) return;
      renderDirty = false;
      const nowMs = performance.now();
      const dt = Math.min((nowMs - lastTimeMs) / 1000, 0.05);
      lastTimeMs = nowMs;

      curYaw = THREE.MathUtils.damp(curYaw, targetYaw, 8, dt);
      kitGroup.rotation.y = curYaw;

      const activeSet = new Set(checkedRef.current);
      let anyPartMoving = false;
      for (const part of trackedParts) {
        const isPacked = part.itemIds.some((id) => activeSet.has(id));
        const targetY = part.baseY + (isPacked ? 0.14 : 0);
        const nextY = THREE.MathUtils.damp(part.group.position.y, targetY, 8, dt);
        if (Math.abs(nextY - targetY) > 0.002) anyPartMoving = true;
        part.group.position.y = nextY;
        part.matToHighlight.emissive.setHex(
          isPacked ? (part.defaultEmissive || 0x0d9488) : part.defaultEmissive
        );
        part.matToHighlight.emissiveIntensity = isPacked ? 0.55 : 0.12;
      }

      renderer.render(scene, camera);

      const settled =
        !isDragging && !anyPartMoving && Math.abs(curYaw - targetYaw) < 0.002;

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
    resetViewRef.current = () => {
      targetYaw = -0.32;
      requestRender();
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      renderer.domElement.setPointerCapture?.(e.pointerId);
      requestRender();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      targetYaw += dx * 0.012;
      requestRender();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      renderer.domElement.releasePointerCapture?.(e.pointerId);
      requestRender();
    };

    const onResize = () => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 240);
      const h = Math.max(container.clientHeight, 200);
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

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
      resizeObs.disconnect();
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      disposeObject3D(scene);
      envTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0A1A33] to-[#071426] border border-slate-700/60 kalinga-card-3d ${className}`}
    >
      {webglFailed ? (
        <img
          src="/src/assets/images/kalinga_3d_kit_1795175246102.jpg"
          alt="3D Emergency Preparedness Go-Bag Kit"
          className="h-52 w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          ref={mountRef}
          data-testid="emergency-kit-3d"
          data-checked-count={checkedIds.length}
          aria-label="Interactive 3D Emergency Go-Bag Kit — drag to rotate"
          className="h-52 sm:h-60 w-full cursor-grab active:cursor-grabbing select-none"
        />
      )}

      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#071426] border-t border-slate-800/80 text-xs text-slate-300">
        <span className="truncate">Drag 3D Go-Bag to inspect supplies</span>
        <button
          type="button"
          onClick={() => resetViewRef.current?.()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Reset View</span>
        </button>
      </div>
    </div>
  );
};
