/**
 * Database setup script
 * Run this to create the initial admin user
 */
import { db } from './index';
import { admins } from './schema';
import bcrypt from 'bcryptjs';

async function setupAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin
    await db.insert(admins).values({
      email,
      password: hashedPassword,
      name: 'Admin',
    });

    console.log('✓ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\nIMPORTANT: Change the password after first login!');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

setupAdmin();
