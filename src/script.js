import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import modelPath from '../static/goodtextured.glb'; // Path to the GLB model

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

// Track mouse movement
let isMouseDown = false;
let lastMouseX = 0;
let rotationY = 0; // Accumulated rotation along Y-axis

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
        model.scale.set(0.4, 0.4, 0.4);
        model.position.set(0, 0, 0);
        model.rotation.set(0.5, 0, 0);
        console.log("Model loaded and added to the scene.");
    },
    undefined,
    (error) => {
        console.error("Error loading model:", error);
    }
);

// Scroll Animation Logic
let lastNormalizedScroll = 0; // Track last scroll to avoid redundant updates
let lastAnimationTime = 0; // Track the last animation time for smooth transitions

window.addEventListener('scroll', () => {
    if (mixer && animationClip) {
        const scrollY = window.scrollY;
        const scrollableHeight = document.body.scrollHeight - window.innerHeight;

        // Normalize scroll value between 0 and 1
        const normalizedScroll = Math.min(scrollY / scrollableHeight, 1);

        // Prevent redundant updates
        if (normalizedScroll === lastNormalizedScroll) return;

        // Map scroll to animation time
        const animationDuration = animationClip.duration; // Total animation duration
        const targetTime = normalizedScroll * animationDuration;

        // Smooth transition: Interpolate between last time and target time
        const timeDelta = targetTime - lastAnimationTime;

        // Small threshold to make the transition smoother
        if (Math.abs(timeDelta) > 0.01) {
            lastAnimationTime += timeDelta * 0.1; // Adjust 0.1 for smoothing speed
            mixer.setTime(lastAnimationTime);
        } else {
            lastAnimationTime = targetTime; // Snap to target if close enough
            mixer.setTime(lastAnimationTime);
        }

        console.log(`ScrollY: ${scrollY}, NormalizedScroll: ${normalizedScroll}, Animation Time: ${lastAnimationTime}`);

        // Update last scroll position
        lastNormalizedScroll = normalizedScroll;
    } else {
        console.warn("Mixer or animation clip is not ready yet.");
    }
});


// Mouse Events for Rotation
canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    lastMouseX = event.clientX;
});

canvas.addEventListener('mousemove', (event) => {
    if (isMouseDown && model) {
        const deltaX = event.clientX - lastMouseX; // Calculate horizontal mouse movement
        rotationY += deltaX * 0.005; // Adjust rotation speed as needed
        model.rotation.y = rotationY; // Update model's Y-axis rotation
        lastMouseX = event.clientX; // Update last mouse position
    }
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
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
