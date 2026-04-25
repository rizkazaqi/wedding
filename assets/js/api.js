const API_URL = "https://script.google.com/macros/s/AKfycbymz_uTRUljr3fU19eOStyOGGU696jEeh4yDNLRn0fmqEE3FxD9MjQStRUWnIEOZtib/exec";

async function fetchGuest(id) {
  const res = await fetch(`${API_URL}?id=${id}`);
  return res.json();
}

async function sendRSVP(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
  return res.json();
}

async function fetchRSVP(guest_id) {
  const res = await fetch(`${API_URL}?rsvp_check=${guest_id}`);
  return res.json();
}

/* =========================
   WISH API
========================= */

async function fetchWishes() {
  const res = await fetch(`${API_URL}?get_wishes=1`);
  return res.json();
}

async function sendWish(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      type: "wish",
      ...data
    })
  });
  return res.json();
}