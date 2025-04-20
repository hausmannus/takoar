let scanner = new Instascan.Scanner({ video: document.getElementById('kamera') });

scanner.addListener('scan', function (veri) {
  alert('QR Kod İçeriği: ' + veri);
  // model.html sayfasına yönlendir, QR'dan gelen linki ekle
  window.location.href = 'model.html?model=' + encodeURIComponent(veri);
});

Instascan.Camera.getCameras().then(function (kameralar) {
  if (kameralar.length > 0) {
    scanner.start(kameralar[0]); // İlk kamerayı başlat
  } else {
    alert('Kamera bulunamadı!');
  }
});
