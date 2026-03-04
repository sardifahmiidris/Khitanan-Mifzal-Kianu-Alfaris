// ==================== GLOBAL VARIABLES ====================
const messageTemplates = {
    formal: {
        title: 'Dengan hormat,',
        body: 'Kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara Khitanan putra kami:',
        closing: 'Atas kehadiran dan doa restunya, kami ucapkan terima kasih.'
    },
    santai: {
        title: 'Hai,',
        body: 'Yuk meramaikan acara Khitanan adik kita:',
        closing: 'Sampai ketemu di acaranya ya!'
    },
    islami: {
        title: 'Bismillahirrahmanirrahim,',
        body: 'Dengan memohon ridho Allah SWT, kami mengundang untuk menghadiri acara Khitanan putra kami:',
        closing: 'Semoga kehadiran dan doa restunya menjadi berkah. Jazakumullah khairan.'
    }
};

// ==================== UTILITY FUNCTIONS ====================
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

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

function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ==================== STORAGE FUNCTIONS ====================
function getStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        return [];
    }
}

function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getGuests() {
    return getStorage('guests');
}

function saveGuests(guests) {
    setStorage('guests', guests);
}

function getGeneratedHistory() {
    return getStorage('generatedHistory');
}

// ==================== SAMPLE DATA ====================
function loadSampleData() {
    const guests = getGuests();
    if (guests.length === 0) {
        const sampleGuests = [
            { id: generateId(), nama: 'Budi Santoso', wa: '081234567890', status: 'pending', createdAt: new Date().toISOString(), linkTerkirim: false },
            { id: generateId(), nama: 'Siti Aminah', wa: '081298765432', status: 'hadir', createdAt: new Date().toISOString(), linkTerkirim: true },
            { id: generateId(), nama: 'Ahmad Hidayat', wa: '081234556677', status: 'tidak', createdAt: new Date().toISOString(), linkTerkirim: false }
        ];
        setStorage('guests', sampleGuests);
    }
}

// ==================== DASHBOARD FUNCTIONS ====================
function loadDashboardStats() {
    const guests = getGuests();
    document.getElementById('total-tamu').textContent = guests.length;
    document.getElementById('total-hadir').textContent = guests.filter(g => g.status === 'hadir').length;
    document.getElementById('total-tidak-hadir').textContent = guests.filter(g => g.status === 'tidak').length;
    document.getElementById('total-terkirim').textContent = guests.filter(g => g.linkTerkirim).length;
}

