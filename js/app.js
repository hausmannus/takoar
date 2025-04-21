const videoElement = document.getElementById('video');
const modelInfo = document.getElementById('model-info');
const modelContainer = document.getElementById('model-container');

let scanning = true;

// Arka kamerayı başlat
navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" }
})
.then(stream => {
  videoElement.srcObject = stream;
})
.catch(err => {
  console.error("Kamera açılırken hata:", err);
  modelInfo.textContent = 'Kamera açılamadı';
});

videoElement.addEventListener('play', () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  function scanQRCode() {
    if (!scanning || videoElement.paused || videoElement.ended) return;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      // QR kod okutuldu, taramayı durdur
      scanning = false;
      videoElement.pause();
      modelInfo.textContent = 'Model yükleniyor...';
      loadAndDisplayModel(code.data);
    } else {
      requestAnimationFrame(scanQRCode);
    }
  }

  scanQRCode();
});

function loadAndDisplayModel(modelUrl) {
  // Gizle video ve bilgi metni
  videoElement.style.display = 'none';
  modelInfo.style.display = 'none';

  // Temizle ve three.js sahnesini kur
  modelContainer.innerHTML = '';
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    modelContainer.clientWidth / modelContainer.clientHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
  modelContainer.appendChild(renderer.domElement);

  // Işık ekle
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  camera.position.set(0, 1.5, 3);

  // Model yükle
  const loader = new THREE.GLTFLoader();
  loader.load(
    modelUrl,
    gltf => {
      scene.add(gltf.scene);
      animate();
    },
    undefined,
    error => {
      console.error('Model yüklenirken hata:', error);
      modelInfo.style.display = 'block';
      modelInfo.textContent = 'Model yüklenemedi';
    }
  );

  // Animasyon döngüsü
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
}
