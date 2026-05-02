const https = require('https');

const SECRET_KEY = 'sk_test_55a24e831a9740a698df29f256dfacf966769784';

function createPlan(name, amount) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: name,
      amount: amount, // in kobo/pesewas
      interval: 'monthly'
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/plan',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.status) {
            resolve(json.data.plan_code);
          } else {
            reject(new Error(`Failed to create plan ${name}: ${json.message}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  try {
    console.log('Creating Test Plans in Paystack...');
    const proCode = await createPlan('Tableo Pro Plan (Test)', 10000);
    console.log(`✅ PAYSTACK_PLAN_CODE_PRO=${proCode}`);
    
    const businessCode = await createPlan('Tableo Business Plan (Test)', 30000);
    console.log(`✅ PAYSTACK_PLAN_CODE_BUSINESS=${businessCode}`);
    
    console.log('\nPlease update your apps/api/.env with the codes above.');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
