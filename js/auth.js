// utility: simple client-side auth using localStorage + SHA-256 hashed passwords

async function hashPassword(password) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const arr = Array.from(new Uint8Array(hash));
    return arr.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('ds_users') || '{}');
    } catch {
        return {};
    }
}

function saveUsers(users) {
    localStorage.setItem('ds_users', JSON.stringify(users));
}

function setCurrentUser(user) {
    localStorage.setItem('ds_currentUser', JSON.stringify(user));
}

function showMessage(el, text, type = 'error') {
    el.textContent = text;
    el.className = 'message ' + (type === 'success' ? 'success' : 'error');
    if (type === 'success') {
        setTimeout(() => { el.textContent = ''; el.className = 'message'; }, 2500);
    }
}

// register handler
document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (form.id === 'signup-form') {
        e.preventDefault();
        const name = form.querySelector('#signup-name').value.trim();
        const email = form.querySelector('#signup-email').value.trim().toLowerCase();
        const password = form.querySelector('#signup-password').value;
        const passwordConfirm = form.querySelector('#signup-password-confirm').value;
        // extra fields
        const accountType = form.querySelector('#account-type') ? form.querySelector('#account-type').value : 'driver';
        let profile = {};
        let verificationFiles = {};
        if (accountType === 'driver') {
            profile = {
                age: form.querySelector('#driver-age') ? form.querySelector('#driver-age').value.trim() : '',
                experience: form.querySelector('#driver-experience') ? form.querySelector('#driver-experience').value.trim() : '',
                driverType: form.querySelector('#driver-type') ? form.querySelector('#driver-type').value.trim() : '',
                serviceRecord: form.querySelector('#service-record') ? form.querySelector('#service-record').value.trim() : '',
                phone: form.querySelector('#driver-phone') ? form.querySelector('#driver-phone').value.trim() : '',
                preferredAreas: form.querySelector('#preferred-areas') ? form.querySelector('#preferred-areas').value.trim() : '',
                additionalInfo: form.querySelector('#additional-info') ? form.querySelector('#additional-info').value.trim() : ''
            };
            verificationFiles = {
                idFile: form.querySelector('#id-file') && form.querySelector('#id-file').files.length > 0 ? Array.from(form.querySelector('#id-file').files).slice(0,5).map(f => f.name).join(', ') : '',
                licenseFile: form.querySelector('#license-file') && form.querySelector('#license-file').files.length > 0 ? Array.from(form.querySelector('#license-file').files).slice(0,5).map(f => f.name).join(', ') : '',
                goodConductFile: form.querySelector('#goodconduct-file') && form.querySelector('#goodconduct-file').files.length > 0 ? Array.from(form.querySelector('#goodconduct-file').files).slice(0,5).map(f => f.name).join(', ') : '',
                passportPhoto: form.querySelector('#passport-photo') && form.querySelector('#passport-photo').files.length > 0 ? Array.from(form.querySelector('#passport-photo').files).slice(0,5).map(f => f.name).join(', ') : ''
            };
        } else {
            profile = {
                name: form.querySelector('#partner-name') ? form.querySelector('#partner-name').value.trim() : '',
                platforms: form.querySelector('#partner-platforms') ? form.querySelector('#partner-platforms').value.trim() : '',
                phone: form.querySelector('#partner-phone') ? form.querySelector('#partner-phone').value.trim() : '',
                vehicleType: form.querySelector('#vehicle-type') ? form.querySelector('#vehicle-type').value.trim() : '',
                modelYear: form.querySelector('#model-year') ? form.querySelector('#model-year').value.trim() : '',
                carCondition: form.querySelector('#car-condition') ? form.querySelector('#car-condition').value.trim() : '',
                insuranceStatus: form.querySelector('#insurance-status') ? form.querySelector('#insurance-status').value.trim() : '',
                preferredAreas: form.querySelector('#partner-preferred-areas') ? form.querySelector('#partner-preferred-areas').value.trim() : ''
            };
            verificationFiles = {
                idFile: form.querySelector('#partner-id-file') && form.querySelector('#partner-id-file').files.length > 0 ? Array.from(form.querySelector('#partner-id-file').files).slice(0,5).map(f => f.name).join(', ') : '',
                carPictures: form.querySelector('#car-pictures') && form.querySelector('#car-pictures').files.length > 0 ? Array.from(form.querySelector('#car-pictures').files).slice(0,5).map(f => f.name).join(', ') : '',
                passportPhoto: form.querySelector('#partner-passport-photo') && form.querySelector('#partner-passport-photo').files.length > 0 ? Array.from(form.querySelector('#partner-passport-photo').files).slice(0,5).map(f => f.name).join(', ') : ''
            };
        }
        const msg = document.getElementById('signup-message');

        if (!email || !password || !name) return showMessage(msg, 'Please complete all fields.');
        if (password.length < 8) return showMessage(msg, 'Password must be at least 8 characters.');
        if (password !== passwordConfirm) return showMessage(msg, 'Passwords do not match.');

        const users = getUsers();
        if (users[email]) return showMessage(msg, 'An account with that email already exists.');

        const hashed = await hashPassword(password);
        users[email] = {
            name,
            email,
            accountType,
            passwordHash: hashed,
            createdAt: new Date().toISOString(),
            profile,
            verificationFiles
        };
        saveUsers(users);
        showMessage(msg, 'Account created. Redirecting...', 'success');
        setTimeout(() => { setCurrentUser(users[email]); window.location.href = 'dashboard.html'; }, 1000);
    }

    if (form.id === 'signin-form') {
        e.preventDefault();
        const email = form.querySelector('#signin-email').value.trim().toLowerCase();
        const password = form.querySelector('#signin-password').value;
        const msg = document.getElementById('signin-message');

        if (!email || !password) return showMessage(msg, 'Please enter email and password.');

        const users = getUsers();
        const user = users[email];
        if (!user) return showMessage(msg, 'No account found for that email.');

        const hashed = await hashPassword(password);
        if (hashed !== user.passwordHash) return showMessage(msg, 'Incorrect password.');

        setCurrentUser(user);
        showMessage(msg, 'Signed in. Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    }
});