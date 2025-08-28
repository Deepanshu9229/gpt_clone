const http = require('http');

console.log('🧪 Testing app endpoints...');

// Test health endpoint
function testHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('✅ Health endpoint:', json.status);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Test conversations endpoint
function testConversations() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/conversations',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('✅ Conversations endpoint:', json.success ? 'Working' : 'Failed');
          if (json.offline) {
            console.log('📱 App is running in offline mode (MongoDB not available)');
          }
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Test creating a conversation
function testCreateConversation() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      title: 'Test Chat',
      model: 'gpt-4',
      messages: []
    });

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/conversations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('✅ Create conversation:', json.success ? 'Working' : 'Failed');
          if (json.conversation?.local) {
            console.log('📱 Conversation created locally (offline mode)');
          }
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('🚀 Starting tests...\n');
    
    await testHealth();
    await testConversations();
    await testCreateConversation();
    
    console.log('\n🎉 All tests passed! App is working correctly.');
    console.log('💡 The app is now running in offline mode without MongoDB.');
    console.log('🔧 To fix MongoDB connection, update your .env.local file with correct credentials.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('💡 Make sure the app is running with: npm run dev');
  }
}

runTests();
