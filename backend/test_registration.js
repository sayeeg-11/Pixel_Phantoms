const http = require('http');

const data = JSON.stringify({
    firstName: "Test",
    lastName: "User",
    email: "chhimakshi@gmail.com", // Targeting the specific email user reported
    age: 25,
    eventTitle: "Phantom DevTalk: Game Engines" // Must match an existing event title or one created by logic
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🚀 Sending simulated registration request...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Response:', responseData);
        if (res.statusCode === 201) {
            console.log('\n✅ SUCCESS! Backend accepted registration.');
            console.log('👉 NOW CHECK BACKEND TERMINAL FOR EMAIL LOGS!');
        } else {
            console.log('\n❌ FAILED. Check backend logs for error.');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request Error:', error);
});

req.write(data);
req.end();
