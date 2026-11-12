import assert from 'node:assert/strict'
import { test } from 'node:test'
import { GameServiceRegistry } from './registry.ts'
import { foldState } from './puzzleGameService.ts'
import { GameError, parseAction, type GameAction, type PuzzleState } from './types.ts'

const registry = new GameServiceRegistry()
const refused = (status: number) => (e: unknown) => e instanceof GameError && e.status === status

test('parseAction accepts the two contracts and rejects everything else', () => {
  assert.deepEqual(parseAction({ type: 'place', piece: 1, slot: 2 }), { type: 'place', piece: 1, slot: 2 })
  assert.deepEqual(parseAction({ type: 'move', piece: 1, x: -3.5, y: 4 }), { type: 'move', piece: 1, x: -3.5, y: 4 })
  for (const bad of [null, [], 'x', {}, { type: 'fly' }, { type: 'place', piece: -1, slot: 0 }, { type: 'place', piece: 1.5, slot: 0 }, { type: 'place', piece: 1, slot: 0, extra: 1 }, { type: 'move', piece: 0, x: NaN, y: 0 }, { type: 'move', piece: 0, x: '1', y: 0 }]) {
    assert.throws(() => parseAction(bad), refused(400), JSON.stringify(bad))
  }
})

test('an unknown parent has no game service', () => {
  assert.throws(() => registry.forParent('chess'), refused(422))
})

test('a template without a grid cannot start', () => {
  assert.throws(() => registry.forParent('scrambled').start({ cols: 0, rows: 3, config: {} }), refused(422))
})

test('next-pieces: panel size, mistakes and solving', () => {
  const service = registry.forParent('next-pieces')
  let state = service.start({ cols: 2, rows: 2, config: { panelSize: 2, order: 'sequential' } })
  assert.deepEqual(state.queue, [0, 1, 2, 3])
  assert.equal(state.visible, 2)
  assert.throws(() => service.action(state, { type: 'place', piece: 3, slot: 3 }), refused(409)) // not in the panel
  assert.throws(() => service.action(state, { type: 'move', piece: 0, x: 0, y: 0 }), refused(400)) // wrong action kind
  const wrong = service.action(state, { type: 'place', piece: 0, slot: 1 })
  assert.equal(wrong.correct, false)
  assert.equal(wrong.state.mistakes, 1)
  assert.deepEqual(wrong.delta, { mistakes: 1 })
  for (const piece of [0, 1, 2, 3]) {
    const result = service.action(state, { type: 'place', piece, slot: piece })
    assert.equal(result.correct, true)
    state = result.state
  }
  assert.equal(state.solved, true)
  assert.throws(() => service.action(state, { type: 'place', piece: 0, slot: 0 }), refused(409)) // already solved
})

test('a filled slot is refused', () => {
  const service = registry.forParent('next-pieces')
  const state = service.start({ cols: 2, rows: 1, config: { panelSize: 2 } })
  const next = service.action(state, { type: 'place', piece: 0, slot: 0 }).state
  assert.throws(() => service.action(next, { type: 'place', piece: 1, slot: 0 }), refused(409))
})

test('last-x leaves exactly X pieces to place, and the same seed gives the same game', () => {
  const service = registry.forParent('last-x')
  const config = { remaining: 3, seed: 7 }
  const a = service.start({ cols: 3, rows: 3, config })
  assert.equal(a.queue?.length, 3)
  assert.equal(a.placed?.filter((p) => !p).length, 3)
  assert.deepEqual(a, service.start({ cols: 3, rows: 3, config }))
  let state = a
  for (const piece of [...(a.queue ?? [])]) state = service.action(state, { type: 'place', piece, slot: piece }).state
  assert.equal(state.solved, true)
})

test('scrambled: pieces start loose, snap home, and placed pieces are locked', () => {
  const service = registry.forParent('scrambled')
  const start = service.start({ cols: 3, rows: 2, config: { seed: 5, freeBuild: false } })
  assert.equal(start.offsets?.length, 6)
  assert.equal(start.solved, false)
  assert.ok(start.offsets?.every((o) => o.x !== 0 || o.y !== 0))
  assert.throws(() => service.action(start, { type: 'move', piece: 9, x: 0, y: 0 }), refused(409))
  assert.throws(() => service.action(start, { type: 'move', piece: 0, x: 1e9, y: 0 }), refused(409))
  assert.throws(() => service.action(start, { type: 'place', piece: 0, slot: 0 }), refused(400))

  const near = service.action(start, { type: 'move', piece: 0, x: 10, y: -10 })
  assert.equal(near.correct, true)
  assert.deepEqual(near.state.offsets?.[0], { x: 0, y: 0 })
  assert.deepEqual(Object.keys(near.delta.offsets as object), ['0'])
  assert.throws(() => service.action(near.state, { type: 'move', piece: 0, x: 50, y: 50 }), refused(409))

  const far = service.action(start, { type: 'move', piece: 1, x: 500, y: 500 })
  assert.equal(far.correct, false)
  assert.deepEqual(far.state.offsets?.[1], { x: 500, y: 500 })

  let state = start
  for (let i = 0; i < 6; i++) state = service.action(state, { type: 'move', piece: i, x: 0, y: 0 }).state
  assert.equal(state.solved, true)
})

test('scrambled free build: joined pieces move together', () => {
  const service = registry.forParent('scrambled')
  let state = service.start({ cols: 3, rows: 1, config: { seed: 2, freeBuild: true } })
  // Drop piece 1 far away, then bring piece 0 next to where piece 1 would be joined: 0 and 1 share an offset once settled.
  state = service.action(state, { type: 'move', piece: 1, x: 400, y: 400 }).state
  state = service.action(state, { type: 'move', piece: 0, x: 405, y: 398 }).state
  assert.deepEqual(state.offsets?.[0], state.offsets?.[1]) // piece 0 locked onto its neighbour
  const moved = service.action(state, { type: 'move', piece: 0, x: 300, y: 300 })
  assert.deepEqual(moved.state.offsets?.[0], { x: 300, y: 300 })
  assert.deepEqual(moved.state.offsets?.[1], { x: 300, y: 300 })
})

test('foldState replays the first row and the later deltas', () => {
  const service = registry.forParent('scrambled')
  const start = service.start({ cols: 2, rows: 2, config: { seed: 3, freeBuild: false } })
  const actions: GameAction[] = [{ type: 'move', piece: 0, x: 5, y: 5 }, { type: 'move', piece: 1, x: 400, y: 0 }]
  let state: PuzzleState = start
  const rows: Record<string, unknown>[] = [start as unknown as Record<string, unknown>]
  for (const action of actions) {
    const result = service.action(state, action)
    rows.push(result.delta)
    state = result.state
  }
  assert.deepEqual(foldState(rows), state)
  assert.throws(() => foldState([]), refused(404))
})
