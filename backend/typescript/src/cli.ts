import '../generated/repositories/repositoryRegistry.ts'
import './datasources-register.ts'
import { setup } from './cli/setup.ts'
import { addUser, updateUser } from './cli/users.ts'

const commands: Record<string, () => Promise<void>> = { setup, 'add-user': addUser, 'update-user': updateUser }
const name = process.argv[2]

if (!name || !commands[name]) {
  console.error(`usage: cli <${Object.keys(commands).join('|')}>`)
  process.exit(1)
}
await commands[name]()
process.exit(0)
