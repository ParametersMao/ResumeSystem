import assert from 'node:assert/strict'
import test, { after } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import axios from 'axios'
import { createServer } from 'vite'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({
  root: projectRoot,
  logLevel: 'error',
  server: { middlewareMode: true, hmr: { port: 24701 } },
  appType: 'custom',
})
const { setupMock } = await vite.ssrLoadModule('/src/api/mock.ts')

after(async () => {
  await vite.close()
})

test('deleting one mock resume removes only that resume from the list', async () => {
  const client = axios.create()
  setupMock(client)

  const marker = `delete-contract-${Date.now()}`
  const firstResponse = await client.post('/api/resumes', {
    title: `${marker}-delete`,
    content: '{}',
  })
  const secondResponse = await client.post('/api/resumes', {
    title: `${marker}-keep`,
    content: '{}',
  })
  const firstId = firstResponse.data.data.id
  const secondId = secondResponse.data.data.id

  const beforeResponse = await client.get('/api/resumes', {
    params: { page: 1, limit: 100 },
  })
  const beforeIds = beforeResponse.data.data.list.map((resume: { id: number }) => resume.id)
  assert.ok(beforeIds.includes(firstId), 'the resume selected for deletion must exist before deletion')
  assert.ok(beforeIds.includes(secondId), 'the control resume must exist before deletion')

  const deleteResponse = await client.delete(`/api/resumes/${firstId}`)
  assert.equal(deleteResponse.status, 200)
  assert.equal(deleteResponse.data.code, 200)

  const afterResponse = await client.get('/api/resumes', {
    params: { page: 1, limit: 100 },
  })
  const afterIds = afterResponse.data.data.list.map((resume: { id: number }) => resume.id)
  assert.ok(!afterIds.includes(firstId), 'the deleted resume must disappear from the list')
  assert.ok(afterIds.includes(secondId), 'deleting one resume must not remove another resume')
})
