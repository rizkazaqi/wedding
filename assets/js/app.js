let guestData = null;
const floatingMenu = document.getElementById("floatingMenu");
// let isLangMenuOpen = false;
let currentLang = localStorage.getItem("lang") || "en";

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (LANG[lang][key]) {
      // el.innerText = LANG[lang][key];
      el.innerHTML = LANG[lang][key].replace(/\n/g, "<br>");
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
  const key = el.dataset.i18nPlaceholder;
  if (LANG[lang][key]) {
    el.placeholder = LANG[lang][key];
  }
});
}

const langBtn = document.getElementById("langToggleBtn");
// if (currentPage === 0) {
//   langBtn?.classList.add("hidden");
// } 
// else {
//   langBtn?.classList.remove("hidden");
// }
const langMenu = document.getElementById("langMenu");
const langIcon = document.getElementById("langIcon");

// langBtn?.addEventListener("mouseenter", () => {
//   langIcon.src = "assets/images/language_1.png";
// });

// langBtn?.addEventListener("mouseleave", () => {
//   if (!isLangMenuOpen) {
//     langIcon.src = "assets/images/language.png";
//   }
// });

// langBtn?.addEventListener("click", (e) => {
//   e.stopPropagation();
//   // console.log("clicked"); // 👈 check this
//   const isOpen = langMenu.classList.toggle("show");
//   if (langIcon) {
//     langIcon.src = isOpen
//       ? "assets/images/language_1.png"
//       : "assets/images/language.png";
//   }
// });

// function updateLangIcon(isHover = false) {
//   if (isHover || isLangMenuOpen) {
//     langIcon.src = "assets/images/language_1.png";
//   } else {
//     langIcon.src = "assets/images/language.png";
//   }
// }

function updateLangIcon() {
  langIcon.src = isLangHover
    ? "assets/images/language_1.png" // black
    : "assets/images/language.png";  // gold
}

// langBtn?.addEventListener("click", (e) => {
//   e.stopPropagation();

//   isLangMenuOpen = langMenu.classList.toggle("show");

//   langIcon.src = isLangMenuOpen
//     ? "assets/images/language_1.png"
//     : "assets/images/language.png";
// });

// langBtn?.addEventListener("mouseenter", () => {
//   updateLangIcon(true);
// });

// langBtn?.addEventListener("mouseleave", () => {
//   updateLangIcon(false);
// });

let isLangHover = false;

langBtn?.addEventListener("mouseenter", () => {
  isLangHover = true;
  updateLangIcon();
});

langBtn?.addEventListener("mouseleave", () => {
  isLangHover = false;
  updateLangIcon();
});

document.querySelectorAll(".lang-item").forEach(item => {
  item.addEventListener("click", () => {
    const lang = item.dataset.lang;

    applyLanguage(lang);

    langMenu.classList.remove("show");
    isLangMenuOpen = false; // ✅ IMPORTANT

    updateLangIcon(false);
  });
});

// close when clicking outside
// document.addEventListener("click", (e) => {
//   if (!langMenu.contains(e.target) && e.target !== langBtn) {
//     langMenu.classList.remove("show");

//     if (langIcon) {
//       langIcon.src = "assets/images/language.png";
//     }
//   }
// });

// document.addEventListener("click", (e) => {
//   if (!langMenu.contains(e.target) && !langBtn.contains(e.target)) {
//     langMenu.classList.remove("show");
//     isLangMenuOpen = false;

//     updateLangIcon(false);
//   }
// });

document.addEventListener("click", (e) => {
  if (!langMenu.contains(e.target) && !langBtn.contains(e.target)) {
    langMenu.classList.remove("show");
    isLangMenuOpen = false;

    isLangHover = false; // 🔥 force reset
    updateLangIcon();
  }
});

// langBtn?.addEventListener("click", (e) => {
//   e.stopPropagation();

//   isLangMenuOpen = langMenu.classList.toggle("show");

//   updateLangIcon(true); // force active look
// });

langBtn?.addEventListener("click", (e) => {
  e.stopPropagation();

  isLangMenuOpen = langMenu.classList.toggle("show");
});

langBtn?.addEventListener("touchstart", () => {
  updateLangIcon(true);
});

function updateLoading(percent) {
  const bar = document.getElementById("loadingProgress");
  const text = document.getElementById("loadingPercent");

  if (bar) bar.style.width = percent + "%";
  if (text) text.innerText = percent + "%";
}

function fakeLoadingSequence() {
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 15;

    if (progress >= 90) {
      progress = 90;
      clearInterval(interval);
    }

    updateLoading(Math.floor(progress));
  }, 200);
}

