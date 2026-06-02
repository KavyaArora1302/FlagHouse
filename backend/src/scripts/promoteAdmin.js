import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { getAdminEmails } from '../utils/adminEmail.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const emailArg = process.argv[2]?.trim().toLowerCase();
const emailsToPromote = emailArg ? [emailArg] : getAdminEmails();

if (emailsToPromote.length === 0) {
  console.error('Usage: npm run promote-admin -- email@example.com');
  console.error('Or set ADMIN_EMAIL in backend/.env');
  process.exit(1);
}

const run = async () => {
  await connectDB();

  for (const email of emailsToPromote) {
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.warn(`No user found for: ${email}`);
      continue;
    }

    console.log(`Promoted to admin: ${user.email} (${user.name})`);
  }

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
