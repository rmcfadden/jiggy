use super::rng::Rng;
use super::types::{Offset, HOME};
use std::collections::HashSet;

/// Size of one piece cell, in puzzle units (the frontend's `PIECE_SIZE`).
pub const PIECE_SIZE: f64 = 100.0;
const TOLERANCE: f64 = PIECE_SIZE * 0.25;

pub struct Scatter<'a> {
    pub cols: usize,
    pub rows: usize,
    pub seed: u32,
    pub side: &'a str,
    pub count: usize,
    pub view_percent: f64,
    pub spread: f64,
}

fn view_margins(cols: usize, rows: usize, view_percent: f64) -> (f64, f64) {
    let f = (view_percent / 100.0).clamp(0.2, 0.8);
    let w = cols as f64 * PIECE_SIZE;
    let h = rows as f64 * PIECE_SIZE;
    ((PIECE_SIZE * 1.25).max((w / f - w) / 2.0), (PIECE_SIZE * 1.25).max((h / f - h) / 2.0))
}

fn between(rng: &mut Rng, lo: f64, hi: f64) -> f64 {
    lo + rng.next() * (hi - lo)
}

/// Deterministic starting offsets for each piece (row-major), measured from its solved position.
pub fn scatter_offsets(s: &Scatter) -> Vec<Offset> {
    let total = s.cols * s.rows;
    let count = s.count.clamp(1, total);
    let mut rng = Rng::new(s.seed ^ 0x5bd1e995);
    let (mx, my) = view_margins(s.cols, s.rows, s.view_percent);
    let w = s.cols as f64 * PIECE_SIZE;
    let h = s.rows as f64 * PIECE_SIZE;
    let half = PIECE_SIZE / 2.0;

    // Target piece-centre ranges [x0, x1, y0, y1] for each side of the board.
    let band = |side: &str| -> Option<[f64; 4]> {
        match side {
            "top" => Some([-mx + half, w + mx - half, -my + half, -half]),
            "bottom" => Some([-mx + half, w + mx - half, h + half, h + my - half]),
            "left" => Some([-mx + half, -half, -my + half, h + my - half]),
            "right" => Some([w + half, w + mx - half, -my + half, h + my - half]),
            _ => None,
        }
    };
    let target = |rng: &mut Rng| -> Offset {
        if let Some([x0, x1, y0, y1]) = band(s.side) {
            return Offset { x: between(rng, x0, x1), y: between(rng, y0, y1) };
        }
        loop {
            let x = between(rng, -mx + half, w + mx - half);
            let y = between(rng, -my + half, h + my - half);
            if x < -half || x > w + half || y < -half || y > h + half {
                return Offset { x, y };
            }
        }
    };

    // Mitchell's best-candidate: of several random targets, take the one farthest from the pieces already placed.
    let candidates = 1 + s.spread.clamp(0.0, 100.0).round() as usize;
    let mut taken: Vec<Offset> = Vec::new();

    // Pick which pieces are loose with a partial Fisher-Yates shuffle.
    let mut ids: Vec<usize> = (0..total).collect();
    // The picks are drawn before any target, in the same order as the frontend and the TypeScript backend.
    for i in 0..count {
        let j = i + (rng.next() * (total - i) as f64).floor() as usize;
        ids.swap(i, j);
    }
    let loose: HashSet<usize> = ids[..count].iter().copied().collect();

    (0..total)
        .map(|i| {
            if !loose.contains(&i) {
                return HOME;
            }
            let mut best = target(&mut rng);
            let mut best_gap = -1.0_f64;
            for c in 0..candidates {
                let t = if c == 0 { best } else { target(&mut rng) };
                let gap = taken.iter().map(|o| (o.x - t.x).hypot(o.y - t.y)).fold(f64::INFINITY, f64::min);
                if gap > best_gap {
                    best = t;
                    best_gap = gap;
                }
            }
            taken.push(best);
            let cx = ((i % s.cols) as f64 + 0.5) * PIECE_SIZE;
            let cy = ((i / s.cols) as f64 + 0.5) * PIECE_SIZE;
            Offset { x: best.x - cx, y: best.y - cy }
        })
        .collect()
}

/// Locks a piece onto its solved position (offset 0,0) when dropped close enough.
pub fn snap_piece(offset: Offset) -> Offset {
    if offset.x.hypot(offset.y) <= TOLERANCE { HOME } else { offset }
}

fn neighbours(cols: usize, len: usize, i: usize) -> impl Iterator<Item = usize> {
    let col = i % cols;
    [if col > 0 { i.checked_sub(1) } else { None }, if col < cols - 1 { Some(i + 1) } else { None }, i.checked_sub(cols), Some(i + cols)]
        .into_iter()
        .flatten()
        .filter(move |&j| j < len)
}

/// Pieces joined to `index`: grid neighbours (row-major, `cols` wide) that share its offset.
pub fn connected_pieces(offsets: &[Offset], cols: usize, index: usize) -> Vec<usize> {
    const EPSILON: f64 = 0.5;
    let mut order = vec![index];
    let mut seen: HashSet<usize> = HashSet::from([index]);
    let mut stack = vec![index];
    while let Some(i) = stack.pop() {
        for j in neighbours(cols, offsets.len(), i) {
            if seen.contains(&j) {
                continue;
            }
            if (offsets[j].x - offsets[i].x).abs() < EPSILON && (offsets[j].y - offsets[i].y).abs() < EPSILON {
                seen.insert(j);
                order.push(j);
                stack.push(j);
            }
        }
    }
    order
}

/// Drops a group of joined pieces: it locks onto the template, or onto the nearest grid neighbour within tolerance.
pub fn settle_group(offsets: &[Offset], cols: usize, group: &[usize]) -> Vec<Offset> {
    let own = offsets[group[0]];
    let home = snap_piece(own);
    let mut target = if own.x.hypot(own.y) <= TOLERANCE { Some(home) } else { None };
    if target.is_none() {
        let members: HashSet<usize> = group.iter().copied().collect();
        let mut best = TOLERANCE;
        for &i in group {
            for j in neighbours(cols, offsets.len(), i) {
                if members.contains(&j) {
                    continue;
                }
                let gap = (offsets[j].x - own.x).hypot(offsets[j].y - own.y);
                if gap <= best {
                    best = gap;
                    target = Some(offsets[j]);
                }
            }
        }
    }
    let Some(to) = target else { return offsets.to_vec() };
    offsets.iter().enumerate().map(|(i, o)| if group.contains(&i) { to } else { *o }).collect()
}

pub fn is_solved(offsets: &[Offset]) -> bool {
    offsets.iter().all(|o| *o == HOME)
}