function finishLoading() {
  updateLoading(100);

  setTimeout(() => {
    const loading = document.getElementById("loading");

    if (loading) {
      loading.style.opacity = "0";

      setTimeout(() => {
        loading.style.display = "none";
      }, 400);
    }
  }, 300);
}

/* =========================
   INIT
========================= */
// async function init() {
//   try {
//     const data = await fetchGuest(GUEST_ID);

//     if (data.error) {
//       showError("Invitation not found");
//       return;
//     }

//     guestData = data;

//     renderGuest(data);

async function init() {
  try {

    // ✅ CASE 1: NO ID → DEFAULT GUEST
    if (!GUEST_ID) {

      const defaultGuest = {
        guest_id: null,
        invited_label: "Guest / Tamu / 参列者",
        name: "Guest",
        max_pax: 1,
        events: "akad,reception"
      };

      guestData = defaultGuest;
      renderGuest(defaultGuest);

      await loadWishes(); 

      finishLoading(); // skip API flow
      return;
    }

    // ✅ CASE 2: HAS ID → FETCH FROM API
    const data = await fetchGuest(GUEST_ID);

    if (data.error) {
      showError("Invitation not found");
      return;
    }

    guestData = data;
    renderGuest(data);

    /* =========================
       EVENT CONTROL (GSA)
    ========================= */
    const akad = document.getElementById("akadCard");
    const resepsi = document.getElementById("resepsiCard");

    const events = (data.events || "").toLowerCase().split(",");

    if (!events.includes("akad") && akad) akad.style.display = "none";
    if (!events.includes("reception") && resepsi) resepsi.style.display = "none";

    /* =========================
       GOOGLE CALENDAR
    ========================= */
    const calendarBtn = document.getElementById("calendarBtn");

    if (calendarBtn) {
      let start, end, title;

      if (events.length === 1 && events.includes("akad")) {
        title = "Akad Nikah - Rizka & Zaqi";
        start = "20260530T000000Z";
        end = "20260530T020000Z";

      } else if (events.length === 1 && events.includes("reception")) {
        title = "Wedding Reception - Rizka & Zaqi";
        start = "20260530T033000Z";
        end = "20260530T060000Z";

      } else {
        title = "Wedding Day - Rizka & Zaqi";
        start = "20260530T000000Z";
        end = "20260530T060000Z";
      }

      calendarBtn.href =
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent(title) +
        "&dates=" + start + "/" + end +
        "&details=" + encodeURIComponent("Wedding Rizka & Zaqi") +
        "&location=" + encodeURIComponent("Aminta Hall Jakarta");
    }

    /* =========================
       RSVP CHECK
    ========================= */

    const paxBlock = document.getElementById("paxBlock");
if (paxBlock) paxBlock.style.display = "block";

    updateLoading(50); // UI ready
    await checkRSVP(data);
    updateLoading(70); // RSVP done

    /* =========================
       LOAD WISHES
    ========================= */
    // loadWishes();
    await loadWishes(); // ✅ ONLY ONCE
    updateLoading(90); // wishes done

    // document.getElementById("loading").style.display = "none";

    finishLoading();

  } catch (err) {
    console.error(err);
    showError("Error loading invitation");
  }
}
// fakeLoadingSequence();
updateLoading(5);
init();

/* =========================
   NAV MENU
========================= */

const menuToggle = document.getElementById("menuToggle");
const navDrawer = document.getElementById("navDrawer");
const closeMenu = document.getElementById("closeMenu");

menuToggle?.addEventListener("click", () => {
  navDrawer.classList.add("open");
});

closeMenu?.addEventListener("click", () => {
  navDrawer.classList.remove("open");
});

/* =========================
   NAV CLICK (JUMP PAGE)
========================= */

// document.querySelectorAll(".nav-item").forEach(item => {

//   item.addEventListener("click", () => {

//     const page = parseInt(item.dataset.page);

//     // ❗ IMPORTANT: use SAME system as swipe
//     currentPage = page;
//     updatePage();

//     navDrawer.classList.remove("open");

//   });

// });

// document.querySelectorAll(".menu-item").forEach(item => {

//   item.addEventListener("click", () => {

//     const page = parseInt(item.dataset.page);

//     currentPage = page;
//     updatePage();

//   });

// });

// const floatingMenu = document.getElementById("floatingMenu");

// document.querySelectorAll(".menu-item").forEach(item => {

//   item.addEventListener("click", () => {

//     const page = parseInt(item.dataset.page);

