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
    
    // Sign Up form fields
    const newUsernameInput = document.getElementById('new-username');
    const newEmailInput = document.getElementById('new-email');
    const newPasswordInput = document.getElementById('new-password');

    // Verification elements
    const verificationIcon = verificationView.querySelector('.verification-icon i');
    const verificationTitle = document.getElementById('verification-title');
    const verificationMessage = document.getElementById('verification-message');
    
    // --- AUTHENTICATION DATA MANAGEMENT (Simulating Persistent JSON Store) ---
    
    // Mock CSV data used as the guaranteed base dataset.
    const MOCK_CSV_DATA = [
        { codename: 'neo_one', email: 'neo@pixelphantoms.com', password_hash: 'matrix_secure_hash' },
        { codename: 'test_agent', email: 'test@pixelphantoms.com', password_hash: 'password123_secure_hash' }
    ];

    /**
     * Retrieves all accounts, merging mock data with user-created data for robustness.
     * This function guarantees that the mock accounts are always present.
     */
    function getAccounts() {
        // 1. Get user-created accounts from Local Storage (our persistent JSON store)
        const userStoredAccounts = JSON.parse(localStorage.getItem('user_accounts')) || [];
        
        // 2. Create a map of mock accounts for quick lookup by codename
        const mockCodenameSet = new Set(MOCK_CSV_DATA.map(acc => acc.codename));
        
        // 3. Filter the user-stored accounts to remove any duplicates of the mock accounts
        const uniqueUserAccounts = userStoredAccounts.filter(userAcc => 
            !mockCodenameSet.has(userAcc.codename)
        );

        // 4. Merge mock accounts (baseline) with unique user-created accounts
        const finalAccounts = [...MOCK_CSV_DATA, ...uniqueUserAccounts];

        // 5. Save the merged, guaranteed functional list back to Local Storage
        // This ensures subsequent page loads start with correct data.
        localStorage.setItem('user_accounts', JSON.stringify(finalAccounts));
        
        return finalAccounts;
    }

    function addAccount(codename, email, password) {
        let accounts = getAccounts();
        
        // Simple hash simulation (password + fixed string)
        const password_hash = password.trim() + '_secure_hash'; 
        
        const newAccount = {
            codename: codename.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password_hash: password_hash
        };
        
        // Push the new account to the array and save the list
        accounts.push(newAccount);
        localStorage.setItem('user_accounts', JSON.stringify(accounts));
    }

    function checkLogin(codename, password) {
        const accounts = getAccounts();
        // Recalculate the expected hash from the input password
        const expected_hash = password.trim() + '_secure_hash';
        
        // Check if a matching account exists
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

    // --- UTILITY FUNCTIONS ---
    function showError(id, message) {
        const errorElement = document.getElementById(id);
        errorElement.textContent = message;
        errorElement.classList.add('show');
        accessCard.classList.add('fail-icon');
        setTimeout(() => accessCard.classList.remove('fail-icon'), 500);
    }

    function hideError(id) {
        const errorElement = document.getElementById(id);
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    function validateField(input, errorId, message) {
        if (input.value.trim() === '') {
            showError(errorId, message);
            return false;
        }
        hideError(errorId);
        return true;
    }

    // --- STATE MANAGEMENT ---
    function setActiveView(viewId) {
        const views = [loginView, signupView, verificationView];
        views.forEach(view => {
            if (view.id === viewId) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });
        feedbackMsg.classList.remove('show', 'success', 'error');
    }

    function setAuthMode(mode) {
        const tabBtns = [loginTabBtn, signupTabBtn];
        tabBtns.forEach(btn => btn.classList.remove('active'));
        
        if (mode === 'login') {
            loginTabBtn.classList.add('active');
            setActiveView('login-view');
            statusValue.textContent = 'STATUS_IDLE';
        } else if (mode === 'signup') {
            signupTabBtn.classList.add('active');
            setActiveView('signup-view');
            statusValue.textContent = 'STATUS_REGISTRATION';
        } else if (mode === 'verification') {
            setActiveView('verification-view');
        }
    }

    // --- SCREENING/SIMULATION LOGIC ---

    function startVerificationSimulation(isLogin) {
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

        // Final result delay
        setTimeout(() => {
            clearInterval(interval);
            
            let isSuccess = false;
            let failureReason = '';
            
            if (isLogin) {
                // Check against the robust Local Storage database
                const account = checkLogin(usernameInput.value, passwordInput.value);
                isSuccess = !!account;
                if (!isSuccess) {
                    failureReason = 'AUTH_FAIL: Invalid Codename or Passkey.';
                }
            } else { // Sign Up Logic
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

    function handleSuccess(isLogin) {
        verificationIcon.className = 'fas fa-lock-open success-icon';
        verificationTitle.textContent = isLogin ? 'ACCESS GRANTED' : 'REGISTRATION COMPLETE';
        verificationMessage.textContent = isLogin ? 'Welcome back, Agent. Redirecting to Command Center...' : 'Agent ID successfully created. You can now log in.';
        statusValue.textContent = 'STATUS_ONLINE';

        if (isLogin) {
            setTimeout(() => {
                localStorage.setItem('session_codename', usernameInput.value);
                window.location.href = '../pages/leaderboard.html'; 
            }, 1000);
        }
        
        if (!isLogin) {
            // Clear sign up fields
            newUsernameInput.value = '';
            newEmailInput.value = '';
            newPasswordInput.value = '';

            setTimeout(() => {
                setAuthMode('login');
                feedbackMsg.innerHTML = '✅ Registration successful! Please log in.';
                feedbackMsg.className = 'feedback-message success show';
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

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let formValid = true;
        const currentView = loginView.classList.contains('active') ? 'login' : signupView.classList.contains('active') ? 'signup' : null;

        if (currentView === 'login') {
            formValid &= validateField(usernameInput, 'username-error', 'Codename is required');
            formValid &= validateField(passwordInput, 'password-error', 'Passkey is required');
        } else if (currentView === 'signup') {
            formValid &= validateField(newUsernameInput, 'new-username-error', 'Codename is required');
            formValid &= validateField(newEmailInput, 'new-email-error', 'Email Key is required');
            formValid &= validateField(newPasswordInput, 'new-password-error', 'Passkey is required');
        }

        if (formValid) {
            startVerificationSimulation(currentView === 'login');
        } else {
            feedbackMsg.textContent = '❌ Input validation failed. Check required fields.';
            feedbackMsg.className = 'feedback-message error show';
            setTimeout(() => feedbackMsg.classList.remove('show'), 4000);
        }
    });

    // --- INITIALIZATION ---
    function initMatrixRain() {
        const canvas = document.getElementById('cyber-rain-canvas');
        if (!canvas) return; 
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const katakana = 'アァカサタナハマヤラワガザダバパピビヂゾブヅエェケセテネヘメレヱゲゼデベペオォコソトノホモヨロヲゴゾドボポぷらーいむすたーわんきらーんあどみんいんぷっ';
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
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
                if (y * fontSize > canvas.height && Math.random() > 0.975) { 
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drops.length = Math.floor(canvas.width / fontSize);
            for (let i = 0; i < drops.length; i++) {
                if(drops[i] === undefined) drops[i] = 0;
            }
        });
        let animationSpeed = 33 + Math.random() * 10;
        setInterval(draw, animationSpeed);
    }
    
    function initHackerStats() {
        const STATS = [
            { label: "CPU_LOAD", unit: "%", min: 15, max: 80, isWarn: v => v > 90 },
            { label: "MEM_USAGE", unit: "GB", min: 2, max: 12, decimal: 1, isWarn: v => v > 10 },
            { label: "PING_LAT", unit: "ms", min: 5, max: 99, decimal: 0, isWarn: v => v > 50 },
            { label: "CORE_TEMP", unit: "°C", min: 35, max: 65, decimal: 0, isWarn: v => v > 60 }
        ];
        let currentStats = STATS.map(s => ({ 
            ...s, 
            value: s.min + Math.random() * (s.max - s.min) 
        }));

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
    
    function selectAndAnimateMessage() {
        const dynamicMsgElement = document.getElementById('dynamic-login-message');
        const welcomeMessages = [
            "> SYSTEM_ACCESS_POINT",
            "> SYNCHRONIZING_ACCESS_KEYS",
            "> INITIATE_AGENT_HANDSHAKE"
        ];
        const targetText = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        
        dynamicMsgElement.style.animation = 'none';

        let textIndex = 0;
        dynamicMsgElement.textContent = ''; 

        const typewriter = () => {
            if (textIndex < targetText.length) {
                dynamicMsgElement.textContent += targetText.charAt(textIndex);
                textIndex++;
                setTimeout(typewriter, 75 + Math.random() * 50);
            }
        };

        typewriter();
    }
    
    selectAndAnimateMessage();
    initMatrixRain();
    initHackerStats(); 
    setAuthMode('login'); 
    getAccounts(); // Initialize Local Storage
});