import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// 1. Inicialización de Escena, Cámara y Renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// 2. Generación de Entorno de Iluminación PBR (HDRI Simulado)
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// 3. Luces Direccionales de Apoyo
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// 4. Controles de Órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 5. Carga de Modelo GLB con Auto-Centrado y Encuadre Automático
const loader = new GLTFLoader();

loader.load(
  './vintage_cola.glb',
  (gltf) => {
    const model = gltf.scene;

    // Obtener la caja delimitadora (Bounding Box)
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Centrar el modelo en el origen de coordenadas (0,0,0)
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);

    scene.add(model);

    // Ajuste dinámico de cámara según el tamaño del objeto
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 2.5;

    camera.position.set(0, maxDim / 4, cameraZ);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
  },
  (xhr) => {
    console.log(`Cargando modelo: ${((xhr.loaded / xhr.total) * 100).toFixed(1)}%`);
  },
  (error) => {
    console.error('Error al cargar el archivo GLB:', error);
  }
);

// 6. Manejo de Redimensionamiento de Pantalla
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 7. Ciclo de Animación (Render Loop)
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