//     currentPage = page;
//     updatePage();

//     floatingMenu.classList.remove("show"); // 🔥 CLOSE AFTER CLICK

//   });

// });

document.querySelectorAll(".menu-item").forEach(item => {

  item.addEventListener("click", () => {

    const page = parseInt(item.dataset.page);

    currentPage = page;
    updatePage();

    floatingMenu?.classList.remove("show"); // close menu

  });

});

// const floatingMenu = document.getElementById("floatingMenu");

// if (floatingMenu) {
//   if (currentPage === 0) {
//     floatingMenu.classList.add("hidden");
//   } else {
//     floatingMenu.classList.remove("hidden");
//   }
// }

// const floatingMenu = document.getElementById("floatingMenu");

// if (floatingMenu) {
//   if (currentPage === 0) {
//     floatingMenu.classList.add("hidden");
//   } else {
//     floatingMenu.classList.remove("hidden");
//   }
// }

/* =========================
   Music
========================= */

const musicBtn = document.getElementById("musicToggle");
const bgm = document.getElementById("bgm");
// const floatingMenu = document.getElementById("floatingMenu");

// let isPlaying = true;

musicBtn?.addEventListener("click", () => {

  if (bgm.paused) {
    bgm.play();
    // musicBtn.innerText = "⏸";
    musicBtn.innerText = "◼";
  } else {
    bgm.pause();
    musicBtn.innerText = "▶";
  }

});

let isPlaying = false; // ❗ change this

// set initial button state
if (musicBtn) {
  musicBtn.innerText = "▶";
}

// make sure audio is paused initially
if (bgm) {
  bgm.pause();
  bgm.currentTime = 0;
}

// openBtn.onclick = () => {
//   currentPage = 1;
//   updatePage();

//   bgm.play();
//   musicBtn.innerText = "⏸";
//   isPlaying = true;
// };

function updateFloatingUI() {
  const menuBtn = document.getElementById("menuToggleBtn");

  if (currentPage === 0) {
    musicBtn?.classList.add("hidden");
    menuBtn?.classList.add("hidden");
    floatingMenu?.classList.remove("show");
  } else {
    musicBtn?.classList.remove("hidden");
    menuBtn?.classList.remove("hidden");
  }
}

// const menuToggleBtn = document.getElementById("menuToggleBtn");

// menuToggleBtn?.addEventListener("click", () => {
//   // floatingMenu.classList.toggle("hidden");
//   floatingMenu.classList.toggle("show");
// });

// document.addEventListener("DOMContentLoaded", () => {

//   const menuToggleBtn = document.getElementById("menuToggleBtn");
//   // const floatingMenu = document.getElementById("floatingMenu");

//   menuToggleBtn?.addEventListener("click", (e) => {
//     e.stopPropagation(); // prevent weird bubbling
//     floatingMenu?.classList.toggle("show");
//   });

// });

const menuToggleBtn = document.getElementById("menuToggleBtn");

menuToggleBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  floatingMenu?.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!floatingMenu.contains(e.target) && e.target !== menuToggleBtn) {
    floatingMenu.classList.remove("show");
  }
});

// if (currentPage === 0) {
//   musicBtn?.classList.add("hidden");
//   floatingMenu?.classList.add("hidden");
// } else {
//   musicBtn?.classList.remove("hidden");
//   floatingMenu?.classList.remove("hidden");
// }


/* =========================
   RSVP CHECK
========================= */
async function checkRSVP(data) {
  const container = document.getElementById("rsvpContainer");
  if (!container) return;

  const rsvpData = await fetchRSVP(data.guest_id);

  if (rsvpData && rsvpData.attendance) {
    // container.innerHTML = `
    //   <p class="subtitle">RSVP</p>

    //   <h2>Thank You</h2>

    //   <p>
    //     Thank you, <strong>${data.invited_label}</strong>,
    //     for confirming your attendance.
    //   </p>

    //   <p style="opacity:0.7;">
    //     We look forward to celebrating this special day with you.
    //   </p>
    // `;
    // applyLanguage(currentLang);
    container.innerHTML = `
  <p class="subtitle" data-i18n="rsvp"></p>

  <h2 data-i18n="thank_you_title"></h2>

  <p data-i18n="thank_you_msg_1"></p>

  <p style="opacity:0.7;" data-i18n="thank_you_msg_2"></p>
`;

applyLanguage(currentLang);
  }
}

/* =========================
   RSVP INTERACTION
========================= */
let selectedAttendance = "Yes";
let selectedPax = 1;

