import * as THREE from 'three';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { NeuralMatrix } from './NeuralMatrix';
import { TrophyModel } from './TrophyModel';
import { sound } from './SoundEngine';

export class Stations {
  constructor(scene, onProximityChange) {
    this.scene = scene;
    this.onProximityChange = onProximityChange;
    this.stationObjects = [];
    this.currentNearbyStation = null;
    this.group = new THREE.Group();

    this.init();
    this.scene.add(this.group);
  }

  createHologramLabel(title, subtitle, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Background pill
    ctx.fillStyle = 'rgba(5, 8, 20, 0.85)';
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 224, 32);
    ctx.fill();
    ctx.stroke();

    // Top subtle bar
    ctx.fillStyle = colorHex;
    ctx.fillRect(40, 30, 432, 6);

    // Title
    ctx.font = 'bold 44px Orbitron, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), 256, 110);

    // Subtitle
    ctx.font = '500 24px Rajdhani, sans-serif';
    ctx.fillStyle = colorHex;
    ctx.fillText(subtitle, 256, 160);

    // Hint
    ctx.font = '600 18px Orbitron, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('[ CLICK OR PRESS E TO ENTER ]', 256, 205);

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

      // 1. Cyber landing pad on the ground
      const padGeo = new THREE.CylinderGeometry(5, 5.5, 0.4, 32);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.3
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = 0.2;
      stGroup.add(pad);

