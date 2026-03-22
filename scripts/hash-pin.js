#!/usr/bin/env node
/**
 * Vynk — Generate Admin PIN hash
 * Usage: npm run setup:pin
 * Then paste the output into ADMIN_PIN_HASH in .env.local
 */
const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.question('Enter your 6-digit admin PIN: ', async (pin) => {
  if (!/^\d{6}$/.test(pin)) {
    console.error('Error: PIN must be exactly 6 digits.')
    process.exit(1)
  }
  console.log('\nGenerating secure hash (this takes a few seconds)...')
  const hash = await bcrypt.hash(pin, 12)
  console.log('\n✓ Add this to your .env.local:\n')
  console.log(`ADMIN_PIN_HASH=${hash}`)
  console.log('\nKeep your PIN safe. Do not share it.')
  rl.close()
})
