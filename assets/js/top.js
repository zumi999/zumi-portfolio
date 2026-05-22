/**
   * Compass Functionality
   */
  function initCompass() {
    const compassEl = document.getElementById("compass");
    if (!compassEl) return;

    const needle = document.getElementById("needle");
    const degTxt = document.getElementById("degTxt");
    const dirTxt = document.getElementById("dirTxt");
    const ticksG = document.getElementById("ticks");

    // Generate compass ticks
    for (let i = 0; i < 72; i++) {
      const rad = (i * 5 * Math.PI) / 180;
      const isLong = i % 6 === 0;
      const isMid = i % 3 === 0;
      const rOut = 130;
      const rIn = isLong ? 114 : isMid ? 121 : 126;
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", (rOut * Math.sin(rad)).toFixed(3));
      line.setAttribute("y1", (-rOut * Math.cos(rad)).toFixed(3));
      line.setAttribute("x2", (rIn * Math.sin(rad)).toFixed(3));
      line.setAttribute("y2", (-rIn * Math.cos(rad)).toFixed(3));
      line.setAttribute("stroke", isLong ? "#111" : "#ccc");
      line.setAttribute("stroke-width", isLong ? "1.2" : "0.7");
      ticksG.appendChild(line);
    }

    const dirs = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];

    let cur = 0,
      tgt = 0;

    function lerp(a, b, t) {
      let d = b - a;
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      return a + d * t;
    }

    (function loop() {
      cur = lerp(cur, tgt, 0.1);
      needle.setAttribute("transform", `rotate(${cur})`);
      requestAnimationFrame(loop);
    })();

    function onMove(clientX, clientY) {
      const rect = compassEl.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
      if (deg < 0) deg += 360;
      tgt = deg;
      degTxt.textContent = `${Math.round(deg).toString().padStart(3, "0")} °`;
      dirTxt.textContent = dirs[Math.round(deg / 22.5) % 16];
    }

    document.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    document.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: false },
    );
  }
  /**
   * Initialize Language Toggle for About Section
   */
  function initLanguageToggle() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const profileJp = document.getElementById('profile-jp');
    const profileEn = document.getElementById('profile-en');

    if (!langButtons.length || !profileJp || !profileEn) {
      return;
    }

    langButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const lang = button.getAttribute('data-lang');
        
        // Update active button state
        langButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        // Toggle profile text visibility
        if (lang === 'jp') {
          profileJp.classList.remove('hidden');
          profileEn.classList.add('hidden');
        } else if (lang === 'en') {
          profileJp.classList.add('hidden');
          profileEn.classList.remove('hidden');
        }
      });
    });
  }

  /**
 * Slideshow Functionality
 */
function initSlideshow() {
  const slideshowContainer = document.querySelector('.slideshow-container');
  if (!slideshowContainer) {
    console.warn('Slideshow container not found');
    return;
  }

  const slides = document.querySelectorAll('.slide');
  
  if (slides.length === 0) {
    console.warn('No slides found');
    return;
  }

  let currentSlide = 0;
  let autoSlideTimer;

  /**
   * Show specific slide
   */
  function showSlide(index) {
    // Wrap around if necessary
    if (index >= slides.length) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = slides.length - 1;
    } else {
      currentSlide = index;
    }

    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (i === currentSlide) {
        slide.classList.add('active');
      }
    });

    // Reset auto-slide timer
    resetAutoSlide();
  }

  /**
   * Next slide
   */
  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  /**
   * Auto slide with conditional interval based on current slide content
   */
  function startAutoSlide() {
    // Check if current slide contains img or transparent div
    const currentSlideElement = slides[currentSlide];
    const hasTransparent = currentSlideElement.querySelector('.transparent') !== null;
    const hasImg = currentSlideElement.querySelector('img') !== null;
    
    // Set interval: 800ms if transparent, 2500ms if img
    const interval = hasTransparent ? 800 : (hasImg ? 2500 : 2500);

    autoSlideTimer = setInterval(() => {
      nextSlide();
    }, interval);
  }

  /**
   * Reset auto slide timer
   */
  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  // Pause auto-slide on hover
  slideshowContainer.addEventListener('mouseenter', () => {
    clearInterval(autoSlideTimer);
  });

  slideshowContainer.addEventListener('mouseleave', () => {
    startAutoSlide();
  });

  // Start auto-slide on load
  startAutoSlide();
}

// Initialize slideshow when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSlideshow);
} else {
  initSlideshow();
}
// モンスターの吹き出し
// 1. 対象のPタグを取得する
  const speechElement = document.querySelector('.speech');

  // 2. 切り替えて表示したいテキストを順番に設定する
  const messages = [
    "&ensp;Hi Guys!&ensp;",      // 1番目（初期状態）
    "How are you?", // 2番目
    "Welcome to<br>My portfolio",     // 3番目
    "Take your time<br>to see my works"      // 4番目
  ];

  let currentIndex = 0;

  // 3. setIntervalで一定時間ごとにテキストを書き換える（3000 = 3秒）
  setInterval(() => {
    currentIndex++; // インデックスを1つ進める

    // 配列の最後まで到達したら、最初（0）に戻す
    if (currentIndex >= messages.length) {
      currentIndex = 0;
    }

    // Pタグの中身を書き換える
    speechElement.innerHTML = messages[currentIndex];
  }, 3000);

  //傾き
  const cardElement = document.querySelector("#no1");
const faceElement = cardElement.querySelector(".card-border-outer");

const { width, height } = cardElement.getBoundingClientRect();

// カードの傾きの最大値（度）
const maxTilt = 6;

// カードの傾きを更新
const updateCardTilt = (x, y) => {
  faceElement.style.rotate = `${-y} ${x} 0 ${maxTilt}deg`;
};

cardElement.addEventListener("pointermove", (event) => {
  // 要素の幅と高さと位置を取得
  const { width, height, left, top } = cardElement.getBoundingClientRect();

  // 要素の中心位置を算出
  const centerX = width / 2;
  const centerY = height / 2;

  // ポインターのカードの中心からの位置を算出
  const offsetX = event.clientX - left;
  const offsetY = event.clientY - top;

  // ポインターのカードの中心からの度合い
  const x = (offsetX - centerX) / centerX;
  const y = (offsetY - centerY) / centerY;
  updateCardTilt(x, y);
});

// ポインターがカードから離れたらもとに戻す
cardElement.addEventListener("pointerleave", () => {
  updateCardTilt(0, 0);
});