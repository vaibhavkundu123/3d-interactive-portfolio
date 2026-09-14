import * as THREE from 'three';
import { sound } from './SoundEngine';

export class Rover {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();

    // Physics state
    this.position = new THREE.Vector3(0, 1.2, 16);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = 0;
    this.maxSpeed = 22;
    this.acceleration = 32;
    this.friction = 0.92;
    this.rotationY = 0;
    this.turnSpeed = 2.4;
    this.tilt = 0;

    // Inputs
    this.inputs = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    this.joystickVector = { x: 0, y: 0 };

    this.initModel();
    this.scene.add(this.mesh);
    this.setupKeyboard();
  }

  initModel() {
    this.bodyGroup = new THREE.Group();

    // 1. Central Cyber Chassis
    const chassisGeo = new THREE.BoxGeometry(1.6, 0.45, 2.6);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      metalness: 0.8,
      roughness: 0.2
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.2;
    this.bodyGroup.add(chassis);

    // Glowing side trim lines
    const trimGeo = new THREE.BoxGeometry(1.7, 0.08, 2.4);
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = 0.2;
    this.bodyGroup.add(trim);

    // 2. Cockpit Canopy (Glowing Neon Glass)
    const cockpitGeo = new THREE.ConeGeometry(0.65, 1.6, 4);
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x005577,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.rotation.x = Math.PI / 2;
    cockpit.rotation.y = Math.PI / 4;
    cockpit.position.set(0, 0.5, -0.2);
    this.bodyGroup.add(cockpit);

    // 3. Swept Hover Wings
    const wingGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Left Wing
      -0.8, 0.2, 0.5,
      -2.2, 0.2, 1.2,
      -0.8, 0.2, -0.8,
      // Right Wing
      0.8, 0.2, 0.5,
      0.8, 0.2, -0.8,
      2.2, 0.2, 1.2
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    wingGeo.computeVertexNormals();

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
      metalness: 0.9,
      roughness: 0.3
    });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    this.bodyGroup.add(wings);

    // Wingtips with neon lights
    const wingLightGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const leftLight = new THREE.Mesh(wingLightGeo, new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
    leftLight.position.set(-2.2, 0.2, 1.2);
    this.bodyGroup.add(leftLight);

    const rightLight = new THREE.Mesh(wingLightGeo, new THREE.MeshBasicMaterial({ color: 0x00f5ff }));
    rightLight.position.set(2.2, 0.2, 1.2);
    this.bodyGroup.add(rightLight);

    // 4. Dual Plasma Thrusters (Rear)
    const thrusterGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.6, 16);
    const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });

    const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    leftThruster.rotation.x = Math.PI / 2;
    leftThruster.position.set(-0.5, 0.25, 1.3);
    this.bodyGroup.add(leftThruster);

    const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    rightThruster.rotation.x = Math.PI / 2;
    rightThruster.position.set(0.5, 0.25, 1.3);
    this.bodyGroup.add(rightThruster);

    // Plasma Exhaust Glow
    const plumeGeo = new THREE.ConeGeometry(0.24, 0.9, 16);
    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.8
    });

    this.leftPlume = new THREE.Mesh(plumeGeo, plumeMat);
    this.leftPlume.rotation.x = -Math.PI / 2;
    this.leftPlume.position.set(-0.5, 0.25, 1.8);
    this.bodyGroup.add(this.leftPlume);

    this.rightPlume = new THREE.Mesh(plumeGeo, plumeMat.clone());
    this.rightPlume.rotation.x = -Math.PI / 2;
    this.rightPlume.position.set(0.5, 0.25, 1.8);
    this.bodyGroup.add(this.rightPlume);

    // Ground Hover Light
    const hoverLight = new THREE.PointLight(0x00f5ff, 2, 8);
    hoverLight.position.set(0, -0.4, 0);
    this.bodyGroup.add(hoverLight);

    this.mesh.add(this.bodyGroup);
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      sound.ensureContext();
      sound.startEngine();

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.inputs.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.inputs.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.inputs.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.inputs.right = true;
          break;
        default:
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.inputs.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.inputs.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.inputs.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.inputs.right = false;
          break;
        default:
          break;
      }
    });
  }

  setJoystickVector(x, y) {
    this.joystickVector.x = x;
    this.joystickVector.y = y;
    if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
      sound.ensureContext();
      sound.startEngine();
    }
  }

  teleportTo(x, z) {
    this.position.x = x;
    this.position.z = z;
    this.speed = 0;
    this.velocity.set(0, 0, 0);
  }

  update(delta, time) {
    // 1. Process steering
    let turn = 0;
    if (this.inputs.left) turn += 1;
    if (this.inputs.right) turn -= 1;
    if (Math.abs(this.joystickVector.x) > 0.15) {
      turn -= this.joystickVector.x;
    }

    this.rotationY += turn * this.turnSpeed * delta;
    this.mesh.rotation.y = this.rotationY;

    // Banking tilt when turning
    const targetTilt = turn * 0.22;
    this.tilt += (targetTilt - this.tilt) * delta * 5;
    this.bodyGroup.rotation.z = this.tilt;

    // 2. Process acceleration
    let accel = 0;
    if (this.inputs.forward) accel += 1;
    if (this.inputs.backward) accel -= 0.6;
    if (Math.abs(this.joystickVector.y) > 0.15) {
      accel -= this.joystickVector.y; // inverted joystick Y
    }

    if (accel !== 0) {
      this.speed += accel * this.acceleration * delta;
      this.speed = Math.max(-this.maxSpeed * 0.4, Math.min(this.maxSpeed, this.speed));
    } else {
      this.speed *= this.friction;
      if (Math.abs(this.speed) < 0.05) this.speed = 0;
    }

    // Move forward in local facing direction (z is forward in this model)
    const forwardX = -Math.sin(this.rotationY);
    const forwardZ = -Math.cos(this.rotationY);

    this.position.x += forwardX * this.speed * delta;
    this.position.z += forwardZ * this.speed * delta;

    // Clamp within map bounds (-75 to 75)
    this.position.x = Math.max(-75, Math.min(75, this.position.x));
    this.position.z = Math.max(-75, Math.min(75, this.position.z));

    // Hover floating wave
    const hoverY = 1.1 + Math.sin(time * 3.5) * 0.12;
    this.position.y = hoverY;

    this.mesh.position.copy(this.position);

    // Update thruster plumes
    const thrustScale = Math.max(0.4, (this.speed / this.maxSpeed) * 2.2);
    if (this.leftPlume && this.rightPlume) {
      this.leftPlume.scale.set(thrustScale, thrustScale * (1 + Math.sin(time * 20) * 0.2), thrustScale);
      this.rightPlume.scale.set(thrustScale, thrustScale * (1 + Math.cos(time * 20) * 0.2), thrustScale);
    }

    // Sound update
    sound.updateEngine(Math.abs(this.speed) / this.maxSpeed);
  }
}
