import * as THREE from 'three';

export class AvatarScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Mouse tracking state
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };

    // Character joints & components
    this.avatarGroup = null;
    this.headGroup = null;
    this.leftEye = null;
    this.rightEye = null;
    this.eyelidLeft = null;
    this.eyelidRight = null;
    this.torso = null;
    this.headsetRings = [];

    // Animation & Interaction state
    this.lastBlinkTime = 0;
    this.isBlinking = false;
    this.nodProgress = 0;
    this.isNodding = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 500;
    const height = this.container.clientHeight || 540;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0.35, 4.7);

    // 3. Renderer with high DPR and ACES tone mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting & Spotlight Beam
    this.setupLighting();

    // 5. Stylized 3D Avatar with Headset
    this.setupAvatar();

    // 6. Volumetric Spotlight Beam & Floating Dust Sparkles
    this.setupSpotlightBeam();

    // 7. Event Listeners
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnClick = this.onClick.bind(this);

    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('mousemove', this.boundOnMouseMove);
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    this.container.addEventListener('click', this.boundOnClick);

    // 8. Animation Loop
    this.animate();
  }

  setupLighting() {
    // Ambient room light
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.4);
    this.scene.add(ambientLight);

    // Overhead Main Spotlight shining down on avatar
    this.overheadLight = new THREE.SpotLight(0xffffff, 5.5, 14, Math.PI / 4.5, 0.35, 1.2);
    this.overheadLight.position.set(0, 4.8, 0.9);
    this.overheadTarget = new THREE.Object3D();
    this.overheadTarget.position.set(0, 0.25, 0);
    this.scene.add(this.overheadTarget);
    this.overheadLight.target = this.overheadTarget;
    this.scene.add(this.overheadLight);

    // Purple Rim Backlight (Left)
    this.purpleLightLeft = new THREE.PointLight(0xa855f7, 4.5, 9);
    this.purpleLightLeft.position.set(-2.2, 0.6, -1.2);
    this.scene.add(this.purpleLightLeft);

    // Violet Rim Backlight (Right)
    this.purpleLightRight = new THREE.PointLight(0x8b5cf6, 4.5, 9);
    this.purpleLightRight.position.set(2.2, 0.6, -1.2);
    this.scene.add(this.purpleLightRight);

    // Cyan High-Tech Front Key Fill
    const cyanFill = new THREE.DirectionalLight(0x38bdf8, 1.4);
    cyanFill.position.set(1.6, 1.8, 3.2);
    this.scene.add(cyanFill);
  }

  setupSpotlightBeam() {
    // Volumetric dual-layer spotlight cone
    // Outer soft beam
    const outerGeo = new THREE.CylinderGeometry(0.25, 2.1, 5.0, 32, 1, true);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xd8b4fe,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const outerBeam = new THREE.Mesh(outerGeo, outerMat);
    outerBeam.position.set(0, 2.5, 0);
    this.scene.add(outerBeam);
    this.outerBeam = outerBeam;

    // Inner bright beam core
    const innerGeo = new THREE.CylinderGeometry(0.12, 1.2, 4.8, 32, 1, true);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const innerBeam = new THREE.Mesh(innerGeo, innerMat);
    innerBeam.position.set(0, 2.5, 0);
    this.scene.add(innerBeam);
    this.innerBeam = innerBeam;

    // Floating Atmospheric Dust Sparkles
    const particleCount = 150;
    const dustGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0xa855f7); // Purple
    const c2 = new THREE.Color(0x38bdf8); // Cyan
    const c3 = new THREE.Color(0xffffff); // White

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.0;
      positions[i * 3 + 1] = Math.random() * 4.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.4;

      const pick = Math.random();
      const col = pick < 0.5 ? c1 : (pick < 0.85 ? c2 : c3);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustParticles);
  }

  setupAvatar() {
    this.avatarGroup = new THREE.Group();
    this.avatarGroup.position.set(0, -0.42, 0);

    // 1. Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdf9e7a,
      roughness: 0.45,
      metalness: 0.05
    });

    const clothMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.75,
      metalness: 0.15
    });

    const capMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      roughness: 0.65,
      metalness: 0.2
    });

    const headsetMat = new THREE.MeshStandardMaterial({
      color: 0x181e2e,
      roughness: 0.35,
      metalness: 0.8
    });

    const neonPurpleMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc
    });

    const neonCyanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8
    });

    // 2. Torso & Hoodie Shoulders
    const torsoGeo = new THREE.CylinderGeometry(0.78, 1.0, 1.55, 32);
    this.torso = new THREE.Mesh(torsoGeo, clothMat);
    this.torso.position.y = -0.78;
    this.avatarGroup.add(this.torso);

    // Hoodie collar
    const collarGeo = new THREE.TorusGeometry(0.44, 0.1, 16, 32);
    const collar = new THREE.Mesh(collarGeo, clothMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.03;
    this.avatarGroup.add(collar);

    // Hoodie drawstring / zipper detail
    const zipGeo = new THREE.BoxGeometry(0.04, 0.45, 0.02);
    const zip = new THREE.Mesh(zipGeo, neonPurpleMat);
    zip.position.set(0, -0.28, 0.82);
    this.avatarGroup.add(zip);

    // 3. Neck
    const neckGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.5, 24);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.18;
    this.avatarGroup.add(neck);

    // 4. Head Group (Rotates and tilts with cursor)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.45, 0);

    // Head base sphere
    const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
    headGeo.scale(1, 1.15, 1.05);
    const head = new THREE.Mesh(headGeo, skinMat);
    this.headGroup.add(head);

    // Jaw / Chin contour
    const chinGeo = new THREE.BoxGeometry(0.42, 0.26, 0.42);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.45, 0.18);
    chin.rotation.x = Math.PI / 8;
    this.headGroup.add(chin);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.12, 16, 16);
    earGeo.scale(0.5, 1, 0.7);

    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.55, 0, 0);
    leftEar.rotation.y = -Math.PI / 10;
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.55, 0, 0);
    rightEar.rotation.y = Math.PI / 10;
    this.headGroup.add(rightEar);

    // 5. High-Tech Cap / Beanie
    const capDomeGeo = new THREE.SphereGeometry(0.58, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const capDome = new THREE.Mesh(capDomeGeo, capMat);
    capDome.position.set(0, 0.23, 0.02);
    this.headGroup.add(capDome);

    // Cap Brim / Visor
    const brimGeo = new THREE.CylinderGeometry(0.63, 0.63, 0.06, 32, 1, false, -Math.PI * 0.42, Math.PI * 0.84);
    const brim = new THREE.Mesh(brimGeo, capMat);
    brim.position.set(0, 0.24, 0.28);
    brim.rotation.x = -Math.PI / 14;
    this.headGroup.add(brim);

    // Glowing Cap Tech Patch
    const patchGeo = new THREE.BoxGeometry(0.24, 0.14, 0.04);
    const patch = new THREE.Mesh(patchGeo, neonPurpleMat);
    patch.position.set(0, 0.38, 0.54);
    patch.rotation.x = -Math.PI / 16;
    this.headGroup.add(patch);

    // 6. Developer Over-Ear Headset (Signature Cyber Element)
    // Headset Arch Band
    const bandGeo = new THREE.TorusGeometry(0.64, 0.035, 16, 32, Math.PI * 0.95);
    const band = new THREE.Mesh(bandGeo, headsetMat);
    band.position.set(0, 0.24, 0);
    band.rotation.z = -Math.PI * 0.475;
    this.headGroup.add(band);

    // Left Earcup
    const earcupGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.14, 24);
    const leftEarcup = new THREE.Mesh(earcupGeo, headsetMat);
    leftEarcup.rotation.z = Math.PI / 2;
    leftEarcup.position.set(-0.62, 0.02, 0);
    this.headGroup.add(leftEarcup);

    // Left Glowing Neon Ring
    const ringGeo = new THREE.TorusGeometry(0.15, 0.02, 16, 32);
    const leftRing = new THREE.Mesh(ringGeo, neonPurpleMat);
    leftRing.rotation.y = Math.PI / 2;
    leftRing.position.set(-0.7, 0.02, 0);
    this.headGroup.add(leftRing);
    this.headsetRings.push(leftRing);

    // Right Earcup
    const rightEarcup = new THREE.Mesh(earcupGeo, headsetMat);
    rightEarcup.rotation.z = Math.PI / 2;
    rightEarcup.position.set(0.62, 0.02, 0);
    this.headGroup.add(rightEarcup);

    // Right Glowing Neon Ring
    const rightRing = new THREE.Mesh(ringGeo, neonCyanMat);
    rightRing.rotation.y = Math.PI / 2;
    rightRing.position.set(0.7, 0.02, 0);
    this.headGroup.add(rightRing);
    this.headsetRings.push(rightRing);

    // 7. Expressive Stylized Eyes
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const createEye = (x) => {
      const eyeRoot = new THREE.Group();
      eyeRoot.position.set(x, 0.05, 0.5);

      // White Sclera
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), eyeWhiteMat);
      eyeRoot.add(white);

      // Dark Iris/Pupil
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.062, 16, 16), pupilMat);
      pupil.position.z = 0.07;
      eyeRoot.add(pupil);

      // Reflection Catchlight
      const catchlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      catchlight.position.set(0.02, 0.02, 0.115);
      eyeRoot.add(catchlight);

      return eyeRoot;
    };

    this.leftEye = createEye(-0.2);
    this.rightEye = createEye(0.2);
    this.headGroup.add(this.leftEye);
    this.headGroup.add(this.rightEye);

    // Eyelids (Blinking)
    const eyelidGeo = new THREE.BoxGeometry(0.24, 0.15, 0.1);
    this.eyelidLeft = new THREE.Mesh(eyelidGeo, skinMat);
    this.eyelidLeft.position.set(-0.2, 0.12, 0.54);
    this.eyelidLeft.scale.y = 0.1;
    this.headGroup.add(this.eyelidLeft);

    this.eyelidRight = new THREE.Mesh(eyelidGeo, skinMat);
    this.eyelidRight.position.set(0.2, 0.12, 0.54);
    this.eyelidRight.scale.y = 0.1;
    this.headGroup.add(this.eyelidRight);

    // Eyebrows
    const browMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
    const browGeo = new THREE.BoxGeometry(0.22, 0.04, 0.06);

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.2, 0.2, 0.52);
    leftBrow.rotation.z = Math.PI / 24;
    this.headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.2, 0.2, 0.52);
    rightBrow.rotation.z = -Math.PI / 24;
    this.headGroup.add(rightBrow);

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.07, 0.18, 16);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.rotation.x = Math.PI / 6;
    nose.position.set(0, -0.08, 0.56);
    this.headGroup.add(nose);

    // Friendly Smirk / Smile
    const mouthGeo = new THREE.TorusGeometry(0.12, 0.024, 8, 16, Math.PI * 0.75);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x9f1239 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.x = Math.PI * 0.95;
    mouth.rotation.z = -Math.PI * 0.86;
    mouth.position.set(0.02, -0.25, 0.52);
    this.headGroup.add(mouth);

    // Clean Teeth Highlight
    const teeth = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.03, 0.03),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    teeth.position.set(0.02, -0.24, 0.51);
    this.headGroup.add(teeth);

    this.avatarGroup.add(this.headGroup);
    this.scene.add(this.avatarGroup);
  }

  onMouseMove(e) {
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onTouchMove(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.targetMouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
  }

  onClick() {
    // Trigger friendly interactive greeting nod
    if (!this.isNodding) {
      this.isNodding = true;
      this.nodProgress = 0;
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    // Smooth lerp mouse tracking
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // 1. Dynamic Head Tracking
    if (this.headGroup) {
      const targetHeadRotY = this.mouse.x * 0.65;
      let targetHeadRotX = -this.mouse.y * 0.45;
      const targetHeadRotZ = -this.mouse.x * 0.12;

      // Handle Interactive Nod Greeting
      if (this.isNodding) {
        this.nodProgress += 0.08;
        targetHeadRotX += Math.sin(this.nodProgress * Math.PI) * 0.35;
        if (this.nodProgress >= 1) {
          this.isNodding = false;
          this.nodProgress = 0;
        }
      }

      this.headGroup.rotation.y += (targetHeadRotY - this.headGroup.rotation.y) * 0.1;
      this.headGroup.rotation.x += (targetHeadRotX - this.headGroup.rotation.x) * 0.1;
      this.headGroup.rotation.z += (targetHeadRotZ - this.headGroup.rotation.z) * 0.1;

      // Natural breathing oscillation
      this.headGroup.position.y = 0.45 + Math.sin(time * 2.4) * 0.016;
    }

    // 2. Torso gentle motion
    if (this.torso) {
      this.torso.rotation.y = this.mouse.x * 0.2;
      this.torso.scale.x = 1 + Math.sin(time * 2.4) * 0.012;
      this.torso.scale.z = 1 + Math.sin(time * 2.4) * 0.012;
    }

    // 3. Eye micro-tracking
    if (this.leftEye && this.rightEye) {
      const eyeLookX = this.mouse.x * 0.03;
      const eyeLookY = this.mouse.y * 0.025;
      this.leftEye.position.x = -0.2 + eyeLookX;
      this.leftEye.position.y = 0.05 + eyeLookY;
      this.rightEye.position.x = 0.2 + eyeLookX;
      this.rightEye.position.y = 0.05 + eyeLookY;
    }

    // 4. Blinking logic
    if (time - this.lastBlinkTime > 3.2) {
      this.isBlinking = true;
      this.lastBlinkTime = time;
    }

    if (this.isBlinking) {
      const blinkProgress = (time - this.lastBlinkTime) / 0.16;
      if (blinkProgress >= 1) {
        this.isBlinking = false;
        if (this.eyelidLeft && this.eyelidRight) {
          this.eyelidLeft.scale.y = 0.1;
          this.eyelidRight.scale.y = 0.1;
        }
      } else {
        const h = Math.sin(blinkProgress * Math.PI) * 1.5;
        if (this.eyelidLeft && this.eyelidRight) {
          this.eyelidLeft.scale.y = Math.max(0.1, h);
          this.eyelidRight.scale.y = Math.max(0.1, h);
        }
      }
    }

    // 5. Spotlight breathing intensity & beam shimmer
    if (this.overheadLight) {
      this.overheadLight.intensity = 5.2 + Math.sin(time * 3.0) * 0.4;
    }
    if (this.outerBeam) {
      this.outerBeam.material.opacity = 0.065 + Math.sin(time * 2.0) * 0.015;
    }
    if (this.innerBeam) {
      this.innerBeam.material.opacity = 0.095 + Math.cos(time * 2.5) * 0.02;
    }

    // 6. Floating dust particle drift
    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.0035;
        positions[i] += Math.sin(time + i) * 0.0008;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 4.8;
        }
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('mousemove', this.boundOnMouseMove);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    if (this.container) {
      this.container.removeEventListener('click', this.boundOnClick);
    }
    this.renderer?.dispose();
    if (this.container && this.renderer?.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

