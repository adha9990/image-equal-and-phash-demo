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
  return colors.map((color) => (color >= average ? 1 : 0)).join("");
};

/**
 * 指紋相似度比較
 * @param {array} origin
 * @param {array} target
 */
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

const pHash = async (filePath) => {
  return getFingerprint(await getImageData(filePath));
};

// module.export = pHash;
