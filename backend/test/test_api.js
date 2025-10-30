import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testEndpoint() {
  const form = new FormData();
  form.append('file', fs.createReadStream(path.join(process.cwd(), 'test', 'sample_report.txt')));

  try {
    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      body: form
    });
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testEndpoint();