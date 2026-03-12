// undangan-v3.js: Versi baru untuk menghindari cache iPhone
// ...seluruh isi undangan-v2.js tanpa alert...

// Zoom effect for Calon Pemimpin Sholeh button
document.addEventListener('DOMContentLoaded', function() {
	var calonBtn = document.querySelector('.calon-zoom-btn');
	if (calonBtn) {
		calonBtn.addEventListener('click', function() {
			calonBtn.classList.remove('zoom-animate');
			void calonBtn.offsetWidth; // force reflow
			calonBtn.classList.add('zoom-animate');
		});
	}
});
// ==================== GLOBAL VARIABLES ====================
let isMusicPlaying = false;
const audio = document.getElementById('backgroundMusic');
let autoScrollEnabled = false;
let scrollInterval;
let currentSection = 0;
const sections = ['heroSection', 'infoSection', 'rsvpSection', 'envelopeSection'];
let totalDonation = 2500000;
const targetDonation = 5000000;

// ==================== INITIALIZATION ====================
window.onload = function() {
	generateStars('starField', 150);
	generateStars('mainStarField', 100);

	// Ambil nama tamu dari parameter URL atau localStorage
	const urlParams = new URLSearchParams(window.location.search);
	const guestSlug = urlParams.get('nama');
	let guestName = '';
	if (guestSlug) {
		// Ambil slug tanpa id unik di belakang
		let slug = decodeURIComponent(guestSlug).replace(/-([a-z0-9]{6})$/, '');
		// Ganti - menjadi spasi, lalu trim
		guestName = slug.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
		// Capitalize tiap kata, tapi biarkan karakter spesial tetap
		guestName = guestName.replace(/\b\w/g, c => c.toUpperCase());
		localStorage.setItem('guestName', guestName);
	} else {
		guestName = localStorage.getItem('guestName') || '';
	}
	const guestNameCover = document.getElementById('guestNameCover');
	if (guestName && guestNameCover) {
		guestNameCover.textContent = guestName;
		guestNameCover.style.display = 'block';
	} else if (guestNameCover) {
		guestNameCover.style.display = 'none';
	}
	// Personalisasi ucapan selamat di bawah
	const personalWelcome = document.getElementById('personalWelcome');
	if (personalWelcome) {
		if (guestName) {
			personalWelcome.textContent = `Selamat Datang, ${guestName}! Semoga acara ini membawa keberkahan untuk kita semua.`;
		} else {
			personalWelcome.textContent = 'Selamat Datang di Khitanan Mifzal Kianu Alfaris';
		}
	}
	// ...lanjutan kode undangan-v2.js...
}
