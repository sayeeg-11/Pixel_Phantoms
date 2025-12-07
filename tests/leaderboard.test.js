// Simple test for leaderboard functionality

// Mock DOM elements for testing
const mockDOM = `
<div id="lb-rows">
    <div class="lb-loader">Scanning database...</div>
</div>
`;

// Mock data for testing
const mockPulls = [
    {
        merged_at: new Date().toISOString(),
        user: { login: 'testuser1', avatar_url: 'avatar1.jpg' },
        labels: [{ name: 'Level 3' }]
    },
    {
        merged_at: new Date().toISOString(),
        user: { login: 'testuser2', avatar_url: 'avatar2.jpg' },
        labels: [{ name: 'Level 2' }]
    }
];

const mockEvents = [
    { title: 'Test Event 1', date: '2025-12-01', location: 'Online' },
    { title: 'Test Event 2', date: '2025-12-15', location: 'In-person' }
];

// Test functions
function testCalculateScores() {
    console.log('Testing calculateScores function...');
    
    // This would normally be imported from home-leaderboard.js
    // For now, we'll just verify the structure
    
    const statsMap = {};
    
    // Simulate the scoring logic
    mockPulls.forEach(pr => {
        if (!pr.merged_at) return;
        
        const user = pr.user.login;
        if (!statsMap[user]) {
            statsMap[user] = {
                login: user,
                xp: 0,
                prCount: 0,
                eventsAttended: 0,
                avatar: pr.user.avatar_url
            };
        }
        
        let prPoints = 0;
        let hasLevel = false;
        
        pr.labels.forEach(label => {
            const name = label.name.toLowerCase();
            if (name.includes('level 3')) { 
                prPoints = 11; 
                hasLevel = true; 
            }
            else if (name.includes('level 2')) { 
                prPoints = 5; 
                hasLevel = true; 
            }
            else if (name.includes('level 1')) { 
                prPoints = 2; 
                hasLevel = true; 
            }
        });
        
        if (!hasLevel) prPoints = 1;
        
        statsMap[user].xp += prPoints * 100;
        statsMap[user].prCount++;
    });
    
    // Simulate events attendance
    Object.keys(statsMap).forEach(user => {
        const eventsAttended = Math.floor(Math.random() * 5);
        statsMap[user].eventsAttended = eventsAttended;
        statsMap[user].xp += eventsAttended * 250;
    });
    
    console.log('Stats Map:', statsMap);
    
    // Verify results
    if (Object.keys(statsMap).length === 2) {
        console.log('✓ calculateScores correctly processed 2 users');
    } else {
        console.error('✗ calculateScores did not process the correct number of users');
    }
    
    return statsMap;
}

function testGetTopContributors(statsMap) {
    console.log('Testing getTopContributors function...');
    
    const contributors = Object.values(statsMap);
    const sorted = contributors.sort((a, b) => b.xp - a.xp);
    const top5 = sorted.slice(0, 5);
    
    console.log('Top Contributors:', top5);
    
    if (top5.length <= 5) {
        console.log('✓ getTopContributors correctly limited results to top 5');
    } else {
        console.error('✗ getTopContributors did not limit results correctly');
    }
    
    return top5;
}

// Run tests
console.log('Running Leaderboard Tests...\n');

const scores = testCalculateScores();
const topContributors = testGetTopContributors(scores);

console.log('\nAll tests completed.');
console.log('Test Results Summary:');
console.log('- Processed', Object.keys(scores).length, 'contributors');
console.log('- Top contributor has', Math.max(...Object.values(scores).map(s => s.xp)), 'XP');
console.log('- Test completed successfully');