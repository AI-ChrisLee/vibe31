// Test MCP migration tool
const testMcpMigration = async () => {
  const baseUrl = 'http://localhost:3000/api/mcp';
  
  console.log('Testing MCP database setup tool...\n');
  
  // Test 1: Check database status
  console.log('1. Checking database status...');
  try {
    const checkResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'setup_database',
          arguments: {
            action: 'check'
          }
        },
        id: 1
      })
    });
    
    const checkResult = await checkResponse.json();
    console.log('Response:', JSON.stringify(checkResult, null, 2));
  } catch (error) {
    console.error('Check failed:', error);
  }
  
  console.log('\n2. Getting setup instructions...');
  try {
    const instructionsResponse = await fetch(baseUrl, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'setup_database',
          arguments: {
            action: 'instructions'
          }
        },
        id: 2
      })
    });
    
    const instructionsResult = await instructionsResponse.json();
    console.log('Response:', JSON.stringify(instructionsResult, null, 2));
  } catch (error) {
    console.error('Instructions failed:', error);
  }
};

// Run the test
testMcpMigration().catch(console.error);