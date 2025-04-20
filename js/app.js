const videoElement = document.getElementById('video');
const modelInfo = document.getElementById('model-info');
const modelContainer = document.getElementById('model-container');

// Kamera başlat
navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" }
})
.then((stream) => {
  videoElement.srcObject = stream;
})
.catch((err) => {
  console.error("Kamera açılırken hata:", err);
});

videoElement.addEventListener('play', () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  function scanQRCode() {
    if (videoElement.paused || videoElement.ended) return;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      modelInfo.textContent = `QR Kod: ${code.data}`;
      display3DModel(code.data); // Burada modeli gösteriyoruz
    }

    requestAnimationFrame(scanQRCode);
  }

  scanQRCode();
});

function display3DModel(modelUrl) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, modelContainer.clientWidth / modelContainer.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
  modelContainer.innerHTML = '';  // Önceki renderı temizle
  modelContainer.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(light);

  camera.position.set(0, 1.5, 3);

  const loader = new THREE.GLTFLoader();
  loader.load(modelUrl, function (gltf) {
    scene.add(gltf.scene);
  }, undefined, function (error) {
    console.error('Model yüklenirken hata:', error);
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
}
