// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Thư mục media riêng cho test, đặt trước khi bất kỳ module nào nạp payload.config.
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const testMediaDir = mkdtempSync(path.join(tmpdir(), 'chieuhoi-media-'))
process.env.MEDIA_DIR = testMediaDir
process.on('exit', () => rmSync(testMediaDir, { recursive: true, force: true }))
