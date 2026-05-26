(function() {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0.5, 5);
  camera.lookAt(0, 0, 0);

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  // ── Lighting ──
  const ambient = new THREE.AmbientLight(0x112244, 0.3);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0x4488ff, 1.5);
  mainLight.position.set(2, 3, 4);
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0x00ccff, 0.8);
  rimLight.position.set(-3, 1, -2);
  scene.add(rimLight);

  const bottomLight = new THREE.PointLight(0xff3333, 0.6, 5);
  bottomLight.position.set(0, -1.5, 0);
  scene.add(bottomLight);

  // ── Create Realistic Fish ──
  const fishGroup = new THREE.Group();

  // Body: custom geometry for elongated tetra shape
  function createBody() {
    const segments = 24;
    const rings = 16;
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    const len = 1.6;
    const maxR = 0.32;

    for (let j = 0; j <= rings; j++) {
      const t = j / rings;
      const theta = t * Math.PI;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      // Body profile: elongated oval
      const xPos = -len / 2 + t * len;
      let r = maxR * Math.sin(theta) * Math.sin(theta);
      if (r < 0.01) r = 0.01;

      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI * 2;
        const x = xPos;
        const y = r * Math.sin(phi) * 0.7;
        const z = r * Math.cos(phi);

        positions.push(x, y, z);

        const nx = xPos > len / 4 ? 0.3 : 0;
        const ny = y;
        const nz = z;
        const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        normals.push(nx / nLen, ny / nLen, nz / nLen);

        uvs.push(i / segments, j / rings);

        // Vertex colors: neon stripe + red belly
        const yAbs = Math.abs(y);
        const zAbs = Math.abs(z);
        const distFromCenter = Math.sqrt(y * y + z * z) / (maxR || 1);

        if (y > -0.05 && y < 0.15 && zAbs > 0.05 && distFromCenter > 0.4) {
          // Cyan stripe
          colors.push(0, 0.95, 1);
        } else if (y < -0.02 && zAbs > 0.05 && distFromCenter > 0.35) {
          // Red belly
          colors.push(1, 0.2, 0.2);
        } else {
          // Dark body
          const bright = 0.12 + distFromCenter * 0.15;
          colors.push(bright * 1.2, bright * 1.5, bright * 1.8);
        }
      }
    }

    for (let j = 0; j < rings; j++) {
      for (let i = 0; i < segments; i++) {
        const a = j * (segments + 1) + i;
        const b = a + segments + 1;
        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }

    geo.setIndex(indices);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return geo;
  }

  const bodyMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.3,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.6,
    side: THREE.DoubleSide
  });

  const body = new THREE.Mesh(createBody(), bodyMat);
  body.position.x = 0.2;
  fishGroup.add(body);

  // Tail fin (forked)
  function createTail() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(-0.3, -0.4, -0.7, -0.35);
    shape.quadraticCurveTo(-0.5, -0.15, -0.3, 0);
    shape.quadraticCurveTo(-0.5, 0.15, -0.7, 0.35);
    shape.quadraticCurveTo(-0.3, 0.4, 0, 0);

    const geo = new THREE.ShapeGeometry(shape);
    return geo;
  }

  const tailMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a2638,
    transparent: true,
    opacity: 0.75,
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const tail = new THREE.Mesh(createTail(), tailMat);
  tail.position.x = -0.6;
  fishGroup.add(tail);

  // Dorsal fin
  function createDorsal() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.05, 0.25, -0.1, 0.4);
    shape.quadraticCurveTo(-0.15, 0.3, -0.2, 0.1);
    shape.quadraticCurveTo(-0.1, 0.05, 0, 0);
    return new THREE.ShapeGeometry(shape);
  }

  const finMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a3050,
    transparent: true,
    opacity: 0.5,
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  const dorsal = new THREE.Mesh(createDorsal(), finMat);
  dorsal.position.set(0.1, 0.3, 0);
  fishGroup.add(dorsal);

  // Pectoral fins
  function createPectoral() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.1, -0.12, 0.2, -0.08);
    shape.quadraticCurveTo(0.1, -0.02, 0, 0);
    return new THREE.ShapeGeometry(shape);
  }

  const pMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a3050,
    transparent: true,
    opacity: 0.45,
    roughness: 0.7,
    side: THREE.DoubleSide
  });
  const pLeft = new THREE.Mesh(createPectoral(), pMat);
  pLeft.position.set(0.4, -0.05, -0.25);
  fishGroup.add(pLeft);
  const pRight = pLeft.clone();
  pRight.position.z = 0.25;
  fishGroup.add(pRight);

  // Eyes
  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    roughness: 0.1,
    metalness: 0.8,
    envMapIntensity: 1
  });
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
  eye.position.set(0.75, 0.08, 0.2);
  fishGroup.add(eye);
  const eye2 = eye.clone();
  eye2.position.z = -0.2;
  fishGroup.add(eye2);

  // Neon glow aura (emissive)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide
  });
  const glowBody = new THREE.Mesh(createBody(), glowMat);
  glowBody.scale.set(1.15, 1.15, 1.15);
  glowBody.position.x = 0.2;
  fishGroup.add(glowBody);

  // Tail glow
  const tailGlowShape = new THREE.Shape();
  tailGlowShape.moveTo(0, 0);
  tailGlowShape.quadraticCurveTo(-0.4, -0.5, -0.9, -0.45);
  tailGlowShape.quadraticCurveTo(-0.6, -0.2, -0.4, 0);
  tailGlowShape.quadraticCurveTo(-0.6, 0.2, -0.9, 0.45);
  tailGlowShape.quadraticCurveTo(-0.4, 0.5, 0, 0);
  const tailGlowGeo = new THREE.ShapeGeometry(tailGlowShape);
  const tailGlowMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.05,
    side: THREE.DoubleSide
  });
  const tailGlow = new THREE.Mesh(tailGlowGeo, tailGlowMat);
  tailGlow.position.x = -0.6;
  fishGroup.add(tailGlow);

  // Scale and position the fish
  fishGroup.scale.set(0.6, 0.6, 0.6);
  fishGroup.position.y = 0.2;

  scene.add(fishGroup);

  // ── Bioluminescent Particles ──
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  const pPositions = new Float32Array(particleCount * 3);
  const pSizes = new Float32Array(particleCount);
  const pSpeeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 8;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 4 + 0.5;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    pSizes[i] = 1 + Math.random() * 3;
    pSpeeds[i] = 0.1 + Math.random() * 0.3;
  }

  particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPositions, 3));
  particleGeo.setAttribute('size', new THREE.Float32BufferAttribute(pSizes, 1));

  const particleMat = new THREE.PointsMaterial({
    color: 0x66ddff,
    size: 0.03,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Mouse Tracking ──
  let mouseX = 0;
  let mouseY = 0;
  let targetRotY = 0;
  let targetRotX = 0;
  let currentRotY = 0;
  let currentRotX = 0;

  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    targetRotY = mouseX * 0.5;
    targetRotX = mouseY * 0.2;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      mouseX = ((t.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((t.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotY = mouseX * 0.5;
      targetRotX = mouseY * 0.2;
    }
  }, { passive: true });

  // ── Animation Loop ──
  let time = 0;

  function animate() {
    resize();
    time += 0.016;

    // Fish subtle idle animation
    fishGroup.position.y = 0.2 + Math.sin(time * 0.8) * 0.05;
    fishGroup.rotation.z = Math.sin(time * 0.6) * 0.02;

    // Smooth mouse follow
    currentRotY += (targetRotY - currentRotY) * 0.05;
    currentRotX += (targetRotX - currentRotX) * 0.05;
    fishGroup.rotation.y = currentRotY;
    fishGroup.rotation.x = currentRotX * 0.5;

    // Tail idle wag
    tail.rotation.y = Math.sin(time * 3) * 0.15;
    tailGlow.rotation.y = tail.rotation.y;

    // Pulse glow opacity
    glowBody.material.opacity = 0.06 + Math.sin(time * 1.2) * 0.03;
    tailGlow.material.opacity = 0.04 + Math.sin(time * 1.2 + 0.5) * 0.025;

    // Belly light pulse
    bottomLight.intensity = 0.5 + Math.sin(time * 0.7) * 0.2;

    // Animate particles
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += pSpeeds[i] * 0.004;
      pos[i * 3] += Math.sin(time + i) * 0.001;
      pos[i * 3 + 2] += Math.cos(time + i * 0.5) * 0.001;

      if (pos[i * 3 + 1] > 3) {
        pos[i * 3 + 1] = -1;
        pos[i * 3] = (Math.random() - 0.5) * 8;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Camera subtle orbit
    const camX = Math.sin(time * 0.1) * 0.3;
    const camZ = Math.cos(time * 0.1) * 0.3;
    camera.position.x = camX;
    camera.position.z = 5 + camZ;
    camera.lookAt(0, 0.2, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // ── Resize ──
  window.addEventListener('resize', resize);

  // Initial resize
  resize();
})();
