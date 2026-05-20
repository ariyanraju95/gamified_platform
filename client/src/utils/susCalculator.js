// Standard SUS formula: odd items (score-1) + even items (5-score), times 2.5
export const computeSUSScore = (scores) => {
  let total = 0;
  scores.forEach((score, index) => {
    total += (index + 1) % 2 !== 0 ? score - 1 : 5 - score;
  });
  return total * 2.5;
};

export const getSUSGrade = (score) => {
  if (score >= 85) return { label: 'Excellent', color: '#16a34a' };
  if (score >= 70) return { label: 'Good', color: '#2563eb' };
  if (score >= 50) return { label: 'OK', color: '#d97706' };
  return { label: 'Poor', color: '#dc2626' };
};
