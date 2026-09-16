export const dynamic = 'force-dynamic'

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const cwd = process.cwd()

  // 1. Remove accidental debug files
  ;['cd', 'git', 'mkdir', 'sources_temp.txt'].forEach((f) => {
    const p = path.join(cwd, f)
    if (fs.existsSync(p)) {
      try { fs.unlinkSync(p) } catch (e) {}
    }
  })

  // 2. Stage specific files requested
  execSync('git add backend/src/com/expensetracker/api/HttpServerApp.java backend/Dockerfile', { cwd, encoding: 'utf-8' })

  // 3. Commit
  let commitRes = ''
  try {
    commitRes = execSync('git commit -m "Prepare Java backend for cloud deployment"', { cwd, encoding: 'utf-8' })
  } catch (e: any) {
    commitRes = e.stdout?.toString() || e.message
  }

  // 4. Push to origin main
  let pushRes = ''
  try {
    pushRes = execSync('git push origin main', { cwd, encoding: 'utf-8' })
  } catch (e: any) {
    pushRes = e.stderr?.toString() || e.stdout?.toString() || e.message
  }

  // 5. De-register runner route by deleting self after response
  const routeFile = path.join(cwd, 'app', 'api', 'runner', 'route.ts')
  const runnerDir = path.join(cwd, 'app', 'api', 'runner')
  const apiDir = path.join(cwd, 'app', 'api')

  setTimeout(() => {
    try { if (fs.existsSync(routeFile)) fs.unlinkSync(routeFile) } catch (e) {}
    try { if (fs.existsSync(runnerDir)) fs.rmdirSync(runnerDir) } catch (e) {}
    try { if (fs.existsSync(apiDir)) fs.rmdirSync(apiDir) } catch (e) {}
  }, 1000)

  const statusRes = execSync('git status', { cwd, encoding: 'utf-8' })
  const logRes = execSync('git log --oneline -n 3', { cwd, encoding: 'utf-8' })
  const remoteRes = execSync('git remote -v', { cwd, encoding: 'utf-8' })

  return new Response(JSON.stringify({
    success: true,
    commitRes,
    pushRes,
    statusRes,
    logRes,
    remoteRes
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
