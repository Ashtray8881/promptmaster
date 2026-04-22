# Reimbursement Tool Implementation Plan

> **Goal:** 构建一个本地 HTML 页面，支持上传发票(PDF)/账单/截图，预览、手动裁剪、重命名后保存到用户指定的本地文件夹。

**Architecture:** 单 HTML 文件，无构建步骤，CDN 引入 pdf.js（PDF渲染）和 cropper.js（图片裁剪）。File System Access API 实现文件夹选择和文件写入。仅支持 Chrome/Edge。

**Tech Stack:** 纯前端 HTML/CSS/JS，pdf.js CDN，cropper.js CDN，File System Access API

**Estimated:** 8 tasks, ~60 minutes

---

## File Structure

```
reimbursement-tool.html   # 单一 HTML 文件，包含所有功能
docs/superpowers/plans/2026-04-22-reimbursement-tool.md  # 本计划
```

---

## Task 1: 创建 HTML 基础结构与样式

**Files:**
- Create: `reimbursement-tool.html`

- [ ] **Step 1: 编写 HTML 基础结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>报销文件整理工具</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .folder-select {
      padding: 10px 16px;
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .folder-select:hover { background: #0056b3; }
    .folder-path {
      flex: 1;
      color: #666;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .upload-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      margin-bottom: 20px;
      background: white;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .upload-zone:hover, .upload-zone.dragover {
      border-color: #007AFF;
    }
    .upload-zone input { display: none; }
    .file-list {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .file-item {
      display: grid;
      grid-template-columns: 80px 1fr 100px 120px;
      gap: 12px;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }
    .file-item:last-child { border-bottom: none; }
    .file-preview {
      width: 80px;
      height: 60px;
      object-fit: contain;
      background: #f0f0f0;
      border-radius: 4px;
    }
    .file-name-input {
      border: 1px solid #ddd;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 14px;
      width: 100%;
    }
    .file-type-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: #e8f4ff;
      color: #007AFF;
    }
    .file-type-badge.invoice { background: #fff3e0; color: #e65100; }
    .file-type-badge.bill { background: #e8f5e9; color: #2e7d32; }
    .file-type-badge.screenshot { background: #f3e5f5; color: #7b1fa2; }
    .file-actions { display: flex; gap: 8px; }
    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-crop { background: #ff9800; color: white; }
    .btn-delete { background: #f44336; color: white; }
    .btn-save {
      width: 100%;
      padding: 14px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      margin-top: 20px;
      cursor: pointer;
    }
    .btn-save:hover { background: #45a049; }
    .btn-save:disabled { background: #ccc; cursor: not-allowed; }
    .crop-modal {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    .crop-modal.active { display: flex; }
    .crop-container { background: white; padding: 20px; border-radius: 8px; max-width: 90vw; max-height: 80vh; }
    .crop-actions { display: flex; gap: 12px; margin-top: 16px; justify-content: center; }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }
    @media (max-width: 768px) {
      .file-item {
        grid-template-columns: 60px 1fr;
        gap: 8px;
      }
      .file-type-badge, .file-actions {
        grid-column: 2;
      }
      .file-preview {
        grid-row: span 2;
      }
    }
  </style>
</head>
<body>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css">

  <div class="header">
    <button class="folder-select" id="selectFolderBtn">选择保存文件夹</button>
    <div class="folder-path" id="folderPath">未选择文件夹</div>
  </div>

  <div class="upload-zone" id="uploadZone">
    <input type="file" id="fileInput" multiple accept=".pdf,.png,.jpg,.jpeg">
    <p>点击或拖拽文件到这里上传</p>
    <p style="font-size:12px;color:#999;margin-top:8px;">支持 PDF、PNG、JPG、JPEG</p>
  </div>

  <div class="file-list" id="fileList">
    <div class="empty-state" id="emptyState">还没有上传文件</div>
  </div>

  <button class="btn-save" id="saveAllBtn" disabled>保存全部到文件夹</button>

  <div class="crop-modal" id="cropModal">
    <div class="crop-container">
      <img id="cropImage" style="max-width:100%;max-height:60vh;">
    </div>
    <div class="crop-actions">
      <button class="btn" style="background:#ccc;" id="cropCancelBtn">取消</button>
      <button class="btn" style="background:#4CAF50;color:white;" id="cropConfirmBtn">确认裁剪</button>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js"></script>
  <script>
    // Application code will go here
  </script>
</body>
</html>
```

- [ ] **Step 2: 验证文件创建**

Run: `ls -la reimbursement-tool.html`
Expected: 文件存在

---

## Task 2: 文件状态管理与上传逻辑

**Files:**
- Modify: `reimbursement-tool.html`

- [ ] **Step 1: 添加完整的 JS 逻辑**

替换 `<script>` 标签内容为完整代码：

```javascript
// PDF.js worker 设置
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// 文件状态管理
let selectedFolderHandle = null;
const files = [];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function detectFileType(file) {
  const name = file.name.toLowerCase();
  if (name.includes('invoice') || name.includes('发票')) return 'invoice';
  if (name.includes('bill') || name.includes('账单') || name.includes('流水')) return 'bill';
  if (name.includes('screenshot') || name.includes('截图') || name.includes('payment') || name.includes('付款')) return 'screenshot';
  if (file.type === 'application/pdf') return 'invoice';
  return 'bill';
}

async function pdfToImageUrl(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: context, viewport: viewport }).promise;
  return canvas.toDataURL('image/png');
}

async function addFile(file) {
  const id = generateId();
  const type = detectFileType(file);
  let previewUrl;

  if (file.type === 'application/pdf') {
    previewUrl = await pdfToImageUrl(file);
  } else {
    previewUrl = URL.createObjectURL(file);
  }

  files.push({
    id,
    file,
    name: file.name.replace(/\.[^.]+$/, ''),
    type,
    previewUrl,
    croppedBlob: null
  });
}

async function handleFiles(fileList) {
  for (const file of fileList) {
    try {
      await addFile(file);
    } catch (err) {
      console.error('处理文件失败:', file.name, err);
      alert(`处理文件 "${file.name}" 失败: ${err.message}`);
    }
  }
  updateUI();
}

function updateUI() {
  const fileList = document.getElementById('fileList');
  const emptyState = document.getElementById('emptyState');
  const saveBtn = document.getElementById('saveAllBtn');

  if (files.length === 0) {
    fileList.innerHTML = '';
    fileList.appendChild(emptyState);
    emptyState.style.display = 'block';
    saveBtn.disabled = true;
    return;
  }

  emptyState.style.display = 'none';
  saveBtn.disabled = !selectedFolderHandle;

  fileList.innerHTML = files.map((f, i) => `
    <div class="file-item" data-id="${f.id}">
      <img class="file-preview" src="${f.previewUrl}" alt="preview">
      <input type="text" class="file-name-input" value="${f.name}" data-index="${i}">
      <span class="file-type-badge ${f.type}">${f.type === 'invoice' ? '发票' : f.type === 'bill' ? '账单' : '截图'}</span>
      <div class="file-actions">
        ${f.type !== 'invoice' ? `<button class="btn btn-crop" data-index="${i}">裁剪</button>` : ''}
        <button class="btn btn-delete" data-index="${i}">删除</button>
      </div>
    </div>
  `).join('');

  fileList.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = () => deleteFile(parseInt(btn.dataset.index));
  });
  fileList.querySelectorAll('.btn-crop').forEach(btn => {
    btn.onclick = () => openCropModal(parseInt(btn.dataset.index));
  });
  fileList.querySelectorAll('.file-name-input').forEach(input => {
    input.onchange = (e) => renameFile(parseInt(input.dataset.index), e.target.value);
  });
}

function deleteFile(index) {
  const file = files[index];
  if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(file.previewUrl);
  }
  files.splice(index, 1);
  updateUI();
}

function renameFile(index, newName) {
  const file = files[index];
  const ext = file.name.split('.').pop();
  if (!newName.endsWith('.' + ext)) {
    newName = newName + '.' + ext;
  }
  file.name = newName;
  updateUI();
}

// 文件夹选择
document.getElementById('selectFolderBtn').onclick = async () => {
  try {
    selectedFolderHandle = await window.showDirectoryPicker();
    document.getElementById('folderPath').textContent = selectedFolderHandle.name;
    updateUI();
  } catch (err) {
    if (err.name !== 'AbortError') {
      alert('选择文件夹失败: ' + err.message);
    }
  }
};

// 上传区域
document.getElementById('uploadZone').onclick = () => {
  document.getElementById('fileInput').click();
};

document.getElementById('uploadZone').ondragover = (e) => {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
};

document.getElementById('uploadZone').ondragleave = (e) => {
  e.currentTarget.classList.remove('dragover');
};

document.getElementById('uploadZone').ondrop = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
};

document.getElementById('fileInput').onchange = (e) => {
  handleFiles(e.target.files);
  e.target.value = '';
};

// 裁剪功能
let currentCropper = null;
let currentCropIndex = -1;

function openCropModal(index) {
  currentCropIndex = index;
  const file = files[index];
  const modal = document.getElementById('cropModal');
  const img = document.getElementById('cropImage');

  img.src = file.previewUrl;
  modal.classList.add('active');

  img.onload = () => {
    if (currentCropper) {
      currentCropper.destroy();
    }
    currentCropper = new Cropper(img, {
      aspectRatio: NaN,
      viewMode: 1,
      dragMode: 'move',
      guides: true,
      center: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
    });
  };
}

document.getElementById('cropCancelBtn').onclick = () => closeCropModal();

function closeCropModal() {
  const modal = document.getElementById('cropModal');
  modal.classList.remove('active');
  if (currentCropper) {
    currentCropper.destroy();
    currentCropper = null;
  }
  currentCropIndex = -1;
}

document.getElementById('cropConfirmBtn').onclick = async () => {
  if (currentCropper && currentCropIndex >= 0) {
    const croppedCanvas = currentCropper.getCroppedCanvas({
      maxWidth: 4096,
      maxHeight: 4096,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    const blob = await new Promise(resolve => croppedCanvas.toBlob(resolve, 'image/png'));
    const url = URL.createObjectURL(blob);

    const file = files[currentCropIndex];
    if (file.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.previewUrl);
    }
    file.previewUrl = url;
    file.croppedBlob = blob;
    file.name = file.name + '_cropped';

    closeCropModal();
    updateUI();
  }
};

// 保存功能
document.getElementById('saveAllBtn').onclick = async () => {
  if (!selectedFolderHandle) {
    alert('请先选择保存文件夹');
    return;
  }

  const saveBtn = document.getElementById('saveAllBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = '保存中...';

  try {
    for (let i = 0; i < files.length; i++) {
      saveBtn.textContent = `保存中... (${i + 1}/${files.length})`;
      await saveFile(files[i]);
    }
    alert('保存成功！共 ' + files.length + ' 个文件');
  } catch (err) {
    alert('保存失败: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '保存全部到文件夹';
    updateUI();
  }
};

async function saveFile(file) {
  let blob;
  let finalName;

  if (file.file.type === 'application/pdf') {
    const arrayBuffer = await file.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport: viewport
    }).promise;
    blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    finalName = file.name + '.png';
  } else if (file.croppedBlob) {
    blob = file.croppedBlob;
    finalName = file.name + '.png';
  } else {
    blob = file.file;
    finalName = file.name + '.' + file.file.name.split('.').pop();
  }

  const fileHandle = await selectedFolderHandle.getFileHandle(finalName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

// 浏览器兼容性检查
if (!('showDirectoryPicker' in window)) {
  document.body.innerHTML = `
    <div style="padding:40px;text-align:center;">
      <h2>浏览器不支持</h2>
      <p>请使用 Chrome 或 Edge 浏览器打开此页面</p>
    </div>
  `;
}

// 初始化
updateUI();
```

- [ ] **Step 2: 验证 HTML 语法**

Run: 检查文件是否包含完整的 HTML 结构

---

## Task 3: 提交代码

- [ ] **Step 1: 初始化 Git（如果需要）并提交**

Run: `git status` 检查状态
Expected: 显示 reimbursement-tool.html 为未跟踪文件

- [ ] **Step 2: 添加并提交**

```bash
git add reimbursement-tool.html docs/superpowers/plans/2026-04-22-reimbursement-tool.md
git commit -m "feat: add reimbursement tool - upload, preview, crop, rename, save"
```

---

## 验证清单

手动测试：
1. Chrome 打开 HTML — 应该正常显示界面
2. 选择文件夹 — 应该弹出选择器
3. 拖拽图片上传 — 应该显示预览
4. 点击裁剪 — 应该打开裁剪模态框
5. 修改文件名 — 应该生效
6. 保存全部 — 文件应该保存到选定文件夹
7. 上传 PDF — 应该正确渲染为图片

---

## 技术限制

- 仅 Chrome/Edge 支持 File System Access API
- PDF 只取第一页
- 所有图片保存为 PNG
