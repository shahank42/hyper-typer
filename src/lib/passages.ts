/**
 * Typing test passages. Each is a single sentence of roughly similar length,
 * designed to test a mix of common words, punctuation-free flow, and varied
 * finger patterns.
 */
const PASSAGES = [
  "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets behind the distant mountains casting golden light across the valley below.",
  "Programming is the art of telling a computer what to do through carefully written instructions that transform abstract ideas into working software applications.",
  "A journey of a thousand miles begins with a single step and every great achievement starts from the courage to take that first leap of faith forward.",
  "The ocean waves crashed against the rocky shore as seagulls circled overhead and the salty breeze carried the scent of adventure across the sandy beach.",
  "Technology continues to reshape how we live and work creating new opportunities for connection and collaboration across borders and time zones every single day.",
  "In the heart of the forest tall ancient trees stretched toward the sky their branches forming a natural canopy that filtered the warm afternoon sunlight.",
  "Music has the power to transcend language and culture bringing people together through shared rhythms melodies and emotions that resonate deep within the soul.",
  "The scientist carefully recorded her observations noting every small detail that could lead to a breakthrough discovery in the field of quantum mechanics research.",
];

/**
 * Select a random passage from the pool.
 *
 * @param exclude - Optional passage to exclude (e.g. the current one),
 *   so that restarting always picks a different passage. If exclusion
 *   leaves the pool empty, falls back to the full array.
 */
export function pickRandom(exclude?: string): string {
  const filtered = exclude ? PASSAGES.filter((s) => s !== exclude) : PASSAGES;
  const pool = filtered.length > 0 ? filtered : PASSAGES;
  return pool[Math.floor(Math.random() * pool.length)]!;
}
