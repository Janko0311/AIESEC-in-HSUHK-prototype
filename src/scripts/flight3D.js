import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
    1000
  );
  camera.position.set(0, 0.4, 7);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
  } catch (error) {
    canvas.style.display = 'none';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
  directionalLight.position.set(5, 5, 6);
  scene.add(directionalLight);

  const rimLight = new THREE.DirectionalLight(0x66ccff, 1.2);
  rimLight.position.set(-5, 2, -4);
  scene.add(rimLight);

  const stars = createStars();
  scene.add(stars);

  const clouds = createCloudParticles();
  scene.add(clouds);

  let airplane = null;
  let runway = null;

  const loader = new GLTFLoader();

  loader.load(
    '/models/airplane.glb',
    (gltf) => {
      airplane = gltf.scene;
      airplane.scale.setScalar(1.15);
      airplane.position.set(0, -0.2, 0);
      airplane.rotation.set(0.05, -0.3, 0.05);
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
    '/models/a320_takeoff_scene.glb',
    (gltf) => {
      runway = gltf.scene;

      const embeddedAircraft = runway.getObjectByName('A320_Root');
      if (embeddedAircraft) embeddedAircraft.visible = false;

      const extras = [];
      runway.traverse((child) => {
        if (child.isLight || child.isCamera) extras.push(child);
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
          x: -2.4,
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
      .to(
        clouds.rotation,
        {
          y: Math.PI * 0.4,
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
          x: 0.4,
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

    stars.rotation.y += 0.0008;
    clouds.rotation.y += 0.0012;

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

function createStars() {
  const geometry = new THREE.BufferGeometry();
  const count = 700;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 40;
    positions[i + 1] = (Math.random() - 0.5) * 25;
    positions[i + 2] = -Math.random() * 30;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.04,
    transparent: true,
    opacity: 0.7
  });

  return new THREE.Points(geometry, material);
}

function createCloudParticles() {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.18, 10, 10);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.18,
    roughness: 1
  });

  for (let i = 0; i < 40; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.1) * 8,
      -Math.random() * 14
    );
    mesh.scale.setScalar(Math.random() * 4 + 1);
    group.add(mesh);
  }

  return group;
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
