import * as THREE from 'three';

export class NeuralMatrix {
  constructor(scene, position = [42, 0, -25]) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(position[0], 4, position[2]);
    this.nodes = [];
    this.edges = [];
    this.pulses = [];

    this.init();
    this.scene.add(this.group);
  }

  init() {
    // Core AI brain sphere in center
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x005577,
      wireframe: true,
      roughness: 0.2
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(this.core);

    // Inner glowing nucleus
    const nucGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const nucMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    this.group.add(new THREE.Mesh(nucGeo, nucMat));

    // Neural nodes arranged in a synaptic sphere cluster
    const nodeCount = 20;
    const radius = 5;

    const nodeGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.6,
      roughness: 0.1
    });

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi) * 0.7; // slight flatten
      const z = radius * Math.cos(phi);

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat.clone());
      nodeMesh.position.set(x, y, z);
      nodeMesh.userData = { originalY: y, phase: Math.random() * Math.PI * 2 };

      this.nodes.push(nodeMesh);
      this.group.add(nodeMesh);
    }

    // Connect nodes with synaptic laser line segments
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00d8ff,
      transparent: true,
      opacity: 0.4
    });

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dist = this.nodes[i].position.distanceTo(this.nodes[j].position);
        if (dist < 4.2) {
          const points = [this.nodes[i].position, this.nodes[j].position];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, lineMat);
          this.group.add(line);
          this.edges.push({ line, start: this.nodes[i], end: this.nodes[j] });
        }
      }
    }

    // Outer orbital rings
    const ringGeo1 = new THREE.TorusGeometry(6.5, 0.05, 8, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.5 });
    this.ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    this.ring1.rotation.x = Math.PI / 3;
    this.group.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(7.5, 0.04, 8, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.4 });
    this.ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.ring2.rotation.y = Math.PI / 4;
    this.group.add(this.ring2);
  }

  update(time) {
    // Rotate brain core
    if (this.core) {
      this.core.rotation.y = time * 0.5;
      this.core.rotation.x = time * 0.3;
    }

    if (this.ring1) {
      this.ring1.rotation.z = time * 0.4;
    }
    if (this.ring2) {
      this.ring2.rotation.x = time * -0.3;
    }

    // Bobbing and pulsing nodes
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      node.position.y = node.userData.originalY + Math.sin(time * 2 + node.userData.phase) * 0.15;
      const s = 1 + Math.sin(time * 3 + node.userData.phase) * 0.2;
      node.scale.set(s, s, s);
    }

    // Slowly rotate the entire network group
    this.group.rotation.y = time * 0.12;
  }
}
