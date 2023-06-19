const { getFilePathsInDirectory, getExecutionTime } = require("./utils");

const duplicateChecker = require("./duplicateChecker");

const filePaths = getFilePathsInDirectory("./images");

console.log("圖片數量:", filePaths.length, "筆資料");

getExecutionTime(() => {
  const result = duplicateChecker.findDuplicateFiles(filePaths);
});

debugger;
