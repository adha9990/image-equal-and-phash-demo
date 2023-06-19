const fs = require("node:fs");
const path = require("node:path");

module.exports = {
  getFilePathsInDirectory: (directoryPath) => {
    const filepaths = [];

    // 读取目录中的所有文件和子文件夹
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      // 检查文件状态
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        // 如果是文件，则将路径添加到列表中
        filepaths.push(filePath);
      } else if (stats.isDirectory()) {
        // 如果是文件夹，则递归调用此函数以获取其下所有文件路径xs
        const subDirectoryPaths = module.exports.getFilePathsInDirectory(filePath);
        filepaths.push(...subDirectoryPaths);
      }
    });

    fs.writeFileSync("./images.json", JSON.stringify(filepaths));

    return filepaths;
  },
  readChunkSync: (filePath, startPosition, length) => {
    let buffer = Buffer.alloc(length);
    const fileDescriptor = fs.openSync(filePath, "r");

    try {
      const bytesRead = fs.readSync(fileDescriptor, buffer, {
        length,
        position: startPosition,
      });

      if (bytesRead < length) buffer = buffer.subarray(0, bytesRead);

      return buffer;
    } finally {
      fs.closeSync(fileDescriptor);
    }
  },
  getExecutionTime: async (callback) => {
    const startTime = performance.now();

    await callback();

    const endTime = performance.now();

    const diffTime = endTime - startTime;

    console.log("程式碼執行時間:", diffTime, "毫秒");

    return diffTime;
  },
};