function loadRecentGuests() {
    const guests = getGuests().slice(0, 5);
    const tbody = document.getElementById('recent-guests-table');
    if (!tbody) return;
    
    if (guests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Belum ada data tamu. <button onclick="openTamuModal()" class="text-green-600 hover:text-green-700 font-medium">Tambah sekarang</button></td></tr>';
        return;
    }
    
    tbody.innerHTML = guests.map(guest => {
        const statusClass = guest.status === 'hadir' ? 'badge-hadir' : guest.status === 'tidak' ? 'badge-tidak' : 'badge-pending';
        return `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">${escapeHtml(guest.nama)}</td>
            <td class="px-6 py-4">${guest.wa || '-'}</td>
            <td class="px-6 py-4"><span class="${statusClass}">${guest.status}</span></td>
            <td class="px-6 py-4">
                <button onclick="editTamu('${guest.id}')" class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTamu('${guest.id}')" class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== NAVIGATION FUNCTIONS ====================

// Fungsi untuk tombol update realtime (refresh data dashboard)
function refreshData() {
    loadDashboardStats();
    loadRecentGuests();
    loadCrudTable();
    loadGuestSelect();
    loadHistory();
    showNotification('Data berhasil di-refresh!', 'success');
}
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
        if (sectionId === 'dashboard') {
            loadDashboardStats();
            loadRecentGuests();
        } else if (sectionId === 'tamu') {
            loadCrudTable();
        } else if (sectionId === 'generator') {
            loadGuestSelect();
            loadHistory();
        }
    }
}

function updateActiveNav(sectionId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('text-green-600', 'font-semibold');
        link.classList.add('text-gray-600');
        if (link.dataset.section === sectionId) {
            link.classList.remove('text-gray-600');
            link.classList.add('text-green-600', 'font-semibold');
        }
    });
}

// ==================== CRUD FUNCTIONS ====================
function openTamuModal(id = null) {
    const modal = document.getElementById('tamuModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (id) {
        document.getElementById('modal-title').textContent = 'Edit Tamu';
        const guest = getGuests().find(g => g.id === id);
        if (guest) {
            document.getElementById('tamu-id').value = guest.id;
            document.getElementById('nama').value = guest.nama;
            document.getElementById('wa').value = guest.wa || '';
            document.getElementById('status').value = guest.status;
        }
    } else {
        document.getElementById('modal-title').textContent = 'Tambah Tamu';
        document.getElementById('tamuForm').reset();
        document.getElementById('tamu-id').value = '';
    }
}

function closeTamuModal() {
    const modal = document.getElementById('tamuModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function saveTamu(e) {
    e.preventDefault();
    const id = document.getElementById('tamu-id').value;
    const nama = document.getElementById('nama').value.trim();
    const wa = document.getElementById('wa').value.trim();
    const status = document.getElementById('status').value;

    if (!nama) {
        showNotification('Nama harus diisi!', 'error');
        return;
    }

    const guests = getGuests();

    if (id) {
        const index = guests.findIndex(g => g.id === id);
        if (index !== -1) {
            guests[index] = { ...guests[index], nama, wa, status };
            showNotification('Data tamu berhasil diupdate!', 'success');
        }
    } else {
        guests.push({
            id: generateId(),
            nama, wa, status,
            createdAt: new Date().toISOString(),
            linkTerkirim: false
        });
        showNotification('Data tamu berhasil ditambahkan!', 'success');
    }

    saveGuests(guests);
    closeTamuModal();
    loadCrudTable();
    loadDashboardStats();
    loadRecentGuests();
    loadGuestSelect();
}

function editTamu(id) {
    openTamuModal(id);
}

function deleteTamu(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        let guests = getGuests().filter(g => g.id !== id);
        saveGuests(guests);
        loadCrudTable();
        loadDashboardStats();
        loadRecentGuests();
        loadGuestSelect();
        showNotification('Data tamu berhasil dihapus!', 'success');
    }
}

function generateGuestLink(nama, id) {
    const slug = nama.toLowerCase().replace(/\s+/g, '-') + '-' + id.slice(-6);
    // Hardcode base agar selalu benar ke GitHub Pages
    const base = 'https://sardifahmiidris.github.io/Khitanan-Mifzal-Kianu-Alfaris/undangan-khitan/';
    return base + 'undangan.html?nama=' + encodeURIComponent(slug);
}

function copyGuestLink(link) {
    copyToClipboard(link, 'Link undangan berhasil disalin!');
}

function sendWA(id) {
    const guest = getGuests().find(g => g.id === id);
    if (guest?.wa) {
        const link = generateGuestLink(guest.nama, guest.id);
        const message = `Assalamualaikum *${guest.nama}*, \n\nKami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara Khitanan anak kami:\n\n📅 Hari/Tanggal: Sabtu, 15 Juni 2024\n🕐 Waktu: 08.00 - Selesai\n📍 Lokasi: Gedung Serbaguna Al-Mubarak, Jl. Khitan No. 123, Jakarta\n\nLink undangan digital: ${link}\n\nMohon konfirmasi kehadiran melalui link di atas.\n\nJazakumullah khairan katsiran 🙏`;
        window.open(`https://wa.me/${guest.wa.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        guest.linkTerkirim = true;
        saveGuests(getGuests());
        loadDashboardStats();
    } else {
        showNotification('Nomor WhatsApp tidak tersedia!', 'error');
    }
}

function loadCrudTable() {
    const guests = getGuests();
    const tbody = document.getElementById('crud-table-body');
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const filterStatus = document.getElementById('filter-status')?.value || 'all';

    let filtered = guests.filter(g => 
        (g.nama.toLowerCase().includes(searchTerm) || (g.wa && g.wa.includes(searchTerm))) &&
        (filterStatus === 'all' || g.status === filterStatus)
    );

    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Tidak ada data tamu</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map((guest, index) => {
        const link = generateGuestLink(guest.nama, guest.id);
        const statusClass = guest.status === 'hadir' ? 'badge-hadir' : guest.status === 'tidak' ? 'badge-tidak' : 'badge-pending';
        return `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">${index + 1}</td>
            <td class="px-6 py-4 font-medium">${escapeHtml(guest.nama)}</td>
            <td class="px-6 py-4">${guest.wa || '-'}</td>
            <td class="px-6 py-4"><span class="${statusClass}">${guest.status}</span></td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <input type="text" value="${link}" readonly class="text-sm bg-gray-50 px-2 py-1 rounded border w-32 md:w-48">
                    <button onclick="copyGuestLink('${link}')" class="text-blue-600 hover:text-blue-800"><i class="fas fa-copy"></i></button>
                </div>
            </td>
            <td class="px-6 py-4">
                <button onclick="editTamu('${guest.id}')" class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTamu('${guest.id}')" class="text-red-600 hover:text-red-800 mr-2"><i class="fas fa-trash"></i></button>
                <button onclick="sendWA('${guest.id}')" class="text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// ==================== GENERATOR FUNCTIONS ====================
function loadGuestSelect() {
    const select = document.getElementById('guest-select');
    if (!select) return;
    const guests = getGuests();
    select.innerHTML = guests.length ? '<option value="">Pilih tamu...</option>' + 
        guests.map(g => `<option value="${g.id}">${escapeHtml(g.nama)} (${g.wa || 'no WA'})</option>`).join('') :
        '<option value="">Belum ada tamu. Tambah tamu dulu</option>';
}

function generateInvitation(guest, template) {
    const link = generateGuestLink(guest.nama, guest.id);
    document.getElementById('generated-link').value = link;
    
    const tpl = messageTemplates[template];
    document.getElementById('invitation-preview').innerHTML = `
        <div class="space-y-3 text-sm">
            <p class="text-gray-600">${tpl.title}</p>
            <p class="font-semibold text-green-700">${escapeHtml(guest.nama)}</p>
            <p class="text-gray-600">${tpl.body}</p>
            <div class="bg-green-50 p-3 rounded-lg border border-green-200">
                <p class="text-sm"><span class="font-semibold">📅 Hari/Tanggal:</span> Sabtu, 15 Juni 2024</p>
                <p class="text-sm"><span class="font-semibold">🕐 Waktu:</span> 08.00 - Selesai</p>
                <p class="text-sm"><span class="font-semibold">📍 Lokasi:</span> Gedung Serbaguna Al-Mubarak, Jl. Khitan No. 123, Jakarta</p>
            </div>
            <p class="text-gray-600">${tpl.closing}</p>
            <div class="mt-3 pt-3 border-t border-gray-200"><p class="text-xs text-gray-500 break-all">Link: ${link}</p></div>
        </div>
    `;

    const history = getGeneratedHistory();
    history.unshift({ id: generateId(), nama: guest.nama, wa: guest.wa, link, template, tanggal: new Date().toISOString(), status: 'pending' });
    if (history.length > 20) history.pop();
    setStorage('generatedHistory', history);
    loadHistory();
    showNotification('Link undangan berhasil digenerate!', 'success');
}

function copyGeneratedLink() {
    const link = document.getElementById('generated-link')?.value;
    link ? copyToClipboard(link, 'Link undangan berhasil disalin!') : showNotification('Generate link terlebih dahulu!', 'error');
}

function shareViaWA() {
    const link = document.getElementById('generated-link')?.value;
    const guestId = document.getElementById('guest-select')?.value;
    if (!link || !guestId) return showNotification('Generate link terlebih dahulu!', 'error');
    
    const guest = getGuests().find(g => g.id === guestId);
    if (!guest?.wa) return showNotification('Nomor WhatsApp tidak tersedia!', 'error');
    
    const message = `Assalamualaikum *${guest.nama}*, \n\nBerikut adalah link undangan digital Khitanan:\n\n${link}\n\nMohon konfirmasi kehadiran melalui link di atas.\n\nTerima kasih 🙏`;
    window.open(`https://wa.me/${guest.wa.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    
    const history = getGeneratedHistory().find(h => h.link === link);
    if (history) { history.status = 'terkirim'; setStorage('generatedHistory', getGeneratedHistory()); loadHistory(); }
}

function loadHistory() {
    const history = getGeneratedHistory();
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;
    
    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Belum ada riwayat generate</td></tr>';
        return;
    }

    tbody.innerHTML = history.slice(0, 10).map(item => `
        <tr>
            <td class="px-6 py-4">${formatDate(item.tanggal)}</td>
            <td class="px-6 py-4 font-medium">${escapeHtml(item.nama)}</td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <input type="text" value="${item.link}" readonly class="text-sm bg-gray-50 px-2 py-1 rounded border w-32 md:w-48">
                    <button onclick="copyToClipboard('${item.link}', 'Link disalin!')" class="text-blue-600 hover:text-blue-800"><i class="fas fa-copy"></i></button>
                </div>
            </td>
            <td class="px-6 py-4"><span class="${item.status === 'terkirim' ? 'badge-hadir' : 'badge-pending'}">${item.status}</span></td>
            <td class="px-6 py-4">
                <button onclick="shareWAFromHistory('${item.id}')" class="text-green-600 hover:text-green-800 mr-2"><i class="fab fa-whatsapp"></i></button>
                <button onclick="deleteHistory('${item.id}')" class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function shareWAFromHistory(id) {
    const item = getGeneratedHistory().find(h => h.id === id);
    if (!item?.wa) return showNotification('Nomor WhatsApp tidak tersedia!', 'error');
    
    const message = `Assalamualaikum *${item.nama}*, \n\nBerikut adalah link undangan digital Khitanan:\n\n${item.link}\n\nMohon konfirmasi kehadiran melalui link di atas.\n\nTerima kasih 🙏`;
    window.open(`https://wa.me/${item.wa.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    
    item.status = 'terkirim';
    setStorage('generatedHistory', getGeneratedHistory());
    loadHistory();
}

function deleteHistory(id) {
    if (confirm('Hapus dari riwayat?')) {
        setStorage('generatedHistory', getGeneratedHistory().filter(h => h.id !== id));
        loadHistory();
        showNotification('Riwayat dihapus!', 'success');
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel loaded');
    
    loadSampleData();
    
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            showSection(sectionId);
            updateActiveNav(sectionId);
            if (mobileMenu) mobileMenu.classList.add('hidden');
        });
    });

    document.getElementById('tamuForm').addEventListener('submit', saveTamu);
    
    document.getElementById('generator-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const guestId = document.getElementById('guest-select').value;
        const template = document.getElementById('message-template').value;
        if (!guestId) return showNotification('Pilih tamu terlebih dahulu!', 'error');
        const guest = getGuests().find(g => g.id === guestId);
        if (guest) generateInvitation(guest, template);
    });

    document.getElementById('search-input')?.addEventListener('input', debounce(loadCrudTable, 300));
    document.getElementById('filter-status')?.addEventListener('change', loadCrudTable);

    showSection('dashboard');
    updateActiveNav('dashboard');
});