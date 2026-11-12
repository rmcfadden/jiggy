/// Mulberry32, the same generator as the frontend's `createRng` and the TypeScript backend.
pub struct Rng(u32);

impl Rng {
    pub fn new(seed: u32) -> Self {
        Self(seed)
    }

    pub fn next(&mut self) -> f64 {
        self.0 = self.0.wrapping_add(0x6d2b79f5);
        let mut t = self.0;
        t = (t ^ (t >> 15)).wrapping_mul(t | 1);
        t ^= t.wrapping_add((t ^ (t >> 7)).wrapping_mul(t | 61));
        f64::from(t ^ (t >> 14)) / 4294967296.0
    }
}

pub fn shuffle<T: Clone>(items: &[T], rng: &mut Rng) -> Vec<T> {
    let mut a = items.to_vec();
    for i in (1..a.len()).rev() {
        let j = (rng.next() * (i + 1) as f64).floor() as usize;
        a.swap(i, j);
    }
    a
}