      // Pad glowing ring
      const ringGeo = new THREE.RingGeometry(4.6, 5.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorInt,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.42;
      stGroup.add(ring);

      // Rotating dashed outer ring
      const outerRingGeo = new THREE.RingGeometry(5.4, 5.7, 32);
      const outerRingMat = new THREE.MeshBasicMaterial({
        color: colorInt,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRing.rotation.x = Math.PI / 2;
      outerRing.position.y = 0.42;
      stGroup.add(outerRing);

      // Vertical Sky Beacon Light Beam
      const beaconGeo = new THREE.CylinderGeometry(0.15, 0.6, 80, 16, 1, true);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: colorInt,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 40;
      stGroup.add(beacon);

      // 2. Specialized Station Visuals
      if (st.id === 'about') {
        // Holo-Deck: Central Avatar hologram cylinder and photo
        const holoGeo = new THREE.CylinderGeometry(1.6, 1.6, 3.2, 24, 1, true);
        const holoMat = new THREE.MeshBasicMaterial({
          color: 0x00f5ff,
          wireframe: true,
          transparent: true,
          opacity: 0.3
        });
        const holoCylinder = new THREE.Mesh(holoGeo, holoMat);
        holoCylinder.position.y = 2.4;
        stGroup.add(holoCylinder);

        // Circular portrait disk
        textureLoader.load(PORTFOLIO_DATA.profileImage, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const photoGeo = new THREE.CircleGeometry(1.4, 32);
          const photoMat = new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.DoubleSide
          });
          const photoMesh = new THREE.Mesh(photoGeo, photoMat);
          photoMesh.position.y = 2.4;
          stGroup.add(photoMesh);
          stGroup.userData.photoMesh = photoMesh;
        }, undefined, () => {
          // Fallback if image fails to load
          const fbGeo = new THREE.OctahedronGeometry(1.2, 1);
          const fbMat = new THREE.MeshStandardMaterial({ color: 0x00f5ff, wireframe: true });
          const fbMesh = new THREE.Mesh(fbGeo, fbMat);
          fbMesh.position.y = 2.4;
          stGroup.add(fbMesh);
        });

      } else if (st.id === 'skills') {
        // Neural Matrix Brain visualization
        this.neuralMatrix = new NeuralMatrix(stGroup, [0, 0, 0]);

      } else if (st.id === 'experience') {
        // Tactical Defense Bay: Rotating Radar dish & Speech Waveform Spectrum
        const dishBaseGeo = new THREE.CylinderGeometry(0.4, 0.8, 2, 16);
        const dishBase = new THREE.Mesh(dishBaseGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        dishBase.position.y = 1;
        stGroup.add(dishBase);

        const radarGroup = new THREE.Group();
        radarGroup.position.y = 2.2;
        const dishGeo = new THREE.SphereGeometry(1.6, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
        const dishMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          wireframe: true,
          side: THREE.DoubleSide
        });
        const dish = new THREE.Mesh(dishGeo, dishMat);
        dish.rotation.x = Math.PI * 0.65;
        radarGroup.add(dish);
        stGroup.add(radarGroup);
        stGroup.userData.radar = radarGroup;

        // Soundwave Spectrum Visualizer bars (representing DRDO Speech Processing)
        const barGroup = new THREE.Group();
        barGroup.position.y = 0.5;
        const barCount = 12;
        const bars = [];
        for (let b = 0; b < barCount; b++) {
          const barGeo = new THREE.BoxGeometry(0.2, 1, 0.2);
          const barMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          const bar = new THREE.Mesh(barGeo, barMat);
          const angle = (b / barCount) * Math.PI * 2;
          bar.position.set(Math.cos(angle) * 3.2, 0.5, Math.sin(angle) * 3.2);
          barGroup.add(bar);
          bars.push(bar);
        }
        stGroup.add(barGroup);
        stGroup.userData.speechBars = bars;

      } else if (st.id === 'achievements') {
        // Golden Trophy Model
        this.trophy = new TrophyModel(stGroup, [0, 0, 0]);

      } else if (st.id === 'education') {
        // Cyber Archives: Monolithic Obelisks
        const obeliskGroup = new THREE.Group();
        const obCount = 3;
        for (let o = 0; o < obCount; o++) {
          const obGeo = new THREE.BoxGeometry(0.8, 3.8 + o * 0.8, 0.8);
          const obMat = new THREE.MeshStandardMaterial({
            color: 0x3b0764,
            emissive: 0x6b21a8,
            roughness: 0.1
          });
          const ob = new THREE.Mesh(obGeo, obMat);
          const angle = (o / obCount) * Math.PI * 2;
          ob.position.set(Math.cos(angle) * 2.2, (3.8 + o * 0.8) / 2, Math.sin(angle) * 2.2);
          obeliskGroup.add(ob);

          // Glowing vertical edge
          const edgeGeo = new THREE.BoxGeometry(0.1, 3.8 + o * 0.8, 0.1);
          const edgeMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
          const edge = new THREE.Mesh(edgeGeo, edgeMat);
          edge.position.copy(ob.position);
          edge.position.x += 0.42;
          obeliskGroup.add(edge);
        }
        stGroup.add(obeliskGroup);
        stGroup.userData.obelisks = obeliskGroup;

      } else if (st.id === 'contact') {
        // Quantum Comms Dish
        const relayCoreGeo = new THREE.IcosahedronGeometry(1.4, 1);
        const relayCoreMat = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          emissive: 0xbe185d,
          roughness: 0.2
        });
        const relayCore = new THREE.Mesh(relayCoreGeo, relayCoreMat);
        relayCore.position.y = 3;
        stGroup.add(relayCore);
        stGroup.userData.relayCore = relayCore;

        // Orbiting antenna ring
        const antRingGeo = new THREE.TorusGeometry(2.4, 0.08, 8, 32);
        const antRingMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const antRing = new THREE.Mesh(antRingGeo, antRingMat);
        antRing.position.y = 3;
        antRing.rotation.x = Math.PI / 4;
        stGroup.add(antRing);
        stGroup.userData.antRing = antRing;
      }

      // 3. Floating 3D Billboard Label
      const billboard = this.createHologramLabel(st.name, st.subtitle, st.color);
      billboard.position.y = 6.2;
      stGroup.add(billboard);

      stGroup.userData.data = st;
      stGroup.userData.outerRing = outerRing;
      stGroup.userData.billboard = billboard;

      this.stationObjects.push(stGroup);
      this.group.add(stGroup);
    });
  }

  checkProximity(playerPosition) {
    let nearest = null;
    let minDistance = 7.5; // Interaction radius

    for (let i = 0; i < this.stationObjects.length; i++) {
      const st = this.stationObjects[i];
      const dist = st.position.distanceTo(playerPosition);
      if (dist < minDistance) {
        nearest = st.userData.data;
        break;
      }
    }

    if (nearest?.id !== this.currentNearbyStation?.id) {
      this.currentNearbyStation = nearest;
      if (nearest) {
        sound.playStationProximity();
      }
      if (this.onProximityChange) {
        this.onProximityChange(nearest);
      }
    }
  }

  update(time, cameraPosition) {
    // Update individual stations
    this.neuralMatrix?.update(time);
    this.trophy?.update(time);

    for (let i = 0; i < this.stationObjects.length; i++) {
      const st = this.stationObjects[i];

      // Rotate outer ground ring
      if (st.userData.outerRing) {
        st.userData.outerRing.rotation.z = time * 0.5;
      }

      // Make billboard face camera if provided
      if (st.userData.billboard && cameraPosition) {
        st.userData.billboard.lookAt(cameraPosition.x, st.userData.billboard.position.y + st.position.y, cameraPosition.z);
      }

      // About photo rotate
      if (st.userData.photoMesh) {
        st.userData.photoMesh.rotation.y = time * 0.4;
      }

      // Radar dish rotation
      if (st.userData.radar) {
        st.userData.radar.rotation.y = time * 0.8;
      }

      // Speech waveform bars bounce
      if (st.userData.speechBars) {
        for (let b = 0; b < st.userData.speechBars.length; b++) {
          const bar = st.userData.speechBars[b];
          const scaleY = 0.5 + Math.abs(Math.sin(time * 6 + b * 1.2)) * 2.2;
          bar.scale.y = scaleY;
          bar.position.y = scaleY / 2;
        }
      }

      // Relay core spin
      if (st.userData.relayCore) {
        st.userData.relayCore.rotation.y = time * 1.2;
        st.userData.relayCore.rotation.x = time * 0.8;
      }
      if (st.userData.antRing) {
        st.userData.antRing.rotation.z = time * 1.5;
      }
    }
  }
}