document.addEventListener("click", (e) => {

  // // ATTENDANCE
  // if (e.target.closest("#attendanceGroup .choice")) {

  //   const choices = document.querySelectorAll("#attendanceGroup .choice");
  //   choices.forEach(c => c.classList.remove("active"));

  //   e.target.classList.add("active");
  //   selectedAttendance = e.target.dataset.value;

  //   const paxBlock = document.getElementById("paxBlock");

  //   if (paxBlock) {
  //     paxBlock.style.display = selectedAttendance === "No" ? "none" : "block";
  //   }
  // }

  // ATTENDANCE
if (e.target.closest("#attendanceGroup .choice")) {

  const choices = document.querySelectorAll("#attendanceGroup .choice");
  choices.forEach(c => c.classList.remove("active"));

  const selected = e.target.closest(".choice"); // safer
  selected.classList.add("active");

  selectedAttendance = selected.dataset.value;

  const paxBlock = document.getElementById("paxBlock");

  if (paxBlock) {
    if (selectedAttendance === "No") {
      paxBlock.style.display = "none";
      selectedPax = 0; // important
    } else {
      paxBlock.style.display = "block";
    }
  }
}

  // PAX
  if (e.target.closest("#paxGroup .choice")) {

    const choices = document.querySelectorAll("#paxGroup .choice");
    choices.forEach(c => c.classList.remove("active"));

    e.target.classList.add("active");
    selectedPax = e.target.dataset.value;
  }

});

/* =========================
   RSVP SUBMIT
========================= */
const rsvpBtn = document.getElementById("rsvpSubmitBtn");

if (rsvpBtn) {
  rsvpBtn.onclick = async () => {

    const payload = {
      guest_id: guestData.guest_id,
      name: guestData.name,
      attendance: selectedAttendance,
      pax: selectedAttendance === "No" ? 0 : selectedPax,
      message: ""
    };

    const res = await sendRSVP(payload);

    if (res.error) {
      alert(res.error);
      return;
    }

    const container = document.getElementById("rsvpContainer");

    // if (container) {
    //   container.innerHTML = `
    //     <p class="subtitle">RSVP</p>

    //     <h2>Thank You</h2>

    //     <p>
    //       Thank you, <strong>${guestData.invited_label}</strong>,
    //       for letting us know.
    //     </p>

    //     <p style="opacity:0.7;">
    //       We truly appreciate your response.
    //     </p>
    //   `;
    //   applyLanguage(currentLang);
    // }
    if (container) {
  container.innerHTML = `
    <p class="subtitle" data-i18n="rsvp"></p>

    <h2 data-i18n="thank_you_title"></h2>

    <p data-i18n="thank_you_msg_1"></p>

    <p style="opacity:0.7;" data-i18n="thank_you_msg_2"></p>
  `;

  applyLanguage(currentLang);
}
  };
}

/* =========================
   WISHES LOAD
========================= */
async function loadWishes() {
  const list = document.getElementById("wishList");
  if (!list) return;

  const data = await fetchWishes();

  list.innerHTML = "";

  data.slice(0, 200).forEach(w => {

    const div = document.createElement("div");
    div.classList.add("wish-item");

    const date = new Date(w.timestamp).toLocaleDateString();

    div.innerHTML = `
      <div class="wish-name">${w.name}</div>
      <div class="wish-text">${w.comment}</div>
      <div class="wish-date">${date}</div>
    `;

    list.appendChild(div);
  });
}

/* =========================
   WISH SUBMIT
========================= */
const wishBtn = document.getElementById("wishSubmit");

if (wishBtn) {
  wishBtn.onclick = async () => {

    const name = document.getElementById("wishName").value.trim();
    const message = document.getElementById("wishMessage").value.trim();

    if (!name || !message) {
      alert("Please fill all fields");
      return;
    }

    await sendWish({
      name,
      comment: message
    });

    document.getElementById("wishName").value = "";
    document.getElementById("wishMessage").value = "";

    loadWishes();
  };
}

/* =========================
   OPEN INVITATION
========================= */
// const openBtn = document.getElementById("openBtn");

// if (openBtn) {
//   openBtn.onclick = () => {
//     currentPage = 1;
//     updatePage();

//     document.getElementById("bgm").play();
//   };
// }

const openBtn = document.getElementById("openBtn");

if (openBtn) {
  openBtn.onclick = () => {
    currentPage = 1;
    updatePage();

    updateFloatingUI();

    if (bgm) {
      bgm.play().catch(() => { });
    }

    if (musicBtn) {
      musicBtn.innerText = "◼";
    }

    isPlaying = true;
  };
}

