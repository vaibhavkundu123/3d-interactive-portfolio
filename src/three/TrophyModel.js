import * as THREE from 'three';

export class TrophyModel {
  constructor(scene, position = [-40, 0, 35]) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(position[0], 2.5, position[2]);

    this.init();
    this.scene.add(this.group);
  }

  init() {
    // Pedestal base
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.8, 0.6, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -1;
    this.group.add(base);

    // Glowing rim around base
    const rimGeo = new THREE.TorusGeometry(1.6, 0.08, 8, 32);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.7;
    this.group.add(rim);

    // Gold material for the trophy
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xb45309,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.15
    });

    // Trophy cup body (lathed or stacked geometries)
    this.cupGroup = new THREE.Group();

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 16);
    const stem = new THREE.Mesh(stemGeo, goldMat);
    stem.position.y = 0;
    this.cupGroup.add(stem);

    // Cup bowl
    const bowlGeo = new THREE.CylinderGeometry(1.2, 0.4, 1.4, 16, 1, true);
    const bowl = new THREE.Mesh(bowlGeo, goldMat);
    bowl.position.y = 1.0;
    this.cupGroup.add(bowl);

    // Cup bottom cap
    const capGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    const cap = new THREE.Mesh(capGeo, goldMat);
    cap.position.y = 0.35;
    this.cupGroup.add(cap);

    // Handles
    const handleGeo = new THREE.TorusGeometry(0.6, 0.09, 8, 24, Math.PI);
    const leftHandle = new THREE.Mesh(handleGeo, goldMat);
    leftHandle.position.set(-1.1, 1.0, 0);
    leftHandle.rotation.z = -Math.PI / 2;
    this.cupGroup.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeo, goldMat);
    rightHandle.position.set(1.1, 1.0, 0);
    rightHandle.rotation.z = Math.PI / 2;
    this.cupGroup.add(rightHandle);

    // Floating IEEE Star Emblem in center of cup
    const starGeo = new THREE.OctahedronGeometry(0.5, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    this.star = new THREE.Mesh(starGeo, starMat);
    this.star.position.y = 1.2;
    this.cupGroup.add(this.star);

    // Orbiting particle ring around the trophy
    const orbCount = 36;
    const orbGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(orbCount * 3);

    for (let i = 0; i < orbCount; i++) {
      const angle = (i / orbCount) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * 2.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5 + 1.0;
      positions[i * 3 + 2] = Math.sin(angle) * 2.2;
    }

    orbGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const orbMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.2,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.sparkles = new THREE.Points(orbGeo, orbMat);
    this.cupGroup.add(this.sparkles);

    this.group.add(this.cupGroup);
  }

  update(time) {
    if (this.cupGroup) {
      this.cupGroup.rotation.y = time * 0.7;
      this.cupGroup.position.y = Math.sin(time * 2) * 0.2;
    }
    if (this.star) {
      this.star.rotation.x = time * 1.5;
      this.star.rotation.z = time * 1.2;
    }
    if (this.sparkles) {
      this.sparkles.rotation.y = time * -1.2;
    }
  }
}
