// Sayfa tamamen yüklendiğinde çalışacak fonksiyon: Tema işlevini başlatır
function initializeThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // 1) Build your translations
  const lang = document.documentElement.lang || 'tr'; 
  const labels = {
    tr: { light: 'Gündüz', dark: 'Gece' },
    en: { light: 'Light',    dark: 'Dark'    }
  }[lang];

  // 2) Apply stored mode + correct label
  const darkMode = localStorage.getItem('darkMode');
  const isDark = darkMode === 'enabled';
  body.classList.toggle('dark-mode', isDark);
  themeToggle.textContent = isDark ? labels.light : labels.dark;

  // 3) Add click listener (only once)
  if (!themeToggle.hasListener) {
    themeToggle.addEventListener('click', () => {
      const nowDark = body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', nowDark ? 'enabled' : 'disabled');
      themeToggle.textContent = nowDark ? labels.light : labels.dark;
    });
    themeToggle.hasListener = true;
  }
}
if (!localStorage.getItem('language')) {
  localStorage.setItem('language', 'tr');
}
function initializeLangToggle() {
  const langToggle = document.getElementById('langToggle');
  // Mevcut dili localStorage'dan al; yoksa varsayılan 'tr'
  const currentLang = localStorage.getItem('language') || 'tr';
  
  // Buton metnini ayarla: Türkçe sayfada "English", İngilizce sayfada "Türkçe"
  langToggle.textContent = currentLang === 'tr' ? 'English' : 'Türkçe';
  
  langToggle.addEventListener('click', () => {
    // Butona tıklandığında anlık değeri tekrar kontrol edip tersine ayarla
    const updatedLang = localStorage.getItem('language') || 'tr';
    const newLang = updatedLang === 'tr' ? 'en' : 'tr';
    localStorage.setItem('language', newLang);
    window.location.replace(newLang === 'tr' ? 'dot.html' : 'dot-en.html');
  });
}


// Sayfa tamamen yüklendiğinde initializeThemeToggle fonksiyonunu çalıştır
//window.addEventListener('load', initializeThemeToggle);

// Sayfa yüklendiğinde initializeLangToggle fonksiyonunu çalıştırın (tema toggle ile birlikte)
window.addEventListener('load', () => {
  initializeThemeToggle();
  initializeLangToggle();
});

// goBack fonksiyonu (mevcut haliyle kalsın)
function goBack() {
    window.history.back();
}


// DOM Elemanlarını Seçme (Bu kısımlar mevcut haliyle doğru görünüyor)
const imageInput = document.getElementById('imageInput');
const originalImage = document.getElementById('originalImage');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const convertBtn = document.getElementById('convertBtn');

// Parametre Elemanlarını Seçme (Opsiyonel)
const dotCountSlider = document.getElementById('dotCount');
const dotSizeSlider = document.getElementById('dotSize');
// dotColorPicker tanımlı değil ve HTML'de yok, bu satırı kaldırabilirsiniz veya ekleyebilirsiniz
// const dotColorPicker = document.getElementById('dotColor');


