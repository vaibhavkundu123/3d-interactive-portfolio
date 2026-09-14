import * as THREE from 'three';
import { Rover } from './Rover';
import { Stations } from './Stations';
import { DataOrbs } from './DataOrbs';

export class World {
  constructor(canvasContainer, options = {}) {
    this.container = canvasContainer;
    this.onStationNearby = options.onStationNearby;
    this.onScoreUpdate = options.onScoreUpdate;
    this.onSpeedUpdate = options.onSpeedUpdate;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Camera modes: 'CHASE' or 'CINEMATIC'
    this.cameraMode = 'CHASE';
    this.targetCameraPos = new THREE.Vector3();
    this.targetCameraLookAt = new THREE.Vector3();

    // Components
    this.rover = null;
    this.stations = null;
    this.dataOrbs = null;

    this.init();
  }

  init() {
    // 1. Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050814);
    this.scene.fog = new THREE.FogExp2(0x050814, 0.015);

    // 2. Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 500);
    this.camera.position.set(0, 10, 30);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight.position.set(40, 60, 30);
    this.scene.add(dirLight);

    const purpleBackLight = new THREE.DirectionalLight(0xa855f7, 0.8);
    purpleBackLight.position.set(-40, 30, -40);
    this.scene.add(purpleBackLight);

    // 5. Cyber Terrain Ground & Grid
    this.setupGround();

    // 6. Deep Space Starfield & Celestial Dust
    this.setupCosmos();

    // 7. Perimeter Boundary Beacons
    this.setupPerimeter();

    // 8. Game Entities
    this.rover = new Rover(this.scene);

    this.stations = new Stations(this.scene, (station) => {
      if (this.onStationNearby) this.onStationNearby(station);
    });

    this.dataOrbs = new DataOrbs(this.scene, (id, color) => {
      if (this.onScoreUpdate) this.onScoreUpdate(100);
    });

    // 9. Resize Listener
    window.addEventListener('resize', this.onResize.bind(this));

    // 10. Start Animation Loop
    this.animate();
  }

  setupGround() {
    // Dark metallic floor
    const floorGeo = new THREE.PlaneGeometry(220, 220);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070b19,
      roughness: 0.3,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    this.scene.add(floor);

    // Primary Neon Grid
    const gridHelper = new THREE.GridHelper(200, 100, 0x00f5ff, 0x1e293b);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Secondary pulsing cyber subgrid
    const subGrid = new THREE.GridHelper(200, 25, 0x3b82f6, 0x0f172a);
    subGrid.position.y = 0.02;
    this.scene.add(subGrid);
  }

  setupCosmos() {
    // 2500 Star particles
    const starCount = 2500;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x00f5ff),
      new THREE.Color(0xffffff),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xa855f7),
      new THREE.Color(0xf59e0b)
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 100 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) + 5; // keep mostly above horizon
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);
  }

  setupPerimeter() {
    // Boundary fence posts
    const pylonGeo = new THREE.CylinderGeometry(0.3, 0.5, 6, 8);
    const pylonMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });

    const bound = 80;
    const corners = [
      [-bound, -bound],
      [bound, -bound],
      [bound, bound],
      [-bound, bound]
    ];

    corners.forEach(([x, z]) => {
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(x, 3, z);
      this.scene.add(pylon);
    });
  }

  teleportToStation(station) {
    if (!station) return;
    this.cameraMode = 'CINEMATIC';

    // Move rover close to station
    const offsetZ = station.id === 'about' ? 10 : 8;
    this.rover.teleportTo(station.position[0], station.position[2] + offsetZ);

    // Target camera view
    this.targetCameraPos.set(
      station.position[0],
      station.position[1] + 6,
      station.position[2] + 16
    );
    this.targetCameraLookAt.set(
      station.position[0],
      station.position[1] + 2.5,
      station.position[2]
    );
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
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

    // 1. Update entities
    this.rover.update(delta, time);
    this.stations.update(time, this.camera.position);
    this.dataOrbs.update(time);

    // 2. Collision & Proximity
    this.stations.checkProximity(this.rover.position);
    this.dataOrbs.checkCollision(this.rover.position);

    // 3. Inform HUD of speed
    if (this.onSpeedUpdate) {
      this.onSpeedUpdate(this.rover.speed);
    }

    // 4. Update Camera
    if (this.cameraMode === 'CHASE') {
      // Dynamic chase camera behind the hovercraft
      const chaseDistance = 7.5 + Math.abs(this.rover.speed) * 0.18;
      const chaseHeight = 3.2 + Math.abs(this.rover.speed) * 0.05;

      const angle = this.rover.rotationY;
      const camX = this.rover.position.x + Math.sin(angle) * chaseDistance;
      const camZ = this.rover.position.z + Math.cos(angle) * chaseDistance;
      const camY = this.rover.position.y + chaseHeight;

      this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), delta * 4);

      // Look slightly ahead of hovercraft
      const lookAtX = this.rover.position.x - Math.sin(angle) * 4;
      const lookAtZ = this.rover.position.z - Math.cos(angle) * 4;
      const lookAtY = this.rover.position.y + 1.2;

      this.camera.lookAt(lookAtX, lookAtY, lookAtZ);

    } else if (this.cameraMode === 'CINEMATIC') {
      this.camera.position.lerp(this.targetCameraPos, delta * 3);
      const curLook = new THREE.Vector3();
      this.camera.getWorldDirection(curLook);
      this.camera.lookAt(this.targetCameraLookAt);
    }

    // 5. Twinkle cosmos stars
    if (this.stars) {
      this.stars.rotation.y = time * 0.015;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    this.renderer?.dispose();
    if (this.container && this.renderer?.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
