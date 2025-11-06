// API base URL
const API_BASE = '/api';

// DOM Elements
const tabContents = document.querySelectorAll('.tab-content');
const navButtons = document.querySelectorAll('.nav-btn');
const modals = document.querySelectorAll('.modal');
const closeButtons = document.querySelectorAll('.close');

// Current active tab
let activeTab = 'dashboard';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tab navigation
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Modal close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Form submissions
    document.getElementById('customer-form').addEventListener('submit', handleCustomerSubmit);
    document.getElementById('room-form').addEventListener('submit', handleRoomSubmit);
    document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);
    document.getElementById('payment-form').addEventListener('submit', handlePaymentSubmit);
    document.getElementById('staff-form').addEventListener('submit', handleStaffSubmit);

    // Add buttons
    document.getElementById('add-customer-btn').addEventListener('click', () => openModal('customer-modal'));
    document.getElementById('add-room-btn').addEventListener('click', () => openModal('room-modal'));
    document.getElementById('add-booking-btn').addEventListener('click', () => {
        loadCustomerOptions();
        loadRoomOptions();
        openModal('booking-modal');
    });
    document.getElementById('add-payment-btn').addEventListener('click', () => {
        loadBookingOptions();
        openModal('payment-modal');
    });
    document.getElementById('add-staff-btn').addEventListener('click', () => openModal('staff-modal'));

    // Add drop database button event listener
    const dropDatabaseBtn = document.getElementById('drop-database-btn');
    if (dropDatabaseBtn) {
        dropDatabaseBtn.addEventListener('click', handleDropDatabase);
    }

    // Load initial data
    loadData();
});

// Switch between tabs
function switchTab(tabId) {
    // Hide all tab contents
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all nav buttons
    navButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabId).classList.add('active');

    // Add active class to clicked button
    document.querySelector(`.nav-btn[data-tab="${tabId}"]`).classList.add('active');

    // Update active tab
    activeTab = tabId;

    // Load data for the selected tab
    loadData();
}

// Open modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Load data for the active tab
function loadData() {
    switch (activeTab) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'rooms':
            loadRooms();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'staff':
            loadStaff();
            break;
    }
}

// Load dashboard data
function loadDashboardData() {
    // Load total customers
    fetch(`${API_BASE}/customers`)
        .then(response => response.json())
        .then(customers => {
            document.getElementById('total-customers').textContent = customers.length;
        })
        .catch(error => console.error('Error loading customers:', error));

    // Load available rooms
    fetch(`${API_BASE}/rooms/available`)
        .then(response => response.json())
        .then(rooms => {
            document.getElementById('available-rooms').textContent = rooms.length;
        })
        .catch(error => console.error('Error loading rooms:', error));

    // Load total bookings
    fetch(`${API_BASE}/bookings`)
        .then(response => response.json())
        .then(bookings => {
            document.getElementById('total-bookings').textContent = bookings.length;
        })
        .catch(error => console.error('Error loading bookings:', error));

    // Load total revenue
    fetch(`${API_BASE}/payments`)
        .then(response => response.json())
        .then(payments => {
            const totalRevenue = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
            document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
        })
        .catch(error => console.error('Error loading payments:', error));

    // Load recent bookings
    loadRecentBookings();
}

