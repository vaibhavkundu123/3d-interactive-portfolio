import * as THREE from 'three';

export class AvatarScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Mouse tracking
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 500;
    const height = this.container.clientHeight || 560;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    // 3. Renderer with transparent background
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // 4. Ambient Background Cosmic Dust & Starfield (Deep background only, never in front of avatar)
    const particleCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0xa855f7); // Purple
    const c2 = new THREE.Color(0x38bdf8); // Cyan
    const c3 = new THREE.Color(0xffffff); // White

    for (let i = 0; i < particleCount; i++) {
      // Keep particles well spread out in perimeter and deep background
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.4 + Math.random() * 2.2; // Don't place in center
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      positions[i * 3 + 2] = -0.5 - Math.random() * 2.5; // Strictly behind avatar

      const pick = Math.random();
      const col = pick < 0.4 ? c1 : (pick < 0.75 ? c2 : c3);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustParticles);

    // 5. Event Listeners
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);

    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('mousemove', this.boundOnMouseMove);
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });

    // 6. Animation loop
    this.animate();
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

    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    // Slow ambient drift of background stars with subtle parallax
    if (this.dustParticles) {
      this.dustParticles.rotation.y = this.mouse.x * 0.15;
      this.dustParticles.rotation.x = -this.mouse.y * 0.1;

      const positions = this.dustParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.0015;
        if (positions[i + 1] < -2.5) {
          positions[i + 1] = 2.5;
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
    this.renderer?.dispose();
    if (this.container && this.renderer?.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}



