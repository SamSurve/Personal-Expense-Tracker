export const dynamic = 'force-dynamic'

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const cwd = process.cwd()

  // 1. Delete accidental debug typo files
  ;['cd', 'git', 'mkdir', 'sources_temp.txt'].forEach((f) => {
    const p = path.join(cwd, f)
    if (fs.existsSync(p)) {
      try { fs.unlinkSync(p) } catch (e) {}
    }
  })

  // 2. Git Add
  execSync('git add .', { cwd, encoding: 'utf-8' })

  // 3. Git Commit
  let commitRes = ''
  try {
    commitRes = execSync('git commit -m "Finalize personal expense tracker"', { cwd, encoding: 'utf-8' })
  } catch (e: any) {
    commitRes = e.stdout?.toString() || e.message
  }

  // 4. Git Push
  let pushRes = ''
  try {
    pushRes = execSync('git push origin main', { cwd, encoding: 'utf-8' })
  } catch (e: any) {
    pushRes = e.stderr?.toString() || e.stdout?.toString() || e.message
  }

  // 5. Final verification
  const statusRes = execSync('git status', { cwd, encoding: 'utf-8' })
  const logRes = execSync('git log --oneline -n 3', { cwd, encoding: 'utf-8' })

  return new Response(JSON.stringify({
    success: true,
    commitRes,
    pushRes,
    statusRes,
    logRes
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
