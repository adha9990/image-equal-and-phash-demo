const { getFilePathsInDirectory, getExecutionTime, generateEagleItem } = require("./utils");

const duplicateChecker = require("./duplicateChecker");

const filePaths = getFilePathsInDirectory("./images");

const items = generateEagleItem(filePaths);

console.log("圖片數量:", filePaths.length, "筆資料");

(async () => {
  await getExecutionTime(() => {
    const result = duplicateChecker.findDuplicateFiles(items);

    console.log(result);
  });

  debugger;
})();
