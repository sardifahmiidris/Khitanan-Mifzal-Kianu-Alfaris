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
    
    // Check if URL has parameter to auto-open
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('open') === 'true') {
        setTimeout(openInvitation, 500);
    }
    
    // Initialize donation progress
    updateDonationProgress();
    
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
    
    addDonationToList(name, amount, message);
    updateTotalDonation(amount);
    
    hideDonationModal();
    showNotification('Terima kasih atas donasinya!', 'success');
    
    document.getElementById('donationForm')?.reset();
}

function addDonationToList(name, amount, message) {
    const list = document.getElementById('donationList');
    if (!list) return;
    
    const donationItem = document.createElement('div');
    donationItem.className = 'donation-item';
    
    const formattedAmount = new Intl.NumberFormat('id-ID').format(amount);
    
    donationItem.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <p class="text-white font-medium text-sm">${name}</p>
                <p class="text-[#D4AF37] text-xs">Rp ${formattedAmount}</p>
            </div>
            <p class="text-gray-400 text-[10px]">baru saja</p>
        </div>
        ${message ? `<p class="text-gray-400 text-xs mt-1">"${message}"</p>` : ''}
    `;
    
    list.insertBefore(donationItem, list.firstChild);
    
    if (list.children.length > 10) {
        list.removeChild(list.lastChild);
    }
}

function updateTotalDonation(amount) {
    totalDonation += amount;
    
    const totalEl = document.getElementById('totalDonation');
    const progressEl = document.getElementById('donationProgress');
    
    if (totalEl) {
        totalEl.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(totalDonation)}`;
    }
    
    const percentage = Math.min((totalDonation / targetDonation) * 100, 100);
    if (progressEl) {
        progressEl.style.width = `${percentage}%`;
    }
    
    if (percentage >= 100) {
        showNotification('Alhamdulillah! Target donasi tercapai!', 'success');
    }
}

function updateDonationProgress() {
    const percentage = (totalDonation / targetDonation) * 100;
    const progressEl = document.getElementById('donationProgress');
    if (progressEl) {
        progressEl.style.width = `${percentage}%`;
    }
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
        // Tambahkan ucapan ke daftar ucapan tamu
        var ucapanList = document.getElementById('ucapanKerabatList');
        if (ucapanList) {
            var ucapanDiv = document.createElement('div');
            ucapanDiv.className = 'glass-card rounded-xl p-4 md:p-6 text-left';
            ucapanDiv.innerHTML = `
                <i class="fas fa-quote-left text-[#D4AF37] mb-2"></i>
                <p class="italic text-gray-300 text-sm md:text-base mb-4">${message ? '"' + message + '"' : ''}</p>
                <p class="text-[#D4AF37] font-semibold">- ${name}</p>
            `;
            ucapanList.insertBefore(ucapanDiv, ucapanList.firstChild);
        }
        event.target.reset();
    }, 1000);
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