// ---------------- PALETTES & YARDIMCI ----------------
const PALETTES = {
  retro: [
    [30,  30,  60],   // Deep Navy
    [239, 71,  111],  // Fuchsia Punch
    [255, 209, 102],  // Warm Mustard
    [6,   214, 160],  // Mint Breeze
    [17,  138, 178],  // Petrol Blue
    [255, 127,  80],  // Coral Sunset
    [255, 183,   3],  // Goldenrod
    [123, 31,  162]   // Deep Purple
  ],
  pastel: [
    [255, 179, 186],  // Rose Blush
    [255, 223, 186],  // Peach Cream
    [255, 182, 193],  // Light Pink (new!)
    [255, 192, 203],  // Pink (new!)
    [255, 105, 180],  // Hot Pink (new!)
    [255, 255, 186],  // Lemon Chiffon
    [186, 255, 201],  // Mint Whisper
    [186, 225, 255],  // Baby Blue
    [200, 186, 255],  // Lavender Mist
    [255, 186, 250],  // Lilac Breeze
    [250, 250, 186],  // Soft Daffodil
    [240, 128, 128],  // Dusty Rose
    [176, 224, 230]   // Pastel Turquoise
  ],
  bw: [
    [0,   0,   0],    // Black
    [64,  64,  64],   // Dark Gray
    [128, 128, 128],  // Medium Gray
    [192, 192, 192],  // Light Gray
    [255, 255, 255]   // White
  ],

  // — New additions —

  warm: [
    [255, 87,   34],   // Fire Orange
    [255, 152,  0],    // Amber
    [255, 193,   7],   // Goldenrod
    [244,  67,  54],   // Tomato Red
    [233,  30,  99],   // Magenta
    [ 216, 27,  96]    // Raspberry
  ],

  cool: [
    [3,   169, 244],   // Sky Blue
    [0,   188, 212],   // Cyan
    [0,   150, 136],   // Teal
    [76,  175,  80],   // Light Green
    [139, 195,  74],   // Lime
    [205, 220,  57]    // Limeade
  ],

  earth: [
    [121, 85,  72],    // Coffee Brown
    [156, 39,  176],   // Plum
    [255, 152,   0],   // Pumpkin
    [139, 195,  74],   // Sage
    [255, 235,  59],   // Sunflower
    [ 63,  81, 181]    // Indigo
  ],

  cyberpunk: [
    [255,  0,  96],    // Hot Pink
    [  0, 255, 255],   // Cyan
    [  0,  0,   0],    // Black
    [255, 255,  255],  // White
    [255, 140,   0],   // Electric Orange
    [199,  21, 133]    // Medium Violet Red
  ],
    sunset: [
    [255, 94,  77],   // Coral Sunset
    [255, 149, 128],  // Peach Glow
    [255, 207, 160],  // Sand Dune
    [255, 229, 204],  // Creamy Drift
    [255, 161, 90],   // Mango
    [240, 128, 128]   // Dusty Rose
  ],

  ocean: [
    [0,   105, 148],  // Deep Sea Blue
    [0,   168, 232],  // Bright Aqua
    [72,  202, 228],  // Tropical Wave
    [175, 238, 238],  // Pale Turquoise
    [0,   128, 128],  // Teal
    [32,  178, 170]   // Light Sea Green
  ],

  galaxy: [
    [29,  0,   51],   // Cosmic Indigo
    [75,  0,  130],   // Deep Violet
    [138, 43, 226],   // Blue Violet
    [199, 21,  133],  // Medium Violet Red
    [255, 20,  147],  // Magenta
    [255, 105, 180]   // Hot Pink
  ],

  golden: [
    [112,  66,  20],   // Dark Brown
    [153, 101,  21],   // Chestnut
    [190, 138,  58],   // Camel
    [212, 175,  55],   // Metallic Gold
    [255, 215,   0],   // Classic Gold
    [245, 222, 179]    // Soft Wheat
  ] 
};





// Orijinal r,g,b’yi en yakın palet renginden dönüştürür (Mevcut haliyle doğru görünüyor)
/* function nearestColor(pal, r, g, b) {
  // If palette is null (Original selected), return the original color
  if (!pal) return `rgb(${r},${g},${b})`;

  let minDist = Infinity;
  let best = pal[0]; // Default to the first color in the palette

  for (const [pr, pg, pb] of pal) {
    // Calculate squared Euclidean distance (faster than sqrt)
    const d = (r - pr)**2 + (g - pg)**2 + (b - pb)**2;
    if (d < minDist) {
      minDist = d;
      best = [pr, pg, pb];
    }
  }
  return `rgb(${best[0]},${best[1]},${best[2]})`;
} */

function nearestColor(pal, r, g, b) {
  // 1) No palette? Return original
  if (!pal) {
    return `rgb(${r},${g},${b})`;
  }

  // 2) If using pastel, detect intensely red/pink pixels and force a bright pink
  //    (r > 200 AND at least 20% stronger than green & blue)
  if (pal === PALETTES.pastel &&
      r > 200 &&
      r > g * 1.2 &&
      r > b * 1.2) {
    // Lilac Breeze is a nice vivid spot of pink:
    return `rgb(255,186,250)`;  
  }

  // 3) Otherwise, fall back to your original Euclidean nearest‐neighbor
  let minDist = Infinity;
  let best = pal[0];
  for (const [pr, pg, pb] of pal) {
    const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (d < minDist) {
      minDist = d;
      best = [pr, pg, pb];
    }
  }
  return `rgb(${best[0]},${best[1]},${best[2]})`;
}
// -----------------------------------------------------



// Parametrelerin Varsayılan Değerleri (Mevcut haliyle doğru görünüyor)
// let dotCount = dotCountSlider.value || 50; // Slider'ın input olayında güncelleniyor
// let dotSize = dotSizeSlider.value || 10;   // Slider'ın input olayında güncelleniyor

let dotCount = parseInt(dotCountSlider.value, 10); // İlk yüklemede değerleri al
let dotSize = parseInt(dotSizeSlider.value, 10);   // İlk yüklemede değerleri al



const dotCountValue = document.getElementById('dotCountValue');
const dotSizeValue = document.getElementById('dotSizeValue');

