import { showToast, showSuccessPopup } from './toast.js';

const API_URL = 'http://localhost:5001/api';
let user = null;
let addresses = [];
let selectedStarRating = 0;
const token = localStorage.getItem('dustyshelf_token'); // Or however the token is stored

// For now, if no backend token exists but dustyshelf_user exists, we might need a fallback,
// but the prompt explicitly asked for API integration.
if (!token) {
    // If you are migrating from Firebase Auth to Backend Auth, you might need to login again.
    // window.location.href = 'login.html';
}

const mainEl = document.querySelector('main');

function initDashboard() {
    // START with page visible and interactive
    mainEl.style.opacity = '1';
    mainEl.style.pointerEvents = 'auto';

    // ── Tab Navigation ──────────────────────────────────────────────────────────
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
                b.classList.add('text-clay');
            });
            btn.classList.add('active');
            btn.classList.remove('text-clay');

            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    // ── Logout ──────────────────────────────────────────────────────────────────
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        // Optional: Call backend logout API
        try {
            if (token) {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (e) {
            console.error('Backend logout failed', e);
        }

        localStorage.removeItem('dustyshelf_token');
        localStorage.removeItem('dustyshelf_user');
        window.location.href = 'login.html';
    });

    // ── Save Profile Button ────────────────────────────────────────────────────
    document.getElementById('saveProfileBtn').addEventListener('click', async () => {
        const name = document.getElementById('edit-name').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();

        if (!name) {
            showToast('Please enter your full name', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, phone })
            });

            const data = await response.json();
            if (data.success) {
                user.name = name;
                user.phone = phone;
                localStorage.setItem('dustyshelf_user', JSON.stringify(user));
                showSuccessPopup('Profile Updated', 'Your changes have been saved successfully!');
            } else {
                showToast(data.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            showToast('Failed to save profile. Please try again.', 'error');
        }
    });

    // ── Add Address Button ────────────────────────────────────────────────────
    document.getElementById('addAddressBtn').addEventListener('click', () => {
        document.getElementById('address-form').classList.remove('hidden');
        document.getElementById('addAddressBtn').style.display = 'none';
        clearAddressForm();
    });

    // ── Cancel Address Button ───────────────────────────────────────────────
    document.getElementById('cancelAddrBtn').addEventListener('click', () => {
        document.getElementById('address-form').classList.add('hidden');
        document.getElementById('addAddressBtn').style.display = 'block';
        clearAddressForm();
    });

    // ── Save Address Button ────────────────────────────────────────────────
    document.getElementById('saveAddrBtn').addEventListener('click', async () => {
        const label = document.getElementById('addr-label').value.trim();
        const phone = document.getElementById('addr-phone').value.trim();
        const fullAddress = document.getElementById('addr-full').value.trim();
        const city = document.getElementById('addr-city').value.trim();
        const pincode = document.getElementById('addr-pincode').value.trim();

        if (!label || !phone || !fullAddress || !city || !pincode) {
            showToast('Please fill all address fields', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/addresses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    label,
                    phone,
                    fullAddress,
                    city,
                    pincode
                })
            });

            const data = await response.json();
            if (data.success) {
                addresses.push(data.address);
                renderAddresses();
                document.getElementById('address-form').classList.add('hidden');
                document.getElementById('addAddressBtn').style.display = 'block';
                clearAddressForm();
                showToast('Address added successfully', 'success');
            } else {
                showToast(data.message || 'Failed to add address', 'error');
            }
        } catch (error) {
            console.error('Failed to save address:', error);
            showToast('Failed to save address. Please try again.', 'error');
        }
    });

    // ── Star Rating for Reviews ────────────────────────────────────────────
    document.querySelectorAll('#star-rating span').forEach(star => {
        star.addEventListener('click', () => {
            selectedStarRating = parseInt(star.dataset.star);
            document.querySelectorAll('#star-rating span').forEach(s => {
                s.classList.remove('text-gold');
                s.classList.add('text-gray-300');
            });
            for (let i = 1; i <= selectedStarRating; i++) {
                document.querySelector(`#star-rating span[data-star="${i}"]`).classList.add('text-gold');
                document.querySelector(`#star-rating span[data-star="${i}"]`).classList.remove('text-gray-300');
            }
        });
    });

    loadProfile();
}

async function loadProfile() {
    try {
        if (!token) {
            // Fallback for demo purposes if backend isn't fully integrated with login.html yet
            const cachedUser = JSON.parse(localStorage.getItem('dustyshelf_user'));
            if (cachedUser) {
                user = cachedUser;
                populateProfileUI();
                loadOrdersFallback();
                loadAddressesFallback();
                return;
            }
            throw new Error('No token found');
        }

        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success && data.user) {
            user = data.user;
            populateProfileUI();
            loadOrders();
            loadAddresses();
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
        // Try fallback with cached user
        const cachedUser = JSON.parse(localStorage.getItem('dustyshelf_user'));
        if (cachedUser) {
            user = cachedUser;
            populateProfileUI();
            loadOrdersFallback();
            loadAddressesFallback();
        } else {
            showToast('Failed to load user profile. Please login again.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }
}

function populateProfileUI() {
    const avatarEl = document.getElementById('profile-avatar');
    if (user.image) {
        avatarEl.src = user.image;
        avatarEl.style.display = 'block';
        avatarEl.parentElement.textContent = '';
        avatarEl.parentElement.appendChild(avatarEl);
    } else {
        avatarEl.style.display = 'none';
        avatarEl.parentElement.textContent = (user.name || 'U')[0].toUpperCase();
    }

    document.getElementById('profile-greeting').textContent = `Hello, ${user.name}`;
    document.getElementById('profile-email').textContent = user.email;

    // Set member since date
    const createdAt = user.createdAt || new Date().toISOString();
    const date = new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('profile-since').textContent = `Member since ${date}`;

    // Fill form fields
    document.getElementById('edit-name').value = user.name || '';
    document.getElementById('edit-phone').value = user.phone || '';
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-role').value = user.role === 'admin' ? 'Admin' : 'Customer';

    // ENSURE page is fully visible and interactive
    mainEl.style.opacity = '1';
    mainEl.style.pointerEvents = 'auto';
    mainEl.style.transition = 'opacity 0.3s ease';
}

async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders/my-orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        document.getElementById('orders-loading').style.display = 'none';

        if (data.success && data.orders && data.orders.length > 0) {
            renderOrders(data.orders);
        } else {
            document.getElementById('orders-empty').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
        document.getElementById('orders-loading').style.display = 'none';
        document.getElementById('orders-empty').classList.remove('hidden');
    }
}

function loadOrdersFallback() {
    // If backend isn't ready, just show empty
    document.getElementById('orders-loading').style.display = 'none';
    document.getElementById('orders-empty').classList.remove('hidden');
}

async function loadAddresses() {
    try {
        const response = await fetch(`${API_URL}/addresses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.addresses && data.addresses.length > 0) {
            addresses = data.addresses;
            renderAddresses();
        } else {
            document.getElementById('addresses-empty').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Failed to load addresses:', error);
        document.getElementById('addresses-empty').classList.remove('hidden');
    }
}

function loadAddressesFallback() {
    document.getElementById('addresses-empty').classList.remove('hidden');
}

function renderAddresses() {
    const list = document.getElementById('addresses-list');
    const emptyEl = document.getElementById('addresses-empty');

    if (addresses.length === 0) {
        emptyEl.classList.remove('hidden');
        list.innerHTML = '';
        return;
    }

    emptyEl.classList.add('hidden');
    list.innerHTML = addresses.map(addr => `
        <div class="bg-white rounded-3xl border border-gray-100 p-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="font-bold text-forest text-sm mb-1">${addr.label || 'Address'}</h4>
                    <p class="text-clay text-xs mb-2">${addr.fullAddress || ''}</p>
                    <p class="text-clay text-xs mb-1">${addr.city || ''} - ${addr.pincode || ''}</p>
                    <p class="text-clay text-xs">📞 ${addr.phone || ''}</p>
                </div>
                <button class="text-red-400 hover:text-red-600 text-xs font-bold" onclick="deleteAddress('${addr.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteAddress(addressId) {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
        const response = await fetch(`${API_URL}/addresses/${addressId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            addresses = addresses.filter(a => a.id !== addressId);
            renderAddresses();
            showToast('Address deleted successfully', 'success');
        } else {
            showToast(data.message || 'Failed to delete address', 'error');
        }
    } catch (error) {
        console.error('Failed to delete address:', error);
        showToast('Failed to delete address', 'error');
    }
}

function clearAddressForm() {
    document.getElementById('addr-label').value = '';
    document.getElementById('addr-phone').value = '';
    document.getElementById('addr-full').value = '';
    document.getElementById('addr-city').value = '';
    document.getElementById('addr-pincode').value = '';
}

function renderOrders(orders) {
    const list = document.getElementById('orders-list');
    list.innerHTML = orders.map(o => {
        const date = new Date(o.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        const status = o.status || 'Pending';
        const statusClass = status === 'Delivered' ? 'status-delivered' : status === 'Shipped' ? 'status-shipped' : 'status-placed';

        return `
        <div class="order-card bg-white rounded-3xl border border-gray-100 p-6">
            <div class="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-clay mb-1">Order #${o.id.substring(0, 8)}</p>
                    <p class="text-xs text-clay">${date}</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs px-3 py-1 rounded-full font-bold capitalize ${statusClass}">${status}</span>
                    <span class="serif font-bold text-forest text-lg">&#8377;${o.totalAmount}</span>
                </div>
            </div>
            <div class="border-t border-gray-50 pt-4 space-y-2">
                ${(o.items || []).map(i => `
                    <div class="flex justify-between text-sm">
                        <span class="text-clay">${i.name || i.title || 'Book'} <span class="text-clay/50">&#215; ${i.quantity || i.qty || 1}</span></span>
                        <span class="font-bold">&#8377;${(i.price * (i.quantity || i.qty || 1)) || 0}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', initDashboard);
