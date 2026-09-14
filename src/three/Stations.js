import * as THREE from 'three';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { sound } from './SoundEngine';

export class Stations {
  constructor(scene, onProximityChange) {
    this.scene = scene;
    this.onProximityChange = onProximityChange;
    this.stationObjects = [];
    this.currentNearbyStation = null;
    this.skillBlocks = [];
    this.group = new THREE.Group();

    this.init();
    this.scene.add(this.group);
  }

  createSignSprite(title, subtitle, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Rounded sign board with wooden/stone texture style
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 224, 28);
    ctx.fill();
    ctx.stroke();

    // Sign header
    ctx.fillStyle = colorHex;
    ctx.fillRect(36, 32, 440, 6);

    // Title
    ctx.font = '900 42px Rajdhani, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), 256, 110);

    // Subtitle
    ctx.font = '600 24px Rajdhani, sans-serif';
    ctx.fillStyle = colorHex;
    ctx.fillText(subtitle, 256, 155);

    // Action hint
    ctx.font = '700 18px Rajdhani, monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('PARK HERE OR PRESS [E] TO VIEW', 256, 202);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(7, 3.5, 1);
    return sprite;
  }

  init() {
    const textureLoader = new THREE.TextureLoader();

    PORTFOLIO_DATA.stations.forEach((st) => {
      const stGroup = new THREE.Group();
      stGroup.position.set(st.position[0], st.position[1], st.position[2]);

      const colorInt = parseInt(st.color.replace('#', '0x'));

      // 1. Cobblestone / Asphalt Parking Zone
      const padGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.25, 24);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.8
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = 0.12;
      pad.receiveShadow = true;
      stGroup.add(pad);

      // Yellow curb marking
      const curbGeo = new THREE.RingGeometry(5.2, 5.5, 24);
      const curbMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        side: THREE.DoubleSide
      });
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.rotation.x = Math.PI / 2;
      curb.position.y = 0.26;
      stGroup.add(curb);

      // Station Beacon Light Pillar
      const beaconLight = new THREE.PointLight(colorInt, 2.5, 15);
      beaconLight.position.set(0, 3, 0);
      stGroup.add(beaconLight);

      // 2. Specific Pavilion Visuals
      if (st.id === 'about') {
        // Welcome Gazebo & Portrait Easel
        const roofGeo = new THREE.ConeGeometry(3.2, 1.8, 8);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 4.2;
        stGroup.add(roof);

        // Pillars
        for (let p = 0; p < 4; p++) {
          const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 3.2, 8);
          const postMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
          const post = new THREE.Mesh(postGeo, postMat);
          const angle = (p / 4) * Math.PI * 2;
          post.position.set(Math.cos(angle) * 2.2, 1.8, Math.sin(angle) * 2.2);
          stGroup.add(post);
        }

        // Profile Portrait in Center
        textureLoader.load(PORTFOLIO_DATA.profileImage, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const photoGeo = new THREE.BoxGeometry(2, 2.4, 0.1);
          const photoMat = new THREE.MeshStandardMaterial({ map: tex });
          const photoMesh = new THREE.Mesh(photoGeo, photoMat);
          photoMesh.position.y = 2.2;
          stGroup.add(photoMesh);
          stGroup.userData.photoMesh = photoMesh;
        });

      } else if (st.id === 'skills') {
        // 3D Knockable Skill Domino Blocks!
        const skillsList = [
          "PyTorch", "TensorFlow", "NeMo", "NLP",
          "Python", "Core Java", "Django", "DSA", "Linux"
        ];

        skillsList.forEach((skill, idx) => {
          const blockGeo = new THREE.BoxGeometry(1.0, 1.8, 0.35);
          const blockMat = new THREE.MeshStandardMaterial({
            color: idx % 2 === 0 ? 0x3b82f6 : 0x0ea5e9,
            roughness: 0.3
          });
          const block = new THREE.Mesh(blockGeo, blockMat);

          const angle = (idx / skillsList.length) * Math.PI * 2;
          const radius = 2.8;
          block.position.set(Math.cos(angle) * radius, 1.0, Math.sin(angle) * radius);
          block.rotation.y = -angle + Math.PI / 2;

          block.userData = {
            name: skill,
            basePos: block.position.clone(),
            baseRot: block.rotation.clone(),
            wobble: 0
          };

          this.skillBlocks.push(block);
          stGroup.add(block);
        });

      } else if (st.id === 'experience') {
        // Research Hangar & Speech Audio Tower
        const towerGeo = new THREE.CylinderGeometry(0.3, 0.6, 5, 8);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.y = 2.5;
        stGroup.add(tower);

        // Rotating radar dish on top
        const dishGeo = new THREE.SphereGeometry(1.4, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
        const dishMat = new THREE.MeshStandardMaterial({ color: 0x10b981, wireframe: true });
        const dish = new THREE.Mesh(dishGeo, dishMat);
        dish.rotation.x = Math.PI * 0.7;
        dish.position.y = 5.2;
        stGroup.add(dish);
        stGroup.userData.dish = dish;

        // Acoustic speech spectrum bars (DRDO speech processing)
        const bars = [];
        for (let b = 0; b < 10; b++) {
          const bar = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 1, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x10b981 })
          );
          const angle = (b / 10) * Math.PI * 2;
          bar.position.set(Math.cos(angle) * 2.8, 0.5, Math.sin(angle) * 2.8);
          stGroup.add(bar);
          bars.push(bar);
        }
        stGroup.userData.speechBars = bars;

      } else if (st.id === 'achievements') {
        // Winner's Trophy Pedestal
        const podGeo = new THREE.CylinderGeometry(2.0, 2.4, 1.2, 8);
        const podMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
        const pod = new THREE.Mesh(podGeo, podMat);
        pod.position.y = 0.6;
        stGroup.add(pod);

        // Giant Golden Trophy Cup
        const cupGroup = new THREE.Group();
        cupGroup.position.y = 1.4;

        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.9,
          roughness: 0.2
        });

        // Stem & Bowl
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 1.2, 16), goldMat);
        stem.position.y = 0.6;
        cupGroup.add(stem);

        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 0.4, 1.5, 16), goldMat);
        bowl.position.y = 1.8;
        cupGroup.add(bowl);

        // Handles
        const handle1 = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 8, 16, Math.PI), goldMat);
        handle1.position.set(-1.2, 1.8, 0);
        handle1.rotation.z = -Math.PI / 2;
        cupGroup.add(handle1);

        const handle2 = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 8, 16, Math.PI), goldMat);
        handle2.position.set(1.2, 1.8, 0);
        handle2.rotation.z = Math.PI / 2;
        cupGroup.add(handle2);

        stGroup.add(cupGroup);
        stGroup.userData.trophy = cupGroup;

      } else if (st.id === 'education') {
        // University Clock Tower & Academy Building
        const building = new THREE.Mesh(
          new THREE.BoxGeometry(3.6, 3.2, 3),
          new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 })
        );
        building.position.y = 1.6;
        stGroup.add(building);

        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 3, 1.4),
          new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 })
        );
        tower.position.set(0, 4.4, 0);
        stGroup.add(tower);

        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(1.2, 1.6, 4),
          new THREE.MeshStandardMaterial({ color: 0x8b5cf6 })
        );
        roof.rotation.y = Math.PI / 4;
        roof.position.set(0, 6.6, 0);
        stGroup.add(roof);

      } else if (st.id === 'contact') {
        // Classic Red Mailbox & Telephone Kiosk
        const boothGeo = new THREE.BoxGeometry(1.8, 3.8, 1.8);
        const boothMat = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          roughness: 0.3
        });
        const booth = new THREE.Mesh(boothGeo, boothMat);
        booth.position.y = 1.9;
        stGroup.add(booth);

        const roof = new THREE.Mesh(
          new THREE.CylinderGeometry(1.1, 1.1, 0.4, 4),
          new THREE.MeshStandardMaterial({ color: 0xbe185d })
        );
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 4;
        stGroup.add(roof);

        // Antenna
        const ant = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 2, 8),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        ant.position.y = 5.2;
        stGroup.add(ant);
      }

      // 3. Floating 3D Signpost
      const billboard = this.createSignSprite(st.name, st.subtitle, st.color);
      billboard.position.y = 6.8;
      stGroup.add(billboard);

      stGroup.userData.data = st;
      stGroup.userData.billboard = billboard;

      this.stationObjects.push(stGroup);
      this.group.add(stGroup);
    });
  }

  // Check if car knocks into any skill blocks!
  checkCarCollisions(carPosition) {
    for (let i = 0; i < this.skillBlocks.length; i++) {
      const block = this.skillBlocks[i];
      const worldPos = new THREE.Vector3();
      block.getWorldPosition(worldPos);

      const dist = worldPos.distanceTo(carPosition);
      if (dist < 1.4) {
        if (block.userData.wobble <= 0.05) {
          sound.playBlockBump();
          block.userData.wobble = 0.8;
        }
      }
    }
  }

  checkProximity(carPosition) {
    let nearest = null;
    let minDistance = 7.5;

    for (let i = 0; i < this.stationObjects.length; i++) {
      const st = this.stationObjects[i];
      const dist = st.position.distanceTo(carPosition);
      if (dist < minDistance) {
        nearest = st.userData.data;
        break;
      }
    }

    if (nearest?.id !== this.currentNearbyStation?.id) {
      this.currentNearbyStation = nearest;
      if (nearest) {
        sound.playCollectStar();
      }
      if (this.onProximityChange) {
        this.onProximityChange(nearest);
      }
    }
  }

  update(time, cameraPosition, carPosition) {
    if (carPosition) {
      this.checkCarCollisions(carPosition);
    }

    // Wobble animation on skill blocks
    for (let i = 0; i < this.skillBlocks.length; i++) {
      const block = this.skillBlocks[i];
      if (block.userData.wobble > 0) {
        block.rotation.z = Math.sin(time * 25) * block.userData.wobble;
        block.userData.wobble *= 0.92;
        if (block.userData.wobble < 0.01) {
          block.userData.wobble = 0;
          block.rotation.z = 0;
        }
      }
    }

    // Rotate billboards towards camera
    for (let i = 0; i < this.stationObjects.length; i++) {
      const st = this.stationObjects[i];

      if (st.userData.billboard && cameraPosition) {
        st.userData.billboard.lookAt(
          cameraPosition.x,
          st.userData.billboard.position.y + st.position.y,
          cameraPosition.z
        );
      }

      // About photo rotation
      if (st.userData.photoMesh) {
        st.userData.photoMesh.rotation.y = time * 0.5;
      }

      // Radar dish rotation
      if (st.userData.dish) {
        st.userData.dish.rotation.y = time * 0.9;
      }

      // Speech waveform bars
      if (st.userData.speechBars) {
        for (let b = 0; b < st.userData.speechBars.length; b++) {
          const bar = st.userData.speechBars[b];
          const scaleY = 0.5 + Math.abs(Math.sin(time * 7 + b * 1.5)) * 2.2;
          bar.scale.y = scaleY;
          bar.position.y = scaleY / 2;
        }
      }

      // Trophy spin
      if (st.userData.trophy) {
        st.userData.trophy.rotation.y = time * 0.7;
        st.userData.trophy.position.y = 1.4 + Math.sin(time * 2) * 0.15;
      }
    }
  }
}
