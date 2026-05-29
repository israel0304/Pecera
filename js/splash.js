(function() {
  'use strict';

  let active = false;
  let renderer, scene, camera;
  let waterMesh, fishGroup, tailMesh;
  let particles, bubbles;
  let fillProgress = 0;
  let time = 0;

  const PARTICLE_COUNT = 80;
  const BUBBLE_COUNT = 25;
  const TANK_W = 3.0;
  const TANK_H = 2.5;
  const TANK_D = 1.5;

  // ── Scene setup ──
  function initScene() {
    const canvas = document.getElementById('splash-canvas');
    if (!canvas) return;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(3.2, 1.2, 5.5);
    camera.lookAt(0, 0.2, 0);

    const ambient = new THREE.AmbientLight(0x224466, 0.4);
    scene.add(ambient);
    const light = new THREE.DirectionalLight(0x4488ff, 1.8);
    light.position.set(3, 4, 5);
    scene.add(light);
    const rim = new THREE.DirectionalLight(0x00ccff, 0.7);
    rim.position.set(-2, 1, -3);
    scene.add(rim);
    const glow = new THREE.PointLight(0x00aaff, 0.5, 6);
    glow.position.set(0, -1, 0);
    scene.add(glow);

    window.addEventListener('resize', () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    });
  }

  // ── Tank ──
  function initTank() {
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(TANK_W, TANK_H, TANK_D),
      new THREE.MeshPhysicalMaterial({
        color: 0x88ddff, transparent: true, opacity: 0.06,
        roughness: 0, metalness: 0, side: THREE.DoubleSide, depthWrite: false
      })
    );
    scene.add(glass);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(TANK_W, TANK_H, TANK_D)),
      new THREE.LineBasicMaterial({ color: 0x00ddff, transparent: true, opacity: 0.2 })
    );
    scene.add(edges);
  }

  // ── Water ──
  function initWater() {
    waterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(TANK_W * 0.92, TANK_H, TANK_D * 0.92),
      new THREE.MeshPhysicalMaterial({
        color: 0x0077dd, transparent: true, opacity: 0.3,
        roughness: 0.1, metalness: 0, side: THREE.DoubleSide
      })
    );
    waterMesh.scale.y = 0.01;
    waterMesh.position.y = -TANK_H / 2;
    scene.add(waterMesh);
  }

  // ── Fish (same as hero) ──
  function createFish() {
    const group = new THREE.Group();

    const bodyGeo = new THREE.SphereGeometry(0.5, 14, 10);
    bodyGeo.scale(1.8, 0.6, 0.7);
    const pos = bodyGeo.attributes.position;
    const cArr = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const zAbs = Math.abs(pos.getZ(i));
      if (y > 0.05 && y < 0.2 && zAbs > 0.08) {
        cArr[i * 3] = 0; cArr[i * 3 + 1] = 0.83; cArr[i * 3 + 2] = 1;
      } else if (y < -0.05 && zAbs > 0.08) {
        cArr[i * 3] = 1; cArr[i * 3 + 1] = 0.27; cArr[i * 3 + 2] = 0.27;
      } else {
        cArr[i * 3] = 0.17; cArr[i * 3 + 1] = 0.24; cArr[i * 3 + 2] = 0.31;
      }
    }
    bodyGeo.setAttribute('color', new THREE.Float32BufferAttribute(cArr, 3));
    const bodyMat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 25 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.x = 0.3;
    group.add(body);

    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0); tailShape.lineTo(-0.5, -0.3); tailShape.lineTo(-0.5, 0.3); tailShape.closePath();
    tailMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(tailShape),
      new THREE.MeshPhongMaterial({ color: 0x2C3E50, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    tailMesh.position.x = -0.7;
    group.add(tailMesh);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
    eye.position.set(0.9, 0.1, 0.3);
    group.add(eye);
    const eye2 = eye.clone();
    eye2.position.z = -0.3;
    group.add(eye2);

    group.scale.set(0.4, 0.4, 0.4);
    return group;
  }

  function initFish() {
    fishGroup = createFish();
    fishGroup.position.set(0, -0.3, 0);
    scene.add(fishGroup);
  }

  // ── Bioluminescent particles ──
  function initParticles() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * TANK_W * 1.4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * TANK_H;
      pos[i * 3 + 2] = (Math.random() - 0.5) * TANK_D * 1.4;
      sz[i] = 1 + Math.random() * 2;
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sz, 1));
    particles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0x66ddff, size: 0.035, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, sizeAttenuation: true, depthWrite: false
      })
    );
    scene.add(particles);
  }

  // ── Bubbles ──
  function initBubbles() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(BUBBLE_COUNT * 3);
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * TANK_W * 0.7;
      pos[i * 3 + 1] = -TANK_H / 2 + Math.random() * TANK_H * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * TANK_D * 0.7;
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    bubbles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0x88eeff, size: 0.05, transparent: true, opacity: 0.35,
        blending: THREE.AdditiveBlending, sizeAttenuation: true, depthWrite: false
      })
    );
    scene.add(bubbles);
  }

  // ── Render loop ──
  function animate() {
    if (!active) return;
    time += 0.016;

    const f = Math.max(0.01, fillProgress);
    waterMesh.scale.y = f;
    waterMesh.position.y = -TANK_H / 2 + (TANK_H * f) / 2;

    if (fishGroup) {
      const s = Math.sin(time * 0.7) * 0.9;
      const sy = -0.1 + Math.sin(time * 0.9) * 0.2;
      const sz = Math.sin(time * 0.5) * 0.2;
      fishGroup.position.set(s, sy, sz);
      fishGroup.rotation.y = Math.cos(time * 0.7) * 0.4;
      fishGroup.rotation.z = Math.sin(time * 0.6) * 0.03;
      if (tailMesh) tailMesh.rotation.y = Math.sin(time * 3.5) * 0.4;
    }

    const pp = particles.geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pp[i * 3 + 1] += Math.sin(time * 0.6 + i) * 0.002;
      pp[i * 3] += Math.sin(time * 0.3 + i * 0.7) * 0.001;
      pp[i * 3 + 2] += Math.cos(time * 0.4 + i * 0.5) * 0.001;
      if (pp[i * 3 + 1] > TANK_H / 2) {
        pp[i * 3 + 1] = -TANK_H / 2;
        pp[i * 3] = (Math.random() - 0.5) * TANK_W * 1.4;
        pp[i * 3 + 2] = (Math.random() - 0.5) * TANK_D * 1.4;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    const bp = bubbles.geometry.attributes.position.array;
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      bp[i * 3 + 1] += (0.3 + i * 0.02) * 0.008;
      bp[i * 3] += Math.sin(time * 2.5 + i) * 0.002;
      if (bp[i * 3 + 1] > TANK_H / 2) {
        bp[i * 3 + 1] = -TANK_H / 2;
        bp[i * 3] = (Math.random() - 0.5) * TANK_W * 0.7;
        bp[i * 3 + 2] = (Math.random() - 0.5) * TANK_D * 0.7;
      }
    }
    bubbles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // ── Launch splash ──
  function launchSplash() {
    if (active) return;
    active = true;

    const overlay = document.getElementById('splash-overlay');
    overlay.style.display = 'block';
    overlay.style.opacity = 0;

    initScene();
    initTank();
    initWater();
    initFish();
    initParticles();
    initBubbles();

    const state = { progress: 0 };
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => { window.location.href = 'index.html'; }
    });

    tl.to(overlay, { opacity: 1, duration: 0.4 }, 0)
      .to(state, {
        progress: 1, duration: 3.5, ease: 'power2.inOut',
        onUpdate: () => { fillProgress = state.progress; }
      }, 0)
      .to('#splash-text', { opacity: 1, duration: 0.5 }, 0.5)
      .to('#splashBlackout', { opacity: 1, duration: 0.8, ease: 'power2.in' }, 4.0)
      .to('#splash-text', { opacity: 0, duration: 0.3 }, 4.2);

    animate();
  }

  // ── Intercept all links to index.html ──
  document.querySelectorAll('a[href="index.html"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      launchSplash();
    });
  });

  window.launchSplash = launchSplash;
})();
