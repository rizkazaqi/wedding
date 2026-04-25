let isModalOpen = false;
let currentPage = 0;
const TOTAL_PAGES = 11;

/* =========================
   NAVIGATION GUARD
========================= */
function canNavigate(direction) {
  if (currentPage === 0) return false;
  if (currentPage === 1 && direction === "prev") return false;
  return true;
}

/* =========================
   DOTS
========================= */
// function initDots() {
//   const container = document.getElementById("dots");
//   const pages = document.querySelectorAll(".page");

//   for (let i = 0; i < TOTAL_PAGES; i++) {
//     const dot = document.createElement("div");
//     dot.classList.add("dot");

//     dot.onclick = () => {
//       if (i === 0) return;
//       currentPage = i;
//       updatePage();
//     };

//     container.appendChild(dot);
//   }
// }

function initDots() {
  const pages = document.querySelectorAll(".page");
  const dotsContainer = document.getElementById("dots");

  dotsContainer.innerHTML = "";

  pages.forEach((_, index) => {

    // ❗ skip cover (index 0)
    if (index === 0) return;

    const dot = document.createElement("div");
    dot.classList.add("dot");

    // couple = first dot
    if (index === 1) dot.classList.add("active");

    dotsContainer.appendChild(dot);
  });
}

// function updateDots() {
//   document.querySelectorAll(".dot").forEach((dot, i) => {
//     dot.classList.toggle("active", i === currentPage);
//   });
// }

function updateDots() {
  const dots = document.querySelectorAll(".dot");

  dots.forEach((dot, index) => {
    // ❗ shift: dot[0] = page[1]
    dot.classList.toggle("active", currentPage === index + 1);
  });
}

/* =========================
   PROGRESS
========================= */
function updateProgress() {
  const percent = ((currentPage + 1) / TOTAL_PAGES) * 100;
  document.getElementById("progress").style.width = percent + "%";
}

/* =========================
   SNAP FEEDBACK
========================= */
function snapFeedback() {
  if (navigator.vibrate) navigator.vibrate(10);
}

/* =========================
   UPDATE PAGE
========================= */
function updatePage() {
  document.querySelector(".story-track").style.transform =
    `translateX(-${currentPage * 100}vw)`;

  // active class for animation
  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active");
  });

  document.querySelectorAll(".page")[currentPage].classList.add("active");

  updateDots();
  updateProgress();

  const dots = document.getElementById("dots");
  const progress = document.querySelector(".progress-bar");

  if (currentPage === 0) {
    dots.style.opacity = "0";
    progress.style.opacity = "0";
  } else {
    dots.style.opacity = "1";
    progress.style.opacity = "1";
  }
    // 🔥 ADD THIS LINE
  if (typeof updateFloatingUI === "function") {
    updateFloatingUI();
  }
}

/* =========================
   SWIPE (PREMIUM)
========================= */
let startX = 0;
let startTime = 0;

document.addEventListener("touchstart", e => {
  if (isModalOpen) return; // 🔥 STOP
  startX = e.touches[0].clientX;
  startTime = Date.now();
});

document.addEventListener("touchend", e => {
  if (isModalOpen) return; // 🔥 STOP
  let endX = e.changedTouches[0].clientX;
  let distance = endX - startX;
  let duration = Date.now() - startTime;

  let velocity = Math.abs(distance) / duration;

  let threshold = 60;
  let fastSwipe = velocity > 0.5;

  if (distance < -threshold || (distance < -30 && fastSwipe)) {
    if (canNavigate("next") && currentPage < TOTAL_PAGES - 1) {
      currentPage++;
      snapFeedback();
      updatePage();
    }
  }

  if (distance > threshold || (distance > 30 && fastSwipe)) {
    if (canNavigate("prev") && currentPage > 0) {
      currentPage--;
      snapFeedback();
      updatePage();
    }
  }
});

/* =========================
   KEYBOARD (OPTIONAL)
========================= */
document.addEventListener("keydown", (e) => {
  if (isModalOpen) return;
  if (e.key === "ArrowRight") {
    if (canNavigate("next") && currentPage < TOTAL_PAGES - 1) {
      currentPage++;
      updatePage();
    }
  }

  if (e.key === "ArrowLeft") {
    if (canNavigate("prev") && currentPage > 0) {
      currentPage--;
      updatePage();
    }
  }
});

/* =========================
   INIT
========================= */
initDots();
updatePage();