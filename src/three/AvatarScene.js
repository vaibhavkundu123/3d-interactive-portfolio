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

    // Background cosmic particles
    this.dustParticles = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 520;
    const height = this.container.clientHeight || 580;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera positioned with ample headroom to prevent any clipping
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    this.camera.position.set(0, 1.20, 1.62);
    this.cameraTarget = new THREE.Vector3(0, 1.12, 0);
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
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // 4. Studio Lighting (Key light, Fill, and Purple Rim Lights)
    this.setupLighting();

    // 5. Load Real 3D Rigged Avatar Model (.glb) with Fair White Skin Tone
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
    // Ambient light (soft indigo/violet fill)
    const ambient = new THREE.AmbientLight(0x312e81, 2.0);
    this.scene.add(ambient);

    // Frontal Soft Key Fill Light (warm flattering light for skin tone)
    this.frontLight = new THREE.DirectionalLight(0xfff7ed, 2.6);
    this.frontLight.position.set(0, 1.8, 2.2);
    this.scene.add(this.frontLight);

    // Overhead Studio Spotlight
    this.overheadLight = new THREE.SpotLight(0xffffff, 4.8, 8, Math.PI / 4, 0.5, 1.2);
    this.overheadLight.position.set(0, 3.2, 0.8);
    this.spotTarget = new THREE.Object3D();
    this.spotTarget.position.set(0, 1.15, 0);
    this.scene.add(this.spotTarget);
    this.overheadLight.target = this.spotTarget;
    this.scene.add(this.overheadLight);

    // Left Purple Rim Light (Accentuates silhouette)
    this.rimLeft = new THREE.PointLight(0xa855f7, 5.5, 6);
    this.rimLeft.position.set(-1.6, 1.35, -0.5);
    this.scene.add(this.rimLeft);

    // Right Violet Rim Light
    this.rimRight = new THREE.PointLight(0x818cf8, 4.5, 6);
    this.rimRight.position.set(1.6, 1.35, -0.5);
    this.scene.add(this.rimRight);
  }

  loadAvatarModel() {
    const texLoader = new THREE.TextureLoader();

    // Load custom fair white skin tone textures
    const fairHeadTex = texLoader.load('/avatar_head_fair.png');
    fairHeadTex.flipY = false;
    fairHeadTex.colorSpace = THREE.SRGBColorSpace;

    const fairBodyTex = texLoader.load('/avatar_body_fair.png');
    fairBodyTex.flipY = false;
    fairBodyTex.colorSpace = THREE.SRGBColorSpace;

    const loader = new GLTFLoader();

    loader.load(
      '/avatar.glb',
      (gltf) => {
        this.model = gltf.scene;

        // Position model slightly lower so top of head has generous headroom
        this.model.position.set(0, -0.16, 0);
        this.model.scale.set(1, 1, 1);

        // Find rigged bones and apply fair skin textures
        const applyFairSkin = (mat) => {
          if (!mat) return;
          if (mat.name === 'm006_head') {
            mat.map = fairHeadTex;
            mat.roughness = 0.52;
            mat.needsUpdate = true;
          } else if (mat.name === 'm006_body') {
            mat.map = fairBodyTex;
            mat.roughness = 0.62;
            mat.needsUpdate = true;
          }
        };

        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (Array.isArray(child.material)) {
              child.material.forEach(applyFairSkin);
            } else {
              applyFairSkin(child.material);
            }
          }

          if (child.isBone || child.type === 'Bone' || child.type === 'Object3D') {
            if (child.name === 'Head') this.headBone = child;
            if (child.name === 'Neck') this.neckBone = child;
            if (child.name === 'Bip01 LEye') this.leftEyeBone = child;
            if (child.name === 'Bip01 REye') this.rightEyeBone = child;
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
      pos[i * 3 + 1] = 0.5 + (Math.random() - 0.5) * 3.5;
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

  animate() {
    this.animId = requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    // Smooth spring lerp for mouse coordinates
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // Correct head tracking angles (Inverted so head looks directly TOWARDS cursor)
    const headYaw = -this.mouse.x * 0.52; // Turns right when mouse is right, left when left
    let headPitch = this.mouse.y * 0.32;  // Tilts up when mouse is up, down when down
    const headRoll = this.mouse.x * 0.08; // Natural subtle roll

    // Handle interactive click nod
    if (this.isNodding) {
      this.nodProgress += 0.08;
      headPitch += Math.sin(this.nodProgress * Math.PI) * 0.32;
      if (this.nodProgress >= 1) {
        this.isNodding = false;
        this.nodProgress = 0;
      }
    }

    // 1. REAL 3D HEAD & NECK ROTATION (Following mouse direction)
    if (this.headBone && this.initialRotations.head) {
      this.headBone.rotation.y = this.initialRotations.head.y + headYaw * 0.7;
      this.headBone.rotation.x = this.initialRotations.head.x + headPitch * 0.7;
      this.headBone.rotation.z = this.initialRotations.head.z + headRoll * 0.7;
    }

    if (this.neckBone && this.initialRotations.neck) {
      this.neckBone.rotation.y = this.initialRotations.neck.y + headYaw * 0.3;
      this.neckBone.rotation.x = this.initialRotations.neck.x + headPitch * 0.3;
      this.neckBone.rotation.z = this.initialRotations.neck.z + headRoll * 0.3;
    }

    // 2. REAL EYE GAZE TRACKING (Eyes look directly at cursor)
    if (this.leftEyeBone && this.initialRotations.leftEye) {
      this.leftEyeBone.rotation.y = this.initialRotations.leftEye.y - this.mouse.x * 0.14;
      this.leftEyeBone.rotation.x = this.initialRotations.leftEye.x + this.mouse.y * 0.10;
    }
    if (this.rightEyeBone && this.initialRotations.rightEye) {
      this.rightEyeBone.rotation.y = this.initialRotations.rightEye.y - this.mouse.x * 0.14;
      this.rightEyeBone.rotation.x = this.initialRotations.rightEye.x + this.mouse.y * 0.10;
    }

    // 3. SUBTLE NATURAL BREATHING (Torso remains anchored)
    if (this.spineBone && this.initialRotations.spine) {
      this.spineBone.rotation.x = this.initialRotations.spine.x + Math.sin(time * 2.0) * 0.015;
    }

    // 4. Overhead Spotlight subtle tracking for dynamic specular highlights
    if (this.overheadLight) {
      this.overheadLight.position.x = this.mouse.x * 0.4;
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





