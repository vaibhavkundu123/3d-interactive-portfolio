import * as THREE from 'three';
import { Car } from './Car';
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

    // Time of day preset: 'DAY', 'SUNSET', 'NIGHT'
    this.timeOfDay = 'DAY';
    this.cameraMode = 'CHASE';
    this.targetCameraPos = new THREE.Vector3();
    this.targetCameraLookAt = new THREE.Vector3();

    // Components
    this.car = null;
    this.stations = null;
    this.dataOrbs = null;
    this.ramps = [];

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 400);
    this.camera.position.set(0, 16, 28);

    // 3. Renderer with Shadows
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting & Sky
    this.setupLighting();

    // 5. Environment (Island, Roads, Trees, Ramps)
    this.setupIsland();
    this.setupRoads();
    this.setupScenery();
    this.setupRamps();

    // 6. Game Entities
    this.car = new Car(this.scene);

    this.stations = new Stations(this.scene, (station) => {
      if (this.onStationNearby) this.onStationNearby(station);
    });

    this.dataOrbs = new DataOrbs(this.scene, () => {
      if (this.onScoreUpdate) this.onScoreUpdate(100);
    });

    // 7. Resize Handler
    window.addEventListener('resize', this.onResize.bind(this));

    // 8. Start Loop
    this.animate();
  }

  setupLighting() {
    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(this.ambientLight);

    // Main Sun Directional Light
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    this.sunLight.position.set(40, 60, 30);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 150;
    this.sunLight.shadow.camera.left = -60;
    this.sunLight.shadow.camera.right = 60;
    this.sunLight.shadow.camera.top = 60;
    this.sunLight.shadow.camera.bottom = -60;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Fill sky light
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x166534, 0.8);
    this.scene.add(this.hemiLight);

    this.setTimeOfDay('DAY');
  }

  setTimeOfDay(mode) {
    this.timeOfDay = mode;

    if (mode === 'DAY') {
      this.scene.background = new THREE.Color(0x7dd3fc); // Bright sky blue
      this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.008);
      this.ambientLight.intensity = 1.3;
      this.sunLight.color.setHex(0xfffaed);
      this.sunLight.intensity = 2.0;
      this.sunLight.position.set(40, 60, 30);
      if (this.car?.spotLightLeft) {
        this.car.spotLightLeft.intensity = 0;
        this.car.spotLightRight.intensity = 0;
      }

    } else if (mode === 'SUNSET') {
      this.scene.background = new THREE.Color(0xf43f5e); // Sunset Rose/Orange
      this.scene.fog = new THREE.FogExp2(0xf43f5e, 0.009);
      this.ambientLight.intensity = 1.0;
      this.sunLight.color.setHex(0xfb923c);
      this.sunLight.intensity = 1.8;
      this.sunLight.position.set(60, 20, 10);
      if (this.car?.spotLightLeft) {
        this.car.spotLightLeft.intensity = 3;
        this.car.spotLightRight.intensity = 3;
      }

    } else if (mode === 'NIGHT') {
      this.scene.background = new THREE.Color(0x0f172a); // Deep Indigo
      this.scene.fog = new THREE.FogExp2(0x0f172a, 0.012);
      this.ambientLight.intensity = 0.5;
      this.sunLight.color.setHex(0x38bdf8);
      this.sunLight.intensity = 0.8;
      this.sunLight.position.set(-30, 40, -20);
      if (this.car?.spotLightLeft) {
        this.car.spotLightLeft.intensity = 8;
        this.car.spotLightRight.intensity = 8;
      }
    }
  }

  setupIsland() {
    // Lush Green Island Plateau
    const islandGeo = new THREE.CylinderGeometry(85, 95, 6, 32);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e, // Vibrant grass
      roughness: 0.8,
      flatShading: true
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.y = -3.0;
    island.receiveShadow = true;
    this.scene.add(island);

    // Ocean Base underneath
    const oceanGeo = new THREE.PlaneGeometry(350, 350);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Tropical ocean
      roughness: 0.2,
      metalness: 0.3
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -6.2;
    this.scene.add(ocean);
    this.ocean = ocean;
  }

  setupRoads() {
    // Road Ring connecting the stations
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Smooth dark asphalt
      roughness: 0.7
    });

    // Central circular road
    const mainRingGeo = new THREE.RingGeometry(35, 47, 48);
    const mainRing = new THREE.Mesh(mainRingGeo, roadMat);
    mainRing.rotation.x = -Math.PI / 2;
    mainRing.position.y = 0.02;
    mainRing.receiveShadow = true;
    this.scene.add(mainRing);

    // Inner cross road linking to Command Deck at (0,0)
    const crossRoadGeo1 = new THREE.PlaneGeometry(10, 75);
    const cross1 = new THREE.Mesh(crossRoadGeo1, roadMat);
    cross1.rotation.x = -Math.PI / 2;
    cross1.position.y = 0.02;
    cross1.receiveShadow = true;
    this.scene.add(cross1);

    const crossRoadGeo2 = new THREE.PlaneGeometry(75, 10);
    const cross2 = new THREE.Mesh(crossRoadGeo2, roadMat);
    cross2.rotation.x = -Math.PI / 2;
    cross2.position.y = 0.02;
    cross2.receiveShadow = true;
    this.scene.add(cross2);

    // Dashed white center line for the main ring
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const dashRingGeo = new THREE.RingGeometry(40.8, 41.2, 40);
    const dashRing = new THREE.Mesh(dashRingGeo, dashMat);
    dashRing.rotation.x = -Math.PI / 2;
    dashRing.position.y = 0.03;
    this.scene.add(dashRing);
  }

  setupScenery() {
    // Low-poly Pine Trees & Boulders
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, flatShading: true });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, flatShading: true });

    const createTree = (x, z, scale = 1) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);
      treeGroup.scale.set(scale, scale, scale);

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.6, 6), trunkMat);
      trunk.position.y = 0.8;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // 3 Stacked Cones
      for (let c = 0; c < 3; c++) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(1.8 - c * 0.4, 1.8, 6),
          foliageMat
        );
        cone.position.y = 1.8 + c * 1.1;
        cone.castShadow = true;
        treeGroup.add(cone);
      }

      this.scene.add(treeGroup);
    };

    const createRock = (x, z, scale = 1) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 0), rockMat);
      rock.position.set(x, scale * 0.6, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.scene.add(rock);
    };

    // Plant trees across open grassy areas
    const treeCoords = [
      [15, 18], [22, 26], [12, -18], [24, -20],
      [-15, 18], [-22, 25], [-16, -18], [-25, -22],
      [55, 12], [58, -15], [-55, 10], [-58, -12],
      [10, 60], [-12, 62], [14, -62], [-14, -60],
      [50, 45], [-50, 45], [48, -48], [-48, -48]
    ];

    treeCoords.forEach(([x, z]) => {
      createTree(x, z, 0.8 + Math.random() * 0.5);
    });

    // Scatter low-poly rocks
    const rockCoords = [
      [18, 12], [-18, 14], [28, -8], [-28, -6],
      [52, 20], [-52, 22], [8, 55], [-8, 55]
    ];

    rockCoords.forEach(([x, z]) => {
      createRock(x, z, 0.7 + Math.random() * 0.6);
    });
  }

  setupRamps() {
    // Stunt Jump Ramps along the road!
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Wooden stunt ramp
      roughness: 0.6
    });

    const createRamp = (x, z, rotY) => {
      const rampGroup = new THREE.Group();
      rampGroup.position.set(x, 0, z);
      rampGroup.rotation.y = rotY;

      // Wedge geometry
      const rampGeo = new THREE.BufferGeometry();
      const w = 4.0;
      const l = 5.0;
      const h = 1.4;

      const vertices = new Float32Array([
        // Bottom
        -w/2, 0, -l/2,   w/2, 0, -l/2,   w/2, 0, l/2,
        -w/2, 0, -l/2,   w/2, 0, l/2,   -w/2, 0, l/2,
        // Incline
        -w/2, 0, l/2,    w/2, 0, l/2,    w/2, h, -l/2,
        -w/2, 0, l/2,    w/2, h, -l/2,  -w/2, h, -l/2,
        // Back Wall
        -w/2, 0, -l/2,   w/2, 0, -l/2,   w/2, h, -l/2,
        -w/2, 0, -l/2,   w/2, h, -l/2,  -w/2, h, -l/2,
      ]);

      rampGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      rampGeo.computeVertexNormals();

      const mesh = new THREE.Mesh(rampGeo, rampMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      rampGroup.add(mesh);

      // Yellow/Black warning stripes along lip
      const lip = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.1, 0.3),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      lip.position.set(0, h, -l/2);
      rampGroup.add(lip);

      this.scene.add(rampGroup);
      this.ramps.push({ pos: new THREE.Vector3(x, 0, z), height: h, length: l, rotY });
    };

    // Place 3 exciting stunt ramps on the roadway!
    createRamp(20, 41, -Math.PI / 6);
    createRamp(-41, 15, Math.PI / 4);
    createRamp(0, -41, 0);
  }

  teleportToStation(station) {
    if (!station) return;
    this.cameraMode = 'CINEMATIC';

    // Auto-drive car close to the pavilion
    const offsetZ = station.id === 'about' ? 10 : 8;
    this.car.teleportTo(station.position[0], station.position[2] + offsetZ);

    this.targetCameraPos.set(
      station.position[0],
      station.position[1] + 9,
      station.position[2] + 18
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

    // 1. Entities
    this.car.update(delta, time);
    this.stations.update(time, this.camera.position, this.car.position);
    this.dataOrbs.update(time);

    // 2. Proximity & Collision
    this.stations.checkProximity(this.car.position);
    this.dataOrbs.checkCollision(this.car.position);

    // 3. Ramp Jump Detection
    for (let i = 0; i < this.ramps.length; i++) {
      const r = this.ramps[i];
      if (this.car.position.distanceTo(r.pos) < 3.2 && this.car.speed > 8 && this.car.isGrounded) {
        this.car.jump();
      }
    }

    // 4. Inform HUD of speed
    if (this.onSpeedUpdate) {
      this.onSpeedUpdate(this.car.speed);
    }

    // 5. Camera Follow
    if (this.cameraMode === 'CHASE') {
      // Third-person isometric chase camera behind the toy car
      const chaseDistance = 12 + Math.abs(this.car.speed) * 0.15;
      const chaseHeight = 8 + Math.abs(this.car.speed) * 0.05;

      const angle = this.car.rotationY;
      const camX = this.car.position.x + Math.sin(angle) * chaseDistance;
      const camZ = this.car.position.z + Math.cos(angle) * chaseDistance;
      const camY = this.car.position.y + chaseHeight;

      this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), delta * 4.5);

      // Look slightly ahead of car
      const lookAtX = this.car.position.x - Math.sin(angle) * 3;
      const lookAtZ = this.car.position.z - Math.cos(angle) * 3;
      const lookAtY = this.car.position.y + 1.2;

      this.camera.lookAt(lookAtX, lookAtY, lookAtZ);

    } else if (this.cameraMode === 'CINEMATIC') {
      this.camera.position.lerp(this.targetCameraPos, delta * 3);
      this.camera.lookAt(this.targetCameraLookAt);
    }

    // 6. Water wave animation
    if (this.ocean) {
      this.ocean.position.y = -6.2 + Math.sin(time * 1.5) * 0.15;
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
