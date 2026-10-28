// Kiểm biến môi trường deploy TRƯỚC khi migrate DB (npm run ci). Thoát mã 1 kèm thông báo (không chứa giá trị bí mật).
import 'dotenv/config'
import { assertDeployEnv } from '../src/lib/env.ts'

try {
  assertDeployEnv(process.env)
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