const wishMessage = document.getElementById("wishMessage");
const charCount = document.getElementById("charCount");

if (wishMessage && charCount) {

  wishMessage.addEventListener("input", () => {

    let length = wishMessage.value.length;

    // hard limit safety
    if (length > 300) {
      wishMessage.value = wishMessage.value.substring(0, 300);
      length = 300;
    }

    charCount.innerText = `${length} / 300`;

    // optional UX (nice visual feedback)
    if (length > 280) {
      charCount.style.color = "#ff6b6b"; // warning
    } else {
      charCount.style.color = "rgba(255,255,255,0.6)";
    }

  });

}

/* =========================
   COUNTDOWN (SAFE)
========================= */
const weddingDate = new Date("2026-05-30T17:00:00");

setInterval(() => {

  const el = document.getElementById("countdown");
  if (!el) return;

  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) return;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  el.innerHTML = `
    <div><span>${days}</span><small>Days</small></div>
    <div><span>${hours}</span><small>Hours</small></div>
    <div><span>${minutes}</span><small>Minutes</small></div>
    <div><span>${seconds}</span><small>Seconds</small></div>
  `;
}, 1000);

// function copyText(id) {
//   const text = document.getElementById(id).innerText;

//   navigator.clipboard.writeText(text).then(() => {
//     alert("Copied to clipboard ✨");
//   });
// }

// function copyText(button, id) {
//   const text = document.getElementById(id).innerText;

//   navigator.clipboard.writeText(text).then(() => {

//     const original = button.innerHTML;

//     // change to copied state
//     button.innerHTML = "✓ Copied";
//     button.classList.add("copied");

//     // revert after 2s
//     setTimeout(() => {
//       button.innerHTML = original;
//       button.classList.remove("copied");
//     }, 2000);

//   });
// }

function copyText(button, id) {
  const text = document.getElementById(id).innerText;

  // TRY MODERN API FIRST
  if (navigator.clipboard && window.isSecureContext) {

    navigator.clipboard.writeText(text)
      .then(() => successCopy(button))
      .catch(() => fallbackCopy(button, text));

  } else {
    // FALLBACK (MOBILE SAFE)
    fallbackCopy(button, text);
  }
}

function fallbackCopy(button, text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;

  // prevent scroll jump
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    successCopy(button);
  } catch (err) {
    alert("Copy failed, please copy manually");
  }

  document.body.removeChild(textarea);
}

// function successCopy(button) {
//   const original = button.innerHTML;

//   button.innerHTML = "✓ Copied";
//   button.classList.add("copied");

//   setTimeout(() => {
//     button.innerHTML = original;
//     button.classList.remove("copied");
//   }, 2000);
// }

function successCopy(button) {
  if (navigator.vibrate) navigator.vibrate(10);

  const original = button.innerHTML;

  button.innerHTML = "✓ Copied";
  button.classList.add("copied");

  setTimeout(() => {
    button.innerHTML = original;
    button.classList.remove("copied");
  }, 2000);
}

// /* =========================
//    MOMENTS GALLERY
// ========================= */

// const photos = [
//   "assets/images/gallery/1.jpg",
//   "assets/images/gallery/2.jpg",
//   "assets/images/gallery/3.jpg",
//   "assets/images/gallery/4.jpg",
//   "assets/images/gallery/5.jpg",
//   "assets/images/gallery/6.jpg",
//   "assets/images/gallery/7.jpg",
//   "assets/images/gallery/8.jpg"
// ];

// function loadGallery() {
//   const gallery = document.getElementById("gallery");
//   if (!gallery) return;

//   gallery.innerHTML = "";

//   photos.forEach(src => {
//     const img = document.createElement("img");
//     img.src = src;

//     img.onclick = () => openModal(src);

//     gallery.appendChild(img);
//   });
// }

// loadGallery();

// /* =========================
//    MODAL LOGIC
// ========================= */

// function openModal(src) {
//   const modal = document.getElementById("photoModal");
//   const modalImg = document.getElementById("modalImg");

//   modal.style.display = "flex";
//   modalImg.src = src;
// }

// document.getElementById("closeModal").onclick = () => {
//   document.getElementById("photoModal").style.display = "none";
// };

/* =========================
   MOMENTS GALLERY (UPGRADE)
========================= */

// const photos = [
//   "assets/images/gallery/1.jpg",
//   "assets/images/gallery/2.jpg",
//   "assets/images/gallery/3.jpg",
//   "assets/images/gallery/4.jpg",
//   "assets/images/gallery/5.jpg",
//   "assets/images/gallery/6.jpg",
//   "assets/images/gallery/7.jpg",
//   "assets/images/gallery/8.jpg"
// ];

