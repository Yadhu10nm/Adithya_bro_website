import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CatPropType, CatExpressionType } from '../types/config';

interface Cat3DCanvasProps {
  propType: CatPropType;
  expression: CatExpressionType;
  furColor?: string;
  bellyColor?: string;
  blushColor?: string;
}

export const Cat3DCanvas: React.FC<Cat3DCanvasProps> = ({
  propType,
  expression,
  furColor = '#FFF5EB',
  bellyColor = '#FFFFFF',
  blushColor = '#FF85A2',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    catGroup: THREE.Group;
    headGroup: THREE.Group;
    bodyGroup: THREE.Group;
    tail: THREE.Group;
    leftPaw: THREE.Mesh;
    rightPaw: THREE.Mesh;
    leftEar: THREE.Group;
    rightEar: THREE.Group;
    eyeLeftGroup: THREE.Group;
    eyeRightGroup: THREE.Group;
    tearDrop: THREE.Mesh;
    propsGroup: THREE.Group;
    currentPropMesh: THREE.Object3D | null;
    currentPropType: string;
    propScaleTarget: number;
    reducedMotion: boolean;
    mouse: { x: number; y: number; targetX: number; targetY: number };
  } | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.6);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Soft Romantic Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5f8, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const pinkRim = new THREE.DirectionalLight(0xff70a6, 1.3);
    pinkRim.position.set(-3.5, 2, -2);
    scene.add(pinkRim);

    const blueRim = new THREE.DirectionalLight(0x70d6ff, 1.2);
    blueRim.position.set(3.5, -1, -2);
    scene.add(blueRim);

    // Root Cat Hierarchy
    const catGroup = new THREE.Group();
    scene.add(catGroup);
    catGroup.position.y = -0.35;

    // Materials
    const furMat = new THREE.MeshStandardMaterial({
      color: furColor,
      roughness: 0.6,
      metalness: 0.05,
    });
    const bellyMat = new THREE.MeshStandardMaterial({
      color: bellyColor,
      roughness: 0.7,
      metalness: 0.02,
    });
    const innerEarMat = new THREE.MeshStandardMaterial({
      color: 0xffb3c6,
      roughness: 0.5,
    });
    const blushMat = new THREE.MeshBasicMaterial({
      color: blushColor,
      transparent: true,
      opacity: 0.65,
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e1b4b });
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xff8da1, roughness: 0.3 });
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 });
    const bellMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.8 });

    // BODY
    const bodyGroup = new THREE.Group();
    catGroup.add(bodyGroup);

    // Chubby torso
    const bodyGeom = new THREE.SphereGeometry(0.72, 32, 28);
    bodyGeom.scale(1.0, 1.15, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeom, furMat);
    bodyMesh.position.y = 0.2;
    bodyGroup.add(bodyMesh);

    // White belly patch
    const bellyGeom = new THREE.SphereGeometry(0.55, 24, 20);
    bellyGeom.scale(0.85, 1.05, 0.4);
    const bellyMesh = new THREE.Mesh(bellyGeom, bellyMat);
    bellyMesh.position.set(0, 0.16, 0.65);
    bodyGroup.add(bellyMesh);

    // Collar and golden bell
    const collarGeom = new THREE.TorusGeometry(0.56, 0.06, 16, 32);
    collarGeom.rotateX(Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeom, collarMat);
    collarMesh.position.set(0, 0.82, 0.05);
    bodyGroup.add(collarMesh);

    const bellGeom = new THREE.SphereGeometry(0.1, 16, 16);
    const bellMesh = new THREE.Mesh(bellGeom, bellMat);
    bellMesh.position.set(0, 0.74, 0.6);
    bodyGroup.add(bellMesh);

    // Back feet (resting on ground)
    const footGeom = new THREE.SphereGeometry(0.24, 16, 14);
    footGeom.scale(1, 0.7, 1.3);

    const leftFoot = new THREE.Mesh(footGeom, furMat);
    leftFoot.position.set(-0.55, -0.4, 0.25);
    bodyGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeom, furMat);
    rightFoot.position.set(0.55, -0.4, 0.25);
    bodyGroup.add(rightFoot);

    // Front paws
    const pawGeom = new THREE.SphereGeometry(0.2, 16, 14);
    pawGeom.scale(0.9, 0.85, 1.2);

    const leftPaw = new THREE.Mesh(pawGeom, bellyMat);
    leftPaw.position.set(-0.35, 0.25, 0.7);
    bodyGroup.add(leftPaw);

    const rightPaw = new THREE.Mesh(pawGeom, bellyMat);
    rightPaw.position.set(0.35, 0.25, 0.7);
    bodyGroup.add(rightPaw);

    // Tail (segmented hierarchy for cute wagging)
    const tail = new THREE.Group();
    tail.position.set(0, -0.15, -0.7);
    bodyGroup.add(tail);

    const tailPartGeom = new THREE.CylinderGeometry(0.08, 0.1, 0.35, 14);
    tailPartGeom.rotateX(Math.PI / 3);
    const t1 = new THREE.Mesh(tailPartGeom, furMat);
    t1.position.set(0, 0.15, -0.15);
    tail.add(t1);

    const tailEndGeom = new THREE.SphereGeometry(0.12, 14, 14);
    const tEnd = new THREE.Mesh(tailEndGeom, bellyMat);
    tEnd.position.set(0, 0.36, -0.32);
    tail.add(tEnd);

    // HEAD GROUP
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.25, 0.1);
    catGroup.add(headGroup);

    // Cute chubby head
    const headGeom = new THREE.SphereGeometry(0.85, 32, 28);
    headGeom.scale(1.15, 0.98, 1.0);
    const headMesh = new THREE.Mesh(headGeom, furMat);
    headGroup.add(headMesh);

    // Cheeks
    const cheekGeom = new THREE.SphereGeometry(0.36, 16, 14);
    cheekGeom.scale(1.1, 0.8, 0.6);

    const leftCheek = new THREE.Mesh(cheekGeom, bellyMat);
    leftCheek.position.set(-0.4, -0.16, 0.72);
    headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeom, bellyMat);
    rightCheek.position.set(0.4, -0.16, 0.72);
    headGroup.add(rightCheek);

    // Blush pads
    const blushGeom = new THREE.SphereGeometry(0.16, 14, 12);
    blushGeom.scale(1.3, 0.8, 0.3);

    const leftBlush = new THREE.Mesh(blushGeom, blushMat);
    leftBlush.position.set(-0.55, -0.1, 0.74);
    leftBlush.rotation.set(0, 0.3, -0.1);
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeom, blushMat);
    rightBlush.position.set(0.55, -0.1, 0.74);
    rightBlush.rotation.set(0, -0.3, 0.1);
    headGroup.add(rightBlush);

    // Tiny pink triangular nose
    const noseGeom = new THREE.ConeGeometry(0.08, 0.08, 4);
    noseGeom.rotateZ(Math.PI);
    noseGeom.scale(1, 0.6, 0.8);
    const noseMesh = new THREE.Mesh(noseGeom, noseMat);
    noseMesh.position.set(0, -0.06, 0.88);
    headGroup.add(noseMesh);

    // Whiskers
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });
    for (const side of [-1, 1]) {
      for (let w = 0; w < 2; w++) {
        const whiskerGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(side * 0.45, -0.12 + w * 0.08, 0.75),
          new THREE.Vector3(side * 0.95, -0.1 + w * 0.15, 0.7),
        ]);
        const whiskerLine = new THREE.Line(whiskerGeom, whiskerMat);
        headGroup.add(whiskerLine);
      }
    }

    // EARS
    const createEar = (isLeft: boolean) => {
      const earGroup = new THREE.Group();
      const coneGeom = new THREE.ConeGeometry(0.38, 0.58, 4);
      coneGeom.scale(1, 1, 0.5);
      const outerEar = new THREE.Mesh(coneGeom, furMat);
      earGroup.add(outerEar);

      const innerConeGeom = new THREE.ConeGeometry(0.24, 0.42, 4);
      innerConeGeom.scale(1, 1, 0.3);
      const innerEar = new THREE.Mesh(innerConeGeom, innerEarMat);
      innerEar.position.set(0, -0.04, 0.08);
      earGroup.add(innerEar);

      const sign = isLeft ? -1 : 1;
      earGroup.position.set(sign * 0.62, 0.8, 0.05);
      earGroup.rotation.z = sign * -0.35;
      earGroup.rotation.x = -0.1;
      return earGroup;
    };

    const leftEar = createEar(true);
    const rightEar = createEar(false);
    headGroup.add(leftEar);
    headGroup.add(rightEar);

    // EYES & EXPRESSION BUILDER
    const createEyeAssembly = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;
      eyeGroup.position.set(sign * 0.38, 0.08, 0.78);

      // Normal round eye
      const openEyeGeom = new THREE.SphereGeometry(0.15, 16, 16);
      openEyeGeom.scale(0.85, 1.1, 0.4);
      const openEye = new THREE.Mesh(openEyeGeom, eyeMat);
      openEye.name = 'openEye';
      eyeGroup.add(openEye);

      // Sparkle pupils
      const pupilGeom1 = new THREE.SphereGeometry(0.05, 10, 10);
      const p1 = new THREE.Mesh(pupilGeom1, eyePupilMat);
      p1.position.set(sign * -0.03, 0.04, 0.08);
      openEye.add(p1);

      const pupilGeom2 = new THREE.SphereGeometry(0.025, 8, 8);
      const p2 = new THREE.Mesh(pupilGeom2, eyePupilMat);
      p2.position.set(sign * 0.03, -0.04, 0.08);
      openEye.add(p2);

      // Happy curved closed eye (`^ ^`)
      const curve = new THREE.EllipseCurve(0, 0, 0.14, 0.1, 0, Math.PI, false, 0);
      const points = curve.getPoints(16);
      const curveGeom = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, p.y, 0))
      );
      const closedEye = new THREE.Line(
        curveGeom,
        new THREE.LineBasicMaterial({ color: 0x1e1b4b, linewidth: 3 })
      );
      closedEye.name = 'closedEye';
      closedEye.position.set(0, -0.02, 0.05);
      closedEye.visible = false;
      eyeGroup.add(closedEye);

      // Heart eye (for proposal love)
      const heartShape = new THREE.Shape();
      heartShape.moveTo(0, 0.05);
      heartShape.bezierCurveTo(0, 0.1, -0.1, 0.15, -0.12, 0.05);
      heartShape.bezierCurveTo(-0.14, -0.05, 0, -0.12, 0, -0.16);
      heartShape.bezierCurveTo(0, -0.12, 0.14, -0.05, 0.12, 0.05);
      heartShape.bezierCurveTo(0.1, 0.15, 0, 0.1, 0, 0.05);

      const heartGeom = new THREE.ShapeGeometry(heartShape);
      const heartMesh = new THREE.Mesh(
        heartGeom,
        new THREE.MeshBasicMaterial({ color: 0xff3366, side: THREE.DoubleSide })
      );
      heartMesh.name = 'heartEye';
      heartMesh.scale.set(0.9, 0.9, 0.9);
      heartMesh.position.set(0, 0, 0.06);
      heartMesh.visible = false;
      eyeGroup.add(heartMesh);

      return eyeGroup;
    };

    const eyeLeftGroup = createEyeAssembly(true);
    const eyeRightGroup = createEyeAssembly(false);
    headGroup.add(eyeLeftGroup);
    headGroup.add(eyeRightGroup);

    // Tear droplet for sad state
    const tearGeom = new THREE.ConeGeometry(0.06, 0.16, 12);
    tearGeom.rotateX(Math.PI);
    const tearDrop = new THREE.Mesh(
      tearGeom,
      new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85,
      })
    );
    tearDrop.position.set(-0.35, -0.22, 0.86);
    tearDrop.visible = false;
    headGroup.add(tearDrop);

    // PROPS CONTAINER
    const propsGroup = new THREE.Group();
    propsGroup.position.set(0, 0.35, 0.8);
    catGroup.add(propsGroup);

    // Mouse / Touch interaction listener
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = Math.max(-1, Math.min(1, x));
      mouse.targetY = Math.max(-1, Math.min(1, y));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        mouse.targetX = Math.max(-1, Math.min(1, x));
        mouse.targetY = Math.max(-1, Math.min(1, y));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    sceneRef.current = {
      scene,
      camera,
      renderer,
      catGroup,
      headGroup,
      bodyGroup,
      tail,
      leftPaw,
      rightPaw,
      leftEar,
      rightEar,
      eyeLeftGroup,
      eyeRightGroup,
      tearDrop,
      propsGroup,
      currentPropMesh: null,
      currentPropType: 'none',
      propScaleTarget: 1,
      reducedMotion: prefersReducedMotion,
      mouse,
    };

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let nextBlinkTime = 3.0;
    let isBlinking = false;
    let blinkProgress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const s = sceneRef.current;
      if (!s) return;

      // Smooth mouse follow
      s.mouse.x += (s.mouse.targetX - s.mouse.x) * 0.08;
      s.mouse.y += (s.mouse.targetY - s.mouse.y) * 0.08;

      if (!s.reducedMotion) {
        // Idle breathing and gentle sway
        s.catGroup.position.y = -0.35 + Math.sin(elapsed * 2.2) * 0.03;
        s.bodyGroup.scale.y = 1 + Math.sin(elapsed * 2.2) * 0.015;

        // Head tracking mouse
        s.headGroup.rotation.y = s.mouse.x * 0.28;
        s.headGroup.rotation.x = -s.mouse.y * 0.2 + Math.sin(elapsed * 1.5) * 0.02;

        // Tail wagging
        s.tail.rotation.y = Math.sin(elapsed * 3.5) * 0.45;
        s.tail.rotation.z = Math.cos(elapsed * 2.8) * 0.15;

        // Prop gentle floating
        if (s.currentPropMesh) {
          s.currentPropMesh.position.y = Math.sin(elapsed * 2.6) * 0.04;
          s.currentPropMesh.rotation.y = Math.sin(elapsed * 1.2) * 0.08;
        }

        // Blinking system
        blinkTimer += delta;
        if (blinkTimer > nextBlinkTime && !isBlinking) {
          isBlinking = true;
          blinkTimer = 0;
          blinkProgress = 0;
          nextBlinkTime = 2.5 + Math.random() * 3.5;
        }

        if (isBlinking) {
          blinkProgress += delta * 12;
          if (blinkProgress >= Math.PI) {
            isBlinking = false;
            s.eyeLeftGroup.scale.y = 1;
            s.eyeRightGroup.scale.y = 1;
          } else {
            const blinkScale = Math.max(0.1, Math.cos(blinkProgress));
            s.eyeLeftGroup.scale.y = blinkScale;
            s.eyeRightGroup.scale.y = blinkScale;
          }
        }
      } else {
        // Reduced motion: static gentle look
        s.catGroup.position.y = -0.35;
        s.headGroup.rotation.set(0, 0, 0);
      }

      s.renderer.render(s.scene, s.camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !sceneRef.current) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [furColor, bellyColor, blushColor]);

  // Update Cat Expression
  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;

    const setEyeMode = (mode: 'open' | 'closed' | 'heart') => {
      [s.eyeLeftGroup, s.eyeRightGroup].forEach((eye) => {
        const openEye = eye.getObjectByName('openEye');
        const closedEye = eye.getObjectByName('closedEye');
        const heartEye = eye.getObjectByName('heartEye');

        if (openEye) openEye.visible = mode === 'open';
        if (closedEye) closedEye.visible = mode === 'closed';
        if (heartEye) heartEye.visible = mode === 'heart';
      });
    };

    // Reset ear angles
    s.leftEar.rotation.z = -0.35;
    s.rightEar.rotation.z = 0.35;
    s.tearDrop.visible = false;

    switch (expression) {
      case 'happy':
        setEyeMode('closed');
        s.headGroup.rotation.z = 0.05;
        break;
      case 'blushing':
        setEyeMode('closed');
        s.headGroup.rotation.z = -0.06;
        break;
      case 'curious':
        setEyeMode('open');
        s.headGroup.rotation.z = 0.12;
        s.leftEar.rotation.z = -0.15;
        break;
      case 'excited':
        setEyeMode('open');
        s.headGroup.rotation.z = 0;
        break;
      case 'loving':
      case 'proposal_love':
        setEyeMode('heart');
        s.headGroup.rotation.z = 0.04;
        break;
      case 'celebrating':
        setEyeMode('closed');
        s.headGroup.rotation.z = 0;
        break;
      case 'sad':
        setEyeMode('open');
        s.leftEar.rotation.z = -0.7; // droopy ears
        s.rightEar.rotation.z = 0.7;
        s.tearDrop.visible = true;
        s.headGroup.rotation.x = 0.15; // looking down
        break;
      default:
        setEyeMode('open');
        break;
    }
  }, [expression]);

  // Update Cat Prop in 3D
  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;

    if (s.currentPropType === propType && s.currentPropMesh) return;

    // Remove existing prop
    if (s.currentPropMesh) {
      s.propsGroup.remove(s.currentPropMesh);
      s.currentPropMesh = null;
    }

    s.currentPropType = propType;
    if (propType === 'none') {
      s.leftPaw.position.set(-0.35, 0.25, 0.7);
      s.rightPaw.position.set(0.35, 0.25, 0.7);
      return;
    }

    const propGroup = new THREE.Group();

    // Adjust paws based on prop
    s.leftPaw.position.set(-0.32, 0.28, 0.85);
    s.rightPaw.position.set(0.32, 0.28, 0.85);

    switch (propType) {
      case 'envelope': {
        // Cute pink love letter with wax seal
        const envGeom = new THREE.BoxGeometry(0.72, 0.48, 0.06);
        const envMat = new THREE.MeshStandardMaterial({ color: 0xffe4e8, roughness: 0.3 });
        const envMesh = new THREE.Mesh(envGeom, envMat);
        propGroup.add(envMesh);

        // Flap triangle
        const flapGeom = new THREE.ConeGeometry(0.36, 0.24, 3);
        flapGeom.rotateZ(Math.PI);
        const flapMat = new THREE.MeshStandardMaterial({ color: 0xffcbd5, roughness: 0.3 });
        const flapMesh = new THREE.Mesh(flapGeom, flapMat);
        flapMesh.position.set(0, 0.08, 0.035);
        propGroup.add(flapMesh);

        // Red wax seal heart
        const sealGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
        sealGeom.rotateX(Math.PI / 2);
        const sealMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.2 });
        const sealMesh = new THREE.Mesh(sealGeom, sealMat);
        sealMesh.position.set(0, 0.04, 0.05);
        propGroup.add(sealMesh);
        break;
      }

      case 'coffee_cup': {
        // Warm ceramic coffee mug with heart latte art
        const mugGeom = new THREE.CylinderGeometry(0.24, 0.2, 0.42, 20);
        const mugMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2 });
        const mug = new THREE.Mesh(mugGeom, mugMat);
        propGroup.add(mug);

        // Handle
        const handleGeom = new THREE.TorusGeometry(0.14, 0.04, 12, 16, Math.PI);
        handleGeom.rotateY(Math.PI / 2);
        const handle = new THREE.Mesh(handleGeom, mugMat);
        handle.position.set(0.24, 0, 0);
        propGroup.add(handle);

        // Coffee liquid
        const liquidGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.02, 20);
        const liquidMat = new THREE.MeshStandardMaterial({ color: 0x5b3829, roughness: 0.3 });
        const liquid = new THREE.Mesh(liquidGeom, liquidMat);
        liquid.position.set(0, 0.18, 0);
        propGroup.add(liquid);

        // Foam heart on coffee
        const foamGeom = new THREE.SphereGeometry(0.06, 12, 12);
        foamGeom.scale(1.2, 0.3, 1.2);
        const foamMat = new THREE.MeshStandardMaterial({ color: 0xfff1e6 });
        const foam = new THREE.Mesh(foamGeom, foamMat);
        foam.position.set(0, 0.195, 0);
        propGroup.add(foam);
        break;
      }

      case 'star_wand': {
        // Glowing magic star wand
        const staffGeom = new THREE.CylinderGeometry(0.028, 0.03, 0.85, 12);
        const staffMat = new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.7, roughness: 0.2 });
        const staff = new THREE.Mesh(staffGeom, staffMat);
        staff.rotation.z = 0.35;
        propGroup.add(staff);

        // 3D Star on tip
        const starGroup = new THREE.Group();
        starGroup.position.set(0.18, 0.42, 0);
        const starGeom = new THREE.OctahedronGeometry(0.18, 0);
        starGeom.scale(1, 1.3, 0.6);
        const starMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.5,
          metalness: 0.5,
          roughness: 0.1,
        });
        const starMesh = new THREE.Mesh(starGeom, starMat);
        starGroup.add(starMesh);

        // Sparkle ring
        const ringGeom = new THREE.TorusGeometry(0.25, 0.02, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 3;
        starGroup.add(ring);

        propGroup.add(starGroup);
        break;
      }

      case 'heart_balloon': {
        // Floating heart balloon on a string
        const balloonGroup = new THREE.Group();
        balloonGroup.position.set(0.25, 0.45, 0.1);

        // Heart shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 0.15);
        shape.bezierCurveTo(0, 0.3, -0.25, 0.45, -0.35, 0.2);
        shape.bezierCurveTo(-0.45, -0.05, 0, -0.3, 0, -0.42);
        shape.bezierCurveTo(0, -0.3, 0.45, -0.05, 0.35, 0.2);
        shape.bezierCurveTo(0.25, 0.45, 0, 0.3, 0, 0.15);

        const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 6, steps: 2, bevelSize: 0.08, bevelThickness: 0.08 };
        const balloonGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        balloonGeom.center();
        const balloonMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          roughness: 0.15,
          metalness: 0.1,
        });
        const balloonMesh = new THREE.Mesh(balloonGeom, balloonMat);
        balloonGroup.add(balloonMesh);

        // String hanging down to cat's paw
        const stringGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.7, 8);
        const stringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const stringMesh = new THREE.Mesh(stringGeom, stringMat);
        stringMesh.position.set(0, -0.42, 0);
        balloonGroup.add(stringMesh);

        propGroup.add(balloonGroup);
        break;
      }

      case 'rose_bouquet': {
        // Paper wrap cone
        const wrapGeom = new THREE.ConeGeometry(0.3, 0.6, 16, 1, true);
        const wrapMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
        const wrap = new THREE.Mesh(wrapGeom, wrapMat);
        wrap.position.set(0, -0.05, 0);
        propGroup.add(wrap);

        // Rose blooms cluster
        const roseColors = [0xe11d48, 0xf43f5e, 0xfb7185, 0xbe123c];
        const roseOffsets = [
          [0, 0.22, 0],
          [-0.14, 0.16, 0.08],
          [0.14, 0.16, 0.08],
          [0, 0.12, 0.16],
          [-0.09, 0.25, -0.08],
          [0.09, 0.25, -0.08],
        ];

        roseOffsets.forEach((pos, idx) => {
          const roseGeom = new THREE.DodecahedronGeometry(0.09, 1);
          const roseMat = new THREE.MeshStandardMaterial({
            color: roseColors[idx % roseColors.length],
            roughness: 0.4,
          });
          const rose = new THREE.Mesh(roseGeom, roseMat);
          rose.position.set(pos[0], pos[1], pos[2]);
          propGroup.add(rose);
        });

        // Green leaf accents
        const leafGeom = new THREE.ConeGeometry(0.08, 0.18, 3);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
        const leaf1 = new THREE.Mesh(leafGeom, leafMat);
        leaf1.position.set(-0.2, 0.18, 0);
        leaf1.rotation.z = 0.8;
        propGroup.add(leaf1);

        const leaf2 = new THREE.Mesh(leafGeom, leafMat);
        leaf2.position.set(0.2, 0.18, 0);
        leaf2.rotation.z = -0.8;
        propGroup.add(leaf2);
        break;
      }

      case 'ring_box': {
        // Red velvet open ring box with sparkling diamond ring!
        const boxBaseGeom = new THREE.BoxGeometry(0.38, 0.22, 0.38);
        const velvetMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.8 });
        const boxBase = new THREE.Mesh(boxBaseGeom, velvetMat);
        propGroup.add(boxBase);

        // Open lid tilted back
        const lidGeom = new THREE.BoxGeometry(0.38, 0.1, 0.38);
        const lid = new THREE.Mesh(lidGeom, velvetMat);
        lid.position.set(0, 0.18, -0.16);
        lid.rotation.x = -Math.PI / 2.6;
        propGroup.add(lid);

        // Inner white satin cushion
        const cushionGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16);
        const cushionMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const cushion = new THREE.Mesh(cushionGeom, cushionMat);
        cushion.position.set(0, 0.08, 0);
        propGroup.add(cushion);

        // Golden Ring Band
        const ringBandGeom = new THREE.TorusGeometry(0.08, 0.016, 12, 24);
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.9,
          roughness: 0.15,
        });
        const ringBand = new THREE.Mesh(ringBandGeom, goldMat);
        ringBand.position.set(0, 0.17, 0);
        ringBand.rotation.x = Math.PI / 2;
        propGroup.add(ringBand);

        // Brilliant Faceted Diamond
        const diamondGeom = new THREE.OctahedronGeometry(0.065, 0);
        diamondGeom.scale(1.1, 1.3, 1.1);
        const diamondMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0x93c5fd,
          emissiveIntensity: 0.4,
          roughness: 0.05,
          metalness: 0.2,
        });
        const diamond = new THREE.Mesh(diamondGeom, diamondMat);
        diamond.position.set(0, 0.24, 0);
        propGroup.add(diamond);

        // Sparkle flares around diamond
        const flareGeom = new THREE.OctahedronGeometry(0.03, 0);
        const flareMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
        const flare = new THREE.Mesh(flareGeom, flareMat);
        flare.position.set(0.08, 0.29, 0.04);
        propGroup.add(flare);
        break;
      }

      case 'celebration': {
        // Golden royal crown & celebration sparkles
        const crownGeom = new THREE.CylinderGeometry(0.42, 0.35, 0.25, 6);
        const crownMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          metalness: 0.85,
          roughness: 0.2,
        });
        const crown = new THREE.Mesh(crownGeom, crownMat);
        crown.position.set(0, 0.95, -0.05);
        crown.rotation.y = 0.5;
        // Mount crown on cat's head!
        s.headGroup.add(crown);

        // Floating big celebratory heart in paws
        const celebHeartGeom = new THREE.OctahedronGeometry(0.24, 1);
        celebHeartGeom.scale(1.2, 1.2, 0.6);
        const celebHeartMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0xff2a6d,
          emissiveIntensity: 0.4,
          roughness: 0.2,
        });
        const heart = new THREE.Mesh(celebHeartGeom, celebHeartMat);
        heart.position.set(0, 0.05, 0.05);
        propGroup.add(heart);
        break;
      }

      case 'broken_heart': {
        // Fractured heart pieces
        const halfHeartGeom = new THREE.SphereGeometry(0.18, 14, 14);
        halfHeartGeom.scale(0.8, 1.2, 0.5);
        const brokenMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });

        const leftHalf = new THREE.Mesh(halfHeartGeom, brokenMat);
        leftHalf.position.set(-0.14, 0.05, 0);
        leftHalf.rotation.z = -0.3;
        propGroup.add(leftHalf);

        const rightHalf = new THREE.Mesh(halfHeartGeom, brokenMat);
        rightHalf.position.set(0.14, 0.02, 0);
        rightHalf.rotation.z = 0.3;
        propGroup.add(rightHalf);
        break;
      }

      default:
        break;
    }

    s.propsGroup.add(propGroup);
    s.currentPropMesh = propGroup;
  }, [propType]);

  return (
    <div
      ref={mountRef}
      className="cat-canvas-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '260px',
        maxHeight: '340px',
        position: 'relative',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
      aria-label="3D animated cat companion holding props for each question"
      role="img"
    />
  );
};
