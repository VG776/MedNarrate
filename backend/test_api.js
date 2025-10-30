import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testAnalyzeEndpoint() {
  const form = new FormData();
  form.append('file', fs.createReadStream('./test/sample_report.txt'));

  try {
    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      body: form
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testAnalyzeEndpoint();