// Palette Seçimi Mantığı (Mevcut haliyle doğru görünüyor, önceki select mantığı kaldırıldı)
let currentPalette = null; // Initialize currentPalette (original is default, which is null)
const paletteButtons = document.querySelectorAll('.palette-btn');

paletteButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        paletteButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to the clicked button
        button.classList.add('active');

        // Update the currentPalette based on the data-palette attribute
        const selectedPalette = button.getAttribute('data-palette');
        if (selectedPalette === 'original') {
            currentPalette = null; // Original uses original colors
        } else {
            currentPalette = PALETTES[selectedPalette]; // Use the selected palette from PALETTES object
        }
        // İsteğe bağlı: Palet değiştiğinde dönüştürmeyi otomatik başlat
        // if (originalImage.src && canvas.style.display === 'block') { convertBtn.click(); }
        // Not: Otomatik dönüştürme, görsel zaten dönüştürülmüşse çalışabilir.
        // Eğer sadece yeni bir görsel yüklendiğinde otomatik dönüşüm isterseniz bu satırı silin.
    });
});


// Slider Değerlerini Güncelleme (Mevcut haliyle doğru görünüyor)
dotCountSlider.addEventListener('input', () => {
    dotCount = parseInt(dotCountSlider.value, 10); // Değeri tamsayı yap
    dotCountValue.textContent = dotCount;
});

dotSizeSlider.addEventListener('input', () => {
    dotSize = parseInt(dotSizeSlider.value, 10); // Değeri tamsayı yap
    dotSizeValue.textContent = dotSize;
});



// Görsel Yükleme İşlevi (Mevcut haliyle doğru görünüyor, dosya okuma ve URL oluşturma)
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Eğer önceki bir görsel URL'si varsa temizle
      if (originalImage.src && originalImage.src.startsWith('blob:')) {
        URL.revokeObjectURL(originalImage.src);
      }

      const img = new Image();
      const objectURL = URL.createObjectURL(file);
      img.src = objectURL;

      img.onload = () => {
        originalImage.src = objectURL; // originalImage elementinin src'sini ayarla
        originalImage.style.display = 'block'; // orijinal görseli göster
        canvas.style.display = 'none'; // dönüşüm canvas'ını gizle
        
        // İndir ve Kopyala butonlarını gizle (Yeni görsel yüklendiğinde)
        document.getElementById('downloadBtn').style.display = 'none';
        document.getElementById('copyBtn').style.display = 'none';

        // İsteğe bağlı: Görsel yüklendiğinde otomatik dönüştürmeyi başlat
        // convertBtn.click();
      };

      // Yükleme hatasını yakala (isteğe bağlı)
      img.onerror = () => {
          console.error("Görsel yüklenemedi.");
          alert("Görsel yüklenirken bir hata oluştu.");
          URL.revokeObjectURL(objectURL); // Hata durumunda da URL'yi temizle
      };

    }
  });

  // Sayfa kapanırken veya yenilenirken oluşturulan URL'leri temizle
  // Bu, bellek sızıntılarını önlemeye yardımcı olur.
  window.addEventListener('beforeunload', () => {
    if (originalImage.src && originalImage.src.startsWith('blob:')) {
      URL.revokeObjectURL(originalImage.src);
    }
    // Gelecekte başka URL'ler oluşturursanız buraya ekleyin
  });


