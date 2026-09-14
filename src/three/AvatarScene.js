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

    // 3D Avatar mesh & material
    this.avatarMesh = null;
    this.shaderMat = null;
    this.dustParticles = null;

    // Animation state
    this.isNodding = false;
    this.nodProgress = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 520;
    const height = this.container.clientHeight || 580;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 4.4);

    // 3. WebGL Renderer
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

    // 4. Lighting (Overhead studio spotlight & purple rim lights)
    this.setupLighting();

    // 5. 3D Depth-Parallax Avatar (The Exact Character with Real-time Head Turn)
    this.setupAvatarMesh();

    // 6. Deep Ambient Cosmic Dust (Strictly in background)
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

    // Overhead Studio Spotlight
    this.overheadLight = new THREE.SpotLight(0xffffff, 6.0, 14, Math.PI / 4, 0.45, 1.2);
    this.overheadLight.position.set(0, 4.5, 1.0);
    this.spotTarget = new THREE.Object3D();
    this.spotTarget.position.set(0, 0, 0);
    this.scene.add(this.spotTarget);
    this.overheadLight.target = this.spotTarget;
    this.scene.add(this.overheadLight);

    // Left Purple Rim Light
    this.rimLeft = new THREE.PointLight(0xa855f7, 5.0, 8);
    this.rimLeft.position.set(-2.4, 0.5, -0.8);
    this.scene.add(this.rimLeft);

    // Right Violet Rim Light
    this.rimRight = new THREE.PointLight(0x8b5cf6, 5.0, 8);
    this.rimRight.position.set(2.4, 0.5, -0.8);
    this.scene.add(this.rimRight);
  }

  setupAvatarMesh() {
    const loader = new THREE.TextureLoader();

    // Load Exact Character Color Texture and Depth Map
    loader.load('/avatar_exact.png', (colorTex) => {
      colorTex.colorSpace = THREE.SRGBColorSpace;

      loader.load('/avatar_exact_depth.jpg', (depthTex) => {
        // 2.5D Volumetric Parallax Shader
        // This causes the nose, cap brim, chin, and eyes to shift with true 3D perspective
        // so the head literally turns to look in the direction of the cursor!
        const vertexShader = `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;

        const fragmentShader = `
          uniform sampler2D uTexture;
          uniform sampler2D uDepthMap;
          uniform vec2 uMouse;
          varying vec2 vUv;

          void main() {
            // Sample depth value (brighter = closer feature like nose and cap)
            float depth = texture2D(uDepthMap, vUv).r;

            // Perspective parallax offset: closer features move more than farther features
            vec2 parallax = uMouse * (depth - 0.45) * 0.052;
            vec2 uv = clamp(vUv + parallax, 0.0, 1.0);

            // Fetch character color at parallax UV
            vec4 color = texture2D(uTexture, uv);

            // Seamless edge vignette feathering
            float edgeX = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x);
            float edgeY = smoothstep(0.0, 0.03, vUv.y) * smoothstep(1.0, 0.97, vUv.y);
            float alpha = edgeX * edgeY;

            gl_FragColor = vec4(color.rgb, color.a * alpha);
          }
        `;

        this.shaderMat = new THREE.ShaderMaterial({
          uniforms: {
            uTexture: { value: colorTex },
            uDepthMap: { value: depthTex },
            uMouse: { value: new THREE.Vector2(0, 0) }
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          transparent: true,
          side: THREE.FrontSide
        });

        // 3D curved geometry with exact aspect ratio (951 x 1251)
        const height = 3.8;
        const width = height * (951 / 1251);
        const geo = new THREE.PlaneGeometry(width, height, 48, 48);

        // Apply natural spherical curvature to plane vertices
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = -((x * x) / 3.4) - ((y * y) / 11.0);
          pos.setZ(i, z);
        }
        geo.computeVertexNormals();

        this.avatarMesh = new THREE.Mesh(geo, this.shaderMat);
        this.avatarMesh.position.set(0, -0.05, 0);
        this.scene.add(this.avatarMesh);
      });
    });
  }

  setupBackgroundParticles() {
    // Ambient cosmic dust strictly in deep background
    const count = 60;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cPurple = new THREE.Color(0xa855f7);
    const cCyan = new THREE.Color(0x38bdf8);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4.6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4.6;
      pos[i * 3 + 2] = -1.2 - Math.random() * 2.2;

      const r = Math.random();
      const color = r < 0.45 ? cPurple : (r < 0.8 ? cCyan : cWhite);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.038,
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

    // Smooth spring interpolation for mouse coordinates
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

    // 1. UPDATE PARALLAX SHADER UNIFORMS (Head features shift in 3D perspective)
    if (this.shaderMat) {
      this.shaderMat.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    }

    // 2. 3D HEAD ROTATION & TILT
    if (this.avatarMesh) {
      const targetYaw = this.mouse.x * 0.35; // Head turns horizontally
      let targetPitch = -this.mouse.y * 0.26; // Head tilts vertically
      const targetRoll = -this.mouse.x * 0.08;

      // Handle interactive click nod
      if (this.isNodding) {
        this.nodProgress += 0.08;
        targetPitch += Math.sin(this.nodProgress * Math.PI) * 0.28;
        if (this.nodProgress >= 1) {
          this.isNodding = false;
          this.nodProgress = 0;
        }
      }

      this.avatarMesh.rotation.y += (targetYaw - this.avatarMesh.rotation.y) * 0.1;
      this.avatarMesh.rotation.x += (targetPitch - this.avatarMesh.rotation.x) * 0.1;
      this.avatarMesh.rotation.z += (targetRoll - this.avatarMesh.rotation.z) * 0.1;

      // Subtle breathing motion
      this.avatarMesh.position.y = -0.05 + Math.sin(time * 2.2) * 0.025;
      this.avatarMesh.position.x = this.mouse.x * 0.1;
    }

    // 3. Overhead Spotlight slight tracking
    if (this.overheadLight) {
      this.overheadLight.intensity = 6.0 + Math.sin(time * 2.8) * 0.4;
      this.overheadLight.position.x = this.mouse.x * 0.35;
    }

    // 4. Background star drift with parallax
    if (this.dustParticles) {
      this.dustParticles.rotation.y = this.mouse.x * 0.12;
      this.dustParticles.rotation.x = -this.mouse.y * 0.08;

      const pos = this.dustParticles.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] -= 0.0015;
        if (pos[i + 1] < -2.4) {
          pos[i + 1] = 2.4;
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





