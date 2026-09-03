const nodemailer = require('nodemailer');
async function run() {
  console.log('creating account...');
  try {
    const acc = await nodemailer.createTestAccount();
    console.log('Account created:', acc.user);
  } catch (e) {
    console.error('Error:', e);
  }
}
run();
