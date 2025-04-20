const videoElement = document.getElementById('video');
const modelInfo = document.getElementById('model-info');
const modelContainer = document.getElementById('model-container');

// Arka kamerayı başlatma
navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" }  // "environment" arka kamerayı seçer
})
.then((stream) => {
  videoElement.srcObject = stream;  // Video akışını 'video' elementine bağla
})
.catch((err) => {
  console.error("Kamera erişimi başarısız oldu:", err);  // Hata olursa logla
});

videoElement.addEventListener('play', () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  function scanQRCode() {
    if (videoElement.paused || videoElement.ended) return;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      modelInfo.textContent = `QR Kod Okundu: ${code.data}`;  // QR kodu okunduysa, bilgiyi göster
      display3DModel(code.data);  // QR kod verisini kullanarak 3D modeli göster
    }

    requestAnimationFrame(scanQRCode);  // Sürekli QR kod taramasını devam ettir
  }

  scanQRCode();  // QR kod taramasını başlat
});

// Three.js ile 3D model görüntüleme
function display3DModel(qrData) {
  // 3D model görüntülemek için Three.js sahnesi
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, modelContainer.clientWidth / modelContainer.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
  modelContainer.innerHTML = '';  // Eski model varsa temizle
  modelContainer.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
}
