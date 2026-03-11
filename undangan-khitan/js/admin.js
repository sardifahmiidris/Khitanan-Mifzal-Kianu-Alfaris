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
    alert('copyToClipboard called!');
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

    // Statistik donasi & ucapan dari Firebase
    loadFirebaseStats();
    loadUcapanDonasiTable();
}

// Tampilkan data ucapan & donasi dari tamu di dashboard
function loadUcapanDonasiTable() {
    if (typeof firebase === 'undefined') return;
    const tbody = document.getElementById('ucapan-donasi-table');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">Memuat data...</td></tr>';

    // Ambil data donasi
    firebase.database().ref('donations').orderByChild('timestamp').limitToLast(20).on('value', function(donasiSnap) {
        // Ambil data ucapan
        firebase.database().ref('ucapan').orderByChild('timestamp').limitToLast(20).once('value', function(ucapanSnap) {
            let rows = [];
            // Hanya tampilkan data dari form donasi (donations)
            donasiSnap.forEach(child => {
                const val = child.val();
                rows.push({
                    nama: val.name || '-',
                    ucapan: val.message || '-',
                    donasi: val.amount ? 'Rp ' + parseInt(val.amount).toLocaleString('id-ID') : '-',
                    status: val.amount && val.message ? 'Donasi & Ucapan' : val.amount ? 'Donasi' : 'Ucapan',
                    attendance: val.attendance || '-',
                    attendanceCount: val.attendanceCount || '-',
                    paymentMethod: val.paymentMethod || '-',
                    key: child.key,
                    tipe: 'donasi'
                });
            });
            tbody.innerHTML = rows.length > 0 ? rows.map(val =>
                `<tr>
                    <td class='px-4 md:px-6 py-4 font-medium'>${val.nama}</td>
                    <td class='px-4 md:px-6 py-4'>${val.ucapan}</td>
                    <td class='px-4 md:px-6 py-4 text-green-600 font-bold'>${val.donasi}</td>
                    <td class='px-4 md:px-6 py-4'>${val.status}</td>
                    <td class='px-4 md:px-6 py-4'>${val.paymentMethod || '-'}</td>
                    <td class='px-4 md:px-6 py-4'>${val.attendanceCount && !isNaN(val.attendanceCount) ? val.attendanceCount : '-'}</td>
                    <td class='px-4 md:px-6 py-4'>${val.attendance || '-'}</td>
                    <td class='px-4 md:px-6 py-4'>
                        <button onclick="deleteUcapanDonasi('${val.key}','${val.tipe}')" class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`
            ).join('') : '<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">Belum ada data donasi/ucapan.</td></tr>';

        });
    });
}

// Fungsi hapus ucapan/donasi
function deleteUcapanDonasi(key, tipe) {
    if (confirm('Hapus data ini?')) {
        if (typeof firebase !== 'undefined') {
            firebase.database().ref(tipe === 'donasi' ? 'donations/' + key : 'ucapan/' + key).remove();
        }
    }
}

// Ambil statistik donasi & ucapan dari Firebase
function loadFirebaseStats() {
    // Pastikan Firebase sudah di-load di index.html
    if (typeof firebase === 'undefined') return;
    // Total Donasi
    firebase.database().ref('donations').on('value', function(snapshot) {
        let total = 0;
        snapshot.forEach(child => {
            const val = child.val();
            if (val.amount) total += parseInt(val.amount);
        });
        document.getElementById('total-donasi').textContent = 'Rp ' + total.toLocaleString('id-ID');
    });
    // Jumlah Ucapan
    firebase.database().ref('ucapan').on('value', function(snapshot) {
        let count = 0;
        snapshot.forEach(() => count++);
        document.getElementById('total-ucapan').textContent = count;
    });
}

