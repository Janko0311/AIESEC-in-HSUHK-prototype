import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initFlightScene() {
  const canvas = document.querySelector('#flight-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    20000
  );
  camera.position.set(0, 0.4, 7);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true
    });
  } catch (error) {
    canvas.style.display = 'none';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const sky = new Sky();
  sky.scale.setScalar(10000);
  sky.material.depthWrite = false;
  const skyUniforms = sky.material.uniforms;
  skyUniforms['turbidity'].value = 8;
  skyUniforms['rayleigh'].value = 2.4;
  skyUniforms['mieCoefficient'].value = 0.006;
  skyUniforms['mieDirectionalG'].value = 0.82;

  const sun = new THREE.Vector3();
  const phi = THREE.MathUtils.degToRad(90 - 10);
  const theta = THREE.MathUtils.degToRad(165);
  sun.setFromSphericalCoords(1, phi, theta);
  skyUniforms['sunPosition'].value.copy(sun);
  scene.add(sky);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(sky);
  const envMap = pmremGenerator.fromScene(envScene).texture;
  scene.add(sky);
  scene.environment = envMap;
  scene.background = new THREE.Color(0xe9c79a);
  scene.fog = new THREE.FogExp2(0xe9c79a, 0.012);
  pmremGenerator.dispose();

  const ambientLight = new THREE.HemisphereLight(0xffd9a0, 0x4a3b2a, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffd2a1, 2.2);
  directionalLight.position.copy(sun).multiplyScalar(30);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(2048, 2048);
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 200;
  directionalLight.shadow.camera.left = -40;
  directionalLight.shadow.camera.right = 40;
  directionalLight.shadow.camera.top = 40;
  directionalLight.shadow.camera.bottom = -40;
  directionalLight.shadow.bias = -0.0005;
  scene.add(directionalLight);

  let airplane = null;
  let runway = null;

  const loader = new GLTFLoader();

  loader.load(
    '/models/airplane.glb?v=10',
    (gltf) => {
      airplane = gltf.scene;
      airplane.scale.setScalar(1.15);
      airplane.position.set(0.25, -0.2, 0);
      airplane.rotation.set(0.05, -0.3, 0.05);
      airplane.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(airplane);

      maybeInitAnimations();
    },
    undefined,
    () => {
      airplane = createFallbackPlane();
      scene.add(airplane);
      maybeInitAnimations();
    }
  );

  loader.load(
    '/models/a320_takeoff_scene.glb?v=3',
    (gltf) => {
      runway = gltf.scene;

      const embeddedAircraft = runway.getObjectByName('A320_Root');
      if (embeddedAircraft) embeddedAircraft.visible = false;

      const extras = [];
      runway.traverse((child) => {
        if (child.isLight || child.isCamera) extras.push(child);
        if (child.isMesh) child.receiveShadow = true;
      });
      extras.forEach((child) => child.parent.remove(child));

      runway.scale.setScalar(0.012);
      runway.position.set(0, -4.5, -6);
      runway.visible = true;
      scene.add(runway);

      maybeInitAnimations();
    },
    undefined,
    () => {
      runway = createFallbackLandingMarker();
      scene.add(runway);
      maybeInitAnimations();
    }
  );

  function maybeInitAnimations() {
    if (!airplane || !runway) return;

    const flightTimeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.scroll-story-wrapper',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });

    flightTimeline
      // Stage 1: Takeoff
      .to(
        airplane.position,
        {
          y: 1.7,
          z: -1.8,
          duration: 2
        },
        0
      )
      .to(
        airplane.rotation,
        {
          x: -0.38,
          y: -0.2,
          z: 0.14,
          duration: 2
        },
        0
      )
      .to(
        camera.position,
        {
          z: 8.5,
          y: 0.9,
          duration: 2
        },
        0
      )

      // Stage 2: Cruise
      .to(
        airplane.rotation,
        {
          x: -0.02,
          y: 0.25,
          z: 0.03,
          duration: 3
        },
        2
      )
      .to(
        airplane.position,
        {
          x: 0.25,
          y: 1.2,
          z: -3.2,
          duration: 3
        },
        2
      )
      .to(
        camera.position,
        {
          x: 1.4,
          y: 0.5,
          z: 7,
          duration: 3
        },
        2
      )

      // Stage 3: Landing
      .to(
        airplane.rotation,
        {
          x: 0.45,
          y: 0,
          z: -0.04,
          duration: 3
        },
        5
      )
      .to(
        airplane.position,
        {
          x: 0.25,
          y: -2.8,
          z: -4.8,
          duration: 3
        },
        5
      )
      .to(
        runway.position,
        {
          y: -2.6,
          z: -5,
          duration: 3
        },
        5
      )
      .to(
        runway.scale,
        {
          x: 2.5,
          y: 2.5,
          z: 2.5,
          duration: 3
        },
        5
      )
      .to(
        camera.position,
        {
          x: 0,
          y: 0,
          z: 6.2,
          duration: 3
        },
        5
      );

    const sectionPanels = gsap.utils.toArray('.story-panel .panel-content');
    sectionPanels.forEach((panel) => {
      gsap.fromTo(
        panel,
        {
          y: 40,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: panel,
            start: 'top 75%'
          }
        }
      );
    });
  }

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', onResize);

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function createFallbackPlane() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 1.7, 12),
    new THREE.MeshStandardMaterial({ color: 0xe8eefc, metalness: 0.2, roughness: 0.6 })
  );
  body.rotation.z = Math.PI / 2;
  group.add(body);

  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 1.2, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x007dff })
  );
  wing.rotation.z = Math.PI / 2;
  group.add(wing);

  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.45, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0a8ea0 })
  );
  tail.position.set(-0.75, 0.18, 0);
  group.add(tail);

  return group;
}

function createFallbackLandingMarker() {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 0.08, 48),
    new THREE.MeshStandardMaterial({
      color: 0x16375c,
      transparent: true,
      opacity: 0.65
    })
  );

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.06, 16, 100),
    new THREE.MeshStandardMaterial({ color: 0x51b8ff })
  );
  ring.rotation.x = Math.PI / 2;

  const marker = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.5, 20),
    new THREE.MeshStandardMaterial({ color: 0x007dff })
  );
  marker.position.y = 0.28;

  group.add(base, ring, marker);
  return group;
}
