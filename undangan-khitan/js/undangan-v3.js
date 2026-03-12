// ========== FUNGSI TAMBAHAN AGAR FITUR UTAMA BERJALAN ==========
// Flip animasi amplop digital
function flipEnvelope() {
	var envelope = document.getElementById('envelope');
	if (envelope) envelope.classList.toggle('flipped');
}

// Copy nomor rekening/ewallet ke clipboard
function copyToClipboard(text, notif) {
	if (navigator.clipboard) {
		navigator.clipboard.writeText(text).then(function() {
			alert(notif || 'Disalin!');
		}, function() {
			alert('Gagal menyalin!');
		});
	} else {
		// fallback lama
		var temp = document.createElement('input');
		document.body.appendChild(temp);
		temp.value = text;
		temp.select();
		document.execCommand('copy');
		document.body.removeChild(temp);
		alert(notif || 'Disalin!');
	}
}

// Quick donate (dummy, hanya alert)
function quickDonate() {
	var amount = document.getElementById('quickDonationAmount').value;
	if (!amount || isNaN(amount) || amount < 10000) {
		alert('Nominal minimal 10.000');
		return;
	}
	alert('Terima kasih atas donasi Anda! (Simulasi)');
}

// Add to calendar (dummy, hanya alert)
function addToCalendar() {
	alert('Fitur tambah ke kalender belum diimplementasikan.');
}

// Buka Google Maps
function openGoogleMaps() {
	window.open('https://www.google.com/maps/dir//mushola+baiturrohim,+Jl.+Raya+Tegal+Panjang+No.rt22+rw+05,+Tegalpanjang,+Tanahbaya,+Kec.+Randudongkal,+Kabupaten+Pemalang,+Jawa+Tengah+52353', '_blank');
}

// Buka Waze
function openWaze() {
	window.open('https://waze.com/ul?ll=-7.0788331,109.3412016&navigate=yes', '_blank');
}

// Modal location
function hideLocationModal(e) {
	if (!e || e.target === document.getElementById('locationModal')) {
		document.getElementById('locationModal').style.display = 'none';
	}
}

// Modal donation
function hideDonationModal(e) {
	if (!e || e.target === document.getElementById('donationModal')) {
		document.getElementById('donationModal').style.display = 'none';
	}
}

// Submit donation (dummy, hanya alert)
function submitDonation(event) {
	if (event) event.preventDefault();
	alert('Terima kasih atas donasi dan konfirmasi Anda! (Simulasi)');
	hideDonationModal();
}
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

	// Fungsi generateStars untuk animasi bintang
	function generateStars(containerId, count) {
		const container = document.getElementById(containerId);
		if (!container) return;
		container.innerHTML = '';
		for (let i = 0; i < count; i++) {
			const star = document.createElement('div');
			star.className = 'star';
			star.style.position = 'absolute';
			star.style.top = Math.random() * 100 + '%';
			star.style.left = Math.random() * 100 + '%';
			star.style.width = (Math.random() * 1.5 + 0.5) + 'px';
			star.style.height = star.style.width;
			star.style.background = '#fff';
			star.style.opacity = Math.random() * 0.7 + 0.3;
			star.style.borderRadius = '50%';
			star.style.boxShadow = `0 0 ${(Math.random() * 6 + 2)}px #fff`;
			container.appendChild(star);
		}
	}

	// Fungsi openInvitation untuk membuka undangan
	function openInvitation() {
		try {
			var cover = document.getElementById('coverPage');
			var main = document.getElementById('mainContent');
			if (cover) cover.style.display = 'none';
			if (main) {
				main.style.display = 'block';
				main.style.visibility = 'visible';
				main.style.opacity = 1;
				main.style.zIndex = 1;
			} else {
				console.warn('mainContent tidak ditemukan!');
			}
			// Tampilkan tombol musik jika ada
			var musicBtn = document.getElementById('musicButtonWrapper');
			if (musicBtn) musicBtn.style.display = 'block';
		} catch (e) {
			console.error('openInvitation error:', e);
			// Fallback: coba tampilkan mainContent saja
			var main = document.getElementById('mainContent');
			if (main) {
				main.style.display = 'block';
				main.style.visibility = 'visible';
				main.style.opacity = 1;
				main.style.zIndex = 1;
			}
		}
	}

	// Pastikan mainContent disembunyikan saat awal load
	document.addEventListener('DOMContentLoaded', function() {
		var main = document.getElementById('mainContent');
		if (main) {
			main.style.display = 'none';
			main.style.visibility = 'hidden';
			main.style.opacity = 0;
			main.style.zIndex = 1;
		}
	});

	// Fallback: jika coverPage tidak ada, mainContent tetap tampil
	window.addEventListener('load', function() {
		var cover = document.getElementById('coverPage');
		var main = document.getElementById('mainContent');
		if ((!cover || cover.style.display === 'none') && main) {
			main.style.display = 'block';
			main.style.visibility = 'visible';
			main.style.opacity = 1;
			main.style.zIndex = 1;
		}
	});
