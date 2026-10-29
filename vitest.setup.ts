// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'
import { cleanup } from '@testing-library/react'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { afterEach } from 'vitest'

// PREVIEW_ALL trong .env dev không được đổi hành vi test; test nào cần thì tự đặt.
delete process.env.PREVIEW_ALL

// Dọn DOM sau mỗi test (RTL không tự dọn vì vitest không bật globals).
afterEach(cleanup)

// Thư mục media riêng cho test, đặt trước khi bất kỳ module nào nạp payload.config.
const testMediaDir = mkdtempSync(path.join(tmpdir(), 'chieuhoi-media-'))
process.env.MEDIA_DIR = testMediaDir
process.on('exit', () => rmSync(testMediaDir, { recursive: true, force: true }))