// let currentPhotoIndex = 0;

// function loadGallery() {
//   const gallery = document.getElementById("gallery");
//   if (!gallery) return;

//   gallery.innerHTML = "";

//   photos.forEach((src, index) => {
//     const img = document.createElement("img");
//     img.src = src;

//     img.onclick = () => openModal(index);

//     gallery.appendChild(img);
//   });
// }

// loadGallery();

// /* =========================
//    MODAL SYSTEM (PRO)
// ========================= */

// function openModal(index) {
//   currentPhotoIndex = index;

//   const modal = document.getElementById("photoModal");
//   modal.style.display = "flex";

//   updateModalImage();
// }

// function updateModalImage() {
//   const modalImg = document.getElementById("modalImg");
//   modalImg.src = photos[currentPhotoIndex];
// }

// /* CLOSE */
// const closeBtn = document.getElementById("closeModal");
// if (closeBtn) {
//   closeBtn.onclick = () => {
//     document.getElementById("photoModal").style.display = "none";
//   };
// }

// /* NEXT / PREV */
// function nextPhoto() {
//   currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
//   updateModalImage();
// }

// function prevPhoto() {
//   currentPhotoIndex =
//     (currentPhotoIndex - 1 + photos.length) % photos.length;
//   updateModalImage();
// }

// document.getElementById("nextBtn").onclick = nextPhoto;
// document.getElementById("prevBtn").onclick = prevPhoto;

// /* =========================
//    SWIPE SUPPORT (MOBILE)
// ========================= */

// let touchStartX = 0;

// const modal = document.getElementById("photoModal");

// if (modal) {

//   modal.addEventListener("touchstart", (e) => {
//     touchStartX = e.touches[0].clientX;
//   });

//   modal.addEventListener("touchend", (e) => {
//     let endX = e.changedTouches[0].clientX;
//     let diff = endX - touchStartX;

//     if (diff > 50) {
//       prevPhoto();
//     } else if (diff < -50) {
//       nextPhoto();
//     }
//   });

// }

// /* =========================
//    KEYBOARD SUPPORT (DESKTOP)
// ========================= */

// document.addEventListener("keydown", (e) => {

//   const modalVisible =
//     document.getElementById("photoModal").style.display === "flex";

//   if (!modalVisible) return;

//   if (e.key === "ArrowRight") nextPhoto();
//   if (e.key === "ArrowLeft") prevPhoto();
//   if (e.key === "Escape") {
//     document.getElementById("photoModal").style.display = "none";
//   }

// });

