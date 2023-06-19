const crypto = require("node:crypto");

const { readChunkSync } = require("./utils");

module.exports = class DuplicateChecker {
  //   找到相同的文件
  static findDuplicateFiles(items) {
    const chunkSize = 1024 * 4;

    const result = [];

    const sizeMap = {};
    for (let item of items) {
      const size = item.size;
      if (sizeMap[size]) {
        sizeMap[size].push(item);
      } else {
        sizeMap[size] = [item];
      }
    }

    for (let [size, items] of Object.entries(sizeMap)) {
      if (items.length < 2) continue;
      const md5Map = {};
      for (let item of items) {
        const filePath = item.filePath;
        const headBuffer = readChunkSync(filePath, 0, chunkSize);
        const bodyBuffer = readChunkSync(filePath, Math.floor((size - chunkSize) / 2), chunkSize);
        const tailBuffer = readChunkSync(filePath, size - chunkSize, chunkSize);

        const mergeBuffer = Buffer.concat([headBuffer, bodyBuffer, tailBuffer]);

        const md5 = crypto.createHash("md5").update(mergeBuffer).digest("hex");

        if (md5Map[md5]) {
          md5Map[md5].push(item);
        } else {
          md5Map[md5] = [item];
        }
      }

      for (let items of Object.values(md5Map)) {
        if (items.length < 2) continue;
        result.push(items);
      }
    }

    return result;
  }
};
