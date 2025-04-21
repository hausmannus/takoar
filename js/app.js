// js/app.js
(async function() {
  const video = document.getElementById('video');
  const container = document.getElementById('model-container');

  // Arka kamerayı başlat
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    video.setAttribute('playsinline', true); // iOS uyumluluk
    await video.play();
  } catch (err) {
    console.error('Kamera başlatılamadı:', err);
    return;
  }

  // QR tarama için canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let scanning = true;

  function scan() {
    if (!scanning) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
      if (code) {
        scanning = false;
        video.pause();
        loadModel(code.data); // QR kod içindeki URL'i modele yükle
        return;
      }
    }
    requestAnimationFrame(scan);
  }

  scan();

  // 3D model render fonksiyonu
  function loadModel(url) {
    // Video'yu gizle
    video.style.display = 'none';
    container.innerHTML = '';

    // Three.js sahne kurulumu
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Işık ekle
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(hemi);

    camera.position.set(0, 1.5, 3);

    // Modeli yükle ve sahneye ekle
    const loader = new THREE.GLTFLoader();
    loader.load(
      url,
      gltf => {
        scene.add(gltf.scene);
        animate();
      },
      undefined,
      err => console.error('Model yüklenirken hata:', err)
    );

    // Animasyon döngüsü
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
  }
})();