// Notifikasi real-time donasi & ucapan baru
if (typeof firebase !== 'undefined') {
    let lastDonationKey = null;
    let lastUcapanKey = null;
    // Donasi
    firebase.database().ref('donations').limitToLast(1).on('child_added', function(snapshot) {
        if (lastDonationKey && snapshot.key !== lastDonationKey) {
            const d = snapshot.val();
            showNotification(`Donasi baru dari ${d.name} sejumlah Rp ${parseInt(d.amount).toLocaleString('id-ID')}`, 'success');
        }
        lastDonationKey = snapshot.key;
    });
    // Ucapan
    firebase.database().ref('ucapan').limitToLast(1).on('child_added', function(snapshot) {
        if (lastUcapanKey && snapshot.key !== lastUcapanKey) {
            const u = snapshot.val();
            showNotification(`Ucapan baru dari ${u.name}`, 'info');
        }
        lastUcapanKey = snapshot.key;
    });
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
        // Jumlah kehadiran (default 1 jika tidak ada field, bisa diubah sesuai kebutuhan)
        const jumlahKehadiran = guest.jumlahKehadiran !== undefined ? guest.jumlahKehadiran : 1;
        // Konfirmasi kehadiran
        let konfirmasi = '-';
        if (guest.status === 'hadir') konfirmasi = 'Hadir';
        else if (guest.status === 'tidak') konfirmasi = 'Tidak Hadir';
        else konfirmasi = 'Masih Ragu';
        return `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">${escapeHtml(guest.nama)}</td>
            <td class="px-6 py-4">${guest.wa || '-'}</td>
            <td class="px-6 py-4">${jumlahKehadiran}</td>
            <td class="px-6 py-4"><span class="${statusClass}">${konfirmasi}</span></td>
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
    // Pastikan fungsi refreshData global agar bisa dipanggil dari onclick HTML
    window.refreshData = refreshData;
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

    if (typeof firebase !== 'undefined') {
        if (id) {
            // Update tamu di Firebase
            firebase.database().ref('guests/' + id).update({ nama, wa, status });
            showNotification('Data tamu berhasil diupdate!', 'success');
        } else {
            // Tambah tamu baru ke Firebase
            const newRef = firebase.database().ref('guests').push();
            newRef.set({ nama, wa, status, createdAt: new Date().toISOString(), linkTerkirim: false });
            showNotification('Data tamu berhasil ditambahkan!', 'success');
        }
    } else {
        // Fallback localStorage
        if (id) {
            const index = guests.findIndex(g => g.id === id);
            if (index !== -1) {
                guests[index] = { ...guests[index], nama, wa, status };
            }
        } else {
            guests.push({
                id: generateId(),
                nama, wa, status,
                createdAt: new Date().toISOString(),
                linkTerkirim: false
            });
        }
        saveGuests(guests);
    }
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
        if (typeof firebase !== 'undefined') {
            firebase.database().ref('guests/' + id).remove();
        } else {
            let guests = getGuests().filter(g => g.id !== id);
            saveGuests(guests);
        }
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
    copyToClipboard(link, 'Salin Link');
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
    link ? copyToClipboard(link, 'Salin Link') : showNotification('Generate link terlebih dahulu!', 'error');
}

function shareViaWA() {
    const link = document.getElementById('generated-link')?.value;
    const guestId = document.getElementById('guest-select')?.value;
    if (!link || !guestId) return showNotification('Generate link terlebih dahulu!', 'error');
    
    const guest = getGuests().find(g => g.id === guestId);
    if (!guest?.wa) return showNotification('Nomor WhatsApp tidak tersedia!', 'error');
    
    // Format pesan WA agar pasti muncul di kolom ketik
    const message = [
        `Assalamualaikum ${guest.nama},`,
        '',
        'Kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara Khitanan:',
        '',
        `Link undangan: ${link}`,
        '',
        'Mohon konfirmasi kehadiran melalui link di atas.',
        '',
        'Terima kasih.'
    ].join('\n');
    const waUrl = `https://wa.me/${guest.wa.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    
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

    // Real-time sync tamu dari Firebase jika ada (misal: node 'guests')
    if (typeof firebase !== 'undefined') {
        firebase.database().ref('guests').on('value', function(snapshot) {
            const guests = [];
            snapshot.forEach(child => {
                const val = child.val();
                guests.push({
                    id: child.key,
                    nama: val.nama,
                    wa: val.wa,
                    status: val.status,
                    createdAt: val.createdAt || '',
                    linkTerkirim: val.linkTerkirim || false
                });
            });
            setStorage('guests', guests);
            loadDashboardStats();
            loadCrudTable();
            loadRecentGuests();
            loadGuestSelect();
        });
        // Real-time ucapan (update tabel ucapan & donasi di dashboard)
        firebase.database().ref('ucapan').on('value', function(snapshot) {
            loadUcapanDonasiTable();
            loadFirebaseStats();
        });
    }

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });
        // Optional: close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth < 640 && mobileMenu && !mobileMenu.classList.contains('hidden')) {
                if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    }

    // Event nav-link desktop & mobile
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            if (sectionId) {
                showSection(sectionId);
                updateActiveNav(sectionId);
            }
            // Tutup mobile menu jika ada
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && window.innerWidth < 640) mobileMenu.classList.add('hidden');
        });
    });

    var tamuForm = document.getElementById('tamuForm');
    if (tamuForm) {
        tamuForm.addEventListener('submit', saveTamu);
    }

    var generatorForm = document.getElementById('generator-form');
    if (generatorForm) {
        generatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const guestId = document.getElementById('guest-select').value;
            const template = document.getElementById('message-template').value;
            if (!guestId) return showNotification('Pilih tamu terlebih dahulu!', 'error');
            const guest = getGuests().find(g => g.id === guestId);
            if (guest) generateInvitation(guest, template);
        });
    }

    document.getElementById('search-input')?.addEventListener('input', debounce(loadCrudTable, 300));
    document.getElementById('filter-status')?.addEventListener('change', loadCrudTable);

    showSection('dashboard');
    updateActiveNav('dashboard');
    // Export data global
    window.exportAllData = exportAllData;
});

