// HTML elementlerine erişim
const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d'); // Canvas 2D bağlamını al
const generateArrayBtn = document.getElementById('generateArrayBtn');
const nextStepBtn = document.getElementById('nextStepBtn');

// Canvas Boyutları ve Bar Ayarları
const canvasWidth = 600;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const numberOfBars = 50; // Görselleştirilecek eleman sayısı
const barWidth = canvasWidth / numberOfBars; // Her bir çubuğun genişliği

let array = []; // Sıralanacak dizi
let isSorting = false; // Sıralama işleminin devam edip etmediğini tutar

// Bubble Sort Algoritması için durum değişkenleri
let i = 0; // Dış döngü indisi
let j = 0; // İç döngü indisi

// Rastgele Dizi Oluşturma Fonksiyonu
function generateRandomArray() {
    array = []; // Diziyi sıfırla
    for (let k = 0; k < numberOfBars; k++) {
        // 1 ile canvasHeight arasında rastgele sayılar
        array.push(Math.floor(Math.random() * canvasHeight) + 1);
    }
    // Algoritma durumunu sıfırla
    i = 0;
    j = 0;
    isSorting = false; // Yeni dizi oluşturulduğunda sıralama bitmiş sayılır
    drawArray(); // Yeni diziyi çiz
}

// Diziyi Canvas'a Çizme Fonksiyonu
function drawArray() {
    // Canvas'ı temizle
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Her çubuğu çiz
    for (let k = 0; k < array.length; k++) {
        const barHeight = array[k]; // Çubuğun yüksekliği (dizi elemanının değeri)
        const x = k * barWidth; // Çubuğun x konumu
        const y = canvasHeight - barHeight; // Çubuğun y konumu (Canvas'ın altından başlar)

        // Çubuk rengini ayarla
        ctx.fillStyle = '#0275d8'; // Mavi renk
        // Belirli barları highlight etmek için burada koşullar ekleyebilirsiniz
        // if (k === j || k === j + 1) { ctx.fillStyle = 'red'; } // Karşılaştırılanlar kırmızı olsun gibi

        // Dikdörtgeni çiz (x, y, genişlik, yükseklik)
        ctx.fillRect(x, y, barWidth - 1, barHeight); // Çubuklar arasına 1px boşluk bırakmak için barWidth - 1 yaptık
    }
}

// Sayfa yüklendiğinde ilk diziyi oluştur ve çiz
// Bubble Sort Algoritmasında Tek Bir Adım Uygulama Fonksiyonu
function bubbleSortStep() {
    if (!isSorting) {
        isSorting = true;
        i = 0;
        j = 0;
    }

    if (i < array.length - 1) {
        if (j < array.length - 1 - i) {
            if (array[j] > array[j + 1]) {
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }
            j++;
        } else {
            j = 0;
            i++;
        }
        drawArray(); // Adım tamamlandı, dizinin yeni durumunu çiz
        // drawArray(j, j + 1); // Opsiyonel: Karşılaştırılanları vurgula
    } else {
        isSorting = false;
        console.log("Sıralama Tamamlandı!");
        drawArray(); // Son durumu çiz
    }
}
// ---------------------------------------------

// Buton olay dinleyicileri
generateArrayBtn.addEventListener('click', generateRandomArray);

// ---------- BUNU DA DİĞER OLAY DİNLEYİCİLERİNİN YANINA EKLEYİN ----------
nextStepBtn.addEventListener('click', bubbleSortStep);
// ---------------------------------------------------------------------

// Sayfa yüklendiğinde ilk diziyi oluştur ve çiz
generateRandomArray();