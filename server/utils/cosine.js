// Function to calculate cosine similarity between query and each vector (same dim vectors)
// (A . B) / (||A||*||B||)
function cosine(A, B) {
  let AdotB = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < A.length; i++) {
    AdotB += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  return AdotB / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = cosine;