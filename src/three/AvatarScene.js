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

    // 3D Avatar components
    this.avatarMesh = null;
    this.avatarGroup = null;
    this.haloGlow = null;
    this.dustParticles = null;
    this.spotlightCone = null;

    // Interaction & animation state
    this.isNodding = false;
    this.nodProgress = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 500;
    const height = this.container.clientHeight || 560;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 4.6);

    // 3. Renderer with high DPR and Tone Mapping
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

    // 5. Stylized 3D Avatar (Exact character match)
    this.setupAvatar();

    // 6. Volumetric Overhead Spotlight & 3D Dust Particles
    this.setupSpotlightAndParticles();

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
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x2e1065, 1.6);
    this.scene.add(ambientLight);

    // Overhead Main Spotlight
    this.overheadLight = new THREE.SpotLight(0xffffff, 5.5, 15, Math.PI / 4, 0.35, 1.2);
    this.overheadLight.position.set(0, 4.6, 1.0);
    this.overheadTarget = new THREE.Object3D();
    this.overheadTarget.position.set(0, 0, 0);
    this.scene.add(this.overheadTarget);
    this.overheadLight.target = this.overheadTarget;
    this.scene.add(this.overheadLight);

    // Rich Purple Rim Light (Left)
    this.purpleLightLeft = new THREE.PointLight(0xa855f7, 5, 8);
    this.purpleLightLeft.position.set(-2.2, 0.4, -0.6);
    this.scene.add(this.purpleLightLeft);

    // Radiant Violet Rim Light (Right)
    this.purpleLightRight = new THREE.PointLight(0x7c3aed, 5, 8);
    this.purpleLightRight.position.set(2.2, 0.4, -0.6);
    this.scene.add(this.purpleLightRight);

    // Front Cyan Highlight Fill
    const cyanFill = new THREE.DirectionalLight(0x38bdf8, 1.2);
    cyanFill.position.set(1.5, 1.5, 3.5);
    this.scene.add(cyanFill);
  }

  createFeatheredAlphaTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 680;
    const ctx = canvas.getContext('2d');

    // Fill black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 680);

    // Rounded rectangle with feathered falloff
    const cx = 256;
    const cy = 340;
    const radGrad = ctx.createRadialGradient(cx, cy, 140, cx, cy, 330);
    radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    radGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.98)');
    radGrad.addColorStop(0.92, 'rgba(255, 255, 255, 0.5)');
    radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 512, 680);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  setupAvatar() {
    this.avatarGroup = new THREE.Group();
    this.avatarGroup.position.set(0, 0, 0);

    // Radial Purple Halo Glow Behind Avatar
    const haloGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.haloGlow = new THREE.Mesh(haloGeo, haloMat);
    this.haloGlow.position.set(0, 0.1, -0.25);
    this.avatarGroup.add(this.haloGlow);

    // High-Resolution Avatar Texture
    const loader = new THREE.TextureLoader();
    const alphaMap = this.createFeatheredAlphaTexture();

    // Primary: /avatar.jpg (High-Res Render), with fallback
    loader.load(
      '/avatar.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        this.buildAvatarPlane(texture, alphaMap);
      },
      undefined,
      () => {
        // Fallback to original image
        loader.load('/avatar_original.png', (fallbackTex) => {
          fallbackTex.colorSpace = THREE.SRGBColorSpace;
          this.buildAvatarPlane(fallbackTex, alphaMap);
        });
      }
    );

    this.scene.add(this.avatarGroup);
  }

  buildAvatarPlane(texture, alphaMap) {
    // 3D curved plane for rich perspective depth
    const aspect = 3 / 4;
    const height = 3.6;
    const width = height * aspect;

    // Curved plane geometry with subtle convex curvature
    const geo = new THREE.PlaneGeometry(width, height, 32, 32);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Subtle spherical curvature
      const z = -((x * x) / 3.2) - ((y * y) / 10.0);
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      alphaMap: alphaMap,
      transparent: true,
      roughness: 0.45,
      metalness: 0.1,
      side: THREE.FrontSide
    });

    this.avatarMesh = new THREE.Mesh(geo, mat);
    this.avatarMesh.position.set(0, 0, 0);
    this.avatarGroup.add(this.avatarMesh);
  }

  setupSpotlightAndParticles() {
    // 1. Volumetric Overhead Spotlight Beam
    const outerGeo = new THREE.CylinderGeometry(0.25, 2.2, 5.0, 32, 1, true);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xe9d5ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.spotlightCone = new THREE.Mesh(outerGeo, outerMat);
    this.spotlightCone.position.set(0, 2.2, 0);
    this.scene.add(this.spotlightCone);

    // Inner bright core
    const innerGeo = new THREE.CylinderGeometry(0.1, 1.2, 4.8, 32, 1, true);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const innerBeam = new THREE.Mesh(innerGeo, innerMat);
    innerBeam.position.set(0, 2.2, 0);
    this.scene.add(innerBeam);
    this.innerBeam = innerBeam;

    // 2. 3D Floating Dust Sparkles & Stars
    const particleCount = 160;
    const dustGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colPurple = new THREE.Color(0xa855f7);
    const colCyan = new THREE.Color(0x38bdf8);
    const colWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.4;
      positions[i * 3 + 1] = Math.random() * 4.8 - 2.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.8 + 0.2; // Both front and behind

      const pick = Math.random();
      const col = pick < 0.45 ? colPurple : (pick < 0.8 ? colCyan : colWhite);
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
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.dustParticles = new THREE.Points(dustGeo, dustMat);
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

    // Smooth lerp mouse coordinates
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // 1. Dynamic 3D Avatar Tracking (Pitch & Yaw towards cursor)
    if (this.avatarGroup) {
      const targetRotY = this.mouse.x * 0.38;
      let targetRotX = -this.mouse.y * 0.28;
      const targetRotZ = -this.mouse.x * 0.08;

      // Handle Interactive Click Nod
      if (this.isNodding) {
        this.nodProgress += 0.08;
        targetRotX += Math.sin(this.nodProgress * Math.PI) * 0.25;
        if (this.nodProgress >= 1) {
          this.isNodding = false;
          this.nodProgress = 0;
        }
      }

      this.avatarGroup.rotation.y += (targetRotY - this.avatarGroup.rotation.y) * 0.1;
      this.avatarGroup.rotation.x += (targetRotX - this.avatarGroup.rotation.x) * 0.1;
      this.avatarGroup.rotation.z += (targetRotZ - this.avatarGroup.rotation.z) * 0.1;

      // Subtle natural breathing oscillation
      this.avatarGroup.position.y = Math.sin(time * 2.2) * 0.025;
      this.avatarGroup.position.x = this.mouse.x * 0.12;
    }

    // 2. Halo Glow breathing & tracking
    if (this.haloGlow) {
      this.haloGlow.scale.setScalar(1 + Math.sin(time * 2.0) * 0.06);
    }

    // 3. Spotlight beam shimmer & slight tilt towards cursor
    if (this.overheadLight) {
      this.overheadLight.intensity = 5.2 + Math.sin(time * 3.0) * 0.4;
      this.overheadLight.position.x = this.mouse.x * 0.4;
    }
    if (this.spotlightCone) {
      this.spotlightCone.rotation.z = -this.mouse.x * 0.06;
      this.spotlightCone.material.opacity = 0.075 + Math.sin(time * 2.2) * 0.015;
    }

    // 4. Floating 3D dust particle drift & parallax
    if (this.dustParticles) {
      const positions = this.dustParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.0035;
        positions[i] += Math.sin(time + i) * 0.0008;

        if (positions[i + 1] < -2.2) {
          positions[i + 1] = 2.6;
        }
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;

      // Responsive parallax on particle field
      this.dustParticles.rotation.y = this.mouse.x * 0.15;
      this.dustParticles.rotation.x = -this.mouse.y * 0.1;
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


