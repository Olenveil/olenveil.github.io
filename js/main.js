let countdownExpired = false;
const targetDate = new Date("2025-06-27T00:00:00-07:00").getTime();

const interval = setInterval(updateCountdown, 1000);
updateCountdown(); // run once on load

function updateCountdown() {
  const now = new Date().getTime();
  const diff = targetDate - now;

  if (diff <= 0) {
    // Replace countdown numbers with "Out now!" shimmer
    const countdownEl = document.getElementById("countdown");
    countdownEl.innerHTML = ""; // Clear the countdown content

    const msg = document.createElement("div");
    msg.className = "release-message shimmer-text ripple"; // includes shimmer style
    msg.textContent = "Out now!";
    countdownEl.appendChild(msg);

    // Show stream links
    document.getElementById("stream-buttons").style.display = "flex";
    document.getElementById("stream-placeholder").style.display = "none";

    // Stop further countdown updates
    clearInterval(interval);

    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("days").textContent = days.toString().padStart(2, '0');
  document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
  document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
  document.getElementById("seconds").textContent = seconds.toString().padStart(2, '0');
}


setInterval(updateCountdown, 1000);
updateCountdown();
