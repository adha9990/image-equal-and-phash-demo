const ExpectImgSize = 32;
const SamplingRadio = 4;
const DCTScale = 2;

const getImageUrl = async function (file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function (e) {
      resolve(e.target.result);
    };
  });
};

const getImageData = async function (src) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = ExpectImgSize;
    canvas.height = ExpectImgSize;

    const img = new Image();
    img.onload = function () {
      const _this = this;
      context.drawImage(_this, 0, 0, _this.width, _this.height, 0, 0, ExpectImgSize, ExpectImgSize);
      resolve(context.getImageData(0, 0, ExpectImgSize, ExpectImgSize));
    };
    img.src = src;
  });
};

const getGrayscale = (origin) => {
  const result = [];
  for (let n = 0; n < origin.data.length; n++) {
    if ((n + 1) % 4 === 0) {
      const R = origin.data[n - 3];
      const G = origin.data[n - 2];
      const B = origin.data[n - 1];
      const gray = R * 0.299 + G * 0.587 + B * 0.114;
      result.push(gray);
    }
  }
  return result;
};

const getDCT = (colors) => {
  const PI_N = Math.PI / colors.length;
  return colors.map((_, n) => {
    const num = DCTScale * colors.reduce((total, current, m) => total + current * Math.cos(PI_N * (m + 0.5) * n), 0);

    return Math.min(255, Math.max(0, num));
  });
};

const getLTCornerColors = (colors) => {
  const MatrixSize = Math.sqrt(colors.length);
  const SamplingSize = MatrixSize / SamplingRadio;
  const result = [];

  for (let i = 0; i < SamplingSize; i++) {
    result.push(...colors.slice(i * MatrixSize, i * MatrixSize + SamplingSize));
  }
  return result;
};

const getFingerprint = (imgData) => {
  // 離散餘弦轉換
  const colors = getLTCornerColors(getDCT(getGrayscale(imgData)));
  // 均值化
  const average = colors.reduce((pre, cur) => pre + cur) / colors.length;
  // 二值化
  return colors.map((color) => (color >= average ? 1 : 0));
};

const getCosineSimilarity = function (origin, target) {
  let product = 0,
    vecA = 0,
    vecB = 0;
  for (let i = 0; i < origin.length; i++) {
    vecA += Math.pow(origin[i], 2);
    vecB += Math.pow(target[i], 2);
    product += origin[i] * target[i];
  }

  if (vecA === vecB) {
    return product / vecA;
  }

  return product / (Math.sqrt(vecA) * Math.sqrt(vecB));
};

export const compareImageSimilarity = async function (imageA, imageB) {
  const [fingerprintA, fingerprintB] = await Promise.all(
    [imageA, imageB].map(async (image) => getFingerprint(await getImageData(Object.prototype.toString.call(image) === "[object String]" ? image : await getImageUrl(image))))
  );
  return getCosineSimilarity(fingerprintA, fingerprintB);
};

const getExecutionTime = async (callback) => {
  const startTime = performance.now();

  await callback();

  const endTime = performance.now();

  const diffTime = endTime - startTime;

  console.log("程式碼執行時間:", diffTime, "毫秒");

  return diffTime;
};

(async () => {
  const similarityWeights = 0.9;

  const filePaths = await fetch("./images.json").then((res) => res.json());

  const fingerprintMap = {};

  const counterEl = document.getElementById("counter");

  await getExecutionTime(async () => {
    console.log(`圖片數量:`, filePaths.length, `筆資料`);

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const fingerprint = getFingerprint(await getImageData(filePath));
      counterEl.innerText = i;
      fingerprintMap[filePath] = fingerprint;
    }
  });

  await getExecutionTime(async () => {
    let counter = 0;
    const result = [];

    while (filePaths.length > 0) {
      const filePathA = filePaths.shift();
      const similarities = [filePathA];
      for (let i = 0; i < filePaths.length; i++) {
        const filePathB = filePaths[i];

        const similarity = getCosineSimilarity(fingerprintMap[filePathA], fingerprintMap[filePathB]);
        counter++;
        // console.log(`%c${counter}.\n%c${filePathA}\n${filePathB}\n%c${Math.floor(similarity * 100) + "%"}`, `color: #00f`, `color: #888`, `color: ${similarity > similarityWeights ? "#f00" : "#000"}`);

        if (similarity > similarityWeights) {
          similarities.push(filePathB);
          filePaths.splice(i, 1);
          i--;
        }
      }

      if (similarities.length > 1) {
        result.push(similarities);
      }
    }

    console.log(`總共執行:`, counter, `次比較`);
    console.log(result);
  });
})();