document.addEventListener("DOMContentLoaded", () => {

  // const photos = [
  //   // "assets/images/gallery/1.jpg",
  //   // "assets/images/gallery/2.jpg",
  //   // "assets/images/gallery/3.jpg",
  //   "assets/images/gallery/4.jpg",
  //   "assets/images/gallery/5.jpg",
  //   "assets/images/gallery/6.jpg",
  //   "assets/images/gallery/7.jpg",
  //   "assets/images/gallery/8.jpg",
  //   "assets/images/gallery/9.jpg",
  //   "assets/images/gallery/10.jpg",
  //   "assets/images/gallery/11.jpg",
  //   "assets/images/gallery/12.jpg",
  //   "assets/images/gallery/13.jpg"
  // ];
  // const photos = [
  //   { src: "assets/images/gallery/1.jpg", caption: "It was first time we met actually - hehehe" },
  //   { src: "assets/images/gallery/2.jpg", caption: "She taught me how to skate properly" },
  //   { src: "assets/images/gallery/3.jpg", caption: "This place, the Fatmawati Indomaret MRT was the place my love confession to her got a reply, she said yes - hihuww" },
  //   { src: "assets/images/gallery/4.jpg", caption: "At ITB Bandung, still looks Maba (Mahasiswa baru) in our latest 20, right?" },
  //   { src: "assets/images/gallery/5.jpg", caption: "At KRL Jakarta, ongoing to Cikini to look for the enggagement ring" },
  //   { src: "assets/images/gallery/6.jpg", caption: "We joined the Pocari Marathon Bandung 2024, she finished her 10k first time wuhuu, I also finished the full marathon." },
  //   { src: "assets/images/gallery/7.jpg", caption: "With Rizka's main family (Cinere side)" },
  //   { src: "assets/images/gallery/8.jpg", caption: "With Zaqi's family (Bojonegoro side)" },
  //   // { src: "assets/images/gallery/10.jpg", caption: "Together, always" },
  //   { src: "assets/images/gallery/12.jpg", caption: "Enggagement day - 10 August 2024" },
  //   { src: "assets/images/gallery/11.jpg", caption: "Every step with you matters ehehe" },
  //   { src: "assets/images/gallery/13.jpg", caption: "Our family's connected" },
  //   { src: "assets/images/gallery/14.jpg", caption: "At Soekarno Hatta Airpot, LDR Phase for one year began huhuhu" },
  //   { src: "assets/images/gallery/15.jpg", caption: "Keren qaqa, real maba S2 HEHEHE" },
  //   { src: "assets/images/gallery/16.jpg", caption: "Although the distance between London and Bandung's too far and different time zone that almost 8-9 hours, we're still connected via digital, even we had our discord channel hehe" },
  //   { src: "assets/images/gallery/17.jpg", caption: "2025 eve with rizka and si kecil (my cat)" },
  //   { src: "assets/images/gallery/18.jpg", caption: "Meanwhile rizka was focusing on her study at London and I was with my working stuff at Bandung, we spent our time to play the Stardew valley and built the digital garden there, even we married also ahah and had a baby lol" },
  //   { src: "assets/images/gallery/19.jpg", caption: "Fast moving forward and after a year - finshing her master study and getting the degree, She came back to Indonesia and we welcomed her at Soekarno Hatta Airport" },
  //   { src: "assets/images/gallery/20.jpg", caption: "She waited on the finish line after I completed the route of 45K (Melrimba Puncak to Masjid Aljabbar Cipeyeum) ITB Ultra 2025" },
  //   { src: "assets/images/gallery/21.jpg", caption: "At Pasar Seni ITB 2025" },
  //   { src: "assets/images/gallery/22.jpg", caption: "At Kondangan (one of Zaqi's closes friends)" },
  //   { src: "assets/images/gallery/23.jpg", caption: "At Bandung" },
  //   { src: "assets/images/gallery/24.jpg", caption: "Wedding Preparation - fitting dress" },
  //   { src: "assets/images/gallery/25.jpg", caption: "Revisited to Bojonegoro after Eid-Fitr holiday" },
  //   { src: "assets/images/gallery/26.jpg", caption: "At the graveyard of Zaqi's mom (Almarhumah Ibu Susilawati - peace be upon her)" },
  //   { src: "assets/images/gallery/27.jpg", caption: "This is our stories, see you on our wedding day 🤗" }
  // ];
  const photos = [
  { src: "assets/images/gallery/1.jpg", caption: "This was actually the first time we met hehe" },
  { src: "assets/images/gallery/2.jpg", caption: "She taught me how to skate properly" },
  { src: "assets/images/gallery/3.jpg", caption: "This place, Fatmawati Indomaret MRT, is where my love confession got a reply—she said yes hihuww" },
  { src: "assets/images/gallery/4.jpg", caption: "At ITB Bandung — still looking like a freshmen (Mahasiswa baru), right?" },
  { src: "assets/images/gallery/5.jpg", caption: "On our way to Cikini by KRL to look for the engagement ring" },
  { src: "assets/images/gallery/6.jpg", caption: "We joined the Pocari Marathon Bandung 2024—she finished her first 10K, wuhuu, and I completed the full marathon" },
  { src: "assets/images/gallery/7.jpg", caption: "With Rizka's main family" },
  { src: "assets/images/gallery/8.jpg", caption: "With Zaqi's family (Bojonegoro side)" },
  { src: "assets/images/gallery/12.jpg", caption: "Engagement day — 10 August 2024" },
  { src: "assets/images/gallery/11.jpg", caption: "Every step with you matters ehehe" },
  { src: "assets/images/gallery/13.jpg", caption: "Our families are connected" },
  { src: "assets/images/gallery/28.jpg", caption: "Adventure partner for life 🤍" },
  { src: "assets/images/gallery/14.jpg", caption: "At Soekarno–Hatta Airport — right before our year-long UK–Indonesia LDR began" },
  // { src: "assets/images/gallery/15.jpg", caption: "Keren qaqa, a real S2 freshman HEHEHE" },
  { src: "assets/images/gallery/16.jpg", caption: "Even though the distance between London and Bandung is far, with a 7–8 hour time difference, we stayed connected digitally—we even had our own Discord channel hehe" },
  { src: "assets/images/gallery/17.jpg", caption: "New Year's Eve 2025 with Rizka and si kecil (my cat)" },
  { src: "assets/images/gallery/18.jpg", caption: "While Rizka focused on her studies in London and I worked in Bandung, we spent time playing Stardew Valley—building our digital garden, and getting married in here also lol" },
  { src: "assets/images/gallery/19.jpg", caption: "Fast forward one year—after finishing her master's degree, she returned to Indonesia, and we welcomed her at Soekarno-Hatta Airport" },
  { src: "assets/images/gallery/20.jpg", caption: "She waited at the finish line after I completed the 45K route (Melrimba Puncak to Masjid Al-Jabbar, Cipeuyeum) — ITB Ultra 2025" },
  { src: "assets/images/gallery/21.jpg", caption: "At Pasar Seni ITB 2025" },
  { src: "assets/images/gallery/29.jpg", caption: "We brought each other into our circles — meeting friends, celebrating weddings, and building a meaningful bond" },
  { src: "assets/images/gallery/23.jpg", caption: "In Bandung" },
  { src: "assets/images/gallery/24.jpg", caption: "Wedding preparation — fitting the dress" },
  { src: "assets/images/gallery/25.jpg", caption: "Revisited Bojonegoro after the Eid al-Fitr holiday" },
  { src: "assets/images/gallery/26.jpg", caption: "At my mother's grave (Almarhumah Ibu Susilawati — may she rest in peace)" },
  { src: "assets/images/gallery/27.jpg", caption: "This is our story—see you on our wedding day 🤗" }
];


  let currentPhotoIndex = 0;

  const gallery = document.getElementById("gallery");
  const modal = document.getElementById("photoModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = document.getElementById("closeModal");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const counter = document.getElementById("photoCounter");

  function loadGallery() {
    if (!gallery) return;

    gallery.innerHTML = "";

    photos.forEach((photo, index) => {
      const img = document.createElement("img");
      img.src = photo.src;
      img.loading = "lazy";

      img.onclick = () => openModal(index);

      gallery.appendChild(img);
    });
  }

  function openModal(index) {
    currentPhotoIndex = index;
    modal.style.display = "flex";
    modal.classList.add("show");
    isModalOpen = true;
    // ✅ ADD THIS
    document.getElementById("musicToggle")?.classList.add("hidden");
    document.getElementById("menuToggleBtn")?.classList.add("hidden");
    updateModalImage();
  }
  closeBtn?.addEventListener("click", () => {
    modal.style.display = "none";

    isModalOpen = false; // 🔥 UNLOCK

    // ✅ ADD THIS
  document.getElementById("musicToggle")?.classList.remove("hidden");
  document.getElementById("menuToggleBtn")?.classList.remove("hidden");
  });

  function preload(index) {
    const img = new Image();
    img.src = photos[index].src;
  }

  function updateModalImage() {
    modalImg.src = photos[currentPhotoIndex].src;

    if (counter) {
      counter.innerText = `${currentPhotoIndex + 1} / ${photos.length}`;
    }

    preload((currentPhotoIndex + 1) % photos.length);
    preload((currentPhotoIndex - 1 + photos.length) % photos.length);
  }
  const caption = document.getElementById("photoCaption");

  function updateModalImage() {
    modalImg.src = photos[currentPhotoIndex].src;

    if (counter) {
      counter.innerText = `${currentPhotoIndex + 1} / ${photos.length}`;
    }

    if (caption) {
      caption.innerText = photos[currentPhotoIndex].caption;
    }

    preload((currentPhotoIndex + 1) % photos.length);
    preload((currentPhotoIndex - 1 + photos.length) % photos.length);
  }

  function nextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    updateModalImage();
  }

  function prevPhoto() {
    currentPhotoIndex =
      (currentPhotoIndex - 1 + photos.length) % photos.length;
    updateModalImage();
  }

  // SAFE binding
  // closeBtn?.addEventListener("click", () => modal.style.display = "none");
  nextBtn?.addEventListener("click", nextPhoto);
  prevBtn?.addEventListener("click", prevPhoto);

  // Swipe
  let startX = 0;

  modal?.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  modal?.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - startX;

    if (diff > 50) prevPhoto();
    if (diff < -50) nextPhoto();
  });

  // Keyboard
  document.addEventListener("keydown", e => {
    // if (modal.style.display !== "flex") return;
    if (!isModalOpen) return;

    e.stopPropagation(); // 🔥 prevents bubbling

    if (e.key === "ArrowRight") nextPhoto();
    if (e.key === "ArrowLeft") prevPhoto();
    if (e.key === "Escape") modal.style.display = "none";
  });

  loadGallery();

  applyLanguage(currentLang);

});

updateFloatingUI();
