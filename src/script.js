import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import modelPath from '../static/lighted.glb'; // Path to the GLB model

// Scene, Camera, Renderer
const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Variables for 3D Model and Animation
let mixer = null;
let animationClip = null;
let model = null;

// Load 3D Model
const loader = new GLTFLoader();
loader.load(
    modelPath,
    (gltf) => {
        model = gltf.scene;
        scene.add(model);

        // Setup animation mixer and retrieve the animation clip
        mixer = new THREE.AnimationMixer(model);
        if (gltf.animations.length > 0) {
            animationClip = gltf.animations[0];
            const action = mixer.clipAction(animationClip);
            action.loop = THREE.LoopOnce; // Prevent looping
            action.clampWhenFinished = true; // Stop animation at the end
            action.play(); // Ensure animation is active for control
        } else {
            console.error("No animations found in the model.");
        }

        // Initial model properties
        model.scale.set(0.03, 0.03, 0.03);
        model.position.set(0, -2, 0);
        model.rotation.set(0, 205, 0);
        console.log("Model loaded and added to the scene.");
    },
    undefined,
    (error) => {
        console.error("Error loading model:", error);
    }
);

// Scroll Animation Logic
window.addEventListener('scroll', () => {
    if (mixer && animationClip) {
        const scrollY = window.scrollY;
        const scrollableHeight = document.body.scrollHeight - window.innerHeight;

        // Normalize scroll value between 0 and 1
        const normalizedScroll = Math.min(scrollY / scrollableHeight, 1);

        // Map scroll to animation time
        const animationDuration = animationClip.duration; // Total animation duration
        const time = normalizedScroll * animationDuration;

        // Update animation mixer time
        mixer.setTime(time);

        console.log(`ScrollY: ${scrollY}, NormalizedScroll: ${normalizedScroll}, Animation Time: ${time}`);
    } else {
        console.warn("Mixer or animation clip is not ready yet.");
    }
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta(); // Time since last frame
    if (mixer) {
        // No need to call mixer.update(delta) because setTime handles frame updates
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
