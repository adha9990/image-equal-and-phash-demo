const generateEagleItem = (filePaths) => {
  return filePaths.map((filePath) => {
    return {
      id: crypto.randomUUID(),
      filePath: filePath,
      size: 0,
      fingerprint: "",
    };
  });
};

class DuplicateChecker {
  static findSimilarFiles(items, fingerprintWeighted = 0.9) {
    const cloneItems = [...items];
    const result = [];

    while (cloneItems.length > 0) {
      const itemA = cloneItems.shift();
      const fingerprintA = itemA.fingerprint;
      const similarities = [itemA];
      for (let i = 0; i < cloneItems.length; i++) {
        const itemB = cloneItems[i];
        const fingerprintB = itemB.fingerprint;

        const similarity = getCosineSimilarity(fingerprintA, fingerprintB);

        if (similarity > fingerprintWeighted) {
          similarities.push(itemB);
          cloneItems.splice(i, 1);
          i--;
        }
      }

      if (similarities.length > 1) {
        result.push(similarities);
      }
    }

    return result;
  }
}

(async () => {
  const filePaths = await fetch("./images.json").then((res) => res.json());

  console.log(`圖片數量:`, filePaths.length, `筆資料`);

  const items = generateEagleItem(filePaths);

  const fingerprintMap = {};

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const filePath = item.filePath;
    const fingerprint = await pHash(filePath);
    fingerprintMap[filePath] = fingerprint;

    console.log(fingerprint);

    item.fingerprint = fingerprint;
  }

  const result = DuplicateChecker.findSimilarFiles(items);

  console.log(result);
})();