// Dönüştürme Butonuna Tıklama Olayı (Mevcut haliyle doğru görünüyor, piksel işlemleri)
convertBtn.addEventListener('click', () => {
  if (!originalImage.src || originalImage.style.display === 'none') {
    alert("Lütfen önce bir görsel yükleyin.");
    return;
  }

  // Görseli canvas'a çiz
  const img = new Image();
  img.src = originalImage.src; // Yüklenen görselin src'sini kullan

  img.onload = () => {
    // Canvas boyutlarını görsele göre ayarla
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Piksel verilerini al
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Canvas'ı temizle (Önceki çizimi kaldır)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Nokta sayısına göre adım boyutunu hesapla
    // Adım, canvas genişliğinin toplam nokta sayısına bölünmesiyle bulunur.
    // Math.max kullanarak adımın en az 1 olmasını sağlayız, 0'a bölünmeyi önleriz.
    const step = Math.max(1, Math.floor(canvas.width / dotCount));


    // Noktaları çiz
    // Dikey (y) ve yatay (x) olarak adım büyüklüğü kadar atlayarak ilerle
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        // 1) Hücre içindeki piksellerin ortalama R,G,B değerini al
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        // Mevcut hücre içindeki pikselleri gez
        for (let yy = 0; yy < step; yy++) {
          for (let xx = 0; xx < step; xx++) {
            const px = x + xx; // Güncel pikselin x koordinatı
            const py = y + yy; // Güncel pikselin y koordinatı

            // Canvas sınırları içinde olduğundan emin ol
            if (px < canvas.width && py < canvas.height) {
              // Pikselin data dizisindeki başlangıç indeksini hesapla (R değeri)
              const idx = (py * canvas.width + px) * 4;
              rSum += data[idx];     // Red değeri
              gSum += data[idx + 1]; // Green değeri
              bSum += data[idx + 2]; // Blue değeri
              // Alpha değeri (data[idx + 3]) genellikle ortalamaya dahil edilmez, ancak gerekirse eklenebilir.
              count++; // Hücredeki piksel sayısını artır
            }
          }
        }

        // Ortalama R, G, B değerlerini hesapla (count 0 olmayacağından emin olmalıyız)
        const rAvg = (count > 0) ? Math.round(rSum / count) : 0;
        const gAvg = (count > 0) ? Math.round(gSum / count) : 0;
        const bAvg = (count > 0) ? Math.round(bSum / count) : 0;

        // 2) (Opsiyonel) Dithering yapacaksan burada ekle…
        // (Bu projede dithering şu an için uygulanmamış)

        // 3) Ortalama renge en yakın palet rengini bul
        // nearestColor fonksiyonu, currentPalette null ise orijinal rengi döndürür.
        const color = nearestColor(currentPalette, rAvg, gAvg, bAvg);

        // 4) Noktayı çiz
        ctx.fillStyle = color; // Noktanın rengini ayarla
        ctx.beginPath();       // Yeni bir çizim yolu başlat
        ctx.arc(
          x + step / 2,        // Çemberin merkezinin x koordinatı (Hücrenin ortası)
          y + step / 2,        // Çemberin merkezinin y koordinatı (Hücrenin ortası)
          dotSize / 2,         // Çemberin yarıçapı (dotSize / 2)
          0,                   // Başlangıç açısı (radyan)
          Math.PI * 2          // Bitiş açısı (2*PI tam çember demektir)
        );
        ctx.fill();            // Çemberin içini seçilen renkle doldur
      }
    }

    // Dönüştürme tamamlandıktan sonra canvas'ı göster
    canvas.style.display = 'block';
    // Orijinal görseli gizle (isteğe bağlı, aynı anda ikisini de gösterebilirsiniz)
    // originalImage.style.display = 'none';


    // İndir ve Kopyala butonlarını görünür yap
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');

    downloadBtn.style.display = 'inline-block';
    copyBtn.style.display = 'inline-block';

    // İndir butonu işlevi (Mevcut haliyle doğru görünüyor)
    downloadBtn.onclick = () => {
      const dataURL = canvas.toDataURL('image/png'); // Canvas içeriğini PNG veri URL'si olarak al
      const link = document.createElement('a'); // İndirme linki oluştur
      link.href = dataURL; // Linkin hedefini veri URL'si yap
      link.download = 'dot-image.png'; // İndirilecek dosyanın adını belirle
      document.body.appendChild(link); // Linki geçici olarak body'ye ekle
      link.click(); // Linke tıklayarak indirmeyi başlat
      document.body.removeChild(link); // Linki body'den kaldır
    };

      // Resmi Kopyala butonu işlevi (Mevcut haliyle doğru görünüyor, Clipboard API kullanıyor)
      copyBtn.onclick = () => {
          // Clipboard API ve ClipboardItem desteğini kontrol et
          if (!navigator.clipboard || !window.ClipboardItem) {
          alert('Bu tarayıcı kopyalama işlemini desteklemiyor. Lütfen güncel bir tarayıcı kullanın.');
          return;
          }

          // Canvas içeriğini Blob olarak al
          canvas.toBlob((blob) => {
          if (blob) {
              // Blob'u ClipboardItem'a dönüştür
              const item = new ClipboardItem({ 'image/png': blob });
              // Clipboard'a yaz
              navigator.clipboard.write([item]).then(() => {
              alert('Resim panoya kopyalandı.');
              }).catch((err) => {
              console.error('Resim kopyalanamadı, farklı bir tarayıcı deneyiniz.');
              alert('Resim kopyalanamadı, farklı bir tarayıcı deneyiniz.'); // Kullanıcıya daha detaylı hata mesajı göster
              });
          } else {
              alert('Resim verisi oluşturulamadı.'); // Blob oluşturma hatası
          }
          }, 'image/png'); // Blob tipini belirt
      }; 
      


    };

     // Görsel yüklenirken hata olursa diye ek kontrol (Opsiyonel ama iyi pratik)
     img.onerror = () => {
         console.error("Dönüştürme için görsel yüklenemedi.");
         alert("Dönüştürme işlemi sırasında görsel yüklenirken bir hata oluştu.");
     };


});



