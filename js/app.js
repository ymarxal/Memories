/**
 * Logbook Nawala - Batch 18 Rumah BUMN Makassar
 * Flipbook Controller & Interactivity (Heyzine Style)
 * 
 * Fitur:
 * 1. Drag halaman dengan mouse (page curl effect) + corner hover hints
 * 2. Navigasi via tombol panah (<, >), keyboard (ArrowLeft, ArrowRight), dan drag
 * 3. Transisi flip 900ms dengan bayangan lipatan realistis
 * 4. Suara kertas saat halaman dibalik (Web Audio API)
 * 5. Sampul depan & belakang single page, isi buku double spread
 * 6. Fullscreen proporsional dengan auto-scaling
 * 7. Lagu otomatis memutar assets/lagu/Memories.mp3
 */

document.addEventListener("DOMContentLoaded", () => {
  // Setup CSS custom properties awal untuk Safari iOS & browser mobile
  function setPageUnitVars(w, h) {
    document.documentElement.style.setProperty('--page-w', w + 'px');
    document.documentElement.style.setProperty('--page-h', h + 'px');
    document.documentElement.style.setProperty('--cqw', (w / 100) + 'px');
    document.documentElement.style.setProperty('--cqh', (h / 100) + 'px');
  }
  const initW = window.innerWidth;
  const initIsMobile = initW < 768;
  const initPw = initIsMobile ? Math.min(Math.max(initW - 18, 280), 460) : 600;
  const initPh = Math.round(initPw / 1.4144);
  setPageUnitVars(initPw, initPh);

  // 1. Background Music Controller (assets/lagu/Memories.mp3)
  const bgMusic = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicBtn");
  let isMusicPlaying = false;

  function initBackgroundMusic() {
    if (!bgMusic) return;

    const musicSrc = BOOK_CONFIG.music?.source || "assets/lagu/Memories.mp3";
    if (!bgMusic.src || !bgMusic.src.includes("Memories.mp3")) {
      bgMusic.src = musicSrc;
    }
    bgMusic.volume = 0.65;
    bgMusic.preload = "auto";

    const updateBtnState = (playing) => {
      isMusicPlaying = playing;
      if (musicBtn) {
        if (playing) {
          musicBtn.innerHTML = "🔊";
          musicBtn.classList.add("playing");
          musicBtn.title = "Hentikan Suara Musik (Memories)";
        } else {
          musicBtn.innerHTML = "🔇";
          musicBtn.classList.remove("playing");
          musicBtn.title = "Putar Suara Musik (Memories)";
        }
      }
    };

    const startPlayback = () => {
      if (isMusicPlaying) return;
      bgMusic.volume = 0.65;
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            updateBtnState(true);
            const musicTip = document.getElementById("loadingMusicTip");
            if (musicTip) {
              musicTip.textContent = "🎵 Memutar: One Piece - Memories";
              musicTip.style.color = "#a3e635";
            }
            userEvents.forEach(e => document.removeEventListener(e, onUserGesture));
          })
          .catch(() => {
            // Jika autoplay audio tertahan kebijakan browser, menunggu gesture apapun di layar
          });
      }
    };

    // Langsung putar dari awal lagu (detik 0 - Full Intro & Song)
    startPlayback();

    const userEvents = ["click", "touchstart", "touchend", "pointerdown", "keydown"];
    const onUserGesture = () => {
      startPlayback();
    };
    userEvents.forEach(e => document.addEventListener(e, onUserGesture, { passive: true }));

    // Global helper agar elemen lain bisa memicu play jika audio sempat tertahan
    window.ensureAudioPlaying = () => {
      if (bgMusic && bgMusic.paused) {
        startPlayback();
      }
    };

    // Toggle Button di Toolbar
    if (musicBtn) {
      musicBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (bgMusic.paused) {
          bgMusic.play().then(() => {
            updateBtnState(true);
          }).catch(() => {});
        } else {
          bgMusic.pause();
          updateBtnState(false);
        }
      });
    }
  }

  initBackgroundMusic();

  // 2. Render Flipbook Pages
  let bookElement = document.getElementById("flipbook");

  function renderPages() {
    bookElement = document.getElementById("flipbook");
    if (!bookElement) {
      const container = document.getElementById("flipbookContainer");
      if (container) {
        bookElement = document.createElement("div");
        bookElement.className = "flipbook-book";
        bookElement.id = "flipbook";
        container.appendChild(bookElement);
      }
    }
    if (!bookElement) return;
    bookElement.innerHTML = "";

    // [Slide 1] Sampul Depan: sampul fix.png Original
    const coverPage = document.createElement("div");
    coverPage.className = "page hard-cover front-cover";
    coverPage.setAttribute("data-density", "hard");
    coverPage.id = "page-cover";
    coverPage.innerHTML = `
      <img src="assets/images/sampul%20fix.png" alt="Sampul Nawala Batch 18" class="cover-image">
    `;
    bookElement.appendChild(coverPage);

    // [Slide 2] Halaman 1: Presented by... (slide2.png)
    const page1 = document.createElement("div");
    page1.className = "page full-slide-page";
    page1.innerHTML = `
      <img src="assets/images/slide2.png" alt="Batch 18 Yearbook Presented by..." style="width: 100%; height: 100%; object-fit: contain; background: #000;">
    `;
    bookElement.appendChild(page1);

    // Daftar background dinamis bergilir: background 1 s.d. background 6
    const slideBackgrounds = [
      "assets/images/background 1.png",
      "assets/images/background 2.png",
      "assets/images/background 3.png",
      "assets/images/background 4.png",
      "assets/images/background 5.png",
      "assets/images/background 6.png"
    ];
    let bgIndex = 0; // Halaman 2 (Tentang Nawala) dimulai dari background 1.png

    // [Slide 3] Halaman 2: Makna & Filosofi Nawala (Background 1)
    const page2 = document.createElement("div");
    page2.className = "page page-manifesto";
    const bgUrlPage2 = encodeURI(slideBackgrounds[bgIndex % slideBackgrounds.length]);
    bgIndex++;
    page2.innerHTML = `
      <div class="page-bg-layer" style="background-image: url('${bgUrlPage2}');"></div>
      <div class="manifesto-container">
        <div class="manifesto-card">
          <!-- Nautical Brass Corners -->
          <span class="manifesto-brass brass-tl"></span>
          <span class="manifesto-brass brass-tr"></span>
          <span class="manifesto-brass brass-bl"></span>
          <span class="manifesto-brass brass-br"></span>

          <!-- Top Section: Logo & 4 Pilar Akronim -->
          <div class="manifesto-top-row">
            <div class="manifesto-logo-box">
              <img src="assets/images/LOGOKU.png" class="manifesto-logo-img" alt="Logo Resmi Nawala Batch 18">
            </div>

            <div class="manifesto-pillars-col">
              ${BOOK_CONFIG.about.pillars.map(pill => `
                <div class="manifesto-pillar-item">
                  <div class="manifesto-pillar-head">
                    <span class="pillar-bullet-dot"></span>
                    <span class="pillar-label">${pill.name}</span>
                  </div>
                  <p class="pillar-desc-text">${pill.desc}</p>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Divider Halus Emas-Navy -->
          <div class="manifesto-divider-wrap">
            <div class="manifesto-divider-line"></div>
          </div>

          <!-- Bottom Section: 2 Paragraf Narasi Editorial -->
          <div class="manifesto-narrative-section">
            <p class="manifesto-paragraph">
              <span class="hl-nawala">NAWALA</span> <span class="hl-batch">Batch 18</span> merupakan identitas angkatan ke-18 peserta magang di Rumah BUMN BRI Makassar. NAWALA melambangkan Navigasi, Wawasan, Aksi, dan Langkah Nyata sebagai gambaran perjalanan kami dalam belajar, berkembang, dan mengenal dunia profesional.
            </p>
            <p class="manifesto-paragraph">
              Seperti sebuah pelayaran, perjalanan <span class="hl-nawala">NAWALA</span> <span class="hl-batch">Batch 18</span> dipenuhi pengalaman, kebersamaan, dan kolaborasi. Setiap langkah menjadi kesempatan untuk tumbuh bersama, mengambil peran, dan memberikan dampak nyata bagi UMKM dan lingkungan sekitar.
            </p>
          </div>
        </div>
      </div>
    `;
    bookElement.appendChild(page2);

    // [Slide 4] Halaman 3: Management Rumah BUMN Makassar (2 Orang Pimpinan & Mentor)
    const mgmtList = BOOK_CONFIG.management || [];
    if (mgmtList.length > 0) {
      const mgmtPage = document.createElement("div");
      mgmtPage.className = "page page-management";
      const bgUrlMgmt = encodeURI(slideBackgrounds[bgIndex % slideBackgrounds.length]);
      bgIndex++;
      mgmtPage.innerHTML = `
        <div class="page-bg-layer" style="background-image: url('${bgUrlMgmt}');"></div>
        <div class="page-inner page-inner-mgmt">
          <div class="wooden-board-header">
            <h2 class="wooden-board-title">MANAGEMENT RUMAH BUMN MAKASSAR</h2>
          </div>

          <div class="mgmt-grid">
            ${mgmtList.map((m, idx) => `
              <div class="mgmt-card">
                <div class="mgmt-photo-frame">
                  <img src="${encodeURI(m.photo)}" alt="${m.name}" class="mgmt-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                  <div class="mgmt-empty-placeholder" style="display: none;">
                    <span class="mgmt-empty-icon">⚓</span>
                    <span class="mgmt-empty-text">Foto Management</span>
                  </div>
                </div>
                <div class="mgmt-info">
                  <h3 class="mgmt-name">${m.name}</h3>
                  <div class="mgmt-role-block">
                    <span class="mgmt-title">${m.title}</span>
                    ${m.period ? `<span class="mgmt-period">(${m.period})</span>` : ''}
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
      bookElement.appendChild(mgmtPage);
    }

    // [Slide 5 s.d. 13] 9 Halaman Divisi Pelayaran Nawala Batch 18 (1 Halaman per Divisi)
    const divisionList = BOOK_CONFIG.divisions || [];
    divisionList.forEach((div, dIdx) => {
      const divPage = document.createElement("div");
      divPage.className = "page page-division";
      const bgUrlDiv = encodeURI(slideBackgrounds[bgIndex % slideBackgrounds.length]);
      bgIndex++;

      // Cari data kru anggota divisi dari memberIds
      const divCrewMembers = (div.memberIds || []).map(id => 
        (BOOK_CONFIG.crewMembers || []).find(c => c.id === id)
      ).filter(Boolean);

      divPage.innerHTML = `
        <div class="page-bg-layer" style="background-image: url('${bgUrlDiv}');"></div>
        <div class="page-inner page-inner-division">
          <div class="division-top-header">
            <div class="division-title-badge">
              <span class="title-anchor">⚓</span>
              <h2 class="division-main-title">${div.name.toUpperCase()}</h2>
              <span class="title-anchor">⚓</span>
            </div>
          </div>

          <div class="division-body-card">
            <div class="division-photo-row">
              <div class="division-photo-frame">
                <img src="${encodeURI(div.photo)}" alt="Foto Divisi ${div.name}" class="division-team-img div-photo-${div.id}" style="${div.photoPosition ? `object-position: ${div.photoPosition};` : ''}" onerror="this.src='assets/images/LOGOKU.png'; this.classList.add('division-img-fallback');">
              </div>
              <div class="division-desc-box">
                <h4 class="desc-heading">Misi & Peran Strategis:</h4>
                <p class="desc-text">${div.description}</p>
              </div>
            </div>

            <!-- Barisan Avatar Profil Bulat Kru Divisi -->
            <div class="division-crew-section">
              <div class="division-crew-title-bar">
                <span class="achieve-star">✦</span>
                <span class="division-crew-heading">ANGGOTA DIVISI</span>
                <span class="achieve-star">✦</span>
              </div>
              <div class="division-crew-avatars-grid crew-count-${divCrewMembers.length}">
                ${divCrewMembers.map((m) => {
                  const isDivLeader = m.role && m.role.trim().toUpperCase() === 'LEADER';
                  return `
                  <button type="button" class="division-crew-avatar-btn" data-division-crew-id="${m.id}" title="${m.name} (${isDivLeader ? 'Leader Divisi' : 'Team'} - Klik untuk profil lengkap)">
                    <div class="avatar-round-slot">
                      <img src="assets/kru/kru${m.id}.png" alt="${m.name}" class="avatar-round-img" loading="lazy" onerror="this.src='assets/images/LOGOKU.png';">
                      <span class="division-avatar-click-badge">⚓ KLIK</span>
                    </div>
                    <span class="avatar-round-caption" title="${m.name}">${m.nickname || m.name}</span>
                    <span class="avatar-round-role">${isDivLeader ? 'LEADER' : 'TEAM'}</span>
                  </button>
                `;
                }).join("")}
              </div>
            </div>
          </div>
        </div>
      `;
      bookElement.appendChild(divPage);
    });

    // [Slide 14 s.d. 17] Halaman Spesial Penghargaan: Intern of the Month (1 Halaman 1 Bulan, Mei s.d. Agustus)
    const iotmData = BOOK_CONFIG.internOfTheMonth;
    if (iotmData && Array.isArray(iotmData.months)) {
      iotmData.months.forEach((mSec, mIdx) => {
        const iotmPage = document.createElement("div");
        iotmPage.className = `page page-iotm page-iotm-single-month`;
        const bgUrlIotm = encodeURI(slideBackgrounds[bgIndex % slideBackgrounds.length]);
        bgIndex++;

        iotmPage.innerHTML = `
          <div class="page-bg-layer" style="background-image: url('${bgUrlIotm}');"></div>
          <div class="page-inner page-inner-iotm">
            <div class="wooden-board-header iotm-board-header">
              <h2 class="wooden-board-title">${iotmData.title}</h2>
              <div class="iotm-month-ribbon-badge">
                <span class="month-ribbon-star">★</span>
                <span class="month-ribbon-text">${mSec.monthName}</span>
                <span class="month-ribbon-star">★</span>
              </div>
            </div>

            <div class="iotm-month-body-single">
              ${mSec.recipients.map((r, rIdx) => `
                <div class="iotm-card-single" data-iotm-month="${mIdx}" data-iotm-idx="${rIdx}" role="button" tabindex="0" title="Klik untuk baca pesan & kesan ${r.name}">
                  <div class="iotm-card-avatar-wrap">
                    <button type="button" class="iotm-avatar-btn" data-iotm-month="${mIdx}" data-iotm-idx="${rIdx}" title="Klik untuk baca pesan & kesan untuk Rumah BUMN Makassar">
                      <div class="iotm-avatar-slot">
                        <img src="${encodeURI(r.photo)}" alt="${r.name}" class="iotm-avatar-img" onerror="this.src='assets/images/LOGOKU.png';">
                        <span class="iotm-click-badge">⚓ KLIK</span>
                      </div>
                    </button>
                    <span class="iotm-click-tip">Pesan & Kesan</span>
                  </div>

                  <div class="iotm-card-content-wrap">
                    <div class="iotm-person-header">
                      <h3 class="iotm-person-name" title="${r.name}">${r.name}</h3>
                      <span class="iotm-person-division">${r.division}</span>
                    </div>

                    <div class="iotm-quote-card" data-iotm-month="${mIdx}" data-iotm-idx="${rIdx}" title="Klik untuk membaca selengkapnya">
                      <p class="iotm-quote-text">“${r.quote}”</p>
                      ${r.message ? `<p class="iotm-message-text">“${r.message}”</p>` : ''}
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
        bookElement.appendChild(iotmPage);
      });
    }

    // [Slide 18 s.d. 23] 6 Halaman Spesial Penghargaan: Nawala Batch 18 Awards (3 Spread Dua-Halaman)
    const awardsData = BOOK_CONFIG.awards;
    if (awardsData && Array.isArray(awardsData.pages)) {
      awardsData.pages.forEach((p, pIdx) => {
        const awardsPage = document.createElement("div");
        awardsPage.className = `page page-awards page-awards-p${pIdx + 1} page-layout-${p.layout || 'standard'}`;
        const bgUrlAwards = encodeURI(slideBackgrounds[bgIndex % slideBackgrounds.length]);
        bgIndex++;

        let awardsBodyHTML = '';

        if (p.layout === "division_dual") {
          // 1 Halaman 2 Plakat Vertikal Berdampingan (SMER & DIGMAR) - Utuh Tanpa Terpotong
          awardsBodyHTML = `
            <div class="awards-division-duo-grid">
              ${p.awards.map(award => `
                <div class="award-division-card-duo" data-award-id="${award.id}">
                  <div class="award-division-plaque-bar">
                    <span class="award-division-badge-icon">${award.icon || '🏆'}</span>
                    <span class="award-division-title-text">${award.category}</span>
                  </div>
                  <div class="award-division-portrait-frame">
                    <span class="brass-corner brass-tl"></span>
                    <span class="brass-corner brass-tr"></span>
                    <span class="brass-corner brass-bl"></span>
                    <span class="brass-corner brass-br"></span>
                    <img src="${encodeURI(award.photo)}" 
                         alt="${award.winner}" 
                         class="award-division-portrait-img" 
                         style="${award.photoPosition ? `object-position: ${award.photoPosition};` : ''}"
                         onerror="this.src='assets/images/LOGOKU.png';">
                  </div>
                  <div class="award-division-footer-duo">
                    <div class="award-division-name-row">
                      <span class="star-accent">★</span>
                      <span class="award-division-badge-name">${award.winner}</span>
                      <span class="star-accent">★</span>
                    </div>
                    <span class="award-division-badge-sub">${award.division}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          `;
        } else if (p.layout === "mood_booster_square") {
          // Mood Booster Angkatan: Frame Kotak Presisi (Square 1:1), Foto Memenuhi Frame Tanpa Bar Hitam
          const mbAward = p.awards[0];
          awardsBodyHTML = `
            <div class="awards-single-container">
              <div class="award-card-moodbooster-square" data-award-id="${mbAward.id}">
                <div class="award-plaque-header">
                  <span class="award-plaque-title">${mbAward.category}</span>
                </div>
                <div class="award-square-photo-frame">
                  <img src="${encodeURI(mbAward.photo || 'assets/images/saranigel.png')}" 
                       alt="${mbAward.winner}" 
                       class="award-square-img" 
                       style="${mbAward.photoPosition ? `object-position: ${mbAward.photoPosition};` : 'object-position: center 25%;'}"
                       onerror="this.src='assets/images/LOGOKU.png';">
                </div>
                <div class="award-card-footer">
                  <span class="award-winner-name">${mbAward.winner}</span>
                  <span class="award-winner-dept">${mbAward.division}</span>
                </div>
              </div>
            </div>
          `;
        } else if (p.layout === "hall_of_fame") {
          // Halaman Ke-6: Roll of Honor & Piala Kehormatan Keseluruhan
          awardsBodyHTML = `
            <div class="award-hall-of-fame-wrap">
              <div class="hof-trophy-badge">
                <span class="hof-trophy-icon">🏆</span>
                <span class="hof-sub-heading">★ BATCH 18 RUMAH BUMN MAKASSAR ★</span>
              </div>
              <div class="hof-winners-grid">
                <div class="hof-item"><span class="hof-tag">BEST DIVISI</span> <strong>SMER</strong></div>
                <div class="hof-item"><span class="hof-tag">MOST INNOVATIVE</span> <strong>DIGMAR</strong></div>
                <div class="hof-item"><span class="hof-tag">BEST LEADER</span> <strong>Dzun Nurain Fithra</strong></div>
                <div class="hof-item"><span class="hof-tag">BEST PERFORMANCE</span> <strong>Ahmad Arsal Saputra</strong></div>
                <div class="hof-item"><span class="hof-tag">ANGGOTA TERBAIK</span> <strong>Made Rizal Aprilian</strong></div>
                <div class="hof-item"><span class="hof-tag">SI PALING RAJIN</span> <strong>Fitrisky Nur Maharani</strong></div>
                <div class="hof-item"><span class="hof-tag">MOOD BOOSTER</span> <strong>Aqshara & Nigel</strong></div>
                <div class="hof-item"><span class="hof-tag">SI PALING MOTER</span> <strong>Muh. Irfan Setiawan</strong></div>
                <div class="hof-item"><span class="hof-tag">LAST MINUTE</span> <strong>Nicholas Irvin Wongso</strong></div>
              </div>
              <div class="hof-footer-parchment">
                <span class="hof-anchor-icon">⚓</span>
                <p class="hof-footer-quote">“Setiap langkah adalah karya, setiap kru adalah nahkoda. Terima kasih atas dedikasi dan pelayaran bersejarah di Rumah BUMN Makassar!”</p>
                <span class="hof-batch-sign">NAWALA BATCH 18 • 2024</span>
              </div>
            </div>
          `;
        } else {
          // 2 Kolom Berdampingan untuk Kategori Individu (Murni Plakat Kehormatan, Tanpa Icon Klik)
          awardsBodyHTML = `
            <div class="awards-duo-columns">
              ${p.awards.map(award => `
                <div class="award-card-individual" data-award-id="${award.id}">
                  <div class="award-plaque-header">
                    <span class="award-plaque-title">${award.category}</span>
                  </div>
                  <div class="award-portrait-frame individual-portrait-frame">
                    <img src="${encodeURI(award.photo)}" alt="${award.winner}" class="award-person-img" onerror="this.src='assets/images/LOGOKU.png';">
                  </div>
                  <div class="award-card-footer">
                    <span class="award-winner-name">${award.winner}</span>
                    <span class="award-winner-dept">${award.division}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          `;
        }

        awardsPage.innerHTML = `
          <div class="page-bg-layer" style="background-image: url('${bgUrlAwards}');"></div>
          <div class="page-inner page-inner-awards">
            <div class="awards-grand-crest">
              <div class="crest-side-ornament left-wing">
                <span class="crest-anchor-icon">⚓</span>
                <span class="crest-filigree-line"></span>
              </div>
              <div class="crest-center-body">
                <span class="crest-sub-title">INTERNSHIP RUMAH BUMN MAKASSAR</span>
                <h2 class="crest-main-title">BATCH 18 AWARDS</h2>
              </div>
              <div class="crest-side-ornament right-wing">
                <span class="crest-filigree-line"></span>
                <span class="crest-anchor-icon">⚓</span>
              </div>
            </div>

            ${awardsBodyHTML}
          </div>
        `;
        bookElement.appendChild(awardsPage);
      });
    }

    // Helper render poster buronan kru umum (Slide 5 s.d. selesai)
    function renderPosterHTML(m) {
      return `
        <div class="wanted-poster" data-crew-id="${m.id}" role="button" tabindex="0" title="Klik poster untuk baca pesan lengkap ${m.name}">
          <span class="wanted-header">INTERNSHIP</span>
          
          <div class="wanted-photo-slot">
            <img src="assets/kru/kru${m.id}.png" 
                 alt="${m.name}" 
                 class="kru-img"
                 loading="lazy"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="wanted-avatar-placeholder" style="display: none;">
              <span class="kru-id-badge">#${m.id}</span>
              <span class="kru-file-name">kru${m.id}.png</span>
            </div>
          </div>

          <div class="wanted-doa-banner">
            <span class="doa-star">★</span>
            <span class="doa-text">BATCH 18</span>
            <span class="doa-star">★</span>
          </div>

          <div class="wanted-name-box">
            <span class="wanted-name" title="${m.name}">${m.name}</span>
          </div>
          
          <div class="wanted-details-wrap">
            <span class="wanted-role-badge ${m.role.toLowerCase() === 'leader' ? 'role-leader' : 'role-team'}">
              ${m.role.toLowerCase() === 'leader' ? '★ LEADER' : 'TEAM'}
            </span>

            <span class="wanted-division" title="${m.division}">${m.division}</span>

            <div class="wanted-quote-box" title="Pesan untuk Batch 18" data-quote-id="${m.id}">
              <p class="wanted-quote-text">“${m.messageBatch || '-'}”</p>
            </div>
          </div>
        </div>
      `;
    }

    // [Slide 4] Halaman Pertama Kru: 2 Leader Batch (Layout Khusus & Rapih di Tengah)
    const allCrew = BOOK_CONFIG.crewMembers || [];
    const firstTwoCrew = allCrew.slice(0, 2);

    if (firstTwoCrew.length > 0) {
      const leaderPage = document.createElement("div");
      leaderPage.className = "page";
      const bgUrlLeader = encodeURI(slideBackgrounds[bgIndex % slideBackgrounds.length]);
      bgIndex++;

      function renderLeaderBatchPoster(m) {
        return `
          <div class="wanted-poster wanted-poster-leader" data-crew-id="${m.id}" role="button" tabindex="0" title="Klik poster untuk baca pesan lengkap ${m.name}">
            <span class="wanted-header">INTERNSHIP</span>
            
            <div class="wanted-photo-slot">
              <img src="assets/kru/kru${m.id}.png" 
                   alt="${m.name}" 
                   class="kru-img"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="wanted-avatar-placeholder" style="display: none;">
                <span class="kru-id-badge">#${m.id}</span>
                <span class="kru-file-name">kru${m.id}.png</span>
              </div>
            </div>

            <div class="wanted-doa-banner">
              <span class="doa-star">★</span>
              <span class="doa-text">BATCH 18</span>
              <span class="doa-star">★</span>
            </div>

            <div class="wanted-name-box">
              <span class="wanted-name" title="${m.name}">${m.name}</span>
            </div>
            
            <div class="wanted-details-wrap leader-details-wrap">
              <span class="wanted-role-badge role-leader-batch">
                ★ LEADER BATCH ★
              </span>

              <span class="wanted-division leader-division">${m.division}</span>

              <div class="wanted-quote-box leader-quote-box" title="Pesan untuk Batch 18" data-quote-id="${m.id}">
                <p class="wanted-quote-text leader-quote-text">“${m.messageBatch || '-'}”</p>
              </div>
            </div>
          </div>
        `;
      }

      leaderPage.innerHTML = `
        <div class="page-bg-layer" style="background-image: url('${bgUrlLeader}');"></div>
        <div class="page-inner page-inner-leaders">
          <div class="crew-grand-header leader-header">
            <span class="crew-header-star">★</span>
            <span class="crew-header-anchor">⚓</span>
            <h2 class="crew-header-text">LEADER BATCH 18 NAWALA</h2>
            <span class="crew-header-anchor">⚓</span>
            <span class="crew-header-star">★</span>
          </div>

          <div class="bounty-grid-2">
            ${firstTwoCrew.map(renderLeaderBatchPoster).join("")}
          </div>
        </div>
      `;
      bookElement.appendChild(leaderPage);
    }

    // [Slide 5 s.d. Selesai] Halaman Kru Berikutnya: Format 3-3 per Halaman (Background 3, 4, 1, 2...)
    const restCrew = allCrew.slice(2);
    const membersPerPage = 3;
    const totalRestPages = Math.ceil(restCrew.length / membersPerPage);

    for (let i = 0; i < totalRestPages; i++) {
      const pageCrew = restCrew.slice(i * membersPerPage, (i + 1) * membersPerPage);

      const crewPage = document.createElement("div");
      crewPage.className = "page";
      const bgUrlCrew = encodeURI(slideBackgrounds[bgIndex % slideBackgrounds.length]);
      bgIndex++;
      crewPage.innerHTML = `
        <div class="page-bg-layer" style="background-image: url('${bgUrlCrew}');"></div>
        <div class="page-inner">
          <div class="crew-grand-header">
            <span class="crew-header-star">★</span>
            <span class="crew-header-anchor">⚓</span>
            <h2 class="crew-header-text">INTERNSHIP BATCH 18</h2>
            <span class="crew-header-anchor">⚓</span>
            <span class="crew-header-star">★</span>
          </div>

          <div class="bounty-grid">
            ${pageCrew.map(renderPosterHTML).join("")}
          </div>
        </div>
      `;
      bookElement.appendChild(crewPage);
    }

    // [Halaman Dokumentasi Akhir 1 s.d. 5]
    const customPages = BOOK_CONFIG.userCustomPages || [];
    customPages.forEach((customItem, idx) => {
      const customPage = document.createElement("div");
      customPage.className = "page full-slide-page";
      const src = typeof customItem === "string" ? customItem : (customItem.src || customItem.photo);
      const title = typeof customItem === "object" && customItem.title ? customItem.title : `Dokumentasi Nawala ${idx + 1}`;
      customPage.innerHTML = `
        <img src="${encodeURI(src)}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.parentElement.style.display='none';">
      `;
      bookElement.appendChild(customPage);
    });

    // [Halaman Teater Mini-Movie Nawala: Format Reels / Story Vertikal 9:16]
    const miniMovieData = BOOK_CONFIG.miniMovie;
    if (miniMovieData) {
      const moviePage = document.createElement("div");
      moviePage.className = "page page-minimovie";
      const bgUrlMovie = encodeURI(slideBackgrounds[bgIndex % slideBackgrounds.length]);
      bgIndex++;
      moviePage.innerHTML = `
        <div class="page-bg-layer" style="background-image: url('${bgUrlMovie}');"></div>
        <div class="page-inner page-inner-movie">
          <div class="wooden-board-header movie-board-header">
            <h2 class="wooden-board-title">${miniMovieData.title}</h2>
          </div>

          <div class="reels-theater-layout centered-movie-layout">
            <div class="reels-stage-wrap">
              <!-- Frame Smartphone / Reels 9:16 Vertikal di Tengah Halaman -->
              <div class="reels-phone-mockup">
                <div class="phone-speaker-notch"></div>
                <div class="phone-screen" id="phoneScreenWrapper" style="cursor: pointer; position: relative;" title="Klik untuk memutar video langsung">
                  <img src="${encodeURI(miniMovieData.poster)}" 
                       alt="${miniMovieData.title}" 
                       id="phonePosterImg"
                       class="reels-video"
                       style="width: 100%; height: 100%; object-fit: cover; display: block; position: absolute; inset: 0;"
                       onerror="this.src='assets/images/LOGOKU.png';">
                  <video id="inlinePhoneVideo"
                         class="reels-video"
                         playsinline
                         webkit-playsinline
                         controls
                         preload="metadata"
                         poster="${encodeURI(miniMovieData.poster)}"
                         style="width: 100%; height: 100%; object-fit: cover; background: #000; display: none; position: absolute; inset: 0; z-index: 2;">
                    <source src="${encodeURI(miniMovieData.source)}" type="video/mp4">
                  </video>
                  <iframe id="inlinePhoneIframe"
                          class="reels-video"
                          src="about:blank"
                          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                          allowfullscreen
                          style="width: 100%; height: 100%; border: 0; display: none; position: absolute; inset: 0; z-index: 2; background: #000;"
                          title="${miniMovieData.title}">
                  </iframe>
                  <div class="phone-play-overlay" id="phonePlayOverlay" title="Klik untuk memutar video langsung">
                    <div class="phone-play-btn-circle">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="#ffffff">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <span class="phone-play-label">PUTAR VIDEO</span>
                  </div>
                </div>
                <span class="phone-home-indicator"></span>
              </div>

              <!-- Tombol Layar Penuh di Samping Kanan HP -->
              <div class="reels-side-actions">
                <button type="button" class="reels-side-fs-btn" id="movieFullscreenBtn" title="Tonton Layar Penuh" aria-label="Tonton Layar Penuh">
                  <span class="fs-icon">⛶</span>
                  <span class="fs-label">Layar Penuh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      bookElement.appendChild(moviePage);
    }

    // Cover Belakang (Hardcover Belakang Resmi)
    const backCover = document.createElement("div");
    backCover.className = "page hard-cover back-cover";
    backCover.setAttribute("data-density", "hard");
    const bgUrlBack = encodeURI(slideBackgrounds[bgIndex % slideBackgrounds.length]);
    backCover.innerHTML = `
      <div class="page-bg-layer" style="background-image: radial-gradient(circle at center, rgba(30, 18, 12, 0.94) 0%, rgba(15, 8, 5, 0.98) 100%), url('${bgUrlBack}');"></div>
      <div class="page-inner">
        <div class="back-cover-content">
          <div class="back-cover-logo-wrap">
            <img src="assets/images/logo2.png" 
                 alt="Logo Nawala Batch 18" 
                 class="back-cover-logo-img"
                 onerror="this.src='assets/images/LOGOKU.png';">
          </div>
          <div class="back-cover-text-group">
            <h2 class="back-cover-main-title">INTERN BATCH 18 NAWALA</h2>
            <p class="back-cover-institution-title">RUMAH BUMN BRI MAKASSAR</p>
          </div>
        </div>
      </div>
    `;
    bookElement.appendChild(backCover);
  }

  // Inisialisasi Kontrol Interaktif Mini-Movie Player & Cinema Dimming
  function initMiniMovieControls() {
    const phoneScreenWrapper = document.getElementById("phoneScreenWrapper");
    const phonePlayOverlay = document.getElementById("phonePlayOverlay");
    const movieFullscreenBtn = document.getElementById("movieFullscreenBtn");
    const reelsModal = document.getElementById("reelsFullscreenModal");
    const reelsModalBackdrop = document.getElementById("reelsModalBackdrop");
    const reelsModalCloseBtn = document.getElementById("reelsModalCloseBtn");
    const reelsModalVideo = document.getElementById("reelsModalVideoPlayer");
    const reelsDirectLinkBtn = document.getElementById("reelsDirectLinkBtn");

    const ARCHIVE_EMBED_URL = (BOOK_CONFIG.miniMovie && BOOK_CONFIG.miniMovie.embedUrl) || "https://archive.org/embed/img-0243_202609";
    const ARCHIVE_DIRECT_URL = (BOOK_CONFIG.miniMovie && BOOK_CONFIG.miniMovie.source) || "https://archive.org/download/img-0243_202609/IMG_0243.MOV";

    if (reelsDirectLinkBtn) {
      reelsDirectLinkBtn.href = ARCHIVE_DIRECT_URL;
    }

    function playInlineVideo() {
      const inlineVideo = document.getElementById("inlinePhoneVideo");
      const inlineIframe = document.getElementById("inlinePhoneIframe");
      const phoneScreenWrapper = document.getElementById("phoneScreenWrapper");
      const phonePosterImg = document.getElementById("phonePosterImg");

      if (phoneScreenWrapper) {
        phoneScreenWrapper.classList.add("is-playing");
      }

      if (inlineVideo) {
        if (phonePosterImg) phonePosterImg.style.display = "none";
        inlineVideo.style.display = "block";
        const playPromise = inlineVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Autoplay inline video dicegah browser, coba iframe:", err);
            if (inlineIframe) {
              inlineVideo.style.display = "none";
              inlineIframe.style.display = "block";
              inlineIframe.src = ARCHIVE_EMBED_URL + "?autoplay=1";
            }
          });
        }
      } else if (inlineIframe) {
        if (phonePosterImg) phonePosterImg.style.display = "none";
        inlineIframe.style.display = "block";
        inlineIframe.src = ARCHIVE_EMBED_URL + "?autoplay=1";
      }

      // Musik utama (bgMusic) TETAP BERPUTAR sesuai permintaan user
    }

    function openVerticalFullscreen() {
      if (!reelsModal) return;

      const reelsModalVideoTag = document.getElementById("reelsModalVideoTag");
      const reelsModalIframe = document.getElementById("reelsModalVideoPlayer");

      if (reelsModalVideoTag) {
        reelsModalVideoTag.style.display = "block";
        if (reelsModalIframe) reelsModalIframe.style.display = "none";
        try {
          reelsModalVideoTag.currentTime = 0;
          reelsModalVideoTag.play().catch(() => {});
        } catch (e) {}
      } else if (reelsModalIframe) {
        const currentSrc = reelsModalIframe.src || "";
        const needsLoad = !currentSrc || currentSrc === "about:blank" || currentSrc === location.href;
        if (needsLoad) {
          reelsModalIframe.src = ARCHIVE_EMBED_URL;
        }
      }

      reelsModal.classList.add("active");
      reelsModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }

    function closeVerticalFullscreen() {
      if (!reelsModal) return;

      const reelsModalVideoTag = document.getElementById("reelsModalVideoTag");
      const reelsModalIframe = document.getElementById("reelsModalVideoPlayer");

      if (reelsModalVideoTag) {
        try { reelsModalVideoTag.pause(); } catch (err) {}
      }
      if (reelsModalIframe) {
        try { reelsModalIframe.src = "about:blank"; } catch (err) {}
      }

      reelsModal.classList.remove("active");
      reelsModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }

    // Helper: pasang onclick DAN touchend untuk elemen agar berfungsi di HP
    function bindTap(el, fn) {
      if (!el) return;
      let _tx = 0, _ty = 0;
      el.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches.length === 1) {
          _tx = e.touches[0].clientX;
          _ty = e.touches[0].clientY;
        }
      }, { passive: true });
      el.addEventListener("touchend", (e) => {
        if (e.changedTouches && e.changedTouches.length === 1) {
          const dx = Math.abs(e.changedTouches[0].clientX - _tx);
          const dy = Math.abs(e.changedTouches[0].clientY - _ty);
          if (dx < 15 && dy < 15) {
            e.preventDefault();
            e.stopPropagation();
            fn(e);
          }
        }
      }, { passive: false });
      el.onclick = (e) => { e.stopPropagation(); fn(e); };
    }

    // Pasang event listener: klik di HP memutar video LANGSUNG di layar mockup
    bindTap(phonePlayOverlay, (e) => {
      playInlineVideo();
    });
    bindTap(phoneScreenWrapper, (e) => {
      if (!phoneScreenWrapper.classList.contains("is-playing")) {
        playInlineVideo();
      }
    });

    // Tombol Layar Penuh di samping kanan HP tetap membuka modal
    bindTap(movieFullscreenBtn, () => openVerticalFullscreen());

    // Pasang event listener untuk tombol tutup video
    bindTap(reelsModalCloseBtn, () => closeVerticalFullscreen());
    bindTap(reelsModalBackdrop, () => closeVerticalFullscreen());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && reelsModal && reelsModal.classList.contains("active")) {
        closeVerticalFullscreen();
      }
    });
  }

  // Efek Suara Lembaran Kertas Asli (Authentic Paper Flip FX)
  const flipAudioSamples = [
    "assets/audio/page-flip-md.mp3",
    "assets/audio/page-flip-sm.mp3",
    "assets/audio/page-flip-lg.mp3"
  ];
  function playPageFlipSound() {
    try {
      const chosen = flipAudioSamples[Math.floor(Math.random() * flipAudioSamples.length)];
      const audio = new Audio(chosen);
      audio.volume = 0.75;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  // 3. St.PageFlip Responsive Engine (Heyzine Architecture)
  const ORIGINAL_PAGE_WIDTH = 2000;
  const ORIGINAL_PAGE_HEIGHT = 1414;
  const targetRatio = ORIGINAL_PAGE_WIDTH / ORIGINAL_PAGE_HEIGHT; // 1.414427... (A4 Landscape)

  function getDeviceLayoutMode() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isPortrait = h > w;

    if (w < 768) {
      return isPortrait ? "mobile-portrait" : "mobile-landscape";
    } else if (w < 1024) {
      return isPortrait ? "tablet-portrait" : "tablet-landscape";
    } else {
      return "desktop";
    }
  }

  function calculateDimensions() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mode = getDeviceLayoutMode();
    const isSingleSlide = mode === "mobile-portrait" || mode === "tablet-portrait";

    let pageWidth, pageHeight;

    if (mode === "mobile-portrait") {
      // HP Portrait: 1 slide di tengah layar, maksimalkan lebar layar
      const availW = Math.max(w - 18, 280);
      const availH = Math.max(h - 110, 240);

      let pw = Math.min(availW, 460);
      let ph = Math.round(pw / targetRatio);

      if (ph > availH) {
        ph = availH;
        pw = Math.round(ph * targetRatio);
      }

      pageWidth = Math.max(pw, 260);
      pageHeight = Math.max(ph, 210);

    } else if (mode === "mobile-landscape") {
      // HP Landscape: Tinggi terbatas (misal 360-420px), maksimalkan tinggi buku
      const availW = Math.max(w - 30, 480);
      const availH = Math.max(h - 55, 230);

      const maxSingleW = Math.floor((availW * 0.94) / 2);
      let ph = Math.min(availH, 360);
      let pw = Math.round(ph * targetRatio);

      if (pw > maxSingleW) {
        pw = maxSingleW;
        ph = Math.round(pw / targetRatio);
      }

      pageWidth = Math.max(pw, 260);
      pageHeight = Math.max(ph, 200);

    } else if (mode === "tablet-portrait") {
      // Tablet Portrait (iPad 768px - 1024px): 1 Halaman besar, tajam, megah
      const availW = Math.max(w - 36, 500);
      const availH = Math.max(h - 120, 500);

      let pw = Math.min(availW * 0.94, 760);
      let ph = Math.round(pw / targetRatio);

      if (ph > availH) {
        ph = availH;
        pw = Math.round(ph * targetRatio);
      }

      pageWidth = Math.round(pw);
      pageHeight = Math.round(ph);

    } else if (mode === "tablet-landscape") {
      // Tablet Landscape (iPad 768px - 1024px landscape): 2 Halaman spread pas di layar tablet
      const availW = Math.max(w - 40, 700);
      const availH = Math.max(h - 90, 360);
      const maxTotalW = Math.min(availW * 0.94, 1000);
      const maxSingleW = Math.floor(maxTotalW / 2);
      const maxH = Math.min(availH * 0.88, 440);

      if (Math.round(maxSingleW / targetRatio) <= maxH) {
        pageWidth = maxSingleW;
        pageHeight = Math.round(pageWidth / targetRatio);
      } else {
        pageHeight = maxH;
        pageWidth = Math.round(pageHeight * targetRatio);
      }

    } else {
      // DESKTOP: 100% IDENTIK DENGAN RUMUS ASLI (TIDAK DIUBAH SAMA SEKALI)
      const maxBookWidth = Math.min(w * 0.88, 1200);
      const maxPageW = Math.floor(maxBookWidth / 2);
      const availableHeight = h - 95;
      const maxPageH = Math.min(availableHeight, 460);
      
      if (Math.round(maxPageW / targetRatio) <= maxPageH) {
        pageWidth = maxPageW;
        pageHeight = Math.round(pageWidth / targetRatio);
      } else {
        pageHeight = Math.round(maxPageH);
        pageWidth = Math.round(pageHeight * targetRatio);
      }
    }

    // Sinkronisasi variabel dimensi ke CSS root agar dihitung presisi oleh Safari iOS
    setPageUnitVars(pageWidth, pageHeight);

    return { pageWidth, pageHeight, isSingleSlide, mode };
  }

  let pageFlip = null;
  let currentDimensions = calculateDimensions();

  // Helper fungsi pembalik halaman dengan animasi 3D lembaran kertas (Page Flip)
  function flipForward() {
    if (!pageFlip || window.isVideoPlaying) return;
    const current = pageFlip.getCurrentPageIndex();
    const total = pageFlip.getPageCount();
    if (current < total - 1) {
      if (typeof pageFlip.getState === "function" && pageFlip.getState() === "flipping") return;
      pageFlip.flipNext("top");
    }
  }

  function flipBackward() {
    if (!pageFlip || window.isVideoPlaying) return;
    const current = pageFlip.getCurrentPageIndex();
    if (current > 0) {
      if (typeof pageFlip.getState === "function" && pageFlip.getState() === "flipping") return;
      pageFlip.flipPrev("top");
    }
  }

  // UI Controls & Synchronization (Heyzine Pattern)
  const pageIndicator = document.getElementById("pageIndicator");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const sidePrev = document.getElementById("sidePrev");
  const sideNext = document.getElementById("sideNext");

  function updateUIState() {
    if (!pageFlip) return;
    const current = pageFlip.getCurrentPageIndex();
    const total = pageFlip.getPageCount();
    const mode = getDeviceLayoutMode();
    const isSingleSlide = mode === "mobile-portrait" || mode === "tablet-portrait";
    const bookEl = document.getElementById("flipbook");

    if (!isSingleSlide && bookEl) {
      if (current === 0) {
        // Sampul Depan di tengah layar desktop/tablet landscape
        bookEl.style.transform = `translateX(-${Math.round(currentDimensions.pageWidth / 2)}px)`;
        bookEl.classList.add("is-cover-mode", "is-front-cover");
        bookEl.classList.remove("is-back-cover");
        if (sidePrev) {
          sidePrev.style.display = "none";
          sidePrev.style.pointerEvents = "none";
        }
        if (sideNext) {
          if (mode === "desktop") {
            sideNext.style.display = "flex";
            sideNext.style.opacity = "1";
            sideNext.style.pointerEvents = "auto";
          } else {
            sideNext.style.display = "none";
            sideNext.style.pointerEvents = "none";
          }
        }
      } else if (current >= total - 1) {
        // Sampul Belakang di tengah layar
        bookEl.style.transform = `translateX(${Math.round(currentDimensions.pageWidth / 2)}px)`;
        bookEl.classList.add("is-cover-mode", "is-back-cover");
        bookEl.classList.remove("is-front-cover");
        if (sideNext) {
          sideNext.style.display = "none";
          sideNext.style.pointerEvents = "none";
        }
        if (sidePrev) {
          if (mode === "desktop") {
            sidePrev.style.display = "flex";
            sidePrev.style.opacity = "1";
            sidePrev.style.pointerEvents = "auto";
          } else {
            sidePrev.style.display = "none";
            sidePrev.style.pointerEvents = "none";
          }
        }
      } else {
        // Mode Terbuka (Kiri - Kanan)
        bookEl.style.transform = "translateX(0)";
        bookEl.classList.remove("is-cover-mode", "is-front-cover", "is-back-cover");
        if (sidePrev) {
          if (mode === "desktop") {
            sidePrev.style.display = "flex";
            sidePrev.style.opacity = "1";
            sidePrev.style.pointerEvents = "auto";
          } else {
            sidePrev.style.display = "none";
            sidePrev.style.pointerEvents = "none";
          }
        }
        if (sideNext) {
          if (mode === "desktop") {
            sideNext.style.display = "flex";
            sideNext.style.opacity = "1";
            sideNext.style.pointerEvents = "auto";
          } else {
            sideNext.style.display = "none";
            sideNext.style.pointerEvents = "none";
          }
        }
      }
      bookEl.style.transition = "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
    } else if (isSingleSlide && bookEl) {
      // Mode 1 Halaman di HP / Tablet Portrait
      bookEl.style.transform = "none";
      bookEl.classList.remove("is-cover-mode", "is-front-cover", "is-back-cover");
      if (sidePrev) {
        sidePrev.style.display = "none";
        sidePrev.style.pointerEvents = "none";
      }
      if (sideNext) {
        sideNext.style.display = "none";
        sideNext.style.pointerEvents = "none";
      }
    }

    // Label Halaman (Heyzine Style)
    if (pageIndicator) {
      if (current === 0) {
        pageIndicator.textContent = "Sampul Depan";
      } else if (current >= total - 1) {
        pageIndicator.textContent = "Sampul Belakang";
      } else {
        pageIndicator.textContent = `Halaman ${current} / ${total - 2}`;
      }
    }

    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= total - 1;
  }

  // Builder Utama PageFlip: Bersih, Cepat, Bebas Memory Leak
  function buildAndMountPageFlip(startPage = 0) {
    currentDimensions = calculateDimensions();
    const { pageWidth, pageHeight } = currentDimensions;

    if (pageFlip) {
      try {
        pageFlip.destroy();
      } catch (e) {}
      pageFlip = null;
    }

    const container = document.getElementById("flipbookContainer");
    if (!container) return;

    container.innerHTML = '<div class="flipbook-book" id="flipbook"></div>';
    renderPages();
    initMiniMovieControls();

    const bookEl = document.getElementById("flipbook");
    pageFlip = new St.PageFlip(bookEl, {
      width: pageWidth,
      height: pageHeight,
      size: "fixed",
      minWidth: 240,
      maxWidth: 950,
      minHeight: 180,
      maxHeight: 750,
      maxShadowOpacity: 0.65,
      showCover: true,
      mobileScrollSupport: true,
      usePortrait: true,
      autoSize: true,
      flippingTime: 800,
      useMouseEvents: false,
      showPageCorners: false,
      disableFlipByClick: false,
      swipeDistance: 30,
      clickEventForward: true,
      drawShadow: true
    });

    window.pageFlip = pageFlip;
    pageFlip.loadFromHTML(document.querySelectorAll(".page"));

    pageFlip.on("flip", () => {
      const cur = pageFlip.getCurrentPageIndex();
      const miniMovieIndex = pageFlip.getPageCount() - 2;
      if (cur !== miniMovieIndex) {
        const inlineVideo = document.getElementById("inlinePhoneVideo");
        const inlineIframe = document.getElementById("inlinePhoneIframe");
        const phoneScreenWrapper = document.getElementById("phoneScreenWrapper");
        const phonePosterImg = document.getElementById("phonePosterImg");
        const reelsModalVideoTag = document.getElementById("reelsModalVideoTag");
        if (inlineVideo && !inlineVideo.paused) {
          try { inlineVideo.pause(); } catch(e) {}
        }
        if (reelsModalVideoTag && !reelsModalVideoTag.paused) {
          try { reelsModalVideoTag.pause(); } catch(e) {}
        }
        if (inlineIframe && inlineIframe.src && inlineIframe.src !== "about:blank") {
          try { inlineIframe.src = "about:blank"; } catch(e) {}
        }
        if (phoneScreenWrapper) phoneScreenWrapper.classList.remove("is-playing");
        if (phonePosterImg) phonePosterImg.style.display = "block";
        if (inlineVideo) inlineVideo.style.display = "none";
        if (inlineIframe) inlineIframe.style.display = "none";
      }
      playPageFlipSound();
      updateUIState();
    });
    pageFlip.on("changeOrientation", updateUIState);

    if (startPage > 0 && startPage < pageFlip.getPageCount()) {
      pageFlip.turnToPage(startPage);
    }

    setTimeout(updateUIState, 100);
  }

  buildAndMountPageFlip(0);

  // 4. Navigasi Toolbar, Keyboard, & Panah
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      if (typeof window.ensureAudioPlaying === "function") window.ensureAudioPlaying();
      flipBackward();
    };
  }
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      if (typeof window.ensureAudioPlaying === "function") window.ensureAudioPlaying();
      flipForward();
    };
  }
  if (sidePrev) {
    sidePrev.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      flipBackward();
    };
  }
  if (sideNext) {
    sideNext.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      flipForward();
    };
  }

  // Keyboard Shortcuts: HANYA ArrowLeft dan ArrowRight
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      flipBackward();
    } else if (e.key === "ArrowRight") {
      flipForward();
    }
  });

  // 5. Heyzine Interactive Zoom Mode (Fit vs 1.5x Zoom)
  const zoomBtn = document.getElementById("zoomBtn");
  let isZoomed = false;

  function toggleZoom(forceState) {
    const container = document.getElementById("flipbookContainer");
    if (!container) return;

    isZoomed = typeof forceState === "boolean" ? forceState : !isZoomed;
    container.classList.toggle("is-zoomed", isZoomed);

    if (zoomBtn) {
      zoomBtn.classList.toggle("active", isZoomed);
      zoomBtn.textContent = isZoomed ? "🔍-" : "🔍+";
      zoomBtn.title = isZoomed ? "Kembali ke Ukuran Normal" : "Perbesar Halaman (Zoom)";
    }

    if (isZoomed) {
      setTimeout(() => {
        container.scrollTo({
          left: (container.scrollWidth - container.clientWidth) / 2,
          top: (container.scrollHeight - container.clientHeight) / 2,
          behavior: "smooth"
        });
      }, 50);
    }
  }

  if (zoomBtn) {
    zoomBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleZoom();
    });
  }

  // Fullscreen Layar Penuh (Heyzine Style)
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    document.addEventListener("fullscreenchange", () => {
      const isFs = !!document.fullscreenElement;
      fullscreenBtn.textContent = isFs ? "✕" : "⛶";
      fullscreenBtn.title = isFs ? "Keluar Layar Penuh" : "Layar Penuh";
      fullscreenBtn.classList.toggle("active", isFs);
    });
  }

  // 6. Touch Swipe Gesture & Edge Tap Navigasi (Mobile & Tablet)
  let touchStartX = 0;
  let touchStartY = 0;
  let lastTapTime = 0;
  const flipContainer = document.getElementById("flipbookContainer");

  if (flipContainer) {
    flipContainer.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    flipContainer.addEventListener("touchend", (e) => {
      if (e.changedTouches && e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);

        // Double Tap Zoom (Heyzine Mobile UX)
        const now = Date.now();
        if (now - lastTapTime < 300 && Math.abs(deltaX) < 15 && deltaY < 15) {
          toggleZoom();
          e.preventDefault();
        }
        lastTapTime = now;

        // Swipe Gesture
        if (Math.abs(deltaX) > 38 && Math.abs(deltaX) > deltaY * 1.2) {
          if (window.isVideoPlaying) return;
          if (deltaX < 0) {
            flipForward();
          } else {
            flipBackward();
          }
        }
      }
    }, { passive: true });

    // Edge Tap Navigasi (Tap 20% kiri/kanan untuk ganti halaman)
    flipContainer.addEventListener("click", (e) => {
      if (isZoomed || window.isVideoPlaying) return;
      if (e.target.closest("button, .wanted-poster, .division-crew-avatar-btn, .iotm-card-single, .iotm-avatar-btn, video, a, #page-cover")) {
        return;
      }
      const rect = flipContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;

      if (clickX > width * 0.80) {
        flipForward();
      } else if (clickX < width * 0.20) {
        flipBackward();
      }
    });
  }

  // 7. Auto-adapt St.PageFlip saat orientasi layar berubah atau di-resize
  let resizeDebounceTimer;
  let lastWindowWidth = window.innerWidth;
  let lastWindowHeight = window.innerHeight;

  window.addEventListener("resize", () => {
    clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      const dw = Math.abs(window.innerWidth - lastWindowWidth);
      const dh = Math.abs(window.innerHeight - lastWindowHeight);

      if (dw > 20 || dh > 20) {
        lastWindowWidth = window.innerWidth;
        lastWindowHeight = window.innerHeight;
        const currentPage = pageFlip ? pageFlip.getCurrentPageIndex() : 0;
        buildAndMountPageFlip(currentPage);
      }
    }, 250);
  });

  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      lastWindowWidth = window.innerWidth;
      lastWindowHeight = window.innerHeight;
      const currentPage = pageFlip ? pageFlip.getCurrentPageIndex() : 0;
      buildAndMountPageFlip(currentPage);
    }, 200);
  });

  // 7. Modal Pesan & Kesan Interaktif
  const quoteModal = document.getElementById("quoteModal");
  const quoteModalClose = document.getElementById("quoteModalClose");
  const modalCrewAvatar = document.getElementById("modalCrewAvatar");
  const modalCrewRole = document.getElementById("modalCrewRole");
  const modalCrewName = document.getElementById("modalCrewName");
  const modalCrewDivision = document.getElementById("modalCrewDivision");
  const modalCrewQuote = document.getElementById("modalCrewQuote");

  /**
   * Format teks modal menjadi HTML yang rapi:
   * - Pola bernomor (1. 2. 3.) => <ol> list
   * - Kutipan dengan sumber "teks — Sumber" => kutipan + sumber di bawah
   * - Newline dijaga
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function formatModalText(raw, wrapQuote) {
    if (!raw || String(raw).trim() === '' || raw === '-') return '<span>-</span>';
    let text = String(raw).trim();

    if (wrapQuote) {
      // Cek apakah ada atribusi " - Sumber" atau " — Sumber" di akhir baris
      const srcMatch = text.match(/\s[-\u2014]\s*([^\n\u201d"]{2,80})\s*$/);
      if (srcMatch) {
        const body = text.slice(0, srcMatch.index).trim().replace(/^[\u201c"]+|[\u201d"]+$/g, '');
        const src = srcMatch[1].trim();
        return `<span class="modal-quote-text">\u201c${escapeHtml(body)}\u201d</span><br><span class="modal-quote-source">\u2014 ${escapeHtml(src)}</span>`;
      }
      const clean = text.replace(/^[\u201c"]+|[\u201d"]+$/g, '');
      return `<span class="modal-quote-text">\u201c${escapeHtml(clean)}\u201d</span>`;
    }

    // Deteksi pola bernomor di awal baris
    if (/(?:^|\n)\s*\d+\.\s+/.test(text)) {
      const lines = text.split(/\n+/);
      let html = '';
      let inList = false;
      for (const line of lines) {
        const m = line.match(/^\s*(\d+)\.\s+(.+)$/);
        if (m) {
          if (!inList) { html += '<ol class="modal-numbered-list">'; inList = true; }
          html += `<li>${escapeHtml(m[2])}</li>`;
        } else if (line.trim()) {
          if (inList) { html += '</ol>'; inList = false; }
          html += `<p class="modal-para">${escapeHtml(line.trim())}</p>`;
        }
      }
      if (inList) html += '</ol>';
      return html;
    }

    // Teks biasa: jaga newline
    return escapeHtml(text).replace(/\n/g, '<br>');
  }

  function setModalHtml(el, html) {
    if (el) el.innerHTML = html;
  }

  function openQuoteModal(crewId) {
    if (!quoteModal) return;
    const crew = (BOOK_CONFIG.crewMembers || []).find(c => c.id === parseInt(crewId, 10));
    if (!crew) return;

    // Reset view: Tampilkan mode reguler "Pesan untuk Batch 18"
    const sectionTitle = document.getElementById("modalSectionTitle");
    const regularBody = document.getElementById("modalRegularBody");
    const divisionDetails = document.getElementById("modalDivisionDetails");
    if (sectionTitle) sectionTitle.textContent = "⚓ PESAN UNTUK BATCH 18 ⚓";
    if (regularBody) regularBody.style.display = "block";
    if (divisionDetails) divisionDetails.style.display = "none";

    const isLeaderBatch = (crew.role && crew.role.toUpperCase() === "LEADER BATCH") || crew.id === 1 || crew.id === 2;
    const avatarFrame = document.getElementById("modalCrewAvatarFrame");
    if (avatarFrame) {
      avatarFrame.classList.toggle("is-leader-batch", isLeaderBatch);
    }

    if (modalCrewAvatar) {
      modalCrewAvatar.classList.toggle("avatar-leader-batch", isLeaderBatch);
      modalCrewAvatar.setAttribute("data-crew-id", crew.id);
      modalCrewAvatar.src = `assets/kru/kru${crew.id}.png`;
      modalCrewAvatar.onerror = function() {
        this.src = "assets/images/LOGOKU.png";
      };
    }
    if (modalCrewRole) {
      modalCrewRole.textContent = crew.role.toUpperCase() === "LEADER BATCH" ? "★ LEADER BATCH ★" : (crew.role.toUpperCase() === "LEADER" ? "★ LEADER" : "TEAM");
    }
    if (modalCrewName) modalCrewName.textContent = crew.name;
    if (modalCrewDivision) modalCrewDivision.textContent = crew.division;
    
    // Flyer Bounty: MURNI MENAMPILKAN PESAN UNTUK BATCH 18
    setModalHtml(modalCrewQuote, formatModalText(crew.messageBatch, false));

    quoteModal.classList.add("active");
    quoteModal.setAttribute("aria-hidden", "false");
  }

  // Buka Modal Khusus Anggota Divisi: Quote Pribadi, Kesan Selama Magang, dan Pencapaian
  function openDivisionCrewModal(crewId) {
    if (!quoteModal) return;
    const crew = (BOOK_CONFIG.crewMembers || []).find(c => c.id === parseInt(crewId, 10));
    if (!crew) return;

    // Cari achievement divisi yang cocok sebagai fallback jika di data kru belum tercantum
    let fallbackAchievement = "Berkontribusi aktif dalam menjalankan program kerja dan inovasi divisi.";
    const div = (BOOK_CONFIG.divisions || []).find(d => (d.memberIds || []).includes(crew.id));
    if (div && div.achievements) {
      const matchedAch = div.achievements.find(a => a.name.toLowerCase().includes(crew.name.toLowerCase()) || crew.name.toLowerCase().includes(a.name.toLowerCase()));
      if (matchedAch) {
        fallbackAchievement = matchedAch.highlight;
      }
    }

    const sectionTitle = document.getElementById("modalSectionTitle");
    const regularBody = document.getElementById("modalRegularBody");
    const divisionDetails = document.getElementById("modalDivisionDetails");
    const modalDetailQuote = document.getElementById("modalDetailQuote");
    const modalDetailMemorable = document.getElementById("modalDetailMemorable");
    const modalDetailAchievement = document.getElementById("modalDetailAchievement");

    if (sectionTitle) sectionTitle.textContent = "⚓ DATA PRIBADI & PENCAPAIAN ⚓";
    if (regularBody) regularBody.style.display = "none";
    if (divisionDetails) divisionDetails.style.display = "flex";

    // Leader Batch di divisi diperlakukan murni sebagai team/anggota biasa
    const isDivisionLeader = crew.role && crew.role.trim().toUpperCase() === "LEADER";
    const avatarFrame = document.getElementById("modalCrewAvatarFrame");
    if (avatarFrame) {
      avatarFrame.classList.remove("is-leader-batch");
    }

    if (modalCrewAvatar) {
      modalCrewAvatar.classList.remove("avatar-leader-batch");
      modalCrewAvatar.setAttribute("data-crew-id", crew.id);
      modalCrewAvatar.src = `assets/kru/kru${crew.id}.png`;
      modalCrewAvatar.onerror = function() {
        this.src = "assets/images/LOGOKU.png";
      };
    }
    if (modalCrewRole) {
      modalCrewRole.textContent = isDivisionLeader ? "★ LEADER" : "TEAM";
    }
    if (modalCrewName) modalCrewName.textContent = crew.name;
    if (modalCrewDivision) modalCrewDivision.textContent = crew.division;

    const modalLabelQuote = document.getElementById("modalLabelQuote");
    if (modalLabelQuote) modalLabelQuote.style.display = "block";
    const achieveBlockDiv = modalDetailAchievement ? modalDetailAchievement.closest(".modal-detail-block") : null;
    if (achieveBlockDiv) achieveBlockDiv.style.display = "block";
    if (modalDetailMemorable) {
      const labelMemorable = modalDetailMemorable.previousElementSibling;
      if (labelMemorable) labelMemorable.textContent = "🌊 Kesan Selama Magang:";
    }

    // 1. Quote Pribadi
    setModalHtml(modalDetailQuote, formatModalText(crew.quote, true));

    // 2. Kesan Selama Magang (Hal Paling Berkesan)
    setModalHtml(modalDetailMemorable, formatModalText(crew.memorable, false));

    // 3. Pencapaian Selama Magang
    setModalHtml(modalDetailAchievement, formatModalText(crew.achievement || fallbackAchievement, false));

    quoteModal.classList.add("active");
    quoteModal.setAttribute("aria-hidden", "false");
  }

  // Buka Modal Pesan & Kesan Intern of the Month saat foto peraih diklik
  function openIotmModal(monthIdx, rIdx) {
    if (!quoteModal) return;
    const iotmData = BOOK_CONFIG.internOfTheMonth;
    if (!iotmData || !iotmData.months || !iotmData.months[monthIdx]) return;
    const m = iotmData.months[monthIdx];
    const r = m.recipients && m.recipients[rIdx];
    if (!r) return;

    const sectionTitle = document.getElementById("modalSectionTitle");
    const regularBody = document.getElementById("modalRegularBody");
    const divisionDetails = document.getElementById("modalDivisionDetails");
    const modalDetailQuote = document.getElementById("modalDetailQuote");
    const modalDetailMemorable = document.getElementById("modalDetailMemorable");
    const modalDetailAchievement = document.getElementById("modalDetailAchievement");
    const modalLabelQuote = document.getElementById("modalLabelQuote");

    if (sectionTitle) sectionTitle.textContent = "⚓ PESAN & KESAN UNTUK RUMAH BUMN ⚓";
    if (regularBody) regularBody.style.display = "none";
    if (divisionDetails) divisionDetails.style.display = "flex";

    // Hapus tulisan Quote Pribadi di IOTM - langsung tampilkan quotenya
    if (modalLabelQuote) modalLabelQuote.style.display = "none";

    const avatarFrame = document.getElementById("modalCrewAvatarFrame");
    if (avatarFrame) avatarFrame.classList.remove("is-leader-batch");

    if (modalCrewAvatar) {
      modalCrewAvatar.classList.remove("avatar-leader-batch");
      modalCrewAvatar.src = r.photo;
      modalCrewAvatar.onerror = function() {
        this.src = "assets/images/LOGOKU.png";
      };
    }
    if (modalCrewRole) modalCrewRole.textContent = `★ INTERN OF THE MONTH (${m.monthName}) ★`;
    if (modalCrewName) modalCrewName.textContent = r.name;
    if (modalCrewDivision) modalCrewDivision.textContent = r.division;
    if (modalDetailQuote) setModalHtml(modalDetailQuote, formatModalText(r.quote, true));
    if (modalDetailMemorable) {
      const labelMemorable = modalDetailMemorable.previousElementSibling;
      if (labelMemorable) labelMemorable.textContent = "🌊 Pesan & Kesan:";
      setModalHtml(modalDetailMemorable, formatModalText(r.message, false));
    }
    // Sembunyikan blok capaian ketiga di mode IOTM
    const achieveBlock = modalDetailAchievement ? modalDetailAchievement.closest(".modal-detail-block") : null;
    if (achieveBlock) {
      achieveBlock.style.display = "none";
    }

    quoteModal.classList.add("active");
    quoteModal.setAttribute("aria-hidden", "false");
  }

  function closeQuoteModal() {
    if (!quoteModal) return;
    quoteModal.classList.remove("active");
    quoteModal.setAttribute("aria-hidden", "true");
  }

  if (quoteModalClose) {
    quoteModalClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeQuoteModal();
    });
  }

  if (quoteModal) {
    quoteModal.addEventListener("click", (e) => {
      if (e.target === quoteModal) {
        closeQuoteModal();
      }
    });
  }

  // Delegasi event klik DAN touch (mobile) untuk flyer bounty, avatar divisi, dan IOTM
  let _bookTouchX = 0, _bookTouchY = 0;

  function handleBookInteraction(target) {
    // 1. Flyer Bounty / Poster Buronan
    const wantedPoster = target.closest(".wanted-poster");
    if (wantedPoster) {
      const crewId = wantedPoster.getAttribute("data-crew-id") ||
                     wantedPoster.querySelector("[data-quote-id]")?.getAttribute("data-quote-id");
      if (crewId) openQuoteModal(crewId);
      return true;
    }
    // 2. Avatar bulat di halaman divisi
    const divAvatarBtn = target.closest(".division-crew-avatar-btn");
    if (divAvatarBtn) {
      const crewId = divAvatarBtn.getAttribute("data-division-crew-id");
      if (crewId) openDivisionCrewModal(crewId);
      return true;
    }
    // 3. Intern of the Month card
    const iotmCard = target.closest(".iotm-card-single") || target.closest(".iotm-avatar-btn");
    if (iotmCard) {
      const monthIdx = parseInt(iotmCard.getAttribute("data-iotm-month"), 10);
      const rIdx = parseInt(iotmCard.getAttribute("data-iotm-idx"), 10);
      if (!isNaN(monthIdx) && !isNaN(rIdx)) openIotmModal(monthIdx, rIdx);
      return true;
    }
    return false;
  }

  bookElement.addEventListener("click", (e) => {
    if (handleBookInteraction(e.target)) e.stopPropagation();
  });

  // Touch handler di document-level CAPTURE phase — memastikan terpicu
  // sebelum PageFlip library bisa menelan event (fix flyer bounty di HP)
  let _docTouchX = 0, _docTouchY = 0;

  document.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length === 1) {
      _docTouchX = e.touches[0].clientX;
      _docTouchY = e.touches[0].clientY;
    }
  }, { passive: true, capture: true });

  document.addEventListener("touchend", (e) => {
    if (e.changedTouches && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const dx = Math.abs(touch.clientX - _docTouchX);
      const dy = Math.abs(touch.clientY - _docTouchY);
      // Tap pendek, bukan swipe
      if (dx < 12 && dy < 12) {
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (el && handleBookInteraction(el)) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    }
  }, { passive: false, capture: true });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && quoteModal && quoteModal.classList.contains("active")) {
      closeQuoteModal();
    }
  });

  setTimeout(updateUIState, 150);

  // ===== REAL ASSET PRELOADER (Halaman Depan, Cover & Kru) =====
  // Preload semua gambar utama di background secara paralel selama loading 15-20 detik
  const CRITICAL_IMAGES = [
    'assets/images/sampul fix.png',
    'assets/images/background 1.png',
    'assets/images/background 2.png',
    'assets/images/background 3.png',
    'assets/images/background 4.png',
    'assets/images/background 5.png',
    'assets/images/background 6.png',
    'assets/images/management1.png',
    'assets/images/management2.png',
    'assets/images/fo.jpg',
    'assets/images/copro.jpg',
    'assets/images/legal.png',
    'assets/images/sms.jpg',
    'assets/images/smer.jpg',
    'assets/images/ecm.jpg',
    'assets/images/digmar.jpg',
    'assets/images/pd.JPG',
    'assets/images/logo2.png',
    'assets/images/LOGOKU.png',
    'assets/images/minimovie_poster.jpg',
    'assets/images/cd.png',
    'assets/images/halaman terakhir 1.png',
    'assets/images/halaman terakhir 2.png',
    'assets/images/halaman terakhir 3.png',
    'assets/images/halaman terakhir 4.png',
    'assets/images/halaman terakhir 5.png'
  ];

  // Tambahkan foto seluruh kru 1 s/d 35 ke antrean preloader
  for (let i = 1; i <= 35; i++) {
    CRITICAL_IMAGES.push(`assets/kru/kru${i}.png`);
  }

  // Preload aset di background
  CRITICAL_IMAGES.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  // ===== 18-DETIK LOADING SCREEN & FULL MEMORIES =====
  const loadingScreen = document.getElementById('appLoadingScreen');
  const loadingBar = document.getElementById('loadingBarFill');
  const loadingHint = document.getElementById('loadingHint');
  const loadingMusicTip = document.getElementById('loadingMusicTip');

  const TOTAL_DURATION_MS = 18000; // 18 Detik (rentang 15-20 detik) agar semua aset & elemen benar-benar siap
  const TICK_INTERVAL = 100; // Update progress bar tiap 100ms
  const TOTAL_TICKS = TOTAL_DURATION_MS / TICK_INTERVAL; // 180 langkah
  let elapsedTicks = 0;
  let isDismissed = false;

  function dismissLoader() {
    if (isDismissed || !loadingScreen) return;
    isDismissed = true;
    if (loadingBar) loadingBar.style.width = '100%';
    if (loadingHint) loadingHint.textContent = 'Semua halaman siap! Selamat bernostalgia ✨';

    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        if (loadingScreen.parentNode) {
          loadingScreen.parentNode.removeChild(loadingScreen);
        }
      }, 700);
    }, 450);
  }

  // Sentuh / interaksi apapun pada layar loading langsung menyalakan musik tanpa delay
  if (loadingScreen) {
    const triggerAudioOnTouch = () => {
      if (typeof window.ensureAudioPlaying === 'function') {
        window.ensureAudioPlaying();
      }
    };
    loadingScreen.addEventListener('pointerdown', triggerAudioOnTouch, { passive: true });
    loadingScreen.addEventListener('touchstart', triggerAudioOnTouch, { passive: true });
    loadingScreen.addEventListener('click', triggerAudioOnTouch, { passive: true });
  }

  // Animasi progress bar 0% s.d. 100% selama 18 detik (15-20 detik)
  const barInterval = setInterval(() => {
    elapsedTicks++;
    const progress = Math.min(Math.round((elapsedTicks / TOTAL_TICKS) * 100), 100);

    if (loadingBar) {
      loadingBar.style.width = progress + '%';
    }

    if (loadingHint) {
      if (progress < 15) {
        loadingHint.textContent = 'Menyiapkan kapal pelayaran Nawala... 🗺️';
      } else if (progress < 35) {
        loadingHint.textContent = 'Memuat arsip 35 kru & dokumentasi divisi... ⚓';
      } else if (progress < 55) {
        loadingHint.textContent = 'Mengalunkan alunan lagu One Piece - Memories... 🎵';
      } else if (progress < 75) {
        loadingHint.textContent = 'Menata lembaran buku 3D & flip animation... 📖';
      } else if (progress < 92) {
        loadingHint.textContent = 'Menyiapkan video perjalanan & elemen interaktif... ✨';
      } else {
        loadingHint.textContent = 'Semua elemen siap! Selamat menikmati Memories Nawala ⛵✨';
      }
    }

    if (elapsedTicks >= TOTAL_TICKS) {
      clearInterval(barInterval);
      dismissLoader();
    }
  }, TICK_INTERVAL);
});