// Export data tamu, donasi, ucapan ke CSV
async function exportAllData() {
    // Gabungkan data tamu dan donasi ke satu file
    let csvGabungan = 'Nama,WA,Status,LinkTerkirim,Ucapan,Nominal Donasi,Metode Pembayaran,Jumlah Hadir\n';
    // Buat map donasi berdasarkan nama (atau WA jika ingin lebih presisi)
    let donasiMap = {};
    if (typeof firebase !== 'undefined') {
        await new Promise(resolve => {
            firebase.database().ref('donations').once('value', function(snapshot) {
                snapshot.forEach(child => {
                    const d = child.val();
                    // Key bisa pakai nama saja, atau nama+wa jika ingin lebih presisi
                    const key = (d.name || '').toLowerCase().trim();
                    donasiMap[key] = d;
                });
                resolve();
            });
        });
    }
    const guests = getGuests();
    guests.forEach(g => {
        const key = (g.nama || '').toLowerCase().trim();
        const donasi = donasiMap[key] || {};
        // Data donasi
        let nominal = '-';
        if (donasi.amount !== undefined && donasi.amount !== null && donasi.amount !== '') {
            nominal = donasi.amount;
        } else if (donasi.amount === 0) {
            nominal = '0';
        }
        let ucapan = '-';
        if (donasi.message !== undefined && donasi.message !== null) {
            ucapan = donasi.message;
        }
        const metode = donasi.paymentMethod || '-';
        const jumlah = donasi.attendanceCount !== undefined && donasi.attendanceCount !== null && donasi.attendanceCount !== '' ? donasi.attendanceCount : '-';
        csvGabungan += `"${g.nama}","${g.wa}","${g.status}","${g.linkTerkirim ? 'Ya' : 'Tidak'}","${ucapan}","${nominal}","${metode}","${jumlah}"\n`;
    });
    downloadCSV(csvGabungan, 'data_tamu_donasi.csv');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}