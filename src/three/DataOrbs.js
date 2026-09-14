import * as THREE from 'three';
import { sound } from './SoundEngine';

export class DataOrbs {
  constructor(scene, onCollect) {
    this.scene = scene;
    this.onCollect = onCollect;
    this.orbs = [];
    this.group = new THREE.Group();

    this.init();
    this.scene.add(this.group);
  }

  init() {
    // Generate 12 collectible data cubes scattered throughout the terrain
    const orbPositions = [
      [15, 1, 10],
      [25, 1, -12],
      [-18, 1, 15],
      [-22, 1, -15],
      [10, 1, 30],
      [-12, 1, 35],
      [20, 1, 45],
      [-30, 1, 10],
      [30, 1, -30],
      [-15, 1, -40],
      [12, 1, -45],
      [-32, 1, -38]
    ];

    const cubeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const wireGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1);

    orbPositions.forEach((pos, idx) => {
      const orbGroup = new THREE.Group();
      orbGroup.position.set(pos[0], pos[1], pos[2]);

      const colors = [0x00f5ff, 0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899, 0x8b5cf6];
      const color = colors[idx % colors.length];

      // Inner glowing core
      const coreMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.2
      });
      const core = new THREE.Mesh(cubeGeo, coreMat);
      orbGroup.add(core);

      // Outer wireframe shell
      const wireMat = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      orbGroup.add(wire);

      // Ground beacon ring
      const ringGeo = new THREE.RingGeometry(0.8, 1.0, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.8;
      orbGroup.add(ring);

      orbGroup.userData = {
        id: idx,
        collected: false,
        baseY: pos[1],
        core,
        wire,
        ring,
        color
      };

      this.orbs.push(orbGroup);
      this.group.add(orbGroup);
    });
  }

  checkCollision(playerPosition) {
    for (let i = 0; i < this.orbs.length; i++) {
      const orb = this.orbs[i];
      if (orb.userData.collected) continue;

      const dist = orb.position.distanceTo(playerPosition);
      if (dist < 2.5) {
        orb.userData.collected = true;
        sound.playOrbCollect();

        // Animate shrinking and remove
        let scale = 1;
        const fadeInterval = setInterval(() => {
          scale -= 0.15;
          if (scale <= 0) {
            clearInterval(fadeInterval);
            this.group.remove(orb);
          } else {
            orb.scale.set(scale, scale, scale);
          }
        }, 30);

        if (this.onCollect) {
          this.onCollect(orb.userData.id, orb.userData.color);
        }
        return true;
      }
    }
    return false;
  }

  update(time) {
    for (let i = 0; i < this.orbs.length; i++) {
      const orb = this.orbs[i];
      if (orb.userData.collected) continue;

      orb.position.y = orb.userData.baseY + Math.sin(time * 2.5 + orb.userData.id) * 0.25;
      orb.userData.core.rotation.x = time * 1.5;
      orb.userData.core.rotation.y = time * 1.2;
      orb.userData.wire.rotation.x = time * -0.8;
      orb.userData.wire.rotation.y = time * -1.0;
    }
  }
}
