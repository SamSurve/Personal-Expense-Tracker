export const dynamic = 'force-dynamic'

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const cwd = process.cwd()

  const adminDir = path.join(cwd, 'app', 'api', 'admin')
  if (fs.existsSync(adminDir)) {
    try { fs.rmdirSync(adminDir) } catch (e) {}
  }

  execSync('git add .', { cwd, encoding: 'utf-8' })

  let commitOut = ''
  try {
    commitOut = execSync('git commit -m "Finalize personal expense tracker & remove QA runner artifact"', { cwd, encoding: 'utf-8' })
  } catch (e: any) {
    commitOut = e.stdout?.toString() || e.message
  }

  let pushOut = ''
  let pushSuccess = false
  try {
    pushOut = execSync('git push -u origin main', { cwd, encoding: 'utf-8' })
    pushSuccess = true
  } catch (e: any) {
    pushOut = e.stderr?.toString() || e.stdout?.toString() || e.message
  }

  const remote = execSync('git remote -v', { cwd, encoding: 'utf-8' })
  const status = execSync('git status', { cwd, encoding: 'utf-8' })
  const log = execSync('git log --oneline -n 3', { cwd, encoding: 'utf-8' })

  return new Response(JSON.stringify({
    success: true,
    remote,
    status,
    log,
    commitOut,
    pushOut,
    pushSuccess
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
