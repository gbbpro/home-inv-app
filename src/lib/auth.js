import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  const saltRounds = 10; // Number of salt rounds
  return await bcrypt.hash(password, saltRounds);
}
