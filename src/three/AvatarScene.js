import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

    // 3D Model & Rigged Bones
    this.model = null;
    this.headBone = null;
    this.neckBone = null;
    this.leftEyeBone = null;
    this.rightEyeBone = null;
    this.spineBone = null;
    this.initialRotations = {};

    // Animation state
    this.isNodding = false;
    this.nodProgress = 0;
    this.isSpeaking = false;
    this.speechGesture = null;

    // Background cosmic particles
    this.dustParticles = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 520;
    const height = this.container.clientHeight || 580;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera positioned for portrait bust view with ample headroom
    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    this.camera.position.set(0, 0.36, 1.38);
    this.cameraTarget = new THREE.Vector3(0, 0.35, 0);
    this.camera.lookAt(this.cameraTarget);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.container.appendChild(this.renderer.domElement);

    // 4. Studio Lighting (Warm key light, Fill, and Purple Rim Lights)
    this.setupLighting();

    // 5. Load High-Fidelity 3D Rigged Developer Avatar
    this.loadAvatarModel();

    // 6. Deep Ambient Cosmic Dust (Strictly in deep space behind model)
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

    // 8. Animation Loop
    this.animate();
  }

  setupLighting() {
    // Ambient light (soft violet fill)
    const ambient = new THREE.AmbientLight(0x2e1065, 1.6);
    this.scene.add(ambient);

    // Frontal Soft Key Fill Light (warm flattering light for natural skin tone)
    this.frontLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    this.frontLight.position.set(0, 1.2, 2.0);
    this.scene.add(this.frontLight);

    // Overhead Studio Spotlight
    this.overheadLight = new THREE.SpotLight(0xffffff, 2.8, 8, Math.PI / 4, 0.4, 1.2);
    this.overheadLight.position.set(0, 2.8, 0.8);
    this.spotTarget = new THREE.Object3D();
    this.spotTarget.position.set(0, 0.35, 0);
    this.scene.add(this.spotTarget);
    this.overheadLight.target = this.spotTarget;
    this.scene.add(this.overheadLight);

    // Left Purple Rim Light (Accentuates silhouette)
    this.rimLeft = new THREE.PointLight(0xa855f7, 4.2, 6);
    this.rimLeft.position.set(-1.6, 0.5, -0.4);
    this.scene.add(this.rimLeft);

    // Right Violet Rim Light
    this.rimRight = new THREE.PointLight(0x818cf8, 3.4, 6);
    this.rimRight.position.set(1.6, 0.5, -0.4);
    this.scene.add(this.rimRight);
  }

  loadAvatarModel() {
    const loader = new GLTFLoader();

    loader.load(
      '/avatar.glb?v=2',
      (gltf) => {
        this.model = gltf.scene;

        // Position model for portrait composition
        this.model.position.set(0, -1.40, 0);
        this.model.scale.set(1, 1, 1);

        // Traverse meshes to configure materials
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Hide glasses for a clean handsome look
            if (child.name === 'Wolf3D_Glasses') {
              child.visible = false;
            }

            // Material tuning
            const configureMat = (mat) => {
              if (!mat) return;
              // Organic skin and fabric have 0 metalness
              mat.metalness = 0.0;

              if (mat.name === 'Wolf3D_Skin') {
                mat.roughness = 0.65;
              } else if (mat.name === 'Wolf3D_Outfit_Top') {
                // Sleek dark hoodie/jacket
                mat.color.setHex(0x18181b);
                mat.roughness = 0.85;
              } else if (mat.name === 'Wolf3D_Outfit_Bottom') {
                mat.color.setHex(0x222228);
                mat.roughness = 0.9;
              } else if (mat.name === 'Wolf3D_Hair') {
                mat.color.setHex(0x231812); // Deep brown hair
                mat.roughness = 0.82;
              }
            };

            if (Array.isArray(child.material)) {
              child.material.forEach(configureMat);
            } else {
              configureMat(child.material);
            }
          }

          // Rigged bones for real-time tracking
          if (child.isBone || child.type === 'Bone' || child.type === 'Object3D') {
            if (child.name === 'Head') this.headBone = child;
            if (child.name === 'Neck') this.neckBone = child;
            if (child.name === 'LeftEye') this.leftEyeBone = child;
            if (child.name === 'RightEye') this.rightEyeBone = child;
            if (child.name === 'Spine2') this.spineBone = child;
          }
        });

        // Store initial rest rotations of bones
        if (this.headBone) this.initialRotations.head = this.headBone.rotation.clone();
        if (this.neckBone) this.initialRotations.neck = this.neckBone.rotation.clone();
        if (this.leftEyeBone) this.initialRotations.leftEye = this.leftEyeBone.rotation.clone();
        if (this.rightEyeBone) this.initialRotations.rightEye = this.rightEyeBone.rotation.clone();
        if (this.spineBone) this.initialRotations.spine = this.spineBone.rotation.clone();

        this.scene.add(this.model);
      },
      undefined,
      (error) => {
        console.error('Error loading 3D avatar:', error);
      }
    );
  }

  setupBackgroundParticles() {
    // 60 deep space ambient cosmic dust particles (z < -1.2)
    const count = 60;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cPurple = new THREE.Color(0xa855f7);
    const cCyan = new THREE.Color(0x38bdf8);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4.5;
      pos[i * 3 + 1] = 0.35 + (Math.random() - 0.5) * 3.5;
      pos[i * 3 + 2] = -1.5 - Math.random() * 2.5; // Deep behind character

      const r = Math.random();
      const color = r < 0.5 ? cPurple : (r < 0.8 ? cCyan : cWhite);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
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

  startSpeaking(gesture = 'talk') {
    this.isSpeaking = true;
    this.speechGesture = gesture;
    if (gesture === 'nod' && !this.isNodding) {
      this.isNodding = true;
      this.nodProgress = 0;
    }
  }

  updateSpeechGesture(gesture) {
    this.speechGesture = gesture;
    if (gesture === 'nod' && !this.isNodding) {
      this.isNodding = true;
      this.nodProgress = 0;
    }
  }

  stopSpeaking() {
    this.isSpeaking = false;
    this.speechGesture = null;
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    // Smooth spring lerp for mouse coordinates
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // Interactive click nod offset
    let nodOffset = 0;
    if (this.isNodding) {
      this.nodProgress += 0.08;
      nodOffset = Math.sin(this.nodProgress * Math.PI) * 0.28;
      if (this.nodProgress >= 1) {
        this.isNodding = false;
        this.nodProgress = 0;
      }
    }

    // Dynamic camera dolly-in during introduction speech
    const targetCamZ = this.isSpeaking ? 1.22 : 1.38;
    const targetCamY = this.isSpeaking ? 0.38 : 0.36;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.04;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.04;

    // Speaking rhythm & conversational gesture
    let speechBob = 0;
    let speechRoll = 0;
    if (this.isSpeaking) {
      speechBob = Math.sin(time * 3.8) * 0.022 + Math.sin(time * 1.6) * 0.012;
      speechRoll = Math.cos(time * 2.4) * 0.012;
    }

    // Subtle body yaw follows cursor
    if (this.model) {
      this.model.rotation.y = this.mouse.x * 0.12;
    }

    // 1. NATURAL HEAD TRACKING (Standard Three.js RPM coordinate frame)
    // - Y-axis: Yaw (horizontal turn left/right)
    // - X-axis: Pitch (vertical tilt up/down)
    // - Z-axis: Roll (subtle tilt)
    if (this.headBone && this.initialRotations.head) {
      const headYaw = this.mouse.x * 0.45; // Right when mouse is right, left when left
      const headPitch = -this.mouse.y * 0.28 + nodOffset + speechBob; // Up when mouse is up, down when down
      const headRoll = -this.mouse.x * 0.06 + speechRoll;

      this.headBone.rotation.y = this.initialRotations.head.y + headYaw;
      this.headBone.rotation.x = this.initialRotations.head.x + headPitch;
      this.headBone.rotation.z = this.initialRotations.head.z + headRoll;
    }

    if (this.neckBone && this.initialRotations.neck) {
      const neckYaw = this.mouse.x * 0.20;
      const neckPitch = -this.mouse.y * 0.12 + speechBob * 0.5;

      this.neckBone.rotation.y = this.initialRotations.neck.y + neckYaw;
      this.neckBone.rotation.x = this.initialRotations.neck.x + neckPitch;
    }

    // 2. REAL EYE GAZE TRACKING (Eyes look directly towards cursor)
    if (this.leftEyeBone && this.initialRotations.leftEye) {
      this.leftEyeBone.rotation.y = this.initialRotations.leftEye.y + this.mouse.x * 0.12;
      this.leftEyeBone.rotation.x = this.initialRotations.leftEye.x - this.mouse.y * 0.10;
    }
    if (this.rightEyeBone && this.initialRotations.rightEye) {
      this.rightEyeBone.rotation.y = this.initialRotations.rightEye.y + this.mouse.x * 0.12;
      this.rightEyeBone.rotation.x = this.initialRotations.rightEye.x - this.mouse.y * 0.10;
    }

    // 3. SUBTLE NATURAL BREATHING (Torso remains anchored)
    if (this.spineBone && this.initialRotations.spine) {
      const breathRate = this.isSpeaking ? 3.0 : 2.0;
      const breathAmp = this.isSpeaking ? 0.022 : 0.015;
      this.spineBone.rotation.x = this.initialRotations.spine.x + Math.sin(time * breathRate) * breathAmp;
    }

    // 4. Overhead Spotlight subtle tracking for dynamic highlights
    if (this.overheadLight) {
      this.overheadLight.position.x = this.mouse.x * 0.35;
    }

    // 5. Deep background star parallax drift
    if (this.dustParticles) {
      this.dustParticles.rotation.y = this.mouse.x * 0.1;
      this.dustParticles.rotation.x = -this.mouse.y * 0.06;
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





