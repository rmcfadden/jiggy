import assert from 'node:assert/strict'
import { test } from 'node:test'
import { GameServiceRegistry } from './registry.ts'
import { LastXGameService, NextPiecesGameService } from './trayGameService.ts'
import { ScrambledGameService } from './scrambledGameService.ts'
import { foldState } from './puzzleGameService.ts'
import { GameError, parseAction, type GameAction, type PuzzleState, type StateRow } from './types.ts'

/** A GUID maker that counts, so a test knows every piece's GUID. Real plays use random v4 UUIDs. */
const counter = () => {
  let n = 0
  return () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`
}
const registry = () => new GameServiceRegistry([new ScrambledGameService(counter()), new NextPiecesGameService(counter()), new LastXGameService(counter())])
const refused = (status: number) => (e: unknown) => e instanceof GameError && e.status === status
const guidOf = (state: PuzzleState, i: number) => state.matrix.flat()[i]
const offset = (state: PuzzleState, i: number) => state.pieces?.[guidOf(state, i)]
const FORGED = 'ffffffff-ffff-4fff-8fff-ffffffffffff'

test('parseAction accepts the two contracts and rejects everything else', () => {
  const g = guidOf({ matrix: [[FORGED]] } as PuzzleState, 0)
  assert.deepEqual(parseAction({ type: 'place', piece: g, slot: 2 }), { type: 'place', piece: g, slot: 2 })
  assert.deepEqual(parseAction({ type: 'move', piece: g.toUpperCase(), x: -3.5, y: 4 }), { type: 'move', piece: g, x: -3.5, y: 4 })
  const bad = [null, [], 'x', {}, { type: 'fly' }, { type: 'place', piece: 1, slot: 0 }, { type: 'place', piece: 'not-a-guid', slot: 0 }, { type: 'place', piece: g, slot: -1 }, { type: 'place', piece: g, slot: 0, extra: 1 }, { type: 'move', piece: g, x: NaN, y: 0 }, { type: 'move', piece: g, x: '1', y: 0 }]
  for (const b of bad) assert.throws(() => parseAction(b), refused(400), JSON.stringify(b))
})

test('an unknown parent has no game service', () => {
  assert.throws(() => registry().forParent('chess'), refused(422))
})

test('a template without a grid cannot start', () => {
  assert.throws(() => registry().forParent('scrambled').start({ cols: 0, rows: 3, config: {} }), refused(422))
})

test('the matrix holds cols x rows unique GUIDs, and two plays never share one', () => {
  const real = new GameServiceRegistry().forParent('scrambled') // real random GUIDs
  const a = real.start({ cols: 4, rows: 3, config: { seed: 1 } })
  const b = real.start({ cols: 4, rows: 3, config: { seed: 1 } })
  assert.equal(a.matrix.length, 3)
  assert.ok(a.matrix.every((row) => row.length === 4))
  assert.equal(new Set(a.matrix.flat()).size, 12)
  assert.ok(a.matrix.flat().every((g) => /^[0-9a-f-]{36}$/.test(g)))
  assert.ok(!a.matrix.flat().some((g) => b.matrix.flat().includes(g)))
  // The same seed still lays pieces out the same way: only the names differ.
  assert.deepEqual(Object.values(a.pieces ?? {}), Object.values(b.pieces ?? {}))
})

test('next-pieces: panel size, mistakes and solving', () => {
  const service = registry().forParent('next-pieces')
  let state = service.start({ cols: 2, rows: 2, config: { panelSize: 2, order: 'sequential' } })
  const [p0, p1, p2, p3] = state.matrix.flat()
  assert.deepEqual(state.queue, [p0, p1, p2, p3])
  assert.equal(state.visible, 2)
  assert.throws(() => service.action(state, { type: 'place', piece: p3, slot: 3 }), refused(409)) // not in the panel
  assert.throws(() => service.action(state, { type: 'place', piece: FORGED, slot: 0 }), refused(409)) // not a piece of this play
  assert.throws(() => service.action(state, { type: 'move', piece: p0, x: 0, y: 0 }), refused(400)) // wrong action kind
  const wrong = service.action(state, { type: 'place', piece: p0, slot: 1 })
  assert.equal(wrong.result, 'denied')
  assert.equal(wrong.correct, false)
  assert.deepEqual(wrong.events, [])
  assert.equal(wrong.state.mistakes, 1)
  for (const [slot, piece] of [p0, p1, p2, p3].entries()) {
    const result = service.action(state, { type: 'place', piece, slot })
    assert.equal(result.result, 'placed')
    assert.deepEqual(result.events, [{ type: 'pieces_added', pieces: [piece] }])
    state = result.state
  }
  assert.equal(state.solved, true)
  assert.throws(() => service.action(state, { type: 'place', piece: p0, slot: 0 }), refused(409)) // already solved
})

test('a filled slot is refused', () => {
  const service = registry().forParent('next-pieces')
  const state = service.start({ cols: 2, rows: 1, config: { panelSize: 2 } })
  const [p0, p1] = state.matrix.flat()
  const next = service.action(state, { type: 'place', piece: p0, slot: 0 }).state
  assert.throws(() => service.action(next, { type: 'place', piece: p1, slot: 0 }), refused(409))
})

test('last-x leaves exactly X pieces to place, and the same seed gives the same game', () => {
  const service = registry().forParent('last-x')
  const config = { remaining: 3, seed: 7 }
  const a = service.start({ cols: 3, rows: 3, config })
  assert.equal(a.queue?.length, 3)
  assert.deepEqual(a, registry().forParent('last-x').start({ cols: 3, rows: 3, config })) // counter GUIDs repeat per registry
  let state = a
  for (const piece of [...(a.queue ?? [])]) state = service.action(state, { type: 'place', piece, slot: state.matrix.flat().indexOf(piece) }).state
  assert.equal(state.solved, true)
})

test('scrambled: pieces start loose, snap home, and placed pieces are locked', () => {
  const service = registry().forParent('scrambled')
  const start = service.start({ cols: 3, rows: 2, config: { seed: 5, freeBuild: false } })
  assert.equal(Object.keys(start.pieces ?? {}).length, 6)
  assert.equal(start.solved, false)
  assert.ok(Object.values(start.pieces ?? {}).every((o) => o.x !== 0 || o.y !== 0))
  assert.throws(() => service.action(start, { type: 'move', piece: FORGED, x: 0, y: 0 }), refused(409))
  assert.throws(() => service.action(start, { type: 'move', piece: guidOf(start, 0), x: 1e9, y: 0 }), refused(409))
  assert.throws(() => service.action(start, { type: 'place', piece: guidOf(start, 0), slot: 0 }), refused(400))

  const near = service.action(start, { type: 'move', piece: guidOf(start, 0), x: 10, y: -10 })
  assert.equal(near.result, 'placed')
  assert.equal(near.correct, true)
  assert.deepEqual(near.events, [{ type: 'pieces_added', pieces: [guidOf(start, 0)] }])
  assert.deepEqual(offset(near.state, 0), { x: 0, y: 0 })
  assert.throws(() => service.action(near.state, { type: 'move', piece: guidOf(start, 0), x: 50, y: 50 }), refused(409))

  const far = service.action(start, { type: 'move', piece: guidOf(start, 1), x: 500, y: 500 })
  assert.equal(far.result, 'moved')
  assert.equal(far.correct, false)
  assert.deepEqual(far.events, [{ type: 'pieces_moved', pieces: [guidOf(start, 1)], x: 500, y: 500 }])
  assert.deepEqual(offset(far.state, 1), { x: 500, y: 500 })

  let state = start
  for (let i = 0; i < 6; i++) state = service.action(state, { type: 'move', piece: guidOf(start, i), x: 0, y: 0 }).state
  assert.equal(state.solved, true)
})

test('scrambled free build: a joined group moves as one, with one event naming every piece', () => {
  const service = registry().forParent('scrambled')
  let state = service.start({ cols: 3, rows: 1, config: { seed: 2, freeBuild: true } })
  const [a, b, c] = state.matrix.flat()
  state = service.action(state, { type: 'move', piece: b, x: 400, y: 400 }).state
  // Piece 0 lands beside piece 1: it settles onto it and the two are joined.
  const join = service.action(state, { type: 'move', piece: a, x: 405, y: 398 })
  assert.equal(join.result, 'moved')
  assert.equal(join.events.length, 2)
  assert.deepEqual(join.events[0], { type: 'pieces_moved', pieces: [a], x: 400, y: 400 }) // the settled position, not the raw drop
  assert.equal(join.events[1].type, 'pieces_joined')
  assert.deepEqual([...join.events[1].pieces].sort(), [a, b].sort())
  assert.deepEqual(offset(join.state, 0), offset(join.state, 1))

  // Dragging either member now moves both, as a single pieces_moved event.
  const moved = service.action(join.state, { type: 'move', piece: b, x: 300, y: 300 })
  assert.equal(moved.events.length, 1)
  assert.equal(moved.events[0].type, 'pieces_moved')
  assert.deepEqual([...moved.events[0].pieces].sort(), [a, b].sort())
  assert.deepEqual(offset(moved.state, 0), { x: 300, y: 300 })
  assert.deepEqual(offset(moved.state, 1), { x: 300, y: 300 })
  assert.notDeepEqual(offset(moved.state, 2), { x: 300, y: 300 }) // piece c is not part of the group
  assert.ok(c)

  // Dropping the whole group on the template places every member in one pieces_added event.
  const home = service.action(moved.state, { type: 'move', piece: a, x: 0, y: 0 })
  assert.equal(home.result, 'placed')
  assert.equal(home.events.length, 1)
  assert.equal(home.events[0].type, 'pieces_added')
  assert.deepEqual([...home.events[0].pieces].sort(), [a, b].sort())
  assert.deepEqual(offset(home.state, 0), { x: 0, y: 0 })
  assert.deepEqual(offset(home.state, 1), { x: 0, y: 0 })
})

test('foldState replays the first row and the stored event rows', () => {
  const service = registry().forParent('scrambled')
  const start = service.start({ cols: 2, rows: 2, config: { seed: 3, freeBuild: false } })
  const actions: GameAction[] = [
    { type: 'move', piece: guidOf(start, 0), x: 5, y: 5 },
    { type: 'move', piece: guidOf(start, 1), x: 400, y: 0 },
  ]
  let state: PuzzleState = start
  const rows: Record<string, unknown>[] = [start as unknown as Record<string, unknown>]
  for (const action of actions) {
    const result = service.action(state, action)
    const row: StateRow = { events: result.events, mistakes: result.state.mistakes, solved: result.state.solved }
    rows.push(JSON.parse(JSON.stringify(row)))
    state = result.state
  }
  assert.deepEqual(foldState(rows), state)
  assert.throws(() => foldState([]), refused(404))
  assert.throws(() => foldState([{ type: 'scrambled', offsets: [] }]), refused(409)) // a play stored before GUIDs
})

test('foldState replays tray games, mistakes included', () => {
  const service = registry().forParent('next-pieces')
  const start = service.start({ cols: 2, rows: 1, config: { panelSize: 2 } })
  const [p0, p1] = start.matrix.flat()
  let state = start
  const rows: Record<string, unknown>[] = [start as unknown as Record<string, unknown>]
  for (const action of [{ type: 'place', piece: p0, slot: 1 }, { type: 'place', piece: p0, slot: 0 }, { type: 'place', piece: p1, slot: 1 }] as GameAction[]) {
    const result = service.action(state, action)
    rows.push(JSON.parse(JSON.stringify({ events: result.events, mistakes: result.state.mistakes, solved: result.state.solved })))
    state = result.state
  }
  assert.equal(state.mistakes, 1)
  assert.equal(state.solved, true)
  assert.deepEqual(foldState(rows), state)
})
