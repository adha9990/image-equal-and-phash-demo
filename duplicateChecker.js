const fs = require("node:fs");
const crypto = require("node:crypto");

const { readChunkSync } = require("./utils");

module.exports = class DuplicateChecker {
  //   找到相同的文件
  static findDuplicateFiles(filePaths) {
    const chunkSize = 1024 * 4;

    const result = [];

    const sizeMap = {};
    for (let filePath of filePaths) {
      const stat = fs.statSync(filePath);
      if (sizeMap[stat.size]) {
        sizeMap[stat.size].push(filePath);
      } else {
        sizeMap[stat.size] = [filePath];
      }
    }

    for (let [size, filePaths] of Object.entries(sizeMap)) {
      if (filePaths.length < 2) continue;
      const md5Map = {};
      for (let filePath of filePaths) {
        const headBuffer = readChunkSync(filePath, 0, chunkSize);
        const bodyBuffer = readChunkSync(filePath, Math.floor((size - chunkSize) / 2), chunkSize);
        const tailBuffer = readChunkSync(filePath, size - chunkSize, chunkSize);

        const mergeBuffer = Buffer.concat([headBuffer, bodyBuffer, tailBuffer]);

        const md5 = crypto.createHash("md5").update(mergeBuffer).digest("hex");

        if (md5Map[md5]) {
          md5Map[md5].push(filePath);
        } else {
          md5Map[md5] = [filePath];
        }
      }

      for (let filePaths of Object.values(md5Map)) {
        if (filePaths.length < 2) continue;
        result.push(filePaths);
      }
    }

    return result;
  }
  //   找到相似的文件
  static findSimilarFiles(filePaths, similarity) {
    console.log("findSimilarFiles");
  }
};
