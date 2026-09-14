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

    // Character joints
    this.avatarGroup = null;
    this.headGroup = null;
    this.leftEye = null;
    this.rightEye = null;
    this.eyelidLeft = null;
    this.eyelidRight = null;
    this.torso = null;

    // Animation state
    this.lastBlinkTime = 0;
    this.isBlinking = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0.4, 4.8);

    // 3. Renderer with high DPR
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting & Spotlight Beam
    this.setupLighting();

    // 5. Stylized 3D Avatar
    this.setupAvatar();

    // 6. Overhead Spotlight Cone & Floating Dust Particles
    this.setupSpotlightBeam();

    // 7. Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });

    // 8. Animation Loop
    this.animate();
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.2);
    this.scene.add(ambientLight);

    // Overhead Main Spotlight (White/Soft Gold shining directly down on avatar)
    this.overheadLight = new THREE.SpotLight(0xffffff, 5, 12, Math.PI / 5, 0.35, 1.2);
    this.overheadLight.position.set(0, 4.5, 0.8);
    this.overheadTarget = new THREE.Object3D();
    this.overheadTarget.position.set(0, 0.3, 0);
    this.scene.add(this.overheadTarget);
    this.overheadLight.target = this.overheadTarget;
    this.scene.add(this.overheadLight);

    // Vibrant Purple/Violet Rim Backlights (Matching the YouTube Short)
    const purpleLightLeft = new THREE.PointLight(0xa855f7, 4, 8);
    purpleLightLeft.position.set(-2, 0.5, -1);
    this.scene.add(purpleLightLeft);

    const purpleLightRight = new THREE.PointLight(0x7c3aed, 4, 8);
    purpleLightRight.position.set(2, 0.5, -1);
    this.scene.add(purpleLightRight);

    // Cyan Front Fill Light (for high-tech highlights)
    const cyanFill = new THREE.DirectionalLight(0x38bdf8, 1.2);
    cyanFill.position.set(1.5, 1.5, 3);
    this.scene.add(cyanFill);
  }

  setupSpotlightBeam() {
    // Conical translucent beam mesh shining from ceiling onto avatar
    const beamGeo = new THREE.CylinderGeometry(0.3, 1.8, 4.8, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 2.5, 0);
    this.scene.add(beam);
    this.beam = beam;

    // Floating Dust Sparkles inside beam
    const particleCount = 120;
    const dustGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2.5;
      positions[i * 3 + 1] = Math.random() * 4.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustParticles);
  }

  setupAvatar() {
    this.avatarGroup = new THREE.Group();
    this.avatarGroup.position.set(0, -0.4, 0);

    // Skin Material (Stylized warm smooth clay)
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdf9d76,
      roughness: 0.5,
      metalness: 0.05
    });

    // Dark Cap / Hoodie Fabric Material
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.7,
      metalness: 0.1
    });

    const capAccentMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea, // Vibrant purple cap emblem
      roughness: 0.4
    });

    // Dark T-Shirt / Hoodie Material
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8
    });

    // 1. Torso & Shoulders
    const torsoGeo = new THREE.CylinderGeometry(0.75, 0.95, 1.5, 32);
    this.torso = new THREE.Mesh(torsoGeo, clothMat);
    this.torso.position.y = -0.75;
    this.avatarGroup.add(this.torso);

    // Collar / Hoodie Rim
    const collarGeo = new THREE.TorusGeometry(0.42, 0.09, 16, 32);
    const collar = new THREE.Mesh(collarGeo, clothMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.02;
    this.avatarGroup.add(collar);

    // 2. Neck
    const neckGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.5, 24);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.18;
    this.avatarGroup.add(neck);

    // 3. Head Joint Group (pivots dynamically with mouse tracking)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.45, 0);

    // Head Base Sphere
    const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
    headGeo.scale(1, 1.15, 1.05);
    const head = new THREE.Mesh(headGeo, skinMat);
    this.headGroup.add(head);

    // Jaw / Chin contour
    const chinGeo = new THREE.BoxGeometry(0.4, 0.25, 0.4);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.45, 0.18);
    chin.rotation.x = Math.PI / 8;
    this.headGroup.add(chin);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.12, 16, 16);
    earGeo.scale(0.5, 1, 0.7);

    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.54, 0, 0);
    leftEar.rotation.y = -Math.PI / 10;
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.54, 0, 0);
    rightEar.rotation.y = Math.PI / 10;
    this.headGroup.add(rightEar);

    // 4. Stylized Cap / Beanie (Matching the video)
    const capDomeGeo = new THREE.SphereGeometry(0.58, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const capDome = new THREE.Mesh(capDomeGeo, capMat);
    capDome.position.set(0, 0.22, 0.02);
    this.headGroup.add(capDome);

    // Cap Brim / Visor sticking forward
    const brimGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.06, 32, 1, false, -Math.PI * 0.4, Math.PI * 0.8);
    const brim = new THREE.Mesh(brimGeo, capMat);
    brim.position.set(0, 0.22, 0.28);
    brim.rotation.x = -Math.PI / 14;
    this.headGroup.add(brim);

    // Cap Front Logo / Patch
    const patchGeo = new THREE.BoxGeometry(0.25, 0.16, 0.04);
    const patch = new THREE.Mesh(patchGeo, capAccentMat);
    patch.position.set(0, 0.38, 0.54);
    patch.rotation.x = -Math.PI / 16;
    this.headGroup.add(patch);

    // 5. Stylized Eyes
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

    const createEye = (x) => {
      const eyeRoot = new THREE.Group();
      eyeRoot.position.set(x, 0.05, 0.5);

      // White Sclera
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), eyeWhiteMat);
      eyeRoot.add(white);

      // Pupil / Iris
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), pupilMat);
      pupil.position.z = 0.07;
      eyeRoot.add(pupil);

      // Cute eye reflection catchlight
      const catchlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      catchlight.position.set(0.02, 0.02, 0.11);
      eyeRoot.add(catchlight);

      return eyeRoot;
    };

    this.leftEye = createEye(-0.2);
    this.rightEye = createEye(0.2);
    this.headGroup.add(this.leftEye);
    this.headGroup.add(this.rightEye);

    // Eyelids (for blinking animation)
    const eyelidGeo = new THREE.BoxGeometry(0.24, 0.14, 0.1);
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

    // Mouth / Smirk (Curved Torus Arc)
    const mouthGeo = new THREE.TorusGeometry(0.12, 0.022, 8, 16, Math.PI * 0.7);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x9f1239 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.x = Math.PI * 0.95;
    mouth.rotation.z = -Math.PI * 0.85;
    mouth.position.set(0.02, -0.25, 0.52);
    this.headGroup.add(mouth);

    // Teeth highlight inside smirk
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
    // Convert screen coordinates to normalized [-1, 1] range
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

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Smooth lerp mouse coordinates
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // 1. Dynamic Head Tracking (Pitch & Yaw towards cursor)
    if (this.headGroup) {
      const targetHeadRotY = this.mouse.x * 0.65;
      const targetHeadRotX = -this.mouse.y * 0.45;
      const targetHeadRotZ = -this.mouse.x * 0.12;

      this.headGroup.rotation.y += (targetHeadRotY - this.headGroup.rotation.y) * 0.1;
      this.headGroup.rotation.x += (targetHeadRotX - this.headGroup.rotation.x) * 0.1;
      this.headGroup.rotation.z += (targetHeadRotZ - this.headGroup.rotation.z) * 0.1;

      // Gentle natural breathing motion
      this.headGroup.position.y = 0.45 + Math.sin(time * 2.5) * 0.018;
    }

    // 2. Torso slight sympathetic rotation & chest breathing
    if (this.torso) {
      this.torso.rotation.y = this.mouse.x * 0.2;
      this.torso.scale.x = 1 + Math.sin(time * 2.5) * 0.015;
      this.torso.scale.z = 1 + Math.sin(time * 2.5) * 0.015;
    }

    // 3. Eyes extra micro-look
    if (this.leftEye && this.rightEye) {
      const eyeLookX = this.mouse.x * 0.03;
      const eyeLookY = this.mouse.y * 0.025;
      this.leftEye.position.x = -0.2 + eyeLookX;
      this.leftEye.position.y = 0.05 + eyeLookY;
      this.rightEye.position.x = 0.2 + eyeLookX;
      this.rightEye.position.y = 0.05 + eyeLookY;
    }

    // 4. Natural Blinking logic
    if (time - this.lastBlinkTime > 3.5) {
      this.isBlinking = true;
      this.lastBlinkTime = time;
    }

    if (this.isBlinking) {
      const blinkProgress = (time - this.lastBlinkTime) / 0.15;
      if (blinkProgress >= 1) {
        this.isBlinking = false;
        if (this.eyelidLeft && this.eyelidRight) {
          this.eyelidLeft.scale.y = 0.1;
          this.eyelidRight.scale.y = 0.1;
        }
      } else {
        const h = Math.sin(blinkProgress * Math.PI) * 1.6;
        if (this.eyelidLeft && this.eyelidRight) {
          this.eyelidLeft.scale.y = Math.max(0.1, h);
          this.eyelidRight.scale.y = Math.max(0.1, h);
        }
      }
    }

    // 5. Spotlight beam subtle breathing intensity
    if (this.overheadLight) {
      this.overheadLight.intensity = 4.8 + Math.sin(time * 3) * 0.4;
    }

    // 6. Floating dust particles drift
    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.004;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 4.5;
        }
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onTouchMove);
    this.renderer?.dispose();
    if (this.container && this.renderer?.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
