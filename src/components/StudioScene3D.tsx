import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { Eye, EyeOff, Layers, RotateCcw, Box } from 'lucide-react';

type SculptureMode = 'assembled' | 'exploded' | 'wireframe';
type ThemeMode = 'dark' | 'light';

// Pre-allocated scratch helpers outside animation loop (zero GC)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3(1, 1, 1);
const _color = new THREE.Color();
const _darkBgColor = new THREE.Color(0x080b1a);
const _lightBgColor = new THREE.Color(0xeef3ff);
const _darkGroundColor = new THREE.Color(0x080b1a);
const _lightGroundColor = new THREE.Color(0xdbe4ff);

function createStudioGridTexture(maxAnisotropy: number, mode: ThemeMode): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = mode === 'dark' ? '#080B1A' : '#EEF3FF';
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;

    // Subtle radial gradient floor glow
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, size * 0.48);
    grad.addColorStop(0, 'rgba(57, 123, 255, 0.22)');
    grad.addColorStop(0.45, 'rgba(133, 85, 255, 0.08)');
    grad.addColorStop(1, 'rgba(8, 11, 26, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Concentric calibration rings
    ctx.strokeStyle = mode === 'dark' ? 'rgba(162, 169, 195, 0.14)' : 'rgba(57, 123, 255, 0.18)';
    ctx.lineWidth = 1;
    for (const r of [64, 128, 192, 238]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Subtle crosshairs
    ctx.strokeStyle = mode === 'dark' ? 'rgba(57, 123, 255, 0.16)' : 'rgba(133, 85, 255, 0.22)';
    ctx.beginPath();
    ctx.moveTo(cx, 16);
    ctx.lineTo(cx, size - 16);
    ctx.moveTo(16, cy);
    ctx.lineTo(size - 16, cy);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const cx = size / 2;
    const grad = ctx.createRadialGradient(cx, cx, 8, cx, cx, cx);
    grad.addColorStop(0, 'rgba(3, 5, 14, 0.92)');
    grad.addColorStop(0.5, 'rgba(8, 11, 26, 0.45)');
    grad.addColorStop(1, 'rgba(8, 11, 26, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export default function StudioScene3D({ theme }: { theme: ThemeMode }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const modeRef = useRef<SculptureMode>('assembled');
  const themeRef = useRef<ThemeMode>(theme);
  const resetTriggerRef = useRef<number>(0);

  const [mode, setMode] = useState<SculptureMode>('assembled');
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const handleModeChange = (nextMode: SculptureMode) => {
    modeRef.current = nextMode;
    setMode(nextMode);
  };

  const handleResetCamera = () => {
    resetTriggerRef.current += 1;
    handleModeChange('assembled');
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let cleanupFn: (() => void) | undefined;

    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Detect software WebGL strictly via GPU renderer string
      const isSoftwareGl = (() => {
        try {
          const probeCanvas = document.createElement('canvas');
          const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
          if (!gl) return true;
          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
          const gpu = String(gl.getParameter(param));
          gl.getExtension('WEBGL_lose_context')?.loseContext();
          return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
        } catch {
          return true;
        }
      })();

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const isInitLight = themeRef.current === 'light';
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isInitLight ? 0xeef3ff : 0x080b1a);
    scene.fog = new THREE.FogExp2(isInitLight ? 0xeef3ff : 0x080b1a, 0.042);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const defaultCamPos = new THREE.Vector3(3.4, 2.35, 5.25);
    const defaultTarget = new THREE.Vector3(-0.9, 1.35, 0);
    camera.position.copy(defaultCamPos);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    // Mandatory studio environment reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    // 3-Point + Softbox Lighting Rig
    const hemiLight = new THREE.HemisphereLight(
      0x397bff,
      isInitLight ? 0xdbe4ff : 0x080b1a,
      isInitLight ? 1.05 : 0.85
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe8d1, 2.1);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -4.5;
    keyLight.shadow.camera.right = 4.5;
    keyLight.shadow.camera.top = 4.5;
    keyLight.shadow.camera.bottom = -4.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8555ff, 1.8);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    let rectLight: THREE.RectAreaLight | null = null;
    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      rectLight = new THREE.RectAreaLight(0x397bff, 3.6, 3.5, 2.2);
      rectLight.position.set(2.5, 3.2, 3.2);
      rectLight.lookAt(0, 1.35, 0);
      scene.add(rectLight);
    }

    // Track disposables cleanly
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];
    const texturesToDispose: THREE.Texture[] = [];

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const darkGridTexture = createStudioGridTexture(maxAniso, 'dark');
    const lightGridTexture = createStudioGridTexture(maxAniso, 'light');
    const contactShadowTexture = createContactShadowTexture();
    texturesToDispose.push(darkGridTexture, lightGridTexture, contactShadowTexture);

    // Ground plane with studio grid
    const floorGeo = new THREE.CircleGeometry(9, 64);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: isInitLight ? lightGridTexture : darkGridTexture,
      roughness: 0.72,
      metalness: 0.25,
      envMapIntensity: 0.5,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    geometriesToDispose.push(floorGeo);
    materialsToDispose.push(floorMat);

    // Soft radial contact shadow directly under sculpture
    const shadowGeo = new THREE.PlaneGeometry(3.8, 3.8);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.set(0.75, 0.02, 0);
    scene.add(shadowPlane);
    geometriesToDispose.push(shadowGeo);
    materialsToDispose.push(shadowMat);

    // =====================================================
    // COMPOSITE 9-PART PROCEDURAL STUDIO MONOLITH GROUP
    // =====================================================
    const monolithGroup = new THREE.Group();
    // Offset right slightly on desktop so hero left-column typography stays unobstructed
    monolithGroup.position.set(0.75, 0, 0);
    scene.add(monolithGroup);

    // Shared Materials (varied roughness & metalness >= 0.25 between adjacent parts)
    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x10152b,
      roughness: 0.48,
      metalness: 0.35,
    });

    const brushedTitaniumMat = new THREE.MeshPhysicalMaterial({
      color: 0x9aa8d6,
      metalness: 0.94,
      roughness: 0.16,
      anisotropy: 0.8,
      anisotropyRotation: Math.PI / 4,
    });

    const electricCoreMat = new THREE.MeshStandardMaterial({
      color: 0x397bff,
      emissive: 0x2458d6,
      emissiveIntensity: 1.45,
      roughness: 0.22,
      metalness: 0.45,
    });

    const violetTrimMat = new THREE.MeshStandardMaterial({
      color: 0x8555ff,
      emissive: 0x5225cc,
      emissiveIntensity: 0.8,
      roughness: 0.28,
      metalness: 0.72,
    });

    const opticalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbe7ff,
      metalness: 0.0,
      roughness: 0.06,
      transmission: isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: isSoftwareGl ? 0.38 : 1,
      ior: 1.54,
      thickness: 1.1,
      attenuationColor: new THREE.Color(0x397bff),
      attenuationDistance: 2.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: isSoftwareGl ? false : true,
    });

    const wireframeOverlayMat = new THREE.MeshBasicMaterial({
      color: 0x397bff,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });

    materialsToDispose.push(
      obsidianMat,
      brushedTitaniumMat,
      electricCoreMat,
      violetTrimMat,
      opticalGlassMat,
      wireframeOverlayMat
    );

    // Part 1: Beveled Octagonal Studio Plinth Base (grounded flush at y = 0)
    const hexShape = new THREE.Shape();
    const baseRadius = 1.15;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const x = Math.cos(a) * baseRadius;
      const y = Math.sin(a) * baseRadius;
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();

    const plinthGeo = new THREE.ExtrudeGeometry(hexShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
    });
    plinthGeo.rotateX(-Math.PI / 2);
    const plinthMesh = new THREE.Mesh(plinthGeo, obsidianMat);
    plinthMesh.position.y = 0.04;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    monolithGroup.add(plinthMesh);
    geometriesToDispose.push(plinthGeo);

    // Part 2: Lathe-Turned Titanium Calibration Collar
    const collarPoints = [
      new THREE.Vector2(0.55, 0),
      new THREE.Vector2(0.86, 0),
      new THREE.Vector2(0.88, 0.08),
      new THREE.Vector2(0.76, 0.18),
      new THREE.Vector2(0.58, 0.18),
      new THREE.Vector2(0.55, 0),
    ];
    const collarGeo = new THREE.LatheGeometry(collarPoints, 48);
    if (collarGeo.index && collarGeo.attributes.normal && collarGeo.attributes.uv) {
      collarGeo.computeTangents();
    }
    const collarMesh = new THREE.Mesh(collarGeo, brushedTitaniumMat);
    collarMesh.position.y = 0.22;
    collarMesh.castShadow = true;
    monolithGroup.add(collarMesh);
    geometriesToDispose.push(collarGeo);

    // Part 3: Inner Faceted Energy Spindle Core + Machined Caps
    const coreGroup = new THREE.Group();
    coreGroup.position.y = 1.35;
    monolithGroup.add(coreGroup);

    const corePrismGeo = new THREE.OctahedronGeometry(0.42, 0);
    corePrismGeo.scale(0.85, 1.45, 0.85);
    const corePrismMesh = new THREE.Mesh(corePrismGeo, electricCoreMat);
    corePrismMesh.castShadow = true;
    coreGroup.add(corePrismMesh);
    geometriesToDispose.push(corePrismGeo);

    const endCapGeo = new THREE.CylinderGeometry(0.14, 0.24, 0.14, 16);
    const topCap = new THREE.Mesh(endCapGeo, brushedTitaniumMat);
    topCap.position.y = 0.62;
    const bottomCap = new THREE.Mesh(endCapGeo, brushedTitaniumMat);
    bottomCap.rotation.x = Math.PI;
    bottomCap.position.y = -0.62;
    coreGroup.add(topCap, bottomCap);
    geometriesToDispose.push(endCapGeo);

    // Part 4: Three Interlocking Beveled Optical Glass Architectural Fins
    const finShape = new THREE.Shape();
    finShape.moveTo(0, -0.78);
    finShape.lineTo(0.48, -0.52);
    finShape.lineTo(0.54, 0.45);
    finShape.lineTo(0.16, 0.84);
    finShape.lineTo(-0.08, 0.65);
    finShape.lineTo(-0.08, -0.68);
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    finGeo.center();
    const finsGroup = new THREE.Group();
    finsGroup.position.y = 1.35;
    monolithGroup.add(finsGroup);
    geometriesToDispose.push(finGeo);

    const finMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const fin = new THREE.Mesh(finGeo, opticalGlassMat);
      const angle = (i / 3) * Math.PI * 2;
      fin.rotation.y = angle;
      fin.position.set(Math.cos(angle) * 0.56, 0, Math.sin(angle) * 0.56);
      fin.renderOrder = 4;
      fin.castShadow = true;
      finsGroup.add(fin);
      finMeshes.push(fin);
    }

    // Part 5: Outer Machined Gimbal Ring
    const gimbalGeo = new THREE.TorusGeometry(1.18, 0.032, 16, 80);
    const gimbalMesh = new THREE.Mesh(gimbalGeo, brushedTitaniumMat);
    gimbalMesh.position.y = 1.35;
    gimbalMesh.rotation.set(Math.PI / 5, Math.PI / 6, 0);
    gimbalMesh.castShadow = true;
    monolithGroup.add(gimbalMesh);
    geometriesToDispose.push(gimbalGeo);

    // Part 6: 24-Element Radial Aperture Vane Array (InstancedMesh)
    const vaneGeo = new THREE.BoxGeometry(0.045, 0.16, 0.025);
    const vaneCount = 24;
    const vaneMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.82,
    });
    const vaneInstanced = new THREE.InstancedMesh(vaneGeo, vaneMat, vaneCount);
    vaneInstanced.position.y = 0.44;
    vaneInstanced.frustumCulled = false;

    for (let i = 0; i < vaneCount; i++) {
      const angle = (i / vaneCount) * Math.PI * 2;
      const r = 0.72;
      _vec3A.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      _euler.set(0.25, -angle, 0.15);
      _quat.setFromEuler(_euler);
      const s = 0.9 + (i % 3) * 0.1;
      _scale.set(1, s, 1);
      _mat4.compose(_vec3A, _quat, _scale);
      vaneInstanced.setMatrixAt(i, _mat4);
      _color.setHex(i % 2 === 0 ? 0x397bff : 0x8555ff);
      vaneInstanced.setColorAt(i, _color);
    }
    vaneInstanced.instanceMatrix.needsUpdate = true;
    if (vaneInstanced.instanceColor) vaneInstanced.instanceColor.needsUpdate = true;
    vaneInstanced.computeBoundingSphere();
    monolithGroup.add(vaneInstanced);
    geometriesToDispose.push(vaneGeo);
    materialsToDispose.push(vaneMat);

    // Part 7: Curved Orbital Light-Guide Spline (TubeGeometry)
    const orbitPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * Math.PI * 2;
      orbitPoints.push(
        new THREE.Vector3(
          Math.cos(t) * 1.48,
          1.35 + Math.sin(t * 2) * 0.34,
          Math.sin(t) * 1.48
        )
      );
    }
    const orbitCurve = new THREE.CatmullRomCurve3(orbitPoints, true);
    const orbitTubeGeo = new THREE.TubeGeometry(orbitCurve, 96, 0.015, 10, true);
    const orbitTubeMesh = new THREE.Mesh(orbitTubeGeo, violetTrimMat);
    monolithGroup.add(orbitTubeMesh);
    geometriesToDispose.push(orbitTubeGeo);

    // Part 8: Three Calibrated Satellite Beacon Nodes along the Orbital Path
    const beaconGeo = new THREE.OctahedronGeometry(0.065, 1);
    const beaconMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(beaconGeo, i === 0 ? electricCoreMat : brushedTitaniumMat);
      monolithGroup.add(b);
      beaconMeshes.push(b);
    }
    geometriesToDispose.push(beaconGeo);

    // Pre-compile shaders on GPU devices
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // OrbitControls with damping (zoom disabled so page scrolling remains smooth)
    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(defaultTarget);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.minPolarAngle = Math.PI / 6;

    let userInteracting = false;
    const onControlStart = () => {
      userInteracting = true;
    };
    const onControlEnd = () => {
      userInteracting = false;
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('end', onControlEnd);

    // Subtle pointer tilt tracking
    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerTarget.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerTarget.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // ResizeObserver for responsive container sizing
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));

      // Center monolith on narrow mobile screens, shift right on desktop
      if (w < 768) {
        monolithGroup.position.x = 0;
        defaultTarget.set(0, 1.35, 0);
      } else {
        monolithGroup.position.x = 0.78;
        defaultTarget.set(-0.9, 1.35, 0);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // State animation tracking
    let explodeFactor = 0;
    let themeBlend = isInitLight ? 1 : 0;
    let lastAppliedTheme: ThemeMode = themeRef.current;
    let lastResetCount = resetTriggerRef.current;
    let resettingCamera = false;
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function applyWireframeState(isWire: boolean) {
      const targetFinMat = isWire ? wireframeOverlayMat : opticalGlassMat;
      for (const fin of finMeshes) {
        if (fin.material !== targetFinMat) fin.material = targetFinMat;
      }
      obsidianMat.wireframe = isWire;
      brushedTitaniumMat.wireframe = isWire;
      corePrismMatSwitch(isWire);
    }

    function corePrismMatSwitch(isWire: boolean) {
      electricCoreMat.wireframe = isWire;
      violetTrimMat.wireframe = isWire;
    }

    function tick() {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Check camera reset trigger
      if (resetTriggerRef.current !== lastResetCount) {
        lastResetCount = resetTriggerRef.current;
        resettingCamera = true;
      }

      if (resettingCamera && !userInteracting) {
        const dampLambda = 6;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, defaultCamPos.x, dampLambda, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, defaultCamPos.y, dampLambda, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, defaultCamPos.z, dampLambda, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, defaultTarget.x, dampLambda, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, defaultTarget.y, dampLambda, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, defaultTarget.z, dampLambda, dt);
        if (camera.position.distanceTo(defaultCamPos) < 0.02) {
          resettingCamera = false;
        }
      } else if (userInteracting) {
        resettingCamera = false;
      }

      const activeMode = modeRef.current;
      const targetExplode = activeMode === 'exploded' ? 1 : 0;
      explodeFactor = THREE.MathUtils.damp(explodeFactor, targetExplode, 5.5, dt);
      applyWireframeState(activeMode === 'wireframe');

      // Damped pointer parallax
      pointerCurrent.x = THREE.MathUtils.damp(pointerCurrent.x, pointerTarget.x, 4, dt);
      pointerCurrent.y = THREE.MathUtils.damp(pointerCurrent.y, pointerTarget.y, 4, dt);

      const motionScale = prefersReducedMotion ? 0 : 1;

      // Animate composite layers cleanly using zero-GC math
      coreGroup.rotation.y = elapsed * 0.45 * motionScale;
      coreGroup.position.y = 1.35 + Math.sin(elapsed * 1.4) * 0.05 * motionScale + explodeFactor * 0.42;

      finsGroup.rotation.y = -elapsed * 0.18 * motionScale + pointerCurrent.x * 0.14 * motionScale;
      finsGroup.rotation.x = pointerCurrent.y * 0.08 * motionScale;
      finsGroup.position.y = 1.35 + explodeFactor * 0.25;

      for (let i = 0; i < finMeshes.length; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const radius = 0.56 + explodeFactor * 0.58;
        finMeshes[i].position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      }

      gimbalMesh.rotation.y = elapsed * 0.28 * motionScale;
      gimbalMesh.rotation.z = elapsed * 0.16 * motionScale;
      gimbalMesh.position.y = 1.35 + explodeFactor * 0.18;

      collarMesh.position.y = 0.22 + explodeFactor * 0.15;
      vaneInstanced.position.y = 0.44 + explodeFactor * 0.35;
      vaneInstanced.rotation.y = elapsed * 0.12 * motionScale;

      // Update orbiting satellite beacons along the spline
      for (let i = 0; i < beaconMeshes.length; i++) {
        const u = ((elapsed * 0.08 * motionScale + i / 3) % 1 + 1) % 1;
        orbitCurve.getPointAt(u, _vec3B);
        beaconMeshes[i].position.copy(_vec3B);
        beaconMeshes[i].rotation.y = elapsed * 1.2 * motionScale;
      }

      // Update theme background, fog, and floor texture smoothly without rebuilding WebGL
      const currentTheme = themeRef.current;
      if (currentTheme !== lastAppliedTheme) {
        lastAppliedTheme = currentTheme;
        floorMat.map = currentTheme === 'light' ? lightGridTexture : darkGridTexture;
        floorMat.needsUpdate = true;
      }
      const targetThemeBlend = currentTheme === 'light' ? 1 : 0;
      themeBlend = THREE.MathUtils.damp(themeBlend, targetThemeBlend, 6, dt);
      if (scene.background instanceof THREE.Color) {
        scene.background.copy(_darkBgColor).lerp(_lightBgColor, themeBlend);
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(_darkBgColor).lerp(_lightBgColor, themeBlend);
      }
      hemiLight.groundColor.copy(_darkGroundColor).lerp(_lightGroundColor, themeBlend);
      hemiLight.intensity = 0.85 + themeBlend * 0.2;
      shadowMat.opacity = 0.55 - themeBlend * 0.28;

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

      tick();

      cleanupFn = () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', handleResize);
        controls.removeEventListener('start', onControlStart);
        controls.removeEventListener('end', onControlEnd);
        controls.dispose();
        canvas.removeEventListener('webglcontextlost', onContextLost);
        canvas.removeEventListener('webglcontextrestored', onContextRestored);

        geometriesToDispose.forEach((g) => g.dispose());
        materialsToDispose.forEach((m) => m.dispose());
        texturesToDispose.forEach((t) => t.dispose());
        envRT.dispose();
        renderer.dispose();
        if (canvas.parentElement === container) {
          container.removeChild(canvas);
        }
      };
    } catch {
      setContextLost(true);
    }

    return () => {
      cleanupFn?.();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Isolated WebGL mount container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D architectural prism sculpture representing WebFlow Creative Studio"
      />

      {/* WebGL Unavailable / Context Lost Architectural Fallback */}
      {contextLost && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#EEF3FF] dark:bg-[#080B1A]"
          style={{
            backgroundImage:
              theme === 'dark'
                ? 'radial-gradient(circle at 72% 45%, rgba(57, 123, 255, 0.22), rgba(133, 85, 255, 0.14) 32%, transparent 65%)'
                : 'radial-gradient(circle at 72% 45%, rgba(57, 123, 255, 0.18), rgba(133, 85, 255, 0.1) 32%, transparent 65%)',
          }}
        />
      )}

      {/* Collapsible Compact Bottom Control Dock (solid rgba surface, no backdrop-filter over WebGL) */}
      <div className="absolute bottom-5 right-4 sm:right-8 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => setControlsCollapsed((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] border border-slate-300 dark:border-white/10 transition-colors"
          style={{
            backgroundColor:
              theme === 'dark' ? 'rgba(16, 21, 43, 0.92)' : 'rgba(255, 255, 255, 0.94)',
          }}
          aria-expanded={!controlsCollapsed}
        >
          {controlsCollapsed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{controlsCollapsed ? '3D Controls' : 'Hide Controls'}</span>
        </button>

        {!controlsCollapsed && (
          <div
            className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border border-slate-300 dark:border-white/12 shadow-2xl"
            style={{
              backgroundColor:
                theme === 'dark' ? 'rgba(16, 21, 43, 0.92)' : 'rgba(255, 255, 255, 0.94)',
            }}
            role="toolbar"
            aria-label="3D Sculpture Controls"
          >
            <button
              type="button"
              onClick={() => handleModeChange('assembled')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                mode === 'assembled'
                  ? 'bg-[#397BFF] text-white'
                  : 'text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] hover:bg-slate-200/60 dark:hover:bg-white/5'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Assemble</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('exploded')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                mode === 'exploded'
                  ? 'bg-[#397BFF] text-white'
                  : 'text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] hover:bg-slate-200/60 dark:hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Explode Layers</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('wireframe')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                mode === 'wireframe'
                  ? 'bg-[#8555FF] text-white'
                  : 'text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] hover:bg-slate-200/60 dark:hover:bg-white/5'
              }`}
            >
              <span>Wireframe</span>
            </button>

            <button
              type="button"
              onClick={handleResetCamera}
              title="Reset 3D Camera"
              aria-label="Reset 3D Camera"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
