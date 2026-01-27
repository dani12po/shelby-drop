/**
 * DEBUG: Real Aptos-Shelby Upload Test
 * 
 * Test script for the new REAL blockchain upload system
 */

import fs from 'fs';
import FormData from 'form-data';

const API_URL = 'http://localhost:3000/api/upload';

async function testRealUpload() {
  console.log('🚀 DEBUG: Testing REAL Aptos-Shelby Upload...\n');

  try {
    // Create a test file
    const testContent = 'Hello Aptos-Shelby Network! This is a REAL blockchain upload test.';
    const testFilePath = './debug-real-test.txt';
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📁 Created test file:', testFilePath);
    console.log('📄 File content:', testContent);
    console.log('📏 File size:', fs.statSync(testFilePath).size, 'bytes\n');

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath), {
      filename: 'debug-real-test.txt',
      contentType: 'text/plain'
    });
    form.append('blobName', 'real-test-' + Date.now());
    form.append('retentionDays', '7');
    form.append('wallet', '0x50093856644bfcf8e33e3979b52f1a71f79f24a6ed7da94aa92b5b4057e0d0bb');

    console.log('📤 Sending request to:', API_URL);
    console.log('📋 Form data prepared with file and metadata\n');

    // Make request
    const response = await fetch(API_URL, {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📡 Response body:', responseText);

    try {
      const responseJson = JSON.parse(responseText);
      console.log('\n✅ Parsed JSON response:');
      console.log(JSON.stringify(responseJson, null, 2));
      
      // Check for REAL success criteria
      if (responseJson.success && responseJson.data && responseJson.data.txHash) {
        console.log('\n🎉 REAL UPLOAD SUCCESS CRITERIA MET:');
        console.log('✅ Upload successful');
        console.log('✅ REAL TX Hash:', responseJson.data.txHash);
        console.log('✅ Aptos Explorer:', responseJson.data.explorerUrls?.aptos);
        console.log('✅ Shelby Explorer:', responseJson.data.explorerUrls?.shelby);
        
        // Verify in Aptos Explorer
        const aptosUrl = responseJson.data.explorerUrls.aptos;
        console.log('\n🔍 VERIFYING IN APTOS EXPLORER:', aptosUrl);
        
        try {
          const aptosResponse = await fetch(aptosUrl);
          if (aptosResponse.ok) {
            console.log('✅ TRANSACTION FOUND IN APTOS EXPLORER');
          } else {
            console.log('❌ TRANSACTION NOT FOUND IN APTOS EXPLORER');
          }
        } catch (aptosError) {
          console.log('❌ ERROR VERIFYING APTOS EXPLORER:', aptosError.message);
        }
        
        // Verify in Shelby Explorer
        const shelbyUrl = responseJson.data.explorerUrls.shelby;
        console.log('\n🔍 VERIFYING IN SHELBY EXPLORER:', shelbyUrl);
        
        try {
          const shelbyResponse = await fetch(shelbyUrl);
          if (shelbyResponse.ok) {
            const shelbyHtml = await shelbyResponse.text();
            const blobName = responseJson.data.blobName;
            if (shelbyHtml.includes(blobName)) {
              console.log('✅ BLOB FOUND IN SHELBY EXPLORER');
            } else {
              console.log('⏳ BLOB NOT YET INDEXED IN SHELBY EXPLORER (may take time)');
            }
          } else {
            console.log('❌ ERROR ACCESSING SHELBY EXPLORER');
          }
        } catch (shelbyError) {
          console.log('❌ ERROR VERIFYING SHELBY EXPLORER:', shelbyError.message);
        }
        
      } else {
        console.log('\n❌ REAL UPLOAD FAILED:');
        console.log('❌ Upload failed or missing TX hash');
        console.log('❌ Error:', responseJson.error);
        console.log('❌ Stage:', responseJson.stage);
      }
    } catch (parseError) {
      console.log('\n❌ Failed to parse JSON response:', parseError.message);
    }

  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    console.error('💥 Stack:', error.stack);
  } finally {
    // Cleanup
    if (fs.existsSync('./debug-real-test.txt')) {
      fs.unlinkSync('./debug-real-test.txt');
      console.log('\n🧹 Cleaned up test file');
    }
  }
}

testRealUpload();
