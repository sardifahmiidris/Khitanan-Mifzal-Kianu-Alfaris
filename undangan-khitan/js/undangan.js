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

    // Check if URL has parameter to auto-open
    if (urlParams.get('open') === 'true') {
        setTimeout(openInvitation, 500);
    }

    // Initialize donation progress
    updateDonationProgress();
    // Jalankan listener donasi real-time
    listenDonationsRealtime();
    // Jalankan listener ucapan real-time
    listenUcapanRealtime();

    // Preload dan autoplay audio
    if (audio) {
        audio.load();
        audio.volume = 1;
        audio.play().catch(()=>{});
    }

    // Add touch event for mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }

    // Setup intersection observer
    setupIntersectionObserver();
};

// ==================== COVER PAGE FUNCTIONS ====================
function openInvitation() {
    const coverPage = document.getElementById('coverPage');
    const mainContent = document.getElementById('mainContent');
    
    // Tampilkan nama tamu jika ada di localStorage
    const guestName = localStorage.getItem('guestName');
    const guestNameCover = document.getElementById('guestNameCover');
    if (guestName && guestNameCover) {
        guestNameCover.textContent = guestName;
        guestNameCover.style.display = 'block';
    } else if (guestNameCover) {
        guestNameCover.style.display = 'none';
    }

    coverPage.classList.add('hidden');
    mainContent.classList.add('show');

    // Start countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show notification
    showNotification('Selamat datang di Khitanan Mifzal Kianu Alfaris', 'info');

    // Tampilkan tombol musik dan play otomatis
    const musicBtnWrap = document.getElementById('musicButtonWrapper');
    if (musicBtnWrap) musicBtnWrap.style.display = 'block';
    if (audio) {
        audio.volume = 1;
        audio.play().catch(()=>{});
        isMusicPlaying = true;
        const icon = document.getElementById('musicIcon');
        if (icon) icon.className = 'fas fa-pause text-white';
    }
}

// Tap anywhere to open
document.getElementById('coverPage')?.addEventListener('click', function(e) {
    if (!e.target.closest('button')) {
        openInvitation();
    }
});

// ==================== MUSIC FUNCTIONS ====================
function toggleMusic() {
    const icon = document.getElementById('musicIcon');
    if (!audio) return;
    if (isMusicPlaying) {
        audio.pause();
        if (icon) icon.className = 'fas fa-music text-white';
        showNotification('Music paused', 'info');
    } else {
        audio.play()
            .then(() => {
                if (icon) icon.className = 'fas fa-pause text-white';
                showNotification('Music playing', 'success');
            })
            .catch(() => {
                showNotification('Click again to play music', 'info');
            });
    }
    isMusicPlaying = !isMusicPlaying;
}

// ==================== AUTO SCROLL FUNCTIONS ====================
function toggleAutoScroll() {
    // Fitur auto scroll di-nonaktifkan
    return;
}

function startAutoScroll() {
    scrollInterval = setInterval(() => {
        currentSection = (currentSection + 1) % sections.length;
        scrollToSection(currentSection);
    }, 5000);
}

function stopAutoScroll() {
    if (scrollInterval) clearInterval(scrollInterval);
}

function scrollToSection(index) {
    const section = document.getElementById(sections[index]);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        currentSection = index;
    }
}

