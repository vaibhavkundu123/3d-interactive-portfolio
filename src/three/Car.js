import * as THREE from 'three';
import { sound } from './SoundEngine';

export class Car {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // Physics
    this.position = new THREE.Vector3(0, 0.45, 14);
    this.velocity = new THREE.Vector3();
    this.speed = 0;
    this.maxSpeed = 26;
    this.reverseMaxSpeed = 12;
    this.acceleration = 35;
    this.braking = 45;
    this.friction = 0.94;
    this.rotationY = 0;
    this.turnSpeed = 2.8;

    // Suspension & Jump
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.gravity = 38;
    this.bodyPitch = 0;
    this.bodyRoll = 0;

    // Inputs
    this.inputs = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    this.joystickVector = { x: 0, y: 0 };
    this.wheelRotation = 0;
    this.frontSteeringAngle = 0;

    this.initModel();
    this.scene.add(this.group);
    this.setupKeyboard();
  }

  initModel() {
    this.carBody = new THREE.Group();

    // Materials
    const paintColor = 0x3b82f6; // Vibrant royal blue arcade paint
    const paintMat = new THREE.MeshStandardMaterial({
      color: paintColor,
      roughness: 0.25,
      metalness: 0.4
    });

    const whiteStripeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.8
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.85,
      roughness: 0.2
    });

    // 1. Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(1.6, 0.5, 2.8);
    const chassis = new THREE.Mesh(chassisGeo, paintMat);
    chassis.position.y = 0.4;
    chassis.castShadow = true;
    this.carBody.add(chassis);

    // Racing Stripe
    const stripeGeo = new THREE.BoxGeometry(0.35, 0.52, 2.82);
    const stripe = new THREE.Mesh(stripeGeo, whiteStripeMat);
    stripe.position.y = 0.4;
    this.carBody.add(stripe);

    // 2. Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(1.3, 0.55, 1.4);
    const cabin = new THREE.Mesh(cabinGeo, paintMat);
    cabin.position.set(0, 0.88, -0.15);
    cabin.castShadow = true;
    this.carBody.add(cabin);

    // Windshield & Windows
    const windshieldGeo = new THREE.BoxGeometry(1.22, 0.42, 1.32);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 0.88, -0.15);
    this.carBody.add(windshield);

    // Roof rack / spoiler
    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.3), paintMat);
    spoilerWing.position.set(0, 0.95, 1.25);
    this.carBody.add(spoilerWing);

    const spoilerLeftPost = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), whiteStripeMat);
    spoilerLeftPost.position.set(-0.55, 0.75, 1.25);
    this.carBody.add(spoilerLeftPost);

    const spoilerRightPost = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), whiteStripeMat);
    spoilerRightPost.position.set(0.55, 0.75, 1.25);
    this.carBody.add(spoilerRightPost);

    // 3. Headlights (with actual SpotLights)
    const headlightGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16);
    headlightGeo.rotateX(Math.PI / 2);

    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });

    const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    leftHeadlight.position.set(-0.55, 0.45, -1.4);
    this.carBody.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    rightHeadlight.position.set(0.55, 0.45, -1.4);
    this.carBody.add(rightHeadlight);

    // Front Light Cones
    this.spotLightLeft = new THREE.SpotLight(0xfffbeb, 4, 30, Math.PI / 6, 0.4, 1.5);
    this.spotLightLeft.position.set(-0.55, 0.45, -1.4);
    this.spotTargetLeft = new THREE.Object3D();
    this.spotTargetLeft.position.set(-0.55, 0, -10);
    this.carBody.add(this.spotLightLeft);
    this.carBody.add(this.spotTargetLeft);
    this.spotLightLeft.target = this.spotTargetLeft;

    this.spotLightRight = new THREE.SpotLight(0xfffbeb, 4, 30, Math.PI / 6, 0.4, 1.5);
    this.spotLightRight.position.set(0.55, 0.45, -1.4);
    this.spotTargetRight = new THREE.Object3D();
    this.spotTargetRight.position.set(0.55, 0, -10);
    this.carBody.add(this.spotLightRight);
    this.carBody.add(this.spotTargetRight);
    this.spotLightRight.target = this.spotTargetRight;

    // 4. Taillights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const tailGeo = new THREE.BoxGeometry(0.25, 0.12, 0.08);

    const leftTail = new THREE.Mesh(tailGeo, tailMat);
    leftTail.position.set(-0.55, 0.45, 1.41);
    this.carBody.add(leftTail);

    const rightTail = new THREE.Mesh(tailGeo, tailMat);
    rightTail.position.set(0.55, 0.45, 1.41);
    this.carBody.add(rightTail);

    this.group.add(this.carBody);

    // 5. Four Rotating Wheels
    const createWheel = () => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.25, 20), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      return { root: wGroup, tire };
    };

    // Front Left & Right (pivotable)
    this.wheelFL = createWheel();
    this.pivotFL = new THREE.Group();
    this.pivotFL.position.set(-0.85, 0.32, -0.85);
    this.pivotFL.add(this.wheelFL.root);
    this.group.add(this.pivotFL);

    this.wheelFR = createWheel();
    this.pivotFR = new THREE.Group();
    this.pivotFR.position.set(0.85, 0.32, -0.85);
    this.pivotFR.add(this.wheelFR.root);
    this.group.add(this.pivotFR);

    // Rear Left & Right (fixed steer, rotating)
    this.wheelRL = createWheel();
    this.wheelRL.root.position.set(-0.85, 0.32, 0.85);
    this.group.add(this.wheelRL.root);

    this.wheelRR = createWheel();
    this.wheelRR.root.position.set(0.85, 0.32, 0.85);
    this.group.add(this.wheelRR.root);
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
        case 'KeyH':
          this.honk();
          break;
        case 'Space':
          this.jump();
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

  honk() {
    sound.playHorn();
    // Fun squash & stretch animation on honk
    this.carBody.scale.set(1.15, 0.85, 1.15);
    setTimeout(() => {
      this.carBody.scale.set(1, 1, 1);
    }, 180);
  }

  jump() {
    if (this.isGrounded) {
      this.verticalVelocity = 12;
      this.isGrounded = false;
      sound.playJump();
    }
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
    this.position.y = 0.45;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.speed = 0;
    this.velocity.set(0, 0, 0);
  }

  update(delta, time) {
    // 1. Steering & Front Wheel Angle
    let steerInput = 0;
    if (this.inputs.left) steerInput += 1;
    if (this.inputs.right) steerInput -= 1;
    if (Math.abs(this.joystickVector.x) > 0.1) {
      steerInput -= this.joystickVector.x;
    }

    const targetSteerAngle = steerInput * 0.45;
    this.frontSteeringAngle += (targetSteerAngle - this.frontSteeringAngle) * delta * 12;
    this.pivotFL.rotation.y = this.frontSteeringAngle;
    this.pivotFR.rotation.y = this.frontSteeringAngle;

    // Car rotates when moving
    if (Math.abs(this.speed) > 0.1) {
      const reverseFactor = this.speed < 0 ? -1 : 1;
      this.rotationY += steerInput * this.turnSpeed * delta * (this.speed / this.maxSpeed) * reverseFactor;
      this.group.rotation.y = this.rotationY;
    }

    // 2. Acceleration / Deceleration
    let accelInput = 0;
    if (this.inputs.forward) accelInput += 1;
    if (this.inputs.backward) accelInput -= 0.8;
    if (Math.abs(this.joystickVector.y) > 0.1) {
      accelInput -= this.joystickVector.y;
    }

    if (accelInput > 0) {
      this.speed += accelInput * this.acceleration * delta;
      this.speed = Math.min(this.maxSpeed, this.speed);
    } else if (accelInput < 0) {
      this.speed += accelInput * this.braking * delta;
      this.speed = Math.max(-this.reverseMaxSpeed, this.speed);
    } else {
      this.speed *= this.friction;
      if (Math.abs(this.speed) < 0.05) this.speed = 0;
    }

    // Move in facing direction
    const forwardX = -Math.sin(this.rotationY);
    const forwardZ = -Math.cos(this.rotationY);

    this.position.x += forwardX * this.speed * delta;
    this.position.z += forwardZ * this.speed * delta;

    // Island boundary clamp
    this.position.x = Math.max(-85, Math.min(85, this.position.x));
    this.position.z = Math.max(-85, Math.min(85, this.position.z));

    // 3. Vertical Physics (Gravity & Jumping)
    if (!this.isGrounded) {
      this.verticalVelocity -= this.gravity * delta;
      this.position.y += this.verticalVelocity * delta;

      if (this.position.y <= 0.45) {
        this.position.y = 0.45;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }
    }

    this.group.position.copy(this.position);

    // 4. Wheels rotation
    const wheelCircumference = Math.PI * 0.64;
    const distanceTraveled = this.speed * delta;
    this.wheelRotation -= (distanceTraveled / wheelCircumference) * Math.PI * 2;

    this.wheelFL.tire.rotation.x = this.wheelRotation;
    this.wheelFR.tire.rotation.x = this.wheelRotation;
    this.wheelRL.tire.rotation.x = this.wheelRotation;
    this.wheelRR.tire.rotation.x = this.wheelRotation;

    // 5. Suspension Dynamics (Pitch on accel/brake, Roll on turns)
    const targetPitch = (accelInput * 0.06);
    this.bodyPitch += (targetPitch - this.bodyPitch) * delta * 8;
    this.carBody.rotation.x = this.bodyPitch;

    const targetRoll = (steerInput * (this.speed / this.maxSpeed) * 0.12);
    this.bodyRoll += (targetRoll - this.bodyRoll) * delta * 8;
    this.carBody.rotation.z = this.bodyRoll;

    // Sound engine speed update
    sound.updateEngine(Math.abs(this.speed) / this.maxSpeed);
  }
}
