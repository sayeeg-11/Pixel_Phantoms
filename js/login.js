document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const accessCard = document.getElementById('access-card');
    const authForm = document.getElementById('auth-form');
    const loginTabBtn = document.getElementById('login-tab-btn');
    const signupTabBtn = document.getElementById('signup-tab-btn');
    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    const verificationView = document.getElementById('verification-view');
    const statusValue = document.getElementById('login-status-value');
    const feedbackMsg = document.getElementById('form-feedback');
    const backToLoginBtn = document.getElementById('back-to-login-btn');

    // Login form fields
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const forgotPasskeyLink = document.querySelector('.forgot-link'); // UPDATED: Use class selector

    // Sign Up form fields
    const newUsernameInput = document.getElementById('new-username');
    const newEmailInput = document.getElementById('new-email');
    const newPasswordInput = document.getElementById('new-password');

    // Password Recovery Modal Elements (NEW)
    const recoveryModal = document.getElementById('recovery-modal');
    const cancelRecoveryBtn = document.getElementById('cancel-recovery-btn');
    const sendRecoveryBtn = document.getElementById('send-recovery-btn');
    const recoveryEmailInput = document.getElementById('recovery-email');

    // Forgot Password elements (keeping for compatibility)
    const forgotPasswordView = document.getElementById('forgot-password-view');
    const resetEmailInput = document.getElementById('reset-email');

    // Verification elements
    const verificationIcon = verificationView.querySelector('.verification-icon i');
    const verificationTitle = document.getElementById('verification-title');
    const verificationMessage = document.getElementById('verification-message');

    // Role switching elements
    const roleBtns = document.querySelectorAll('.role-btn');
    const roleInput = document.getElementById('selected-role');

    // --- AUTHENTICATION DATA MANAGEMENT ---

    // Variable to hold the data fetched from the hidden CSV file
    let baseCsvAccounts = [];

    /**
     * Fetches the Hidden CSV file to simulate backend database.
     */
    function loadBaseAccounts() {
        fetch('../data/accounts.csv')
            .then(response => {
                if (!response.ok) throw new Error("Failed to load account database.");
                return response.text();
            })
            .then(csvText => {
                baseCsvAccounts = parseCSV(csvText);
                console.log("System: Secure CSV Database Loaded.", baseCsvAccounts);
                getAccounts(); 
            })
            .catch(error => {
                console.error("System Error: Could not access hidden CSV.", error);
                baseCsvAccounts = [];
            });
    }

    /**
     * Parses standard CSV format into an array of account objects.
     */
    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const accounts = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const [codename, email, password_hash] = line.split(',');
                if (codename && email && password_hash) {
                    accounts.push({
                        codename: codename.trim(),
                        email: email.trim(),
                        password_hash: password_hash.trim()
                    });
                }
            }
        }
        return accounts;
    }

    /**
     * Retrieves all accounts, merging the "Hidden CSV" data with user-created data.
     */
    function getAccounts() {
        const userStoredAccounts = JSON.parse(localStorage.getItem('user_accounts')) || [];
        const baseCodenameSet = new Set(baseCsvAccounts.map(acc => acc.codename));
        const uniqueUserAccounts = userStoredAccounts.filter(userAcc =>
            !baseCodenameSet.has(userAcc.codename)
        );
        const finalAccounts = [...baseCsvAccounts, ...uniqueUserAccounts];
        localStorage.setItem('user_accounts', JSON.stringify(finalAccounts));
        return finalAccounts;
    }

    function addAccount(codename, email, password) {
        let accounts = getAccounts();
        const password_hash = password.trim() + '_secure_hash';
        const newAccount = {
            codename: codename.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password_hash: password_hash
        };
        const userStoredAccounts = JSON.parse(localStorage.getItem('user_accounts')) || [];
        userStoredAccounts.push(newAccount);
        localStorage.setItem('user_accounts', JSON.stringify(userStoredAccounts));
    }

    function checkLogin(codename, password) {
        const accounts = getAccounts();
        const expected_hash = password.trim() + '_secure_hash';
        return accounts.find(account =>
            account.codename === codename.toLowerCase().trim() &&
            account.password_hash === expected_hash
        );
    }

    function checkCodenameOrEmailExists(codename, email) {
        const accounts = getAccounts();
        const lowerCodename = codename.toLowerCase().trim();
        const lowerEmail = email.toLowerCase().trim();
        return accounts.some(account =>
            account.codename === lowerCodename || account.email === lowerEmail
        );
    }

    function checkEmailExists(email) {
        const accounts = getAccounts();
        const lowerEmail = email.toLowerCase().trim();
        return accounts.some(account => account.email === lowerEmail);
    }

    // --- UTILITY FUNCTIONS ---
    function showError(id, message) {
        const errorElement = document.getElementById(id);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        accessCard.classList.add('fail-icon');
        setTimeout(() => accessCard.classList.remove('fail-icon'), 500);
    }

    function hideError(id) {
        const errorElement = document.getElementById(id);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    function validateField(input, errorId, message) {
        if (!input || input.value === undefined || input.value.trim() === '') {
            showError(errorId, message);
            return false;
        }
        hideError(errorId);
        return true;
    }

    /**
     * Email validation helper (NEW)
     */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // --- STATE MANAGEMENT ---
    function setActiveView(viewId) {
        const views = [loginView, signupView, verificationView, forgotPasswordView];
        views.forEach(view => {
            if (view && view.id === viewId) {
                view.classList.add('active');
            } else if (view) {
                view.classList.remove('active');
            }
        });
        feedbackMsg.classList.remove('show', 'success', 'error');
    }

    function setAuthMode(mode) {
        const tabBtns = [loginTabBtn, signupTabBtn];
        tabBtns.forEach(btn => btn.classList.remove('active'));

        hideError('username-error');
        hideError('password-error');
        hideError('new-username-error');
        hideError('new-email-error');
        hideError('new-password-error');
        if (resetEmailInput) hideError('reset-email-error');

        const toggleRequired = (login, signup, reset) => {
            usernameInput.required = login;
            passwordInput.required = login;
            newUsernameInput.required = signup;
            newEmailInput.required = signup;
            newPasswordInput.required = signup;
            if (resetEmailInput) resetEmailInput.required = reset;
        };

        if (mode === 'login') {
            loginTabBtn.classList.add('active');
            setActiveView('login-view');
            statusValue.textContent = 'STATUS_IDLE';
            toggleRequired(true, false, false);
            newUsernameInput.value = '';
            newEmailInput.value = '';
            newPasswordInput.value = '';
            if (resetEmailInput) resetEmailInput.value = '';

        } else if (mode === 'signup') {
            signupTabBtn.classList.add('active');
            setActiveView('signup-view');
            statusValue.textContent = 'STATUS_REGISTRATION';
            toggleRequired(false, true, false);
            usernameInput.value = '';
            passwordInput.value = '';
            if (resetEmailInput) resetEmailInput.value = '';

        } else if (mode === 'forgot-password' && forgotPasswordView) {
            setActiveView('forgot-password-view');
            statusValue.textContent = 'STATUS_RECOVERY_MODE';
            toggleRequired(false, false, true);
            usernameInput.value = '';
            passwordInput.value = '';
            newUsernameInput.value = '';
            newEmailInput.value = '';
            newPasswordInput.value = '';

        } else if (mode === 'verification') {
            setActiveView('verification-view');
            toggleRequired(false, false, false);
        }
    }

    // --- PASSWORD RECOVERY MODAL FUNCTIONALITY (NEW) ---
    
    /**
     * Opens the password recovery modal
     */
    function openRecoveryModal() {
        if (recoveryModal) {
            recoveryModal.style.display = 'flex';
            statusValue.textContent = 'RECOVERY_MODE';
            if (recoveryEmailInput) recoveryEmailInput.value = '';
            hideError('recovery-email-error');
        }
    }

    /**
     * Closes the password recovery modal
     */
    function closeRecoveryModal() {
        if (recoveryModal) {
            recoveryModal.style.display = 'none';
            statusValue.textContent = 'STATUS_IDLE';
            if (recoveryEmailInput) recoveryEmailInput.value = '';
            hideError('recovery-email-error');
        }
    }

    /**
     * Handles the password recovery email sending
     */
    function handlePasswordRecovery() {
        const email = recoveryEmailInput.value.trim();
        
        // Validation
        if (!email) {
            showError('recovery-email-error', 'Email Key is required for recovery');
            return;
        }
        
        if (!validateEmail(email)) {
            showError('recovery-email-error', 'Please enter a valid Email Key format');
            return;
        }

        // Check if email exists in database
        const emailExists = checkEmailExists(email);
        
        // Update status and show verification view
        setAuthMode('verification');
        statusValue.textContent = 'RECOVERY_PROTOCOL_INIT';
        
        // Close the modal
        closeRecoveryModal();

        // Start verification animation
        verificationIcon.className = 'fas fa-paper-plane fa-spin';
        verificationIcon.classList.remove('success-icon', 'fail-icon');
        verificationTitle.textContent = 'INITIATING RECOVERY PROTOCOL...';
        verificationMessage.textContent = 'Searching agent database for associated Email Key.';

        const sequenceSteps = [
            'SEARCHING AGENT DATABASE BY EMAIL KEY...',
            'VERIFYING RECOVERY HASH...',
            'INITIATING SECURE TOKEN GENERATION...',
            'AWAITING MAIL SERVER RESPONSE...'
        ];

        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < sequenceSteps.length) {
                verificationTitle.textContent = sequenceSteps[stepIndex];
                stepIndex++;
            } else {
                clearInterval(interval);
            }
        }, 800 + Math.random() * 400);

        setTimeout(() => {
            clearInterval(interval);

            if (emailExists) {
                verificationIcon.className = 'fas fa-paper-plane success-icon';
                verificationTitle.textContent = 'RECOVERY EMAIL DISPATCHED';
                verificationMessage.textContent = `A secure passkey reset link has been dispatched to: ${email}. Follow the instructions to regain access.`;
                statusValue.textContent = 'STATUS_PENDING_RESET';
            } else {
                verificationIcon.className = 'fas fa-times-circle fail-icon';
                verificationTitle.textContent = 'AGENT NOT FOUND';
                verificationMessage.textContent = 'The entered email key does not match any known records. Please verify the address and try again.';
                statusValue.textContent = 'STATUS_DENIED';
            }
        }, 4000 + Math.random() * 1000);
    }

    // --- SCREENING/SIMULATION LOGIC ---
    function startAuthOrRegistrationSimulation(isLogin) {
        setAuthMode('verification');
        statusValue.textContent = isLogin ? 'AUTH_SCREENING_INIT' : 'AGENT_CREATION_INIT';

        verificationIcon.className = 'fas fa-fingerprint fa-spin';
        verificationIcon.classList.remove('success-icon', 'fail-icon');
        verificationTitle.textContent = isLogin ? 'INITIATING ACCESS PROTOCOL...' : 'SECURE AGENT HASHING...';
        verificationMessage.textContent = 'Analyzing credentials against known hashes and security kernels.';

        const sequenceSteps = isLogin ? [
            'VERIFYING CODENAME...',
            'DECRYPTING PASSKEY HASH...',
            'CHECKING HOST INTEGRITY...',
            'AWAITING GATEWAY RESPONSE...'
        ] : [
            'GENERATING UNIQUE AGENT ID...',
            'ENCRYPTING PASSKEY TO BLOCKCHAIN...',
            'ASSIGNING SECURE MAIL CHANNEL...',
            'FINALIZING NEW ACCOUNT CREATION...'
        ];

        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < sequenceSteps.length) {
                verificationTitle.textContent = sequenceSteps[stepIndex];
                stepIndex++;
            } else {
                clearInterval(interval);
            }
        }, 800 + Math.random() * 400);

        setTimeout(() => {
            clearInterval(interval);

            let isSuccess = false;
            let failureReason = '';

            if (isLogin) {
                const account = checkLogin(usernameInput.value, passwordInput.value);
                isSuccess = !!account;
                if (!isSuccess) {
                    failureReason = 'AUTH_FAIL: Invalid Codename or Passkey.';
                }
            } else {
                const codename = newUsernameInput.value;
                const email = newEmailInput.value;
                const password = newPasswordInput.value;

                if (checkCodenameOrEmailExists(codename, email)) {
                    failureReason = 'Codename or Email already exists in records.';
                } else {
                    addAccount(codename, email, password);
                    isSuccess = true;
                }
            }

            if (isSuccess) {
                handleSuccess(isLogin);
            } else {
                handleFailure(isLogin, failureReason);
            }
        }, 4000 + Math.random() * 1000);
    }

    function startPasswordResetSimulation() {
        setAuthMode('verification');
        statusValue.textContent = 'RECOVERY_PROTOCOL_INIT';

        verificationIcon.className = 'fas fa-fingerprint fa-spin';
        verificationIcon.classList.remove('success-icon', 'fail-icon');
        verificationTitle.textContent = 'INITIATING RECOVERY PROTOCOL...';
        verificationMessage.textContent = 'Searching agent database for associated Email Key.';

        const sequenceSteps = [
            'SEARCHING AGENT DATABASE BY EMAIL KEY...',
            'VERIFYING RECOVERY HASH...',
            'INITIATING SECURE TOKEN GENERATION...',
            'AWAITING MAIL SERVER RESPONSE...'
        ];

        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < sequenceSteps.length) {
                verificationTitle.textContent = sequenceSteps[stepIndex];
                stepIndex++;
            } else {
                clearInterval(interval);
            }
        }, 800 + Math.random() * 400);

        setTimeout(() => {
            clearInterval(interval);
            const email = resetEmailInput.value;
            const isEmailFound = checkEmailExists(email);

            if (isEmailFound) {
                verificationIcon.className = 'fas fa-paper-plane success-icon';
                verificationTitle.textContent = 'RECOVERY EMAIL DISPATCHED';
                verificationMessage.textContent = `A secure passkey reset link has been dispatched to: ${email}. Follow the instructions to regain access.`;
                statusValue.textContent = 'STATUS_PENDING_RESET';
            } else {
                verificationIcon.className = 'fas fa-times-circle fail-icon';
                verificationTitle.textContent = 'AGENT NOT FOUND';
                verificationMessage.textContent = 'The entered email key does not match any known records. Please verify the address and try again.';
                statusValue.textContent = 'STATUS_DENIED';
            }
        }, 4000 + Math.random() * 1000);
    }

    function handleSuccess(isLogin) {
        verificationIcon.className = 'fas fa-lock-open success-icon';
        verificationTitle.textContent = isLogin ? 'ACCESS GRANTED' : 'REGISTRATION COMPLETE';
        verificationMessage.textContent = isLogin ? 'Welcome back, Agent. Redirecting to Profile...' : 'Agent ID successfully created. Redirecting to Profile...';
        statusValue.textContent = 'STATUS_ONLINE';

        if (isLogin || !isLogin) {
            const codename = isLogin ? usernameInput.value : newUsernameInput.value;
            setTimeout(() => {
                localStorage.setItem('session_codename', codename);
                window.location.href = '../pages/profile.html';
            }, 1500);
        }
    }

    function handleFailure(isLogin, customReason = '') {
        const errorMessages = isLogin ? [
            'UNAUTHORIZED ACCESS: Security violation detected.',
            'HASH_MISMATCH: Protocol rejected credentials.'
        ] : [
            'REGISTRATION FAILED: Could not secure password hash.',
            'SERVER DENIED: Email key invalid.',
            'CONNECTION DROPPED: Registration protocol failure.'
        ];

        verificationIcon.className = 'fas fa-times-circle fail-icon';
        verificationTitle.textContent = isLogin ? 'AUTHENTICATION FAILED' : 'REGISTRATION FAILED';

        let message = customReason || errorMessages[Math.floor(Math.random() * errorMessages.length)];
        verificationMessage.textContent = message + ' Please try again.';
        statusValue.textContent = 'STATUS_DENIED';

        if (isLogin) {
            usernameInput.value = '';
            passwordInput.value = '';
        }
    }

    // --- EVENT HANDLERS ---
    loginTabBtn.addEventListener('click', () => setAuthMode('login'));
    signupTabBtn.addEventListener('click', () => setAuthMode('signup'));
    backToLoginBtn.addEventListener('click', () => setAuthMode('login'));

    // Forgot Passkey Link Handler (UPDATED)
    if (forgotPasskeyLink) {
        forgotPasskeyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openRecoveryModal();
        });
    }

    // Recovery Modal Event Handlers (NEW)
    if (cancelRecoveryBtn) {
        cancelRecoveryBtn.addEventListener('click', closeRecoveryModal);
    }

    if (sendRecoveryBtn) {
        sendRecoveryBtn.addEventListener('click', handlePasswordRecovery);
    }

    // Close modal when clicking outside (NEW)
    if (recoveryModal) {
        recoveryModal.addEventListener('click', function(e) {
            if (e.target === recoveryModal) {
                closeRecoveryModal();
            }
        });
    }

    // Form Submit Handler
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let formValid = true;
        const currentView = loginView.classList.contains('active') ? 'login' :
            signupView.classList.contains('active') ? 'signup' :
            forgotPasswordView && forgotPasswordView.classList.contains('active') ? 'forgot' : null;

        if (currentView === 'login') {
            formValid &= validateField(usernameInput, 'username-error', 'Codename is required');
            formValid &= validateField(passwordInput, 'password-error', 'Passkey is required');
            if (formValid) startAuthOrRegistrationSimulation(true);

        } else if (currentView === 'signup') {
            formValid &= validateField(newUsernameInput, 'new-username-error', 'Codename is required');
            formValid &= validateField(newEmailInput, 'new-email-error', 'Email Key is required');
            formValid &= validateField(newPasswordInput, 'new-password-error', 'Passkey is required');
            if (formValid) startAuthOrRegistrationSimulation(false);

        } else if (currentView === 'forgot') {
            formValid &= validateField(resetEmailInput, 'reset-email-error', 'Email Key is required for recovery');
            if (formValid) startPasswordResetSimulation();
        }

        if (!formValid) {
            feedbackMsg.textContent = '❌ Input validation failed. Check required fields.';
            feedbackMsg.className = 'feedback-message error show';
            setTimeout(() => feedbackMsg.classList.remove('show'), 4000);
        }
    });

    // --- PASSWORD VISIBILITY TOGGLE ---
    const togglePassword = document.getElementById('togglePassword');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
            this.classList.toggle('fa-eye');
            console.log(`System: Access key visibility set to ${type.toUpperCase()}`);
        });
    }

    // --- ROLE SWITCHING LOGIC ---
    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const role = btn.dataset.role;
            roleInput.value = role;

            if (role === 'core_committee') {
                usernameInput.placeholder = "Codename (Core Handle)";
            } else {
                usernameInput.placeholder = "Codename (Member ID)";
            }
        });
    });

    // --- INITIALIZATION ---
    authForm.setAttribute('novalidate', 'true');

    function initMatrixRain() {
        const canvas = document.getElementById('cyber-rain-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const katakana = 'アァカサタナハマヤラワガザダバパピビヂゾブヅエェケセテネヘメレヱゲゼデベペオォコソトノホモヨロヲゴゾドボポ10100101';
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = [];
        for (let i = 0; i < columns; i++) drops[i] = 1;

        function draw() {
            ctx.fillStyle = `rgba(0, 0, 0, ${0.05 + Math.random() * 0.05})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = fontSize + 'px "JetBrains Mono"';
            for (let i = 0; i < drops.length; i++) {
                const text = katakana[Math.floor(Math.random() * katakana.length)];
                const colorCode = Math.random() < 0.1 ? '#00ff88' : '#00aaff';
                ctx.fillStyle = colorCode;
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                ctx.fillText(text, x, y);
                if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drops.length = Math.floor(canvas.width / fontSize);
            for (let i = 0; i < drops.length; i++) if(drops[i] === undefined) drops[i] = 0;
        });
        setInterval(draw, 33);
    }

    function initHackerStats() {
        const STATS = [
            { label: "CPU_LOAD", unit: "%", min: 15, max: 80, isWarn: v => v > 90 },
            { label: "MEM_USAGE", unit: "GB", min: 2, max: 12, decimal: 1, isWarn: v => v > 10 },
            { label: "PING_LAT", unit: "ms", min: 5, max: 99, decimal: 0, isWarn: v => v > 50 },
            { label: "CORE_TEMP", unit: "°C", min: 35, max: 65, decimal: 0, isWarn: v => v > 60 }
        ];
        let currentStats = STATS.map(s => ({ ...s, value: s.min + Math.random() * (s.max - s.min) }));

        function updateHackerStats() {
            const overlay = document.getElementById('hacker-stats-overlay');
            if (!overlay) return;
            let html = '<p style="color:#00aaff; margin-bottom: 10px;">SYSTEM_DIAGNOSTICS:</p>';
            currentStats = currentStats.map(stat => {
                const delta = (Math.random() * 10 - 5) / (stat.decimal ? 10 : 1);
                let newValue = stat.value + delta;
                newValue = Math.max(stat.min, Math.min(stat.max, newValue));
                let displayValue = stat.decimal !== undefined ? newValue.toFixed(stat.decimal) : Math.round(newValue);
                let statusClass = stat.isWarn(newValue) ? 'hacker-status-warn' : 'hacker-status-ok';
                html += `<div class="hacker-stat-line"><span>${stat.label}</span><span class="${statusClass}">${displayValue}${stat.unit}</span></div>`;
                return { ...stat, value: newValue };
            });
            overlay.innerHTML = html;
        }
        setInterval(updateHackerStats, 750);
        updateHackerStats();
    }

    initMatrixRain();
    initHackerStats();
    setAuthMode('login');
    loadBaseAccounts();
});
