// ✅ Corrected ABCD/BCD logic as per Rule2Page standards
export const performAbcdBcdAnalysis = (aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers) => {
  const abcdNumbers = [];
  const bcdNumbers = [];

  // Helper function to check if a number exists in a list (one count per day)
  const exists = (list, num) => list.includes(num);

  for (const num of dDayNumbers) {
    // ✅ ABCD Logic: count if present in A, B, or C (only once per day)
    let abcCount = 0;
    if (exists(aDayNumbers, num)) abcCount++;
    if (exists(bDayNumbers, num)) abcCount++;
    if (exists(cDayNumbers, num)) abcCount++;

    if (abcCount >= 2) {
      abcdNumbers.push(num);
      continue; // ❗ABCD takes priority — don't allow in BCD too
    }

    // ✅ BCD Logic: Must be in B or C (exclusively), but not both B & C
    const inB = exists(bDayNumbers, num);
    const inC = exists(cDayNumbers, num);

    const bcdValid = (inB && !inC) || (!inB && inC); // Exclusive B or C appearance
    if (bcdValid) {
      bcdNumbers.push(num);
    }
  }

  return { abcdNumbers, bcdNumbers };
};
