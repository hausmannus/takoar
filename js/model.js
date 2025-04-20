// QR koddan gelen model bağlantısını al
const urlParams = new URLSearchParams(window.location.search);
const modelURL = urlParams.get('model');

// 3D sahne oluştur
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Işık ekle
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// Model yükle
const loader = new THREE.GLTFLoader();
loader.load(modelURL, function (gltf) {
  scene.add(gltf.scene);
});

// Kamera pozisyonu
camera.position.z = 3;

// Fare/dokunmatik ile kontrol
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Çizim döngüsü
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
