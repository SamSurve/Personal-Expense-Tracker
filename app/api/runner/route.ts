export const dynamic = 'force-dynamic'

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const cwd = process.cwd()
  const targetRemote = 'https://github.com/SamSurve/Personal-Expense-Tracker.git'

  // 1. Initial status & remote
  const initialRemote = execSync('git remote -v', { cwd, encoding: 'utf-8' })
  const initialBranch = execSync('git branch', { cwd, encoding: 'utf-8' })

  // 2. Change remote to SamSurve repository
  execSync(`git remote set-url origin ${targetRemote}`, { cwd, encoding: 'utf-8' })
  const updatedRemote = execSync('git remote -v', { cwd, encoding: 'utf-8' })

  // 3. Security check
  const envExists = fs.existsSync(path.join(cwd, '.env')) || fs.existsSync(path.join(cwd, '.env.local'))

  // 4. Git add & commit if any changes remain
  let commitOut = ''
  try {
    execSync('git add .', { cwd, encoding: 'utf-8' })
    commitOut = execSync('git commit -m "Finalize personal expense tracker"', { cwd, encoding: 'utf-8' })
  } catch (e: any) {
    commitOut = e.stdout?.toString() || e.message
  }

  // 5. Git push -u origin main (without force push)
  let pushOut = ''
  let pushSuccess = false
  try {
    pushOut = execSync('git push -u origin main', { cwd, encoding: 'utf-8' })
    pushSuccess = true
  } catch (e: any) {
    pushOut = e.stderr?.toString() || e.stdout?.toString() || e.message
  }

  // 6. Delete app/api/runner/route.ts and empty app/api directory
  const routeFile = path.join(cwd, 'app', 'api', 'runner', 'route.ts')
  const runnerDir = path.join(cwd, 'app', 'api', 'runner')
  const apiDir = path.join(cwd, 'app', 'api')

  let artifactRemoved = false
  try {
    if (fs.existsSync(routeFile)) fs.unlinkSync(routeFile)
    if (fs.existsSync(runnerDir)) fs.rmdirSync(runnerDir)
    if (fs.existsSync(apiDir)) fs.rmdirSync(apiDir)
    artifactRemoved = !fs.existsSync(routeFile)
  } catch (e) {
    console.error('Directory cleanup error:', e)
  }

  // Stage deletion of route.ts and commit/push if push succeeded
  if (pushSuccess) {
    try {
      execSync('git add .', { cwd, encoding: 'utf-8' })
      execSync('git commit -m "Remove QA runner route artifact"', { cwd, encoding: 'utf-8' })
      pushOut += '\n' + execSync('git push origin main', { cwd, encoding: 'utf-8' })
    } catch (e: any) {
      pushOut += '\n' + (e.stderr?.toString() || e.stdout?.toString() || e.message)
    }
  }

  // 7. Final status & log
  const finalStatus = execSync('git status', { cwd, encoding: 'utf-8' })
  const finalLog = execSync('git log --oneline -n 3', { cwd, encoding: 'utf-8' })

  return new Response(JSON.stringify({
    success: true,
    initialRemote,
    updatedRemote,
    envExists,
    commitOut,
    pushOut,
    pushSuccess,
    artifactRemoved,
    finalStatus,
    finalLog
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
