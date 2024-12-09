import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import modelPath from '../static/buster_drone.glb'; // Import the GLB model path

// Scene, Camera, Renderer
const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Load 3D Model
const loader = new GLTFLoader();
let mixer;
let model;

loader.load(modelPath, (gltf) => {
    model = gltf.scene;
    scene.add(model);

    // Setup animation mixer
    mixer = new THREE.AnimationMixer(model);
    if (gltf.animations.length) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
    }

    // Set initial model scale and position
    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);
}, undefined, (error) => {
    console.error('Error loading the model:', error);
});

// Scroll Animation Logic
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const normalizedScroll = scrollY / (document.body.scrollHeight - window.innerHeight);

    if (model) {
        gsap.to(model.rotation, { y: normalizedScroll * Math.PI * 2, duration: 0.5 });
        gsap.to(model.position, { z: -normalizedScroll * 5, duration: 0.5 });
    }
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta();

    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
