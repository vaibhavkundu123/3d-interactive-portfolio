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

    // 3D Model joints & components
    this.avatarGroup = null;
    this.torso = null;
    this.headGroup = null;
    this.leftEye = null;
    this.rightEye = null;
    this.eyelidLeft = null;
    this.eyelidRight = null;
    this.dustParticles = null;

    // Animation & interaction state
    this.lastBlinkTime = 0;
    this.isBlinking = false;
    this.isNodding = false;
    this.nodProgress = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 520;
    const height = this.container.clientHeight || 560;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0.25, 4.3);

    // 3. WebGL Renderer with ACES tone mapping & antialiasing
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting (Overhead studio spotlight + Purple/Violet rim lights)
    this.setupLighting();

    // 5. Build 3D Character matching the user's reference
    this.setupCharacter();

    // 6. Ambient Deep Background Starfield
    this.setupBackgroundParticles();

    // 7. Event Listeners
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnClick = this.onClick.bind(this);

    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('mousemove', this.boundOnMouseMove);
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    this.container.addEventListener('click', this.boundOnClick);

    // 8. Animation loop
    this.animate();
  }

  setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x2e1065, 1.8);
    this.scene.add(ambient);

    // Main Overhead Studio Spotlight (Casting realistic down-light onto cap and shoulders)
    this.overheadLight = new THREE.SpotLight(0xffffff, 6.5, 14, Math.PI / 4, 0.45, 1.1);
    this.overheadLight.position.set(0, 4.5, 1.0);
    this.spotTarget = new THREE.Object3D();
    this.spotTarget.position.set(0, 0.2, 0);
    this.scene.add(this.spotTarget);
    this.overheadLight.target = this.spotTarget;
    this.scene.add(this.overheadLight);

    // Purple Rim Light (Left)
    this.rimLightLeft = new THREE.PointLight(0xa855f7, 5.0, 9);
    this.rimLightLeft.position.set(-2.4, 0.6, -1.0);
    this.scene.add(this.rimLightLeft);

    // Violet Rim Light (Right)
    this.rimLightRight = new THREE.PointLight(0x8b5cf6, 5.0, 9);
    this.rimLightRight.position.set(2.4, 0.6, -1.0);
    this.scene.add(this.rimLightRight);

    // Front Cyan Highlight Fill
    const cyanFill = new THREE.DirectionalLight(0x38bdf8, 1.4);
    cyanFill.position.set(1.4, 1.8, 3.2);
    this.scene.add(cyanFill);
  }

  setupCharacter() {
    this.avatarGroup = new THREE.Group();
    this.avatarGroup.position.set(0, -0.42, 0);

    // --- MATERIALS ---
    // Smooth warm skin
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdf9e7a,
      roughness: 0.42,
      metalness: 0.05
    });

    // Subtle stubble / 5-o'clock shadow material for lower jaw
    const stubbleMat = new THREE.MeshStandardMaterial({
      color: 0xb57856,
      roughness: 0.65,
      metalness: 0.02
    });

    // Matte Black Hoodie Fabric
    const hoodieMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f18,
      roughness: 0.85,
      metalness: 0.1
    });

    // Baseball Cap Fabric
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.7,
      metalness: 0.15
    });

    // Brown Hair
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x2e1a12,
      roughness: 0.6,
      metalness: 0.05
    });

    // Shiny Silver Metal for eyelets & drawstring tips
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.18
    });

    // --- 1. TORSO & HOODIE ---
    this.torso = new THREE.Group();

    // Chest & Shoulders
    const chestGeo = new THREE.CylinderGeometry(0.82, 1.05, 1.55, 32);
    const chest = new THREE.Mesh(chestGeo, hoodieMat);
    chest.position.y = -0.78;
    this.torso.add(chest);

    // Thick Rolled Hood Collar around the neck
    const hoodCollarGeo = new THREE.TorusGeometry(0.46, 0.14, 16, 32);
    const hoodCollar = new THREE.Mesh(hoodCollarGeo, hoodieMat);
    hoodCollar.rotation.x = Math.PI / 2.1;
    hoodCollar.position.set(0, 0.05, -0.04);
    this.torso.add(hoodCollar);

    // Silver Drawstring Eyelets
    const eyeletGeo = new THREE.TorusGeometry(0.035, 0.01, 12, 24);
    const leftEyelet = new THREE.Mesh(eyeletGeo, silverMat);
    leftEyelet.position.set(-0.13, -0.06, 0.44);
    leftEyelet.rotation.x = -Math.PI / 10;
    this.torso.add(leftEyelet);

    const rightEyelet = new THREE.Mesh(eyeletGeo, silverMat);
    rightEyelet.position.set(0.13, -0.06, 0.44);
    rightEyelet.rotation.x = -Math.PI / 10;
    this.torso.add(rightEyelet);

    // Hanging Hoodie Drawstrings (Matching user's image)
    const stringMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const stringGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.48, 12);

    const leftString = new THREE.Mesh(stringGeo, stringMat);
    leftString.position.set(-0.13, -0.32, 0.46);
    this.torso.add(leftString);

    const rightString = new THREE.Mesh(stringGeo, stringMat);
    rightString.position.set(0.13, -0.32, 0.46);
    this.torso.add(rightString);

    // Silver Aglets (Metallic tips at ends of drawstrings)
    const agletGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12);
    const leftAglet = new THREE.Mesh(agletGeo, silverMat);
    leftAglet.position.set(-0.13, -0.56, 0.46);
    this.torso.add(leftAglet);

    const rightAglet = new THREE.Mesh(agletGeo, silverMat);
    rightAglet.position.set(0.13, -0.56, 0.46);
    this.torso.add(rightAglet);

    this.avatarGroup.add(this.torso);

    // --- 2. NECK ---
    const neckGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.52, 24);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.2;
    this.avatarGroup.add(neck);

    // --- 3. HEAD GROUP (Pivots independently to follow mouse) ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.48, 0);

    // Cranium / Head Base Sphere
    const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
    headGeo.scale(1, 1.14, 1.06);
    const head = new THREE.Mesh(headGeo, skinMat);
    this.headGroup.add(head);

    // Jaw / Chin contour with subtle stubble shading
    const chinGeo = new THREE.BoxGeometry(0.42, 0.28, 0.44);
    const chin = new THREE.Mesh(chinGeo, stubbleMat);
    chin.position.set(0, -0.44, 0.18);
    chin.rotation.x = Math.PI / 8;
    this.headGroup.add(chin);

    // Stubble overlay on jaw sides
    const stubbleLeft = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), stubbleMat);
    stubbleLeft.position.set(-0.25, -0.32, 0.26);
    stubbleLeft.scale.set(0.8, 1, 0.8);
    this.headGroup.add(stubbleLeft);

    const stubbleRight = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), stubbleMat);
    stubbleRight.position.set(0.25, -0.32, 0.26);
    stubbleRight.scale.set(0.8, 1, 0.8);
    this.headGroup.add(stubbleRight);

    // Ears (With warm subsurface tone)
    const earGeo = new THREE.SphereGeometry(0.12, 16, 16);
    earGeo.scale(0.45, 1.05, 0.75);

    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.55, -0.02, 0.0);
    leftEar.rotation.y = -Math.PI / 10;
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.55, -0.02, 0.0);
    rightEar.rotation.y = Math.PI / 10;
    this.headGroup.add(rightEar);

    // --- 4. BROWN HAIR FRINGE (Peeking under cap brim) ---
    // Left fringe strand
    const fringe1Geo = new THREE.ConeGeometry(0.1, 0.26, 12);
    const fringe1 = new THREE.Mesh(fringe1Geo, hairMat);
    fringe1.position.set(-0.16, 0.18, 0.52);
    fringe1.rotation.z = -Math.PI / 5;
    fringe1.rotation.x = Math.PI / 6;
    this.headGroup.add(fringe1);

    // Center fringe strands (curving across forehead to right like in picture)
    const fringe2 = new THREE.Mesh(fringe1Geo, hairMat);
    fringe2.position.set(-0.04, 0.2, 0.54);
    fringe2.rotation.z = -Math.PI / 4;
    fringe2.rotation.x = Math.PI / 7;
    this.headGroup.add(fringe2);

    const fringe3 = new THREE.Mesh(fringe1Geo, hairMat);
    fringe3.position.set(0.08, 0.21, 0.53);
    fringe3.rotation.z = -Math.PI / 3.5;
    fringe3.rotation.x = Math.PI / 8;
    this.headGroup.add(fringe3);

    // Sideburns in front of ears
    const sideburnGeo = new THREE.BoxGeometry(0.06, 0.22, 0.12);
    const leftSideburn = new THREE.Mesh(sideburnGeo, hairMat);
    leftSideburn.position.set(-0.52, 0.06, 0.18);
    this.headGroup.add(leftSideburn);

    const rightSideburn = new THREE.Mesh(sideburnGeo, hairMat);
    rightSideburn.position.set(0.52, 0.06, 0.18);
    this.headGroup.add(rightSideburn);

    // --- 5. BASEBALL CAP (Forward curved cap matching user image) ---
    // Cap Dome fitting cleanly on head
    const capDomeGeo = new THREE.SphereGeometry(0.58, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.54);
    const capDome = new THREE.Mesh(capDomeGeo, capMat);
    capDome.position.set(0, 0.25, 0.02);
    this.headGroup.add(capDome);

    // Cap Top Button
    const capButtonGeo = new THREE.SphereGeometry(0.042, 16, 16);
    const capButton = new THREE.Mesh(capButtonGeo, capMat);
    capButton.position.set(0, 0.82, 0.02);
    this.headGroup.add(capButton);

    // Curved Visor / Brim sticking forward and curving downwards
    const brimGeo = new THREE.CylinderGeometry(0.64, 0.64, 0.05, 32, 1, false, -Math.PI * 0.44, Math.PI * 0.88);
    const brim = new THREE.Mesh(brimGeo, capMat);
    brim.position.set(0, 0.26, 0.32);
    brim.rotation.x = -Math.PI / 11;
    // Arch curvature for visor
    brim.scale.set(1.0, 0.65, 1.0);
    this.headGroup.add(brim);

    // --- 6. EXPRESSIVE EYES (With pupil tracking & catchlights) ---
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x5c3317, // Rich warm hazel/brown
      roughness: 0.3,
      metalness: 0.1
    });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const createEye = (x) => {
      const eyeRoot = new THREE.Group();
      eyeRoot.position.set(x, 0.05, 0.5);

      // White Sclera
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 20), eyeWhiteMat);
      eyeRoot.add(white);

      // Hazel/Brown Iris
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), irisMat);
      iris.position.z = 0.062;
      eyeRoot.add(iris);

      // Black Pupil
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), pupilMat);
      pupil.position.z = 0.092;
      eyeRoot.add(pupil);

      // Distinct Specular Catchlight (Reflecting overhead studio light)
      const catchlight = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), catchlightMat);
      catchlight.position.set(0.025, 0.028, 0.118);
      eyeRoot.add(catchlight);

      return eyeRoot;
    };

    this.leftEye = createEye(-0.21);
    this.rightEye = createEye(0.21);
    this.headGroup.add(this.leftEye);
    this.headGroup.add(this.rightEye);

    // Eyelids (for realistic blinking)
    const eyelidGeo = new THREE.BoxGeometry(0.25, 0.15, 0.1);
    this.eyelidLeft = new THREE.Mesh(eyelidGeo, skinMat);
    this.eyelidLeft.position.set(-0.21, 0.13, 0.55);
    this.eyelidLeft.scale.y = 0.1;
    this.headGroup.add(this.eyelidLeft);

    this.eyelidRight = new THREE.Mesh(eyelidGeo, skinMat);
    this.eyelidRight.position.set(0.21, 0.13, 0.55);
    this.eyelidRight.scale.y = 0.1;
    this.headGroup.add(this.eyelidRight);

    // Eyebrows
    const browMat = new THREE.MeshBasicMaterial({ color: 0x1f140e });
    const browGeo = new THREE.BoxGeometry(0.23, 0.045, 0.06);

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.21, 0.22, 0.53);
    leftBrow.rotation.z = Math.PI / 22;
    this.headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.21, 0.22, 0.53);
    rightBrow.rotation.z = -Math.PI / 22;
    this.headGroup.add(rightBrow);

    // Naturally Sculpted Nose
    const noseGeo = new THREE.ConeGeometry(0.075, 0.19, 16);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.rotation.x = Math.PI / 5.5;
    nose.position.set(0, -0.08, 0.58);
    this.headGroup.add(nose);

    // Gentle Friendly Smile / Neutral Mouth
    const mouthGeo = new THREE.TorusGeometry(0.125, 0.022, 8, 20, Math.PI * 0.72);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x883842 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.x = Math.PI * 0.95;
    mouth.rotation.z = -Math.PI * 0.86;
    mouth.position.set(0.015, -0.25, 0.53);
    this.headGroup.add(mouth);

    // Clean Subtle Teeth Line
    const teeth = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.024, 0.02),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    teeth.position.set(0.015, -0.245, 0.52);
    this.headGroup.add(teeth);

    this.avatarGroup.add(this.headGroup);
    this.scene.add(this.avatarGroup);
  }

  setupBackgroundParticles() {
    // 70 ambient cosmic star particles floating in deep background (z < -1.0)
    const count = 70;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cPurple = new THREE.Color(0xa855f7);
    const cCyan = new THREE.Color(0x38bdf8);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      pos[i * 3 + 2] = -1.2 - Math.random() * 2.5; // Strictly behind character

      const r = Math.random();
      const color = r < 0.45 ? cPurple : (r < 0.8 ? cCyan : cWhite);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.dustParticles = new THREE.Points(geo, mat);
    this.scene.add(this.dustParticles);
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

    // Smooth spring lerp for mouse coordinates
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // 1. DYNAMIC HEAD TRACKING (Natural pitch, yaw, and roll following cursor)
    if (this.headGroup) {
      const targetHeadYaw = this.mouse.x * 0.72; // Horizontal turn (yaw)
      let targetHeadPitch = -this.mouse.y * 0.48; // Vertical tilt (pitch)
      const targetHeadRoll = -this.mouse.x * 0.12; // Natural subtle roll

      // Handle interactive click nod
      if (this.isNodding) {
        this.nodProgress += 0.08;
        targetHeadPitch += Math.sin(this.nodProgress * Math.PI) * 0.35;
        if (this.nodProgress >= 1) {
          this.isNodding = false;
          this.nodProgress = 0;
        }
      }

      this.headGroup.rotation.y += (targetHeadYaw - this.headGroup.rotation.y) * 0.1;
      this.headGroup.rotation.x += (targetHeadPitch - this.headGroup.rotation.x) * 0.1;
      this.headGroup.rotation.z += (targetHeadRoll - this.headGroup.rotation.z) * 0.1;

      // Gentle natural breathing motion
      this.headGroup.position.y = 0.48 + Math.sin(time * 2.2) * 0.015;
    }

    // 2. TORSO SYMPATHETIC MOTION & BREATHING
    if (this.torso) {
      this.torso.rotation.y = this.mouse.x * 0.18;
      this.torso.scale.x = 1 + Math.sin(time * 2.2) * 0.012;
      this.torso.scale.z = 1 + Math.sin(time * 2.2) * 0.012;
    }

    // 3. EYE MICRO-TRACKING (Eyes look directly towards cursor)
    if (this.leftEye && this.rightEye) {
      const lookX = this.mouse.x * 0.028;
      const lookY = this.mouse.y * 0.022;
      this.leftEye.position.x = -0.21 + lookX;
      this.leftEye.position.y = 0.05 + lookY;
      this.rightEye.position.x = 0.21 + lookX;
      this.rightEye.position.y = 0.05 + lookY;
    }

    // 4. NATURAL BLINKING ANIMATION
    if (time - this.lastBlinkTime > 3.4) {
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
        const h = Math.sin(blinkProgress * Math.PI) * 1.55;
        if (this.eyelidLeft && this.eyelidRight) {
          this.eyelidLeft.scale.y = Math.max(0.1, h);
          this.eyelidRight.scale.y = Math.max(0.1, h);
        }
      }
    }

    // 5. Overhead Spotlight subtle intensity pulse
    if (this.overheadLight) {
      this.overheadLight.intensity = 6.2 + Math.sin(time * 2.8) * 0.4;
      this.overheadLight.position.x = this.mouse.x * 0.35;
    }

    // 6. Deep background star drift with parallax
    if (this.dustParticles) {
      this.dustParticles.rotation.y = this.mouse.x * 0.12;
      this.dustParticles.rotation.x = -this.mouse.y * 0.08;

      const positions = this.dustParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.0015;
        if (positions[i + 1] < -2.4) {
          positions[i + 1] = 2.4;
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




