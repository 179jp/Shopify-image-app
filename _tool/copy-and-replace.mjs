import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// __dirname と __filename の代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseDir = path.join(__dirname, "..");

// ビルドされたファイルのディレクトリ
const buildDir = path.join(baseDir, "extension-app", "dist", "assets");

// コピー先のディレクトリ
const destDir = path.join(
  baseDir,
  "extensions",
  "image-extension-app",
  "assets",
);

// Liquid ファイルのパス
const liquidFilePath = path.join(
  baseDir,
  "extensions",
  "image-extension-app",
  "blocks",
  "ex_gallery.liquid",
);

// ファイルをコピーする関数
function copyFiles(srcDir, destDir) {
  fs.readdirSync(srcDir).forEach((file) => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    fs.copyFileSync(srcFile, destFile);
  });
}

// Liquid ファイル内のファイル名を置き換える関数
function replaceFileNames(liquidFilePath, buildDir) {
  let liquidContent = fs.readFileSync(liquidFilePath, "utf8");
  const files = fs.readdirSync(buildDir);

  files.forEach((file) => {
    if (file.endsWith(".js")) {
      const regex = new RegExp(`index-[a-zA-Z0-9]+\\.js`, "g");
      liquidContent = liquidContent.replace(regex, file);
    } else if (file.endsWith(".css")) {
      const regex = new RegExp(`index-[a-zA-Z0-9]+\\.css`, "g");
      liquidContent = liquidContent.replace(regex, file);
    }
  });

  fs.writeFileSync(liquidFilePath, liquidContent, "utf8");
}

// JS と CSS ファイルをコピー
copyFiles(buildDir, destDir);

// Liquid ファイル内のファイル名を置き換え
replaceFileNames(liquidFilePath, buildDir);

console.log(
  "ビルドされたファイルをコピーし、Liquid ファイル内のファイル名を更新しました。",
);
