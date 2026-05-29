(function () {
  'use strict';

  var active = false;
  var renderer, scene, camera;
  var waterMesh, fishGroup, tailMesh;
  var particles, bubbles;
  var fillProgress = 0, time = 0, animId = null;

  var TANK_W, TANK_H;
  var PC = 60, BC = 20;

  function initScene() {
    var canvas = document.getElementById('splash-canvas');
    if (!canvas) { fallback(); return; }

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: true });
    } catch (e) { fallback(); return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050508, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    renderer.setSize(w, h, false);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);

    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 0.2, 5.5);
    camera.lookAt(0, 0, 0);

    // Tank size = 60% of visible viewport width
    var vFov = camera.fov * Math.PI / 180;
    var dist = 5.5;
    var visH = 2 * dist * Math.tan(vFov / 2);
    TANK_W = Math.min(visH * camera.aspect, visH) * 0.6;
    TANK_H = TANK_W;

    scene.add(new THREE.AmbientLight(0x446688, 1.0));
    var dl = new THREE.DirectionalLight(0x88ccff, 2.2);
    dl.position.set(2, 4, 4);
    scene.add(dl);
    var rl = new THREE.DirectionalLight(0x00ddff, 1.2);
    rl.position.set(-2, 1, -3);
    scene.add(rl);

    window.addEventListener('resize', function () {
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
  }

  function fallback() {
    window.location.href = 'index.html';
  }

  function initTank() {
    var hw = TANK_W / 2, hh = TANK_H / 2;

    var pts = [
      [-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh], [-hw, -hh]
    ];
    var flat = [];
    for (var i = 0; i < pts.length; i++) {
      flat.push(pts[i][0], pts[i][1], 0);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(flat, 3));
    scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x00ddff, transparent: true, opacity: 0.7 })));
  }

  function initWater() {
    var geo = new THREE.BoxGeometry(TANK_W * 0.94, TANK_H, TANK_W * 0.08, 30, 20, 1);
    waterMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0x3399ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide
    }));
    waterMesh.position.y = -TANK_H / 2;
    waterMesh.scale.y = 0.01;
    scene.add(waterMesh);

    // Store original positions and top-face indices
    var pos = geo.attributes.position.array;
    waterMesh.userData.orig = new Float32Array(pos);
    var halfH = TANK_H / 2;
    var topZ = [];
    for (var i = 0; i < pos.length; i += 3) {
      if (Math.abs(pos[i + 1] - halfH) < 0.001) {
        topZ.push(i + 2);
      }
    }
    waterMesh.userData.topZ = topZ;
  }

  function makeFish() {
    var g = new THREE.Group();

    var bg = new THREE.SphereGeometry(0.5, 14, 10);
    bg.scale(1.8, 0.6, 0.7);
    var p = bg.attributes.position;
    var c = new Float32Array(p.count * 3);
    for (var i = 0; i < p.count; i++) {
      var y = p.getY(i), za = Math.abs(p.getZ(i));
      if (y > 0.05 && y < 0.2 && za > 0.08) {
        c[i*3]=0; c[i*3+1]=0.83; c[i*3+2]=1;
      } else if (y < -0.05 && za > 0.08) {
        c[i*3]=1; c[i*3+1]=0.27; c[i*3+2]=0.27;
      } else {
        c[i*3]=0.17; c[i*3+1]=0.24; c[i*3+2]=0.31;
      }
    }
    bg.setAttribute('color', new THREE.BufferAttribute(c, 3));
    var body = new THREE.Mesh(bg, new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 25 }));
    body.position.x = 0.3;
    g.add(body);

    var ts = new THREE.Shape();
    ts.moveTo(0,0); ts.lineTo(-0.5,-0.3); ts.lineTo(-0.5,0.3); ts.closePath();
    tailMesh = new THREE.Mesh(new THREE.ShapeGeometry(ts),
      new THREE.MeshPhongMaterial({ color: 0x2C3E50, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
    tailMesh.position.x = -0.7;
    g.add(tailMesh);

    var em = new THREE.MeshBasicMaterial({ color: 0x222222 });
    var e1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), em);
    e1.position.set(0.9, 0.1, 0.3); g.add(e1);
    var e2 = e1.clone();
    e2.position.z = -0.3; g.add(e2);

    var s = TANK_W * 0.1;
    g.scale.set(s, s, s);
    return g;
  }

  function initFish() {
    fishGroup = makeFish();
    fishGroup.position.set(0, 0, 0);
    scene.add(fishGroup);
  }

  function initParticles() {
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(PC * 3);
    for (var i = 0; i < PC; i++) {
      pos[i*3] = (Math.random() - 0.5) * TANK_W * 0.85;
      pos[i*3+1] = (Math.random() - 0.5) * TANK_H;
      pos[i*3+2] = (Math.random() - 0.5) * TANK_W * 0.06;
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    particles = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x88ddff, size: 0.04, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, sizeAttenuation: true, depthWrite: false
    }));
    scene.add(particles);
  }

  function initBubbles() {
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(BC * 3);
    for (var i = 0; i < BC; i++) {
      pos[i*3] = (Math.random() - 0.5) * TANK_W * 0.55;
      pos[i*3+1] = -TANK_H/2 + Math.random() * TANK_H * 0.8;
      pos[i*3+2] = (Math.random() - 0.5) * TANK_W * 0.04;
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    bubbles = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xaaefff, size: 0.07, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, sizeAttenuation: true, depthWrite: false
    }));
    scene.add(bubbles);
  }

  function tick() {
    if (!active) return;
    time += 0.016;

    if (waterMesh) {
      var f = Math.max(0.01, fillProgress);
      waterMesh.scale.y = f;
      waterMesh.position.y = -TANK_H/2 + (TANK_H * f) / 2;
      // Wave animation only on top face vertices
      if (f > 0.05 && waterMesh.userData.topZ) {
        var wp = waterMesh.geometry.attributes.position.array;
        var orig = waterMesh.userData.orig;
        var topZ = waterMesh.userData.topZ;
        for (var t = 0; t < topZ.length; t++) {
          var zi = topZ[t];
          var wx = orig[zi - 2], wy = orig[zi - 1];
          var wave = Math.sin(wx * 4 + time * 3) * 0.025 + Math.cos(wy * 5 + time * 2.5) * 0.015;
          wp[zi - 1] = orig[zi - 1] + Math.min(wave, 0.03);
          wp[zi] = orig[zi];
        }
        waterMesh.geometry.attributes.position.needsUpdate = true;
      }
    }

    if (fishGroup) {
      var fp = Math.max(fillProgress, 0.05);
      var wc = -TANK_H/2 + (TANK_H * fp) / 2;
      fishGroup.position.set(
        Math.sin(time * 0.8) * TANK_W * 0.3,
        wc + Math.sin(time * 0.9) * TANK_H * fp * 0.25,
        Math.sin(time * 0.5) * 0.05
      );
      fishGroup.rotation.y = Math.cos(time * 0.8) * 0.3;
      fishGroup.rotation.z = Math.sin(time * 0.6) * 0.03;
      if (tailMesh) tailMesh.rotation.y = Math.sin(time * 3.5) * 0.4;
    }

    if (particles) {
      var pp = particles.geometry.attributes.position.array;
      for (var i = 0; i < PC; i++) {
        pp[i*3+1] += Math.sin(time * 0.5 + i) * 0.002;
        pp[i*3] += Math.sin(time * 0.3 + i * 0.7) * 0.001;
        pp[i*3+2] += Math.cos(time * 0.4 + i * 0.5) * 0.001;
        if (pp[i*3+1] > TANK_H/2) {
          pp[i*3+1] = -TANK_H/2;
          pp[i*3] = (Math.random() - 0.5) * TANK_W * 0.85;
          pp[i*3+2] = (Math.random() - 0.5) * TANK_W * 0.06;
        }
        if (pp[i*3+1] < -TANK_H/2) {
          pp[i*3+1] = TANK_H/2;
          pp[i*3] = (Math.random() - 0.5) * TANK_W * 0.85;
          pp[i*3+2] = (Math.random() - 0.5) * TANK_W * 0.06;
        }
        if (pp[i*3] > TANK_W * 0.45) pp[i*3] = -TANK_W * 0.45;
        if (pp[i*3] < -TANK_W * 0.45) pp[i*3] = TANK_W * 0.45;
        if (pp[i*3+2] > TANK_W * 0.06) pp[i*3+2] = -TANK_W * 0.06;
        if (pp[i*3+2] < -TANK_W * 0.06) pp[i*3+2] = TANK_W * 0.06;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    }

    if (bubbles) {
      var bp = bubbles.geometry.attributes.position.array;
      for (var i = 0; i < BC; i++) {
        bp[i*3+1] += (0.3 + i * 0.02) * 0.008;
        bp[i*3] += Math.sin(time * 2.5 + i) * 0.002;
        if (bp[i*3+1] > TANK_H/2) {
          bp[i*3+1] = -TANK_H/2;
          bp[i*3] = (Math.random() - 0.5) * TANK_W * 0.55;
          bp[i*3+2] = (Math.random() - 0.5) * TANK_W * 0.04;
        }
        if (bp[i*3+1] < -TANK_H/2) {
          bp[i*3+1] = TANK_H/2;
          bp[i*3] = (Math.random() - 0.5) * TANK_W * 0.55;
          bp[i*3+2] = (Math.random() - 0.5) * TANK_W * 0.04;
        }
        if (bp[i*3] > TANK_W * 0.3) bp[i*3] = -TANK_W * 0.3;
        if (bp[i*3] < -TANK_W * 0.3) bp[i*3] = TANK_W * 0.3;
        if (bp[i*3+2] > TANK_W * 0.04) bp[i*3+2] = -TANK_W * 0.04;
        if (bp[i*3+2] < -TANK_W * 0.04) bp[i*3+2] = TANK_W * 0.04;
      }
      bubbles.geometry.attributes.position.needsUpdate = true;
    }

    if (renderer && scene && camera) renderer.render(scene, camera);
    animId = requestAnimationFrame(tick);
  }

  function launchSplash() {
    if (active) return;
    active = true;

    var overlay = document.getElementById('splash-overlay');
    overlay.classList.add('active');

    // Force reflow
    overlay.offsetHeight;

    initScene();
    if (!renderer) { fallback(); return; }
    initTank();
    initWater();
    initFish();
    initParticles();
    initBubbles();

    // Render first frame immediately to confirm scene exists
    renderer.render(scene, camera);

    // Queue render loop on next frame
    animId = requestAnimationFrame(tick);

    // Animated dots on text
    var dotEl = document.getElementById('splash-dots');
    var dotCount = 0;
    var dotInterval = setInterval(function () {
      dotCount = (dotCount + 1) % 4;
      dotEl.textContent = dotCount === 0 ? '' : new Array(dotCount + 1).join('.');
    }, 400);

    var state = { progress: 0 };
    var tl = gsap.timeline({
      onComplete: function () { window.location.href = 'index.html'; }
    });

    tl.to(overlay, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
      .to(state, {
        progress: 0.95, duration: 4.5, ease: 'power2.inOut',
        onUpdate: function () { fillProgress = state.progress; }
      }, 0)
      .to('#splash-text', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.5)
      .to('#splashBlackout', { opacity: 1, duration: 1.5, ease: 'power3.inOut' }, 4.2)
      .to('#splash-text', { opacity: 0, duration: 0.3 }, 4.6);
  }

  document.querySelectorAll('a[href="index.html"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      launchSplash();
    });
  });

  window.launchSplash = launchSplash;
})();
