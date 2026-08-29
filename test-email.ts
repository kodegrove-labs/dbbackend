import { sendEmail } from './src/email/email.service';

async function test() {
  console.log('Testing Email Service...');
  try {
    await sendEmail(
      'guptaharshit279@gmail.com',
      'Test Integration - Auth Service',
      'Hello Harshit! This is a test email from your Google AI Studio Auth Service to verify that your Nodemailer configuration is working properly.'
    );
    console.log('SUCCESS: Email sent to guptaharshit279@gmail.com');
  } catch (err) {
    console.error('FAILED to send email:', err);
  }
}
test();
