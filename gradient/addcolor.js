document.addEventListener('DOMContentLoaded', function() {



    
    // DOM elements
    const userText = document.getElementById('userText');
    const gradientDirection = document.getElementById('gradientDirection');
    const fontSize = document.getElementById('fontSize');
    const lineHeight = document.getElementById('lineHeight');
    const textAlign = document.getElementById('textAlign');
    const fontWeight = document.getElementById('fontWeight');
    const fontFamily = document.getElementById('fontFamily');
    const backgroundColor = document.getElementById('backgroundColor');
    const previewText = document.getElementById('previewText');
    const previewContainer = document.querySelector('.preview');
    const updatePreviewBtn = document.getElementById('updatePreview');
    const showCodeBtn = document.getElementById('showCode');
    const copyCodeBtn = document.getElementById('copyCode');
    const downloadImageBtn = document.getElementById('downloadImage');
    const copyImageBtn = document.getElementById('copyImage');
    const codeOutput = document.getElementById('codeOutput');
    const addColorBtn = document.getElementById('addColor');
    const colorCanvas = document.getElementById('colorCanvas');
    const colorCirclesContainer = document.getElementById('colorCirclesContainer');
    
    // Gradient control elements
    const gradientControl = document.getElementById('gradientControl');
    const gradientLine = document.getElementById('gradientLine');
    const startCircle = document.getElementById('startCircle');
    const endCircle = document.getElementById('endCircle');
    
    // Array to hold color stops and intermediate preview circles
    let colorStops = [
        { color: '#ff0000', position: 0, circle: null }, // Start color at 0
        { color: '#0000ff', position: 1, circle: null }  // End color at 1
    ];
    let intermediatePreviewCircles = [];
    let customGradientEnabled = false;
    
    // Initialize preview circle colors
    startCircle.style.backgroundColor = colorStops[0].color;
    endCircle.style.backgroundColor = colorStops[colorStops.length - 1].color;

    function disableSelection(element) {
        element.style.userSelect = 'none';
        element.style.webkitUserSelect = 'none'; // For Safari
        element.style.mozUserSelect = 'none';    // For Firefox
        element.style.msUserSelect = 'none';     // For Internet Explorer/Edge
    }
    // Apply to the canvas and button
    disableSelection(colorCanvas);
    disableSelection(addColor);

    // Draw color gradient on canvas
    const ctx = colorCanvas.getContext('2d');
    function drawColorGradient() {
        const width = colorCanvas.width;
        const height = colorCanvas.height;
        for (let x = 0; x < width; x++) {
            const hue = (x / width) * 360;
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, `hsl(${hue}, 100%, 0%)`);    // Black
            gradient.addColorStop(0.5, `hsl(${hue}, 100%, 50%)`); // Pure color
            gradient.addColorStop(1, `hsl(${hue}, 100%, 100%)`);  // White
            ctx.fillStyle = gradient;
            ctx.fillRect(x, 0, 1, height);
        }
    }

    // Convert hex to HSL
    function hexToHSL(hex) {
        let r = parseInt(hex.substr(1,2),16)/255;
        let g = parseInt(hex.substr(3,2),16)/255;
        let b = parseInt(hex.substr(5,2),16)/255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s * 100, l * 100];
    }

    // Get color from canvas position
    function getColorFromPosition(x, y) {
        const hue = (x / colorCanvas.width) * 360;
        const lightness = (y / colorCanvas.height) * 100;
        return `hsl(${hue}, 100%, ${lightness}%)`;
    }

    // Place color circles on canvas
    // Place color circles on canvas
    function placeColorCircles() {
        colorCirclesContainer.innerHTML = '';
        colorStops.forEach((stop, index) => {
            let displayedX, displayedY;
            
            // Eğer daha önce bu renk duruşu için bir daire oluşturulmuşsa ve konumu manuel olarak ayarlanmışsa
            if (stop.circle && stop.circle.dataset.manualPosition === 'true') {
                // Mevcut konumu koru
                displayedX = parseFloat(stop.circle.style.left) || 0;
                displayedY = parseFloat(stop.circle.style.top) || 0;
            } 
            // Daha önce oluşturulmuş ama konumu manuel olarak değiştirilmemiş bir daire varsa
            else if (stop.circle) {
                // Mevcut konumu koru
                displayedX = parseFloat(stop.circle.style.left) || 0;
                displayedY = parseFloat(stop.circle.style.top) || 0;
            }
            // Yeni bir daire oluşturuluyorsa
            else {
                // Renk değerlerinden konumu hesapla
                const [hue, , lightness] = hexToHSL(stop.color);
                displayedX = (hue / 360) * colorCanvas.offsetWidth;
                displayedY = (lightness / 100) * colorCanvas.offsetHeight;
            }
            
            const circle = document.createElement('div');
            circle.className = 'color-circle';
            circle.style.left = `${displayedX}px`;
            circle.style.top = `${displayedY}px`;
            circle.style.backgroundColor = stop.color;
            
            // Eğer önceki dairenin manuel konumu varsa, bu bilgiyi aktar
            if (stop.circle && stop.circle.dataset.manualPosition === 'true') {
                circle.dataset.manualPosition = 'true';
            }
            
            colorCirclesContainer.appendChild(circle);
            stop.circle = circle;
            makeColorCircleDraggable(circle, index);
        });
    }

    // Make color circles draggable
    function makeColorCircleDraggable(circle, index) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        
        circle.addEventListener('mousedown', function(e) {
            isDragging = true;
            e.preventDefault();
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY;
            const rect = circle.getBoundingClientRect();
            const containerRect = colorCanvas.getBoundingClientRect();
            initialLeft = rect.left - containerRect.left;
            initialTop = rect.top - containerRect.top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        function onMouseMove(e) {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;
            // Constrain to displayed dimensions
            newLeft = Math.max(0, Math.min(newLeft, colorCanvas.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, colorCanvas.offsetHeight));
            circle.style.left = `${newLeft}px`;
            circle.style.top = `${newTop}px`;
            // Scale to internal canvas coordinates
            const canvasX = newLeft * (colorCanvas.width / colorCanvas.offsetWidth);
            const canvasY = newTop * (colorCanvas.height / colorCanvas.offsetHeight);
            const color = getColorFromPosition(canvasX, canvasY);
            colorStops[index].color = color;
            circle.style.backgroundColor = color;
            updatePreviewCircles();
            updatePreview();
        }
        
        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
    // Update preview circles' colors
    function updatePreviewCircles() {
        startCircle.style.backgroundColor = colorStops[0].color;
        endCircle.style.backgroundColor = colorStops[colorStops.length - 1].color;
        intermediatePreviewCircles.forEach((circle, i) => {
            circle.style.backgroundColor = colorStops[i + 1].color;
        });
    }
    // Override hexToHSL to support both hex and hsl formats
    function hexToHSL(color) {
        if (color.startsWith('hsl')) {
            const regex = /hsl\(\s*(\d+)[, ]+\s*(\d+)%[, ]+\s*(\d+)%\s*\)/;
            const result = regex.exec(color);
            if (result) {
                return [parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[3])];
            }
            return [0, 0, 0];
        }
        let r = parseInt(color.substr(1,2), 16) / 255;
        let g = parseInt(color.substr(3,2), 16) / 255;
        let b = parseInt(color.substr(5,2), 16) / 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return [h, s * 100, l * 100];
    }
    // Add new color stop
    addColorBtn.addEventListener('click', function() {
        if (colorStops.length < 10) { // Limit to 5 stops
            const defaultColor = getColorFromPosition(colorCanvas.width / 2, colorCanvas.height / 2);
            colorStops.splice(colorStops.length - 1, 0, { color: defaultColor, circle: null });
            if (customGradientEnabled) {
                const newCircle = document.createElement('div');
                newCircle.className = 'gradient-circle intermediate-circle';
                newCircle.style.left = '50%';
                newCircle.style.top = '50%';
                gradientControl.appendChild(newCircle);
                makeDraggable(newCircle);
                intermediatePreviewCircles.push(newCircle);
            }
            placeColorCircles();
            updatePreviewCircles();
            updatePreview();
        }
    });

    // Gradient direction change
    gradientDirection.addEventListener('change', function() {
        customGradientEnabled = this.value === 'custom';
        gradientControl.style.display = customGradientEnabled ? 'block' : 'none';

        // Her durumda çember renklerini güncelle
        startCircle.style.backgroundColor = colorStops[0].color;
        endCircle.style.backgroundColor = colorStops[colorStops.length - 1].color;

        // Eski ara çemberleri temizle
        intermediatePreviewCircles.forEach(circle => circle.remove());
        intermediatePreviewCircles = [];

        if (customGradientEnabled) {
            initializeGradientControl();
            // Ara çemberleri güncel colorStops'a göre oluştur
            for (let i = 1; i < colorStops.length - 1; i++) {
                const newCircle = document.createElement('div');
                newCircle.className = 'gradient-circle intermediate-circle';
                newCircle.style.left = '50%';
                newCircle.style.top = '50%';
                newCircle.style.backgroundColor = colorStops[i].color;
                gradientControl.appendChild(newCircle);
                makeDraggable(newCircle);
                intermediatePreviewCircles.push(newCircle);
            }
            updateCustomGradient();
        }
        updatePreviewCircles(); // Tüm çember renklerini güncelle
        updatePreview();
    });

    // Make preview circles draggable
    makeDraggable(startCircle);
    makeDraggable(endCircle);
    
    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        
        element.addEventListener('mousedown', function(e) {
            isDragging = true;
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY;
            const rect = element.getBoundingClientRect();
            initialLeft = rect.left - previewContainer.getBoundingClientRect().left;
            initialTop = rect.top - previewContainer.getBoundingClientRect().top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        function onMouseMove(e) {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            const newLeft = initialLeft + deltaX;
            const newTop = initialTop + deltaY;
            const previewRect = previewContainer.getBoundingClientRect();
            const elementRadius = element.offsetWidth / 2;
            const maxLeft = previewRect.width - elementRadius;
            const maxTop = previewRect.height - elementRadius;
            const constrainedLeft = Math.max(elementRadius, Math.min(newLeft, maxLeft));
            const constrainedTop = Math.max(elementRadius, Math.min(newTop, maxTop));
            element.style.left = constrainedLeft + 'px';
            element.style.top = constrainedTop + 'px';
            if (customGradientEnabled) {
                updateGradientLine();
                updateCustomGradient();
            }
        }
        
        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    // Update gradient line
    function updateGradientLine() {
        const startRect = startCircle.getBoundingClientRect();
        const endRect = endCircle.getBoundingClientRect();
        const previewRect = previewContainer.getBoundingClientRect();
        const startX = startRect.left + startRect.width / 2 - previewRect.left;
        const startY = startRect.top + startRect.height / 2 - previewRect.top;
        const endX = endRect.left + endRect.width / 2 - previewRect.left;
        const endY = endRect.top + endRect.height / 2 - previewRect.top;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        gradientLine.style.left = startX + 'px';
        gradientLine.style.top = startY + 'px';
        gradientLine.style.width = length + 'px';
        gradientLine.style.transform = `rotate(${angle}deg)`;
        gradientLine.style.transformOrigin = '0 50%';
        return angle;
    }

    // Initialize gradient control
    function initializeGradientControl() {
        updateGradientLine();
    }


    function throttle(fn, wait) {
    let last = 0, timer = null;
    return function(...args) {
        const now = Date.now();
        const remaining = wait - (now - last);
        if (remaining <= 0) {
        clearTimeout(timer);
        timer = null;
        last = now;
        fn.apply(this, args);
        } else if (!timer) {
        timer = setTimeout(() => {
            last = Date.now();
            timer = null;
            fn.apply(this, args);
        }, remaining);
        }
    };
    }
    // Update custom gradient
/*     function updateCustomGradient() {
        const previewRect = previewContainer.getBoundingClientRect();
        const getPosition = (circle) => {
            const rect = circle.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2 - previewRect.left,
                y: rect.top + rect.height / 2 - previewRect.top
            };
        };
        
        const P_start = getPosition(startCircle);
        const P_end = getPosition(endCircle);
        const V = { x: P_end.x - P_start.x, y: P_end.y - P_start.y };
        const V_dot_V = V.x * V.x + V.y * V.y;
        
        if (V_dot_V === 0) {
            previewText.style.background = `linear-gradient(90deg, ${colorStops[0].color}, ${colorStops[colorStops.length - 1].color})`;
        } else {
            const allCircles = [
                { circle: startCircle, color: colorStops[0].color },
                ...intermediatePreviewCircles.map((circle, i) => ({ circle, color: colorStops[i + 1].color })),
                { circle: endCircle, color: colorStops[colorStops.length - 1].color }
            ];
            const stops = allCircles.map(c => {
                const P_i = getPosition(c.circle);
                const t = ((P_i.x - P_start.x) * V.x + (P_i.y - P_start.y) * V.y) / V_dot_V;
                return { t, color: c.color };
            });
            stops.sort((a, b) => a.t - b.t);
            const gradientStops = stops.map(s => `${s.color} ${s.t * 100}%`).join(', ');
            const angle = Math.atan2(V.y, V.x) * (180 / Math.PI);
            const cssAngle = (90 - angle) % 360;
            previewText.style.background = `linear-gradient(${cssAngle}deg, ${gradientStops})`;
        }
        
        previewText.style.webkitBackgroundClip = 'text';
        previewText.style.backgroundClip = 'text';
        previewText.style.color = 'transparent';
    } */
        function updateCustomGradient() {
            const pvRect = previewContainer.getBoundingClientRect();

            /* 1) Çember konumlarını & renklerini topla */
            const circles = [
                { circle: startCircle, color: colorStops[0].color },
                ...intermediatePreviewCircles.map((c,i)=>({ circle:c, color: colorStops[i+1].color })),
                { circle: endCircle,   color: colorStops.at(-1).color }
            ].map(o=>{
                const r = o.circle.getBoundingClientRect();
                return {
                    x: r.left + r.width/2 - pvRect.left,
                    y: r.top  + r.height/2 - pvRect.top,
                    color: o.color
                };
            });

            /* 2) Küçük bir dokuyu hesapla */
            const texURL = generateDistanceGradient(circles, pvRect.width, pvRect.height, 0.35);

            /* 3) Metnin arka planını bu doku yap */
            previewText.style.backgroundImage    = `url(${texURL})`;
            previewText.style.backgroundSize     = '100% 100%';
            previewText.style.backgroundRepeat   = 'no-repeat';
            previewText.style.webkitBackgroundClip =
            previewText.style.backgroundClip     = 'text';
            previewText.style.color              = 'transparent';
        }
        updateCustomGradient = throttle(updateCustomGradient, 30);




    // Update preview
    function updatePreview() {
        previewText.textContent = userText.value || 'Metin girin';
        if (customGradientEnabled) {
            updateCustomGradient();
        }else {
            const gradientStops = colorStops
                .sort((a, b) => a.position - b.position)
                .map(stop => `${stop.color} ${stop.position * 100}%`)
                .join(', ');
            previewText.style.background = `linear-gradient(${gradientDirection.value}, ${gradientStops})`;
            previewText.style.webkitBackgroundClip = 'text';
            previewText.style.backgroundClip = 'text';
            previewText.style.color = 'transparent';
        }
        previewText.style.fontSize = `${fontSize.value}px`;
        previewText.style.lineHeight = lineHeight.value;
        previewText.style.textAlign = textAlign.value;
        previewText.style.fontWeight = fontWeight.value;
        previewText.style.fontFamily = fontFamily.value;
        previewContainer.style.backgroundColor = backgroundColor.value;
        if (codeOutput.style.display === 'block') {
            generateCode();
        }
    }

    // Generate CSS code
    function generateCode() {
        let gradientCSS;
        if (customGradientEnabled) {
            const previewRect = previewContainer.getBoundingClientRect();
            const getPosition = (circle) => {
                const rect = circle.getBoundingClientRect();
                return {
                    x: rect.left + rect.width / 2 - previewRect.left,
                    y: rect.top + rect.height / 2 - previewRect.top
                };
            };
            const P_start = getPosition(startCircle);
            const P_end = getPosition(endCircle);
            const V = { x: P_end.x - P_start.x, y: P_end.y - P_start.y };
            const V_dot_V = V.x * V.x + V.y * V.y;
            if (V_dot_V === 0) {
                gradientCSS = `linear-gradient(90deg, ${colorStops[0].color}, ${colorStops[colorStops.length - 1].color})`;
            } else {
                const allCircles = [
                    { circle: startCircle, color: colorStops[0].color },
                    ...intermediatePreviewCircles.map((circle, i) => ({ circle, color: colorStops[i + 1].color })),
                    { circle: endCircle, color: colorStops[colorStops.length - 1].color }
                ];
                const stops = allCircles.map(c => {
                    const P_i = getPosition(c.circle);
                    const t = ((P_i.x - P_start.x) * V.x + (P_i.y - P_start.y) * V.y) / V_dot_V;
                    return { t, color: c.color };
                });
                stops.sort((a, b) => a.t - b.t);
                const gradientStops = stops.map(s => `${s.color} ${s.t * 100}%`).join(', ');
                const angle = Math.atan2(V.y, V.x) * (180 / Math.PI);
                const cssAngle = (90 - angle) % 360;
                gradientCSS = `linear-gradient(${cssAngle}deg, ${gradientStops})`;
            }
        } else {
            const gradientStops = colorStops
                .sort((a, b) => a.position - b.position)
                .map(stop => `${stop.color} ${stop.position * 100}%`)
                .join(', ');
            gradientCSS = `linear-gradient(${gradientDirection.value}, ${gradientStops})`;
        }
        
        const css = `.gradyan-metin {
    background: ${gradientCSS};
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-size: ${fontSize.value}px;
    line-height: ${lineHeight.value};
    text-align: ${textAlign.value};
    font-weight: ${fontWeight.value};
    font-family: ${fontFamily.value};
}

.gradyan-metin-container {
    background-color: ${backgroundColor.value};
    padding: 20px;
}`;
        codeOutput.textContent = css;
    }

    // Event listeners for buttons
    updatePreviewBtn.addEventListener('click', updatePreview);
    showCodeBtn.addEventListener('click', function() {
        generateCode();
        codeOutput.style.display = codeOutput.style.display === 'none' || codeOutput.style.display === '' ? 'block' : 'none';
        showCodeBtn.textContent = codeOutput.style.display === 'none' ? 'CSS Kodunu Göster' : 'CSS Kodunu Gizle';
    });
    copyCodeBtn.addEventListener('click', function() {
        generateCode();
        navigator.clipboard.writeText(codeOutput.textContent).then(() => {
            const originalText = copyCodeBtn.textContent;
            copyCodeBtn.textContent = 'Kopyalandı!';
            setTimeout(() => copyCodeBtn.textContent = originalText, 1500);
        }).catch(err => console.error('Kopyalama başarısız: ', err));
    });
    
    
/*     downloadImageBtn.addEventListener('click', function() {
        html2canvas(previewContainer, {
            backgroundColor: backgroundColor.value,
            scale: 2,
            logging: false,
            onclone: function(clonedDoc) {
                const clonedPreview = clonedDoc.querySelector('.preview');
                clonedPreview.style.boxShadow = 'none';
                clonedPreview.style.border = 'none';
                const clonedControl = clonedDoc.querySelector('.gradient-control');
                if (clonedControl) clonedControl.style.display = 'none';
            }
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'gradyan-metin.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });  */ 

    downloadImageBtn.addEventListener('click', async function() {
    const text = userText.value || 'Metin girin';
    const fontSizeVal = parseInt(fontSize.value, 10);
    const fontFamilyVal = fontFamily.value;
    const fontWeightVal = fontWeight.value;
    const lineHeightVal = lineHeight.value;
    const textAlignVal = textAlign.value;
    const width = 1200;
    const height = 300;
    const gradientDirectionVal = gradientDirection.value === 'custom' ? 'to right' : gradientDirection.value;
    const bgColor = backgroundColor.value;

    // Canvas'a çiz (tüm renk duraklarını kullanarak)
    const canvas = await drawGradientTextToCanvas({
        text,
        fontSize: fontSizeVal,
        fontFamily: fontFamilyVal,
        fontWeight: fontWeightVal,
        lineHeight: lineHeightVal,
        textAlign: textAlignVal,
        width,
        height,
        colorStops: [...colorStops], // Tüm renk duraklarını kopyala
        gradientDirection: gradientDirectionVal,
        backgroundColor: bgColor
    });

    // PNG olarak indir
    const link = document.createElement('a');
    link.download = 'gradyan-metin.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

copyImageBtn.addEventListener('click', async function() {
    const text = userText.value || 'Metin girin';
    const fontSizeVal = parseInt(fontSize.value, 10);
    const fontFamilyVal = fontFamily.value;
    const fontWeightVal = fontWeight.value;
    const lineHeightVal = lineHeight.value;
    const textAlignVal = textAlign.value;
    const width = 900;
    const height = 300;
    const gradientDirectionVal = gradientDirection.value === 'custom' ? 'to right' : gradientDirection.value;
    const bgColor = backgroundColor.value;

    // Canvas'a çiz (tüm renk duraklarını kullanarak)
    const canvas = await drawGradientTextToCanvas({
        text,
        fontSize: fontSizeVal,
        fontFamily: fontFamilyVal,
        fontWeight: fontWeightVal,
        lineHeight: lineHeightVal,
        textAlign: textAlignVal,
        width,
        height,
        colorStops: [...colorStops], // Tüm renk duraklarını kopyala
        gradientDirection: gradientDirectionVal,
        backgroundColor: bgColor
    });

    // PNG olarak panoya kopyala
    canvas.toBlob(blob => {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
            const originalText = copyImageBtn.textContent;
            copyImageBtn.textContent = 'Kopyalandı!';
            setTimeout(() => copyImageBtn.textContent = originalText, 1500);
        }).catch(err => console.error('Görsel kopyalama başarısız: ', err));
    });
});




    



/*     copyImageBtn.addEventListener('click', function() {
        html2canvas(previewContainer, {
            backgroundColor: backgroundColor.value,
            scale: 2,
            logging: false,
            onclone: function(clonedDoc) {
                const clonedPreview = clonedDoc.querySelector('.preview');
                clonedPreview.style.boxShadow = 'none';
                clonedPreview.style.border = 'none';
                const clonedControl = clonedDoc.querySelector('.gradient-control');
                if (clonedControl) clonedControl.style.display = 'none';
            }
        }).then(canvas => {
            canvas.toBlob(blob => {
                navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
                    const originalText = copyImageBtn.textContent;
                    copyImageBtn.textContent = 'Kopyalandı!';
                    setTimeout(() => copyImageBtn.textContent = originalText, 1500);
                }).catch(err => console.error('Görsel kopyalama başarısız: ', err));
            });
        });
    }); */



    // Initialize
    drawColorGradient();
    placeColorCircles();
    updatePreview();
    if (gradientDirection.value === 'custom') {
        customGradientEnabled = true;
        gradientControl.style.display = 'block';
        initializeGradientControl();
        updateCustomGradient();
    }
    [userText, fontSize, lineHeight, textAlign, fontWeight, fontFamily, backgroundColor].forEach(element => {
        element.addEventListener('input', updatePreview);
    });

    // Renk seçimi için yeni arayüz elemanları
const colorPickerContainer = document.createElement('div');
colorPickerContainer.className = 'color-picker-container';
colorPickerContainer.style.display = 'none';
colorPickerContainer.style.position = 'absolute';
colorPickerContainer.style.zIndex = '1000';
colorPickerContainer.style.background = '#fff';
colorPickerContainer.style.border = '1px solid #ccc';
colorPickerContainer.style.borderRadius = '16px';
colorPickerContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
colorPickerContainer.style.padding = '10px';
colorPickerContainer.style.width = '300px';

// Renk seçici HSL canvaslar
const hueCanvas = document.createElement('canvas');
hueCanvas.width = 280;
hueCanvas.height = 30;
hueCanvas.style.display = 'block';
hueCanvas.style.marginBottom = '10px';
hueCanvas.style.borderRadius = '16px';
hueCanvas.style.cursor = 'pointer';
disableSelection(hueCanvas); // Add this line

const shadeCanvas = document.createElement('canvas');
shadeCanvas.width = 280;
shadeCanvas.height = 150;
shadeCanvas.style.display = 'block';
shadeCanvas.style.marginBottom = '10px';
shadeCanvas.style.borderRadius = '16px';
shadeCanvas.style.cursor = 'pointer';
disableSelection(hueCanvas); // Add this line

/*minik renk göstergeci*/
 

// Seçilen renk göstergesi
const selectedColorDisplay = document.createElement('div');
selectedColorDisplay.style.display = 'flex';
selectedColorDisplay.style.justifyContent = 'space-between';
selectedColorDisplay.style.alignItems = 'center';
selectedColorDisplay.style.borderRadius = '100px';

const colorPreview = document.createElement('div');
colorPreview.style.width = '30px';
colorPreview.style.height = '30px';
colorPreview.style.borderRadius = '100px';
colorPreview.style.border = '1px solid #ccc';

const hexInput = document.createElement('input');
hexInput.type = 'text';
hexInput.style.padding = '5px';
hexInput.style.borderRadius = '68px';
hexInput.style.border = '1px solid #ccc';
hexInput.style.width = '100px';

const deleteColorBtn = document.createElement('button');
deleteColorBtn.textContent = 'Delete';
deleteColorBtn.style.padding = '5px 10px';
deleteColorBtn.style.borderRadius = '68px';
deleteColorBtn.style.background = '#757575';
deleteColorBtn.style.cursor = 'pointer';
deleteColorBtn.style.marginLeft = '10px';

selectedColorDisplay.appendChild(colorPreview);
selectedColorDisplay.appendChild(hexInput);
selectedColorDisplay.appendChild(deleteColorBtn);

colorPickerContainer.appendChild(shadeCanvas);
colorPickerContainer.appendChild(hueCanvas);
colorPickerContainer.appendChild(selectedColorDisplay);
document.body.appendChild(colorPickerContainer);


// Create indicator elements for hue and shade pickers
const hueIndicator = document.createElement('div');
hueIndicator.className = 'hue-indicator';
hueIndicator.style.position = 'absolute';
hueIndicator.style.width = '8px';
hueIndicator.style.height = '30px';
hueIndicator.style.borderRadius = '1px';
hueIndicator.style.border = '1px solid white';
hueIndicator.style.boxShadow = '0 0 3px rgba(0,0,0,0.5)';
hueIndicator.style.pointerEvents = 'none';
hueIndicator.style.zIndex = '15';
hueIndicator.style.top = '0';
hueIndicator.style.transform = 'translateX(-50%)';

const shadeIndicator = document.createElement('div');
shadeIndicator.className = 'shade-indicator';
shadeIndicator.style.position = 'absolute';
shadeIndicator.style.width = '16px';
shadeIndicator.style.height = '16px';
shadeIndicator.style.borderRadius = '50%';
shadeIndicator.style.border = '1px solid white';
shadeIndicator.style.boxShadow = '0 0 3px rgba(0,0,0,0.5)';
shadeIndicator.style.pointerEvents = 'none';
shadeIndicator.style.zIndex = '15';
shadeIndicator.style.transform = 'translate(-50%, -50%)';

// Create container wrappers for indicators
const hueCanvasWrapper = document.createElement('div');
hueCanvasWrapper.style.position = 'relative';
hueCanvasWrapper.style.width = '100%';
hueCanvasWrapper.style.marginBottom = '10px';
hueCanvasWrapper.appendChild(hueCanvas);
hueCanvasWrapper.appendChild(hueIndicator);

const shadeCanvasWrapper = document.createElement('div');
shadeCanvasWrapper.style.position = 'relative';
shadeCanvasWrapper.style.width = '100%';
shadeCanvasWrapper.style.marginBottom = '10px';
shadeCanvasWrapper.appendChild(shadeCanvas);
shadeCanvasWrapper.appendChild(shadeIndicator);
// Replace the direct canvas additions with our new wrappers
colorPickerContainer.innerHTML = '';
colorPickerContainer.appendChild(shadeCanvasWrapper);
colorPickerContainer.appendChild(hueCanvasWrapper);
colorPickerContainer.appendChild(selectedColorDisplay);


// Spectrum renk çubuğu (alt kısımdaki renk çubuğu)
const spectrumContainer = document.createElement('div');
spectrumContainer.className = 'spectrum-container';
spectrumContainer.style.position = 'relative';
spectrumContainer.style.width = '100%';
spectrumContainer.style.height = '50px';
spectrumContainer.style.marginTop = '20px';
spectrumContainer.style.borderRadius = '16px';
spectrumContainer.style.overflow = 'hidden';

const spectrumCanvas = document.createElement('canvas');
spectrumCanvas.width = colorCanvas.width;
spectrumCanvas.height = 50;
spectrumCanvas.style.width = '100%';
spectrumCanvas.style.height = '100%';
spectrumCanvas.style.borderRadius = '16px';
disableSelection(hueCanvas); // Add this line

spectrumContainer.appendChild(spectrumCanvas);
colorCirclesContainer.parentNode.insertBefore(spectrumContainer, colorCirclesContainer.nextSibling);

// Global değişkenler
let currentSelectedCircle = null;
let currentHue = 0;
let currentSaturation = 100;
let currentLightness = 50;

// Renk seçiciyi çiz
function drawHueCanvas() {
    const ctx = hueCanvas.getContext('2d');
    for (let x = 0; x < hueCanvas.width; x++) {
        const hue = (x / hueCanvas.width) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, 0, 1, hueCanvas.height);
    }
}

function drawShadeCanvas(hue) {
    const ctx = shadeCanvas.getContext('2d');
    for (let y = 0; y < shadeCanvas.height; y++) {
        for (let x = 0; x < shadeCanvas.width; x++) {
            const saturation = (x / shadeCanvas.width) * 100;
            const lightness = 100 - (y / shadeCanvas.height) * 100;
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function drawSpectrumCanvas() {
    const ctx = spectrumCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, spectrumCanvas.width, 0);
    
    // Sort colorStops by position
    colorStops.sort((a, b) => a.position - b.position);
    // Add gradient stops using their positions
    colorStops.forEach((stop) => {
        gradient.addColorStop(stop.position, stop.color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
}

// Spectrum üzerindeki renk çemberlerini oluştur
function createSpectrumCircles() {
    colorStops.sort((a, b) => a.position - b.position);
    
    // Clear previous circles
    spectrumContainer.querySelectorAll('.spectrum-circle').forEach(circle => circle.remove());
    
    colorStops.forEach((stop, index) => {
        const circle = document.createElement('div');
        circle.className = 'spectrum-circle';
        circle.style.position = 'absolute';
        circle.style.width = '20px';
        circle.style.height = '20px';
        circle.style.borderRadius = '50%';
        circle.style.border = '2px solid white';
        circle.style.boxShadow = '0 0 3px rgba(0,0,0,0.5)';
        circle.style.cursor = 'pointer';
        circle.style.zIndex = '10';
        circle.style.backgroundColor = stop.color;
        circle.style.left = `${stop.position * 100}%`;
        circle.style.top = '50%';
        circle.style.transform = 'translate(-50%, -50%)';
        circle.dataset.index = index;
        
        // Make circle draggable
        let isDragging = false;
        let startX;
        
        circle.addEventListener('mousedown', function(e) {
            isDragging = true;
            e.preventDefault();
            startX = e.clientX;
            e.stopPropagation();
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        function onMouseMove(e) {
            if (!isDragging) return;
            
            const rect = spectrumContainer.getBoundingClientRect();
            const containerWidth = rect.width;
            const newX = Math.max(0, Math.min(containerWidth, e.clientX - rect.left));
            //const position = newX / containerWidth; // Position between 0 and 1
            let position = newX / containerWidth;
            
            const index = parseInt(circle.dataset.index);
            // Update the position of the dragged stop, keeping its color
            colorStops[index].position = position;
            circle.style.left = `${position * 100}%`;
            
            // Sort colorStops by position to ensure correct gradient order
            colorStops.sort((a, b) => a.position - b.position);
            // Update indices after sorting
            colorStops.forEach((stop, i) => {
                if (stop.circle) stop.circle.dataset.index = i;
            });
            
            // Update UI and preview
            createSpectrumCircles(); // Redraw circles to reflect new order
            drawSpectrumCanvas();
            updatePreview();
        }


        
        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        
        // Click handler for color picker
        circle.addEventListener('click', function(e) {
            if (!isDragging) {
                currentSelectedCircle = this;
                const rect = circle.getBoundingClientRect();
                
                colorPickerContainer.style.display = 'block';
                colorPickerContainer.style.left = `${rect.left}px`;
                colorPickerContainer.style.top = `${rect.bottom + 10}px`;
                
                const colorIndex = parseInt(circle.dataset.index);
                const [hue, saturation, lightness] = hexToHSL(colorStops[colorIndex].color);
                currentHue = hue;
                currentSaturation = saturation;
                currentLightness = lightness;
                
                drawShadeCanvas(currentHue);
                hexInput.value = colorStops[colorIndex].color;
                colorPreview.style.backgroundColor = colorStops[colorIndex].color;
                
                // Add this code to position the indicators
                // Position hue indicator
                const huePosition = (currentHue / 360) * hueCanvas.offsetWidth;
                hueIndicator.style.left = `${huePosition}px`;
                hueIndicator.style.backgroundColor = `hsl(${currentHue}, 100%, 50%)`;
                
                // Position shade indicator
                const saturationPosition = (currentSaturation / 100) * shadeCanvas.offsetWidth;
                const lightnessPosition = (1 - currentLightness / 100) * shadeCanvas.offsetHeight;
                shadeIndicator.style.left = `${saturationPosition}px`;
                shadeIndicator.style.top = `${lightnessPosition}px`;
                shadeIndicator.style.backgroundColor = `hsl(${currentHue}, ${currentSaturation}%, ${currentLightness}%)`;
                
                deleteColorBtn.disabled = colorStops.length <= 2;
                deleteColorBtn.style.opacity = deleteColorBtn.disabled ? '0.5' : '1';
            }
            e.stopPropagation();
        });
        
        spectrumContainer.appendChild(circle);

        
    });
}




    const preview = document.querySelector('.preview');
    const zoomIcon = document.querySelector('.zoom-icon');

    // Zoom iconuna tıklama
    zoomIcon.addEventListener('click', function(e) {
        e.stopPropagation(); // Event'in üst elementlere yayılmasını engelle
        preview.classList.add('fullscreen');
        document.body.style.overflow = 'hidden'; // Scroll'u engelle
    });

    // Dışarı tıklama ile küçültme
    document.addEventListener('click', function(e) {
        if (preview.classList.contains('fullscreen') && 
            !e.target.closest('.preview-text')) {
            preview.classList.remove('fullscreen');
            document.body.style.overflow = ''; // Scroll'u geri getir
        }
    });



// HSL->HEX dönüşümü
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Olay dinleyicileri
// Update the hueCanvas event handler to position the indicator
hueCanvas.addEventListener('mousedown', function(e) {
    const rect = hueCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    currentHue = (x / rect.width) * 360;
    drawShadeCanvas(currentHue);
    updateSelectedColor();
    
    // Update indicator position
    hueIndicator.style.left = `${x}px`;
    hueIndicator.style.backgroundColor = `hsl(${currentHue}, 100%, 50%)`;
    
    function moveHandler(e) {
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        currentHue = (x / rect.width) * 360;
        drawShadeCanvas(currentHue);
        updateSelectedColor();
        
        // Update indicator position
        hueIndicator.style.left = `${x}px`;
        hueIndicator.style.backgroundColor = `hsl(${currentHue}, 100%, 50%)`;
    }
    
    function upHandler() {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
    }
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
});

// Update the shadeCanvas event handler to position the indicator
shadeCanvas.addEventListener('mousedown', function(e) {
    const rect = shadeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    currentSaturation = (x / rect.width) * 100;
    currentLightness = 100 - (y / rect.height) * 100;
    updateSelectedColor();
    
    // Update indicator position
    shadeIndicator.style.left = `${x}px`;
    shadeIndicator.style.top = `${y}px`;
    shadeIndicator.style.backgroundColor = `hsl(${currentHue}, ${currentSaturation}%, ${currentLightness}%)`;
    
    function moveHandler(e) {
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        currentSaturation = (x / rect.width) * 100;
        currentLightness = 100 - (y / rect.height) * 100;
        updateSelectedColor();
        
        // Update indicator position
        shadeIndicator.style.left = `${x}px`;
        shadeIndicator.style.top = `${y}px`;
        shadeIndicator.style.backgroundColor = `hsl(${currentHue}, ${currentSaturation}%, ${currentLightness}%)`;
    }
    
    function upHandler() {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
    }
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
});

// Modify the color picker circle click handler to position indicators when opened
spectrumContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('spectrum-circle')) {
        const index = parseInt(e.target.dataset.index);
        const [hue, saturation, lightness] = hexToHSL(colorStops[index].color);
        
        // Position hue indicator
        const huePosition = (hue / 360) * hueCanvas.offsetWidth;
        hueIndicator.style.left = `${huePosition}px`;
        hueIndicator.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
        
        // Position shade indicator
        const saturationPosition = (saturation / 100) * shadeCanvas.offsetWidth;
        const lightnessPosition = (1 - lightness / 100) * shadeCanvas.offsetHeight;
        shadeIndicator.style.left = `${saturationPosition}px`;
        shadeIndicator.style.top = `${lightnessPosition}px`;
        shadeIndicator.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
});

// Update hexInput handler to update indicators
hexInput.addEventListener('change', function() {
    if (/^#[0-9A-F]{6}$/i.test(this.value)) {
        const [h, s, l] = hexToHSL(this.value);
        currentHue = h;
        currentSaturation = s;
        currentLightness = l;
        
        // Update indicators
        const huePosition = (h / 360) * hueCanvas.offsetWidth;
        hueIndicator.style.left = `${huePosition}px`;
        hueIndicator.style.backgroundColor = `hsl(${h}, 100%, 50%)`;
        
        const saturationPosition = (s / 100) * shadeCanvas.offsetWidth;
        const lightnessPosition = (1 - l / 100) * shadeCanvas.offsetHeight;
        shadeIndicator.style.left = `${saturationPosition}px`;
        shadeIndicator.style.top = `${lightnessPosition}px`;
        shadeIndicator.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
        
        drawShadeCanvas(h);
        updateSelectedColorFromHex(this.value);
    }
});
deleteColorBtn.addEventListener('click', function() {
    if (colorStops.length > 2 && currentSelectedCircle) {
        const index = parseInt(currentSelectedCircle.dataset.index);
        colorStops.splice(index, 1);
        colorPickerContainer.style.display = 'none';
        createSpectrumCircles();
        drawSpectrumCanvas();
        updatePreview();
    }
});

// Seçilen rengi güncelleme
function updateSelectedColor() {
    if (!currentSelectedCircle) return;
    
    const hexColor = hslToHex(currentHue, currentSaturation, currentLightness);
    const index = parseInt(currentSelectedCircle.dataset.index);
    
    // Renk göstergesini güncelle
    colorPreview.style.backgroundColor = hexColor;
    hexInput.value = hexColor;
    
    // colorStops array'ini güncelle
    colorStops[index].color = hexColor;
    
    // Circle'ı güncelle
    currentSelectedCircle.style.backgroundColor = hexColor;
    
    // Spectrumu güncelle
    drawSpectrumCanvas();
    
    updatePreviewCircles();
    // Önizlemeyi güncelle
    updatePreview();
}

function updateSelectedColorFromHex(hexColor) {
    if (!currentSelectedCircle) return;
    
    const index = parseInt(currentSelectedCircle.dataset.index);
    
    // Renk göstergesini güncelle
    colorPreview.style.backgroundColor = hexColor;
    
    // colorStops array'ini güncelle
    colorStops[index].color = hexColor;
    
    // Circle'ı güncelle
    currentSelectedCircle.style.backgroundColor = hexColor;
    
    // Spectrumu güncelle
    drawSpectrumCanvas();
    
    updatePreviewCircles();
    // Önizlemeyi güncelle
    updatePreview();
}

// Dışarı tıklanınca renk seçiciyi kapat
document.addEventListener('click', function(e) {
    if (!colorPickerContainer.contains(e.target) && 
        !e.target.classList.contains('spectrum-circle')) {
        colorPickerContainer.style.display = 'none';
    }
});

spectrumCanvas.addEventListener('click', function(e) {
    if (colorStops.length < 10) {
        const rect = spectrumCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const position = x / rect.width;
        
        const ctx = spectrumCanvas.getContext('2d');
        const pixelData = ctx.getImageData(x, rect.height / 2, 1, 1).data;
        const hexColor = `#${pixelData[0].toString(16).padStart(2, '0')}${pixelData[1].toString(16).padStart(2, '0')}${pixelData[2].toString(16).padStart(2, '0')}`;
        
        colorStops.push({ color: hexColor, position: position, circle: null });
        
        colorStops.sort((a, b) => a.position - b.position);



        createSpectrumCircles();
        drawSpectrumCanvas();
        updatePreview();
    }
});

// Yeni "Renk Ekle" butonu
const addColorBtnNew = document.createElement('button');
addColorBtnNew.textContent = 'renk ekle';
addColorBtnNew.style.padding = '8px 10px';
addColorBtnNew.style.margin = '10px 0';
addColorBtnNew.style.borderRadius = '100px';
addColorBtnNew.style.border = '1px solid #ccc';
addColorBtnNew.style.background = '#4e5155';
addColorBtnNew.style.cursor = 'pointer';
addColorBtnNew.style.fontWeight = '400';
addColorBtnNew.style.fontSize  = '16px';

addColorBtnNew.addEventListener('click', function() {
    if (colorStops.length < 10) {
        const defaultColor = '#00ffff';
        const insertPosition = 0.5; // Middle of the gradient
        colorStops.push({ color: defaultColor, position: insertPosition, circle: null });
        

        createSpectrumCircles();
        drawSpectrumCanvas();
        updatePreview();
    }
});

// Eski renk alanını ve butonları gizle
colorCanvas.style.display = 'none';
colorCirclesContainer.style.display = 'none';
addColorBtn.style.display = 'none';

// Yeni butonu ekle
spectrumContainer.parentNode.insertBefore(addColorBtnNew, spectrumContainer.nextSibling);

// Başlangıç işlemleri
drawHueCanvas();
drawShadeCanvas(currentHue);
drawSpectrumCanvas();
createSpectrumCircles();

// Mevcut updatePreview fonksiyonunu güncelle
const originalUpdatePreview = updatePreview;
updatePreview = function() {
    // Orijinal işlevi çağır
    originalUpdatePreview();
    


    // Spectrum canvas'ı güncelle
    drawSpectrumCanvas();
};

// Eski color circles yönetimini devre dışı bırak
placeColorCircles = function() {
    // Spektrum işlevselliği kullanıldığında bu fonksiyon bir şey yapmaz
    return;
};



function showColorDetailBox(circleEl, color) {
    // Kutucuğu oluştur veya seç
    let detailBox = document.getElementById('colorDetailBox');
    if (!detailBox) {
        detailBox = document.createElement('div');
        detailBox.id = 'colorDetailBox';
        detailBox.style.position = 'absolute';
        detailBox.style.zIndex = 1000;
        detailBox.style.padding = '8px 14px';
        detailBox.style.borderRadius = '12px';
        detailBox.style.background = '#fff';
        detailBox.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
        detailBox.style.fontSize = '14px';
        detailBox.style.pointerEvents = 'none';
        document.body.appendChild(detailBox);
    }
    detailBox.textContent = color;

    // Çemberin ve spektrumun konumunu al
    const circleRect = circleEl.getBoundingClientRect();
    const spectrumRect = document.querySelector('.spectrum-container').getBoundingClientRect();

    // Kutucuğun boyutunu tahmini olarak al
    const boxWidth = 90, boxHeight = 38;

    // Pozisyonu hesapla: çemberin ortasına hizala, spektrumun üstünde tut
    let left = circleRect.left + (circleRect.width / 2) - (boxWidth / 2);
    let top = circleRect.top - boxHeight - 8;

    // Sayfa ve spektrum kutusu içinde taşmayı engelle
    left = Math.max(spectrumRect.left + 4, Math.min(left, spectrumRect.right - boxWidth - 4));
    top = Math.max(spectrumRect.top + 4, top);

    // Pozisyonu uygula
    detailBox.style.left = `${left}px`;
    detailBox.style.top = `${top}px`;
    detailBox.style.width = `${boxWidth}px`;
    detailBox.style.height = `${boxHeight}px`;
    detailBox.style.display = 'block';
}

function hideColorDetailBox() {
    const detailBox = document.getElementById('colorDetailBox');
    if (detailBox) detailBox.style.display = 'none';
}

/* utils --------------------------------------------------------- */
function hexToRgb(hex) {               // #rrggbb → {r,g,b}
    const i = parseInt(hex.slice(1), 16);
    return { r:(i>>16)&255, g:(i>>8)&255, b:i&255 };
}
function drawGradientTextToCanvas({
    text,
    fontSize,
    fontFamily,
    fontWeight,
    lineHeight,
    textAlign,
    width,
    height,
    colorStops,
    gradientDirection,
    backgroundColor
}) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Arka plan
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Yazı stillerini ayarla
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'middle';

        // Tüm renk duraklarını kullanarak gradyan oluştur
        let grad;
        if (gradientDirection === 'to right') {
            grad = ctx.createLinearGradient(0, 0, width, 0);
        } else if (gradientDirection === 'to left') {
            grad = ctx.createLinearGradient(width, 0, 0, 0);
        } else if (gradientDirection === 'to bottom') {
            grad = ctx.createLinearGradient(0, 0, 0, height);
        } else if (gradientDirection === 'to top') {
            grad = ctx.createLinearGradient(0, height, 0, 0);
        } else {
            grad = ctx.createLinearGradient(0, 0, width, 0);
        }

        // Tüm renk duraklarını ekle (pozisyonlarıyla birlikte)
        colorStops
            .sort((a, b) => a.position - b.position)
            .forEach(stop => {
                grad.addColorStop(stop.position, stop.color);
            });

        ctx.fillStyle = grad;

        // Metni çiz
        let x;
        if (textAlign === 'center') x = width / 2;
        else if (textAlign === 'right') x = width - 20;
        else x = 20;
        
        ctx.fillText(text, x, height / 2);

        resolve(canvas);
    });
}

/* Proximity-blend texture --------------------------------------- */
function generateDistanceGradient(circles, W, H, scale = 0.3) {
    const w = Math.max(1, Math.round(W * scale));
    const h = Math.max(1, Math.round(H * scale));

    const cvs = document.createElement('canvas');
    cvs.width = w;  cvs.height = h;
    const ctx  = cvs.getContext('2d');
    const img  = ctx.createImageData(w, h);
    const dat  = img.data;

    // Önden RGB’leri sayısal tutalım
    const cInfo = circles.map(c => ({
        x: c.x,  y: c.y,  ...hexToRgb(c.color)
    }));

    for (let y = 0; y < h; y++) {
        const py = y / scale;          // gerçek (preview) koordinatı
        for (let x = 0; x < w; x++) {
            const px = x / scale;
            let Rt=0, Gt=0, Bt=0, Wt=0;

            for (const c of cInfo) {
                const dx = px - c.x, dy = py - c.y;
                const wInv = 1 / (dx*dx + dy*dy + 1);   // +1 → 0 bölünmeyi önler
                Wt += wInv;
                Rt += c.r * wInv;
                Gt += c.g * wInv;
                Bt += c.b * wInv;
            }
            const idx = (y * w + x) << 2;
            dat[idx]   = Rt / Wt;
            dat[idx+1] = Gt / Wt;
            dat[idx+2] = Bt / Wt;
            dat[idx+3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    return cvs.toDataURL();            // <img> / CSS background için
}


// Slider'lar için gerekli DOM elementlerini al
const fontSizeSlider = document.getElementById('fontSize');
const lineHeightSlider = document.getElementById('lineHeight');
const fontWeightSlider = document.getElementById('fontWeight');

// Slider değerlerini göstermek için gerekli DOM elementlerini al
const fontSizeValue = document.getElementById('fontSizeValue');
const lineHeightValue = document.getElementById('lineHeightValue');
const fontWeightValue = document.getElementById('fontWeightValue');

// Slider değerleri değiştiğinde önizlemeyi güncelle
fontSizeSlider.addEventListener('input', function() {
    previewText.style.fontSize = `${this.value}px`;
    fontSizeValue.textContent = `${this.value}px`;
});

lineHeightSlider.addEventListener('input', function() {
    previewText.style.lineHeight = this.value;
    lineHeightValue.textContent = this.value;
});

fontWeightSlider.addEventListener('input', function() {
    previewText.style.fontWeight = this.value;
    fontWeightValue.textContent = this.value;
});

// Başlangıç değerlerini ayarla
previewText.style.fontSize = `${fontSizeSlider.value}px`;
fontSizeValue.textContent = `${fontSizeSlider.value}px`;

previewText.style.lineHeight = lineHeightSlider.value;
lineHeightValue.textContent = lineHeightSlider.value;

previewText.style.fontWeight = fontWeightSlider.value;
fontWeightValue.textContent = fontWeightSlider.value;



// Panel ve Butonları Kaldır
const gradientDirectionButton = document.getElementById('gradientDirectionButton');
const fontFamilyButton = document.getElementById('fontFamilyButton');
const backgroundColorButton = document.getElementById('backgroundColorButton');
const textAlignButton = document.getElementById('textAlignButton');

const gradientDirectionPanel = document.getElementById('gradientDirectionPanel');
const fontFamilyPanel = document.getElementById('fontFamilyPanel');
const backgroundColorPanel = document.getElementById('backgroundColorPanel');
const textAlignPanel = document.getElementById('textAlignPanel');

// Event Listener'ları Kaldır
gradientDirectionButton.removeEventListener('click', function() {
    togglePanel(gradientDirectionPanel);
});

fontFamilyButton.removeEventListener('click', function() {
    togglePanel(fontFamilyPanel);
});

backgroundColorButton.removeEventListener('click', function() {
    togglePanel(backgroundColorPanel);
});

textAlignButton.removeEventListener('click', function() {
    togglePanel(textAlignPanel);
});

// togglePanel Fonksiyonunu Kaldır
function togglePanel(panel) {
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}




});