// js/app.js
(function() {
  const video = document.getElementById('video');
  const info = document.getElementById('info');
  const modelContainer = document.getElementById('model-container');

  let scanning = true;

  // Arka kamerayı başlat ve QR taramayı başlat
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      video.srcObject = stream;
      video.setAttribute('playsinline', true); // iOS için
      video.play();
      requestAnimationFrame(tick);
    })
    .catch(err => {
      console.error('Kamera açılamadı:', err);
      info.textContent = 'Kamera açılamadı';
    });

  function tick() {
    if (!scanning) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
      if (code) {
        scanning = false;
        video.pause();
        info.textContent = 'Model yükleniyor...';
        displayModel(code.data);
        return;
      }
    }
    requestAnimationFrame(tick);
  }

  function displayModel(modelUrl) {
    // Kamera ve bilgi metnini gizle
    video.style.display = 'none';
    info.style.display = 'none';
    modelContainer.innerHTML = '';

    // three.js sahnesi
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

    // Işıklar
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 10, 10);
    scene.add(dirLight);

    camera.position.set(0, 1.5, 3);

    // Model yükleme
    const loader = new THREE.GLTFLoader();
    loader.load(
      modelUrl,
      gltf => {
        scene.add(gltf.scene);
        animate();
      },
      undefined,
      error => {
        console.error('Model yüklenemedi:', error);
        info.style.display = 'block';
        info.textContent = 'Model yüklenemedi';
      }
    );

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
  }
})();
