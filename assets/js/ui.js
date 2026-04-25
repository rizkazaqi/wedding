// function renderGuest(data) {
//   document.getElementById("guestName").innerText =
//     "Dear " + data.invited_label;

//   // RSVP NAME
//   const rsvpName = document.getElementById("rsvpName");
//   if (rsvpName) {
//     rsvpName.innerText = data.invited_label;
//   }

//   const pax = document.getElementById("pax");
//   pax.innerHTML = "";

//   for (let i = 1; i <= data.max_pax; i++) {
//     let opt = document.createElement("option");
//     opt.value = i;
//     opt.innerText = i;
//     pax.appendChild(opt);
//   }
// }

function renderGuest(data) {
  document.getElementById("guestName").innerText =
  "" + data.invited_label;
    // "Dear " + data.invited_label;

  // RSVP NAME
  const rsvpName = document.getElementById("rsvpName");
  if (rsvpName) {
    rsvpName.innerText = data.invited_label;
  }

  // PAX BUTTONS
  const paxGroup = document.getElementById("paxGroup");
  paxGroup.innerHTML = "";

  for (let i = 1; i <= data.max_pax; i++) {
    const div = document.createElement("div");
    div.classList.add("choice");
    if (i === 1) div.classList.add("active");

    div.innerText = i;
    div.dataset.value = i;

    paxGroup.appendChild(div);
  }
}

function renderEvents(data) {
  const events = (data.events || "").split(",");
  let html = "";

  if (events.includes("akad")) {
    html += `<h2>Akad Nikah</h2>`;
  }

  if (events.includes("reception")) {
    html += `<h2>Reception</h2>`;
  }

  document.getElementById("eventPage").innerHTML = html;
}

function showError(msg) {
  document.body.innerHTML = `<h1>${msg}</h1>`;
}