// Load recent bookings
function loadRecentBookings() {
    fetch(`${API_BASE}/bookings`)
        .then(response => response.json())
        .then(bookings => {
            // Sort by booking_id descending and take first 5
            const recentBookings = bookings.sort((a, b) => b.booking_id - a.booking_id).slice(0, 5);
            
            const tbody = document.querySelector('#recent-bookings-table tbody');
            tbody.innerHTML = '';

            recentBookings.forEach(booking => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${booking.customer_name}</td>
                    <td>${booking.room_type}</td>
                    <td>${booking.check_in_date}</td>
                    <td>$${parseFloat(booking.total_amount).toFixed(2)}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading recent bookings:', error));
}

// Load customers
function loadCustomers() {
    fetch(`${API_BASE}/customers`)
        .then(response => response.json())
        .then(customers => {
            const tbody = document.querySelector('#customers-table tbody');
            tbody.innerHTML = '';

            customers.forEach(customer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.customer_id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.email || ''}</td>
                    <td>${customer.address || ''}</td>
                    <td>
                        <button class="btn-edit" onclick="editCustomer(${customer.customer_id})">Edit</button>
                        <button class="btn-delete" onclick="deleteCustomer(${customer.customer_id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading customers:', error));
}

// Load rooms
function loadRooms() {
    fetch(`${API_BASE}/rooms`)
        .then(response => response.json())
        .then(rooms => {
            const tbody = document.querySelector('#rooms-table tbody');
            tbody.innerHTML = '';

            rooms.forEach(room => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${room.room_id}</td>
                    <td>${room.room_type}</td>
                    <td>$${parseFloat(room.price_per_night).toFixed(2)}</td>
                    <td>${room.is_available ? 'Available' : 'Occupied'}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading rooms:', error));
}

// Load bookings
function loadBookings() {
    fetch(`${API_BASE}/bookings`)
        .then(response => response.json())
        .then(bookings => {
            const tbody = document.querySelector('#bookings-table tbody');
            tbody.innerHTML = '';

            bookings.forEach(booking => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${booking.booking_id}</td>
                    <td>${booking.customer_name}</td>
                    <td>${booking.room_type}</td>
                    <td>${booking.check_in_date}</td>
                    <td>${booking.check_out_date}</td>
                    <td>$${parseFloat(booking.total_amount).toFixed(2)}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading bookings:', error));
}

// Load payments
function loadPayments() {
    fetch(`${API_BASE}/payments`)
        .then(response => response.json())
        .then(payments => {
            const tbody = document.querySelector('#payments-table tbody');
            tbody.innerHTML = '';

            payments.forEach(payment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${payment.payment_id}</td>
                    <td>${payment.booking_id}</td>
                    <td>${payment.customer_name}</td>
                    <td>${payment.payment_date}</td>
                    <td>$${parseFloat(payment.amount).toFixed(2)}</td>
                    <td>${payment.payment_method}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading payments:', error));
}

// Load staff
function loadStaff() {
    fetch(`${API_BASE}/staff`)
        .then(response => response.json())
        .then(staff => {
            const tbody = document.querySelector('#staff-table tbody');
            tbody.innerHTML = '';

            staff.forEach(member => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${member.staff_id}</td>
                    <td>${member.name}</td>
                    <td>${member.role}</td>
                    <td>${member.phone || ''}</td>
                    <td>${member.email || ''}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading staff:', error));
}

// Handle customer form submission
function handleCustomerSubmit(event) {
    event.preventDefault();

    const customerId = document.getElementById('customer-id').value;
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const email = document.getElementById('customer-email').value;
    const address = document.getElementById('customer-address').value;

    const customerData = { name, phone, email, address };

    const url = customerId ? `${API_BASE}/customers/${customerId}` : `${API_BASE}/customers`;
    const method = customerId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
    })
    .then(response => response.json())
    .then(data => {
        closeModal('customer-modal');
        loadCustomers();
        resetCustomerForm();
    })
    .catch(error => console.error('Error saving customer:', error));
}

// Reset customer form
function resetCustomerForm() {
    document.getElementById('customer-form').reset();
    document.getElementById('customer-id').value = '';
}

// Handle room form submission
function handleRoomSubmit(event) {
    event.preventDefault();

    const roomId = document.getElementById('room-id').value;
    const room_type = document.getElementById('room-type').value;
    const price_per_night = document.getElementById('room-price').value;
    const is_available = document.getElementById('room-available').value === 'true';

    const roomData = { room_type, price_per_night: parseFloat(price_per_night), is_available };

    const url = roomId ? `${API_BASE}/rooms/${roomId}` : `${API_BASE}/rooms`;
    const method = roomId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
    })
    .then(response => response.json())
    .then(data => {
        closeModal('room-modal');
        loadRooms();
        resetRoomForm();
    })
    .catch(error => console.error('Error saving room:', error));
}

// Reset room form
function resetRoomForm() {
    document.getElementById('room-form').reset();
    document.getElementById('room-id').value = '';
}

// Handle booking form submission
function handleBookingSubmit(event) {
    event.preventDefault();

    const bookingId = document.getElementById('booking-id').value;
    const customer_id = document.getElementById('booking-customer').value;
    const room_id = document.getElementById('booking-room').value;
    const check_in_date = document.getElementById('check-in-date').value;
    const check_out_date = document.getElementById('check-out-date').value;
    const total_amount = document.getElementById('total-amount').value;

    const bookingData = {
        customer_id: parseInt(customer_id),
        room_id: parseInt(room_id),
        check_in_date,
        check_out_date,
        total_amount: parseFloat(total_amount)
    };

    const url = bookingId ? `${API_BASE}/bookings/${bookingId}` : `${API_BASE}/bookings`;
    const method = bookingId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
        closeModal('booking-modal');
        loadBookings();
        resetBookingForm();
    })
    .catch(error => console.error('Error saving booking:', error));
}

// Reset booking form
function resetBookingForm() {
    document.getElementById('booking-form').reset();
    document.getElementById('booking-id').value = '';
}

// Handle payment form submission
function handlePaymentSubmit(event) {
    event.preventDefault();

    const paymentId = document.getElementById('payment-id').value;
    const booking_id = document.getElementById('payment-booking').value;
    const payment_date = document.getElementById('payment-date').value;
    const amount = document.getElementById('payment-amount').value;
    const payment_method = document.getElementById('payment-method').value;

    const paymentData = {
        booking_id: parseInt(booking_id),
        payment_date,
        amount: parseFloat(amount),
        payment_method
    };

    const url = paymentId ? `${API_BASE}/payments/${paymentId}` : `${API_BASE}/payments`;
    const method = paymentId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })
    .then(response => response.json())
    .then(data => {
        closeModal('payment-modal');
        loadPayments();
        resetPaymentForm();
    })
    .catch(error => console.error('Error saving payment:', error));
}

// Reset payment form
function resetPaymentForm() {
    document.getElementById('payment-form').reset();
    document.getElementById('payment-id').value = '';
}

// Handle staff form submission
function handleStaffSubmit(event) {
    event.preventDefault();

    const staffId = document.getElementById('staff-id').value;
    const name = document.getElementById('staff-name').value;
    const role = document.getElementById('staff-role').value;
    const phone = document.getElementById('staff-phone').value;
    const email = document.getElementById('staff-email').value;

    const staffData = { name, role, phone, email };

    const url = staffId ? `${API_BASE}/staff/${staffId}` : `${API_BASE}/staff`;
    const method = staffId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffData)
    })
    .then(response => response.json())
    .then(data => {
        closeModal('staff-modal');
        loadStaff();
        resetStaffForm();
    })
    .catch(error => console.error('Error saving staff:', error));
}

// Reset staff form
function resetStaffForm() {
    document.getElementById('staff-form').reset();
    document.getElementById('staff-id').value = '';
}

// Load customer options for booking form
function loadCustomerOptions() {
    fetch(`${API_BASE}/customers`)
        .then(response => response.json())
        .then(customers => {
            const select = document.getElementById('booking-customer');
            select.innerHTML = '<option value="">Select a customer</option>';

            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.customer_id;
                option.textContent = `${customer.customer_id} - ${customer.name}`;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading customers:', error));
}

// Load room options for booking form
function loadRoomOptions() {
    fetch(`${API_BASE}/rooms/available`)
        .then(response => response.json())
        .then(rooms => {
            const select = document.getElementById('booking-room');
            select.innerHTML = '<option value="">Select a room</option>';

            rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.room_id;
                option.textContent = `${room.room_id} - ${room.room_type} ($${parseFloat(room.price_per_night).toFixed(2)})`;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading rooms:', error));
}

// Load booking options for payment form
function loadBookingOptions() {
    fetch(`${API_BASE}/bookings`)
        .then(response => response.json())
        .then(bookings => {
            const select = document.getElementById('payment-booking');
            select.innerHTML = '<option value="">Select a booking</option>';

            bookings.forEach(booking => {
                const option = document.createElement('option');
                option.value = booking.booking_id;
                option.textContent = `${booking.booking_id} - ${booking.customer_name} - $${parseFloat(booking.total_amount).toFixed(2)}`;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading bookings:', error));
}

// Edit customer
function editCustomer(customerId) {
    fetch(`${API_BASE}/customers`)
        .then(response => response.json())
        .then(customers => {
            const customer = customers.find(c => c.customer_id == customerId);
            if (customer) {
                document.getElementById('customer-id').value = customer.customer_id;
                document.getElementById('customer-name').value = customer.name;
                document.getElementById('customer-phone').value = customer.phone;
                document.getElementById('customer-email').value = customer.email || '';
                document.getElementById('customer-address').value = customer.address || '';
                openModal('customer-modal');
            }
        })
        .catch(error => console.error('Error loading customer:', error));
}

// Delete customer
function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        fetch(`${API_BASE}/customers/${customerId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                loadCustomers();
                // Also refresh dashboard data since customer count changed
                if (activeTab === 'dashboard') {
                    loadDashboardData();
                }
            } else if (response.status === 400) {
                alert('Cannot delete customer with existing bookings');
            } else {
                alert('Error deleting customer');
            }
        })
        .catch(error => {
            console.error('Error deleting customer:', error);
            alert('Error deleting customer');
        });
    }
}

// Handle drop database
function handleDropDatabase() {
    if (confirm('Are you sure you want to drop all database tables? This will permanently delete ALL data!')) {
        fetch(`${API_BASE}/drop-database`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            // Refresh all data
            loadData();
        })
        .catch(error => {
            console.error('Error dropping database:', error);
            alert('Error dropping database');
        });
    }
}