// ==================== COUNTDOWN FUNCTIONS ====================
function updateCountdown() {
    // Set countdown to 25 March 2026, 08:00:00 WIB
    const eventDate = new Date('March 25, 2026 08:00:00 GMT+0700').getTime();
    const now = new Date().getTime();
    const distance = eventDate - now;
    
    if (distance < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// ==================== MODAL FUNCTIONS ====================
function showLocationModal() {
    const modal = document.getElementById('locationModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideLocationModal(event) {
    const modal = document.getElementById('locationModal');
    if (modal && (!event || event.target.classList.contains('modal-overlay'))) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showDonationModal() {
    const modal = document.getElementById('donationModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideDonationModal(event) {
    const modal = document.getElementById('donationModal');
    if (modal && (!event || event.target.classList.contains('modal-overlay'))) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ==================== MAP FUNCTIONS ====================
function openGoogleMaps() {
    const lat = -6.2088;
    const lng = 106.8456;
    const label = 'Gedung Serbaguna Al-Mubarak';
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.open(`geo:${lat},${lng}?q=${lat},${lng}(${label})`);
    } else {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    }
    
    hideLocationModal();
}

function openWaze() {
    const lat = -6.2088;
    const lng = 106.8456;
    window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`);
    hideLocationModal();
}

// ==================== CALENDAR FUNCTIONS ====================
function addToCalendar() {
    const title = 'Khitanan Arka';
    const description = 'Acara khitanan putra tercinta Arka. Mohon doa restu untuk kelancaran acara.';
    const location = 'Gedung Serbaguna Al-Mubarak, Jl. Khitan No. 123, Jakarta';
    
    const startDate = new Date('2024-06-15T08:00:00');
    const endDate = new Date('2024-06-15T12:00:00');
    
    const startFormatted = formatDateForCalendar(startDate);
    const endFormatted = formatDateForCalendar(endDate);
    
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(title)}` +
        `&dates=${startFormatted}/${endFormatted}` +
        `&details=${encodeURIComponent(description)}` +
        `&location=${encodeURIComponent(location)}` +
        `&sf=true&output=xml`;
    
    window.open(googleCalendarUrl, '_blank');
    showNotification('Silahkan tambahkan ke kalender Anda', 'info');
}

function formatDateForCalendar(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}00`;
}

// ==================== ENVELOPE FUNCTIONS ====================
function flipEnvelope() {
    const envelope = document.getElementById('envelope');
    if (!envelope) return;
    
    envelope.classList.toggle('flipped');
    envelope.classList.add('animate-shake');
    setTimeout(() => envelope.classList.remove('animate-shake'), 500);
    
    showNotification('Amplop digital dibuka', 'info');
}

// ==================== CLIPBOARD FUNCTIONS ====================
function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(message || 'Berhasil disalin!', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification(message || 'Berhasil disalin!', 'success');
    });
}

// ==================== E-WALLET FUNCTIONS ====================
function showEWallet(wallet) {
    let message = '';
    let number = '';
    
    switch(wallet) {
        case 'dana':
            message = 'DANA: 0812-3456-7890 a.n. Ahmad';
            number = '081234567890';
            break;
        case 'ovo':
            message = 'OVO: 0812-3456-7890 a.n. Ahmad';
            number = '081234567890';
            break;
        case 'gopay':
            message = 'GoPay: 0812-3456-7890 a.n. Ahmad';
            number = '081234567890';
            break;
    }
    
    copyToClipboard(number, message + ' (nomor telah disalin)');
}

// ==================== DONATION FUNCTIONS ====================
function quickDonate() {
    const amount = document.getElementById('quickDonationAmount')?.value;
    
    if (!amount || amount < 10000) {
        showNotification('Minimal donasi Rp 10.000', 'error');
        return;
    }
    
    const donorAmount = document.getElementById('donorAmount');
    if (donorAmount) donorAmount.value = amount;
    showDonationModal();
}

function submitDonation(event) {
    event.preventDefault();
    const name = document.getElementById('donorName')?.value;
    const amount = parseInt(document.getElementById('donorAmount')?.value);
    const message = document.getElementById('donorMessage')?.value;
    if (!name || !amount) return;
    // Kirim donasi ke Firebase agar real-time
    firebase.database().ref('donations').push({
        name,
        amount,
        message,
        timestamp: Date.now()
    });
    hideDonationModal();
    showNotification('Terima kasih atas donasinya!', 'success');
    document.getElementById('donationForm')?.reset();
}

// Ambil donasi real-time dari Firebase
function listenDonationsRealtime() {
    const list = document.getElementById('donationList');
    if (!list) return;
    firebase.database().ref('donations').orderByChild('timestamp').limitToLast(10)
        .on('value', function(snapshot) {
            list.innerHTML = '';
            const arr = [];
            snapshot.forEach(child => arr.push(child.val()));
            arr.reverse().forEach(donation => {
                addDonationToList(donation.name, donation.amount, donation.message);
            });
        });
}

// ==================== RSVP FUNCTIONS ====================
function submitRSVP(event) {
    event.preventDefault();
    const name = document.getElementById('rsvpName')?.value;
    const guests = document.getElementById('rsvpGuests')?.value;
    const status = document.getElementById('rsvpStatus')?.value;
    const message = document.getElementById('rsvpMessage')?.value;
    if (!name || !guests || !status) {
        showNotification('Mohon lengkapi data', 'error');
        return;
    }
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Mengirim...';
    submitBtn.disabled = true;
    // Kirim ucapan ke Firebase agar real-time
    firebase.database().ref('ucapan').push({
        name,
        message,
        timestamp: Date.now()
    });
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showNotification('Terima kasih atas konfirmasinya!', 'success');
        // Tampilkan status kehadiran tamu
        var statusResult = document.getElementById('rsvpStatusResult');
        if (statusResult) {
            let statusText = '';
            if (status === 'hadir') statusText = 'Anda akan HADIR pada acara.';
            else if (status === 'tidak') statusText = 'Anda TIDAK dapat hadir.';
            else if (status === 'ragu') statusText = 'Anda MASIH RAGU untuk hadir.';
            statusResult.textContent = statusText;
            statusResult.style.display = 'block';
        }
        event.target.reset();
    }, 1000);
}

// Ambil ucapan real-time dari Firebase
function listenUcapanRealtime() {
    const ucapanList = document.getElementById('ucapanKerabatList');
    if (!ucapanList) return;
    firebase.database().ref('ucapan').orderByChild('timestamp').limitToLast(10)
        .on('value', function(snapshot) {
            ucapanList.innerHTML = '';
            const arr = [];
            snapshot.forEach(child => arr.push(child.val()));
            arr.reverse().forEach(ucapan => {
                var ucapanDiv = document.createElement('div');
                ucapanDiv.className = 'glass-card rounded-xl p-4 md:p-6 text-left highlight-new';
                ucapanDiv.innerHTML = `
                    <i class="fas fa-quote-left text-[#D4AF37] mb-2"></i>
                    <p class="italic text-gray-300 text-sm md:text-base mb-4">${ucapan.message ? '"' + ucapan.message + '"' : ''}</p>
                    <p class="text-[#D4AF37] font-semibold">- ${ucapan.name}</p>
                `;
                ucapanList.appendChild(ucapanDiv);
                setTimeout(() => ucapanDiv.classList.remove('highlight-new'), 2000);
            });
            ucapanList.scrollTop = 0;
        });
}

// ==================== UTILITY FUNCTIONS ====================
function generateStars(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(star);
    }
}

function showNotification(message, type) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// ==================== INTERSECTION OBSERVER ====================
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.3 });
    
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// ==================== EVENT LISTENERS ====================
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.min-h-screen');
    if (heroSection) {
        heroSection.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
    
    const scrollTop = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
});

window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideLocationModal();
        hideDonationModal();
    }
});

document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
});

// ==================== GALERI & LIVE PHOTO ====================
if (typeof firebase !== 'undefined') {
    // Upload foto
    const uploadForm = document.getElementById('uploadPhotoForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('photoInput');
            const captionInput = document.getElementById('photoCaption');
            const file = fileInput.files[0];
            if (!file) return showNotification('Pilih foto terlebih dahulu!', 'error');
            const fileName = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const storageRef = firebase.storage().ref('gallery/' + fileName);
            const uploadTask = storageRef.put(file);
            uploadTask.on('state_changed', null, function(error) {
                showNotification('Upload gagal: ' + error.message, 'error');
            }, function() {
                uploadTask.snapshot.ref.getDownloadURL().then(function(url) {
                    firebase.database().ref('gallery').push({
                        url,
                        caption: captionInput.value,
                        timestamp: Date.now()
                    });
                    showNotification('Foto berhasil diupload!', 'success');
                    fileInput.value = '';
                    captionInput.value = '';
                });
            });
        });
    }
    // Tampilkan galeri real-time
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
        firebase.database().ref('gallery').orderByChild('timestamp').limitToLast(24)
            .on('value', function(snapshot) {
                galleryGrid.innerHTML = '';
                const arr = [];
                snapshot.forEach(child => arr.push(child.val()));
                arr.reverse().forEach(photo => {
                    const div = document.createElement('div');
                    div.className = 'rounded-lg overflow-hidden shadow-lg bg-white/10 border border-[#D4AF37]/30';
                    div.innerHTML = `<img src="${photo.url}" alt="foto tamu" class="w-full h-32 md:h-40 object-cover"><div class="p-2 text-xs text-white text-center">${photo.caption || ''}</div>`;
                    galleryGrid.appendChild(div);
                });
            });
    }
}