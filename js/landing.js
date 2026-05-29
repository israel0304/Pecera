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

  // ── Create Fish (matching escenario 6 crearPez3D) ──
  const fishGroup = new THREE.Group();

  // Body with vertex colors for two-tone neon pattern
  let bodyGeo = new THREE.SphereGeometry(0.5, 14, 10);
  bodyGeo.scale(1.8, 0.6, 0.7);

  let pos = bodyGeo.attributes.position;
  let cArr = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    let y = pos.getY(i);
    let zAbs = Math.abs(pos.getZ(i));
    if (y > 0.05 && y < 0.2 && zAbs > 0.08) {
      cArr[i * 3] = 0; cArr[i * 3 + 1] = 0.83; cArr[i * 3 + 2] = 1;
    } else if (y < -0.05 && zAbs > 0.08) {
      cArr[i * 3] = 1; cArr[i * 3 + 1] = 0.27; cArr[i * 3 + 2] = 0.27;
    } else {
      cArr[i * 3] = 0.17; cArr[i * 3 + 1] = 0.24; cArr[i * 3 + 2] = 0.31;
    }
  }
  bodyGeo.setAttribute('color', new THREE.BufferAttribute(cArr, 3));

  let body = new THREE.Mesh(bodyGeo, new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 25 }));
  body.position.x = 0.3;
  fishGroup.add(body);

  // Tail (dark translucent)
  let tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0); tailShape.lineTo(-0.5, -0.3); tailShape.lineTo(-0.5, 0.3); tailShape.closePath();
  let tail = new THREE.Mesh(new THREE.ShapeGeometry(tailShape), new THREE.MeshPhongMaterial({ color: 0x2C3E50, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  tail.position.x = -0.7;
  fishGroup.add(tail);

  // Eyes (black)
  let eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
  let eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeMat);
  eye.position.set(0.9, 0.1, 0.3);
  fishGroup.add(eye);
  let eye2 = eye.clone();
  eye2.position.z = -0.3;
  fishGroup.add(eye2);

  // Scale for hero presentation
  fishGroup.scale.set(0.4, 0.4, 0.4);
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

  // ── Mouse & Touch Tracking ──
  let mouseX = 0;
  let mouseY = 0;
  let targetRotY = 0;
  let targetRotX = 0;
  let currentRotY = 0;
  let currentRotX = 0;
  let touchInit = false;

  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    targetRotY = mouseX * 0.5;
    targetRotX = mouseY * 0.2;
  });

  function onTouch(e) {
    if (e.touches.length === 1) {
      if (!touchInit) touchInit = true;
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      mouseX = ((t.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((t.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotY = mouseX * 1.0;
      targetRotX = mouseY * 0.5;
    }
  }

  canvas.addEventListener('touchstart', onTouch, { passive: true });
  canvas.addEventListener('touchmove', onTouch, { passive: true });

  // ── Animation Loop ──
  let time = 0;

  function animate() {
    resize();
    time += 0.016;

    // Fish subtle idle animation
    fishGroup.position.y = 0.2 + Math.sin(time * 0.8) * 0.05;
    fishGroup.rotation.z = Math.sin(time * 0.6) * 0.02;

    // Smooth mouse follow (faster lerp for touch)
    currentRotY += (targetRotY - currentRotY) * 0.1;
    currentRotX += (targetRotX - currentRotX) * 0.1;
    fishGroup.rotation.y = currentRotY;
    fishGroup.rotation.x = currentRotX * 0.5;

    // Tail idle wag
    if (tail) tail.rotation.y = Math.sin(time * 3) * 0.3;

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
  resize();

  // ── GSAP Micro-interactions ──
  if (typeof gsap !== 'undefined') {
    // Hero entrance timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 }, 0)
      .fromTo('h1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
      .fromTo('.subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, 0.4)
      .fromTo('.hero-actions .btn', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, 0.6)
      .fromTo('.scroll-indicator', { opacity: 0 }, { opacity: 0.6, duration: 0.5 }, 1.2);

    // ── Nav scroll effect ──
    const nav = document.querySelector('.nav');
    if (nav) {
      gsap.to(nav, {
        scrollTrigger: {
          trigger: document.body,
          start: 'top -80',
          end: 'top -160',
          toggleActions: 'play none none reverse'
        },
        backgroundColor: 'rgba(8,8,11,0.95)',
        backdropFilter: 'blur(20px)',
        duration: 0.3,
        ease: 'none'
      });
    }

    // ── Scroll-triggered: feature cards ──
    gsap.fromTo('.feature-card', { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });

    // ── Scroll-triggered: phone mockups ──
    gsap.fromTo('.phone-mockup', { opacity: 0, scale: 0.92, y: 30 }, {
      opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.screenshots-grid',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });

    // ── Scroll-triggered: CTA section ──
    gsap.fromTo('.cta-section', { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      }
    });
  }
})();
