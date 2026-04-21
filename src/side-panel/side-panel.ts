import { Prompt, Folder, replaceVariables, parseVariables } from '../shared/types';

// 综合图片生成标签库（10大维度分类）
const PRESET_TAGS: Record<string, string[]> = {
  // ========== 一、图片风格 ==========
  '风格-写实': ['写实', '真实', '照片级', '纪实', '新闻摄影', '肖像', '写真', '街拍', '抓拍', '微距', '宏观', '航拍', '卫星视图'],
  '风格-科幻': ['科幻', '赛博朋克', '未来主义', '复古未来', '太空歌剧', '星际', '末日废土', '后启示录', '生物机械', '义体'],
  '风格-奇幻': ['奇幻', '魔幻', '神话', '传说', '童话', '寓言', '哥特', '暗黑'],
  '风格-绘画': ['油画', '水彩', '素描', '彩铅', '粉彩', '丙烯', '水墨', '工笔', '浮世绘', '涂鸦', '喷漆'],
  '风格-插画': ['插画', '扁平插画', '肌理插画', '像素艺术', '点阵', '低多边形', 'Low Poly', '等高线', '线条艺术'],
  '风格-设计': ['极简', '扁平', 'Material Design', '波普', '孟菲斯', '包豪斯', '构成主义', '蒸汽波', '新拟态', 'Neumorphism'],
  '风格-特殊': ['电影感', 'cinematic', '纪录片风格', '广告大片', '商业摄影', '产品渲染', '3D建模', '等距视角', 'Isometric'],

  // ========== 二、质量与分辨率 ==========
  '质量': ['高清', 'HD', '全高清', 'FHD', '1080p', '2K', '4K', '8K', '16K', '超细腻', '超细节', '高分辨率', 'High Res', '无损', 'RAW', 'DPI 300+'],
  '长宽比': ['1:1', '4:3', '16:9', '9:16', '3:2', '2.35:1', '21:9', '9:21', 'A4竖版', '横版海报', '竖版海报'],

  // ========== 三、光照与光影 ==========
  '光-自然': ['自然光', '日光', '清晨', '黎明', '黄昏', '日落', '金色时刻', '蓝色时刻', '阴天', '柔光', '正午阳光'],
  '光-人工': ['工作室灯光', '伦勃朗光', '蝴蝶光', '侧光', '分割光', '背光', '逆光', '霓虹灯', 'LED', '烛光', '火光', '月光', '荧光灯'],
  '光效': ['体积光', '丁达尔效应', '焦散', '镜头光晕', '光斑', '散景', '高光溢出', '暗角'],

  // ========== 四、构图与视角 ==========
  '景别': ['极远景', '远景', '全景', '中景', '近景', '特写', '极特写'],
  '角度': ['平视', '眼平线', '俯视', '高角度', '仰视', '低角度', '鸟瞰', '上帝视角', '虫眼视角', '荷兰角', '倾斜'],
  '镜头': ['广角', '超广角', '鱼眼', '长焦', '远摄', '微距', '移轴', '微缩模型', '全景', '360度'],
  '构图': ['三分法', '黄金螺旋', '对称构图', '引导线', '框架构图', '留白', '负空间', '中心构图'],

  // ========== 五、色彩与色调 ==========
  '色调': ['黑白', '单色', '棕褐色', '复古', '鲜艳', '高饱和', '柔和', '低饱和', '褪色', '暖色调', '冷色调'],
  '色效': ['赛博朋克色调', '电影色调', 'Teal & Orange', '双色调', 'Duotone', '渐变', '渐变色', '金属色'],

  // ========== 六、材质与纹理 ==========
  '材质-金属': ['拉丝金属', '镜面', '锈蚀金属', '液态金属'],
  '材质-石材': ['大理石', '花岗岩', '混凝土', '砖墙', '卵石'],
  '材质-木材': ['原木', '深色胡桃木', '做旧木板', '竹'],
  '材质-布料': ['丝绸', '天鹅绒', '牛仔', '帆布', '蕾丝', '亚麻'],
  '材质-皮革': ['光滑皮革', '鳄鱼皮', '麂皮'],
  '材质-透明': ['磨砂玻璃', '彩色玻璃', '裂纹玻璃', '水晶'],
  '材质-自然': ['树皮', '叶片', '羽毛', '毛皮', '贝壳'],
  '材质-科技': ['电路板', '碳纤维', '全息箔', 'LED网格'],

  // ========== 七、氛围与情绪 ==========
  '氛围': ['宁静', '平和', '紧张', '悬疑', '喜悦', '欢快', '忧郁', '伤感', '神秘', '诡异', '史诗', '壮丽', '浪漫', '温馨', '孤独', '荒凉', '繁忙', '热闹', '梦幻', '超现实'],

  // ========== 八、艺术流派与技术 ==========
  '艺术流派': ['印象派', '后印象派', '点彩派', '立体主义', '未来主义', '达达主义', '超现实主义', '表现主义', '抽象表现主义', '波普艺术', '极简主义', '巴洛克', '洛可可', '古典主义', '浪漫主义'],
  '东方艺术': ['浮世绘', '琳派', '狩野派', '文人画', '泼墨山水', '工笔重彩', '细密画'],
  '技术媒介': ['数字绘画', 'Procreate', 'Photoshop', '3D渲染', 'Blender', 'Octane', 'Unreal Engine', '拼贴', '混合媒介', '丝网印刷', '木刻版画', '石版画'],
  '渲染引擎': ['虚幻引擎', 'Unity', 'OC渲染', 'C4D', 'Blender', 'MAYA', '3dsMax', 'V-Ray', 'Arnold', 'Redshift'],

  // ========== 九、年代与时代感 ==========
  '年代': ['古代', '史前', '中世纪', '文艺复兴', '维多利亚时代', '1920年代', '复古', '1950年代', '1980年代', '合成波', '1990年代', '近未来', '2050', '远古未来', '石器朋克'],

  // ========== 十、负面提示词 ==========
  '负面词': ['低质量', '模糊', '噪点', '扭曲', '畸形', '残缺', '比例失调', '色彩溢出', '过曝', '欠曝', '噪点', '锯齿', '毛刺', '不自然', '塑料感', 'AI痕迹', '水印', '文字错误'],

  // ========== 附加：视频/运镜 ==========
  '运镜': ['推进', '后拉', '横移', '竖移', '摇镜', '跟拍', '环绕', '升降', '手持', '稳定器', '航拍', '希区柯克', '一镜到底', '快切', '慢动作', '升格', '降格'],
  '电影感': ['电影级', '院线质感', '叙事感', '剧情片', '纪录片感', '广告感', '预告片感', 'MV风格'],

  // ========== 附加：Seedance/NanoBanana 专有 ==========
  'Seedance风格': ['赛博科技感', '电影级质感', '专业电影感'],
  'NanoBanana风格': ['微距鲜艳风', '写实风格', '精准渲染'],
  '文字渲染': ['清晰文字', '发光文字', '渐变文字', '立体文字', '手写文字', '霓虹文字', '镂空文字', '光晕文字'],
  '质感': ['金属质感', '玻璃质感', '毛绒质感', '皮革质感', '木质质感', '布料质感', '透明质感', '磨砂质感', '光泽质感', '哑光质感', '真实触感'],

  // ========== 附加：摄影类型 ==========
  '摄影类型': ['肖像', '风光', '建筑', '美食', '产品', '时尚', '街拍', '纪实', '静物', '宠物', '花卉', '星空'],

  // ========== 附加：用途分类 ==========
  '小红书': ['封面图', '配图', '头像', '背景图', '表情包', '九宫格', '海报', 'banner', '带货图', '种草图'],
  '社交媒体': ['朋友圈', '微博', '抖音', '快手', '视频号', 'Instagram', 'Twitter', 'Facebook', 'Threads'],
  '商业用途': ['品牌LOGO', 'VI设计', '包装设计', '海报', '宣传单', '名片', 'PPT素材', 'DM单', '户外广告', '展览物料'],
  '电商': ['主图', '详情页', '场景图', '白底图', '模特图', '模特场景', '产品展示', '使用场景', '对比图', '卖点图'],
  '建筑室内': ['建筑外观', '室内设计', '展厅', '办公室', '住宅', '商铺', '酒店', '餐厅', '咖啡厅', '健身房'],
  'PPT素材': ['封面', '背景', '图标', '配图', '装饰', '数据图表', '流程图', '时间线', '对比图', '人物插画'],
};

interface State {
  prompts: Prompt[];
  folders: Folder[];
  selectedPrompt: Prompt | null;
  currentFolder: string;
  searchQuery: string;
  selectedTags: string[];
  customTags: string[];
  dropdownVisible: boolean;
}

const state: State = {
  prompts: [],
  folders: [],
  selectedPrompt: null,
  currentFolder: 'all',
  searchQuery: '',
  selectedTags: [],
  customTags: [],
  dropdownVisible: false,
};

let searchTimeout: ReturnType<typeof setTimeout>;

// 历史记录
interface HistoryEntry {
  id: string;
  promptId: string;
  usedAt: number;
  site: string;
  variables: Record<string, string>;
  content: string;
}

// DOM elements
const folderListEl = document.getElementById('folderList')!;
const promptListEl = document.getElementById('promptList')!;
const searchInput = document.getElementById('search') as HTMLInputElement;
const searchWrapper = document.getElementById('searchWrapper')!;
const dropdownEl = document.getElementById('dropdown')!;
const variablePanel = document.getElementById('variablePanel')!;
const variableInputs = document.getElementById('variableInputs')!;
const copyBtn = document.getElementById('copyBtn')!;
const cancelBtn = document.getElementById('cancelBtn')!;
const closeBtn = document.getElementById('closePanel')!;
const toastEl = document.getElementById('toast')!;
const addFolderBtn = document.getElementById('addFolderBtn')!;
const addFolderBtn2 = document.getElementById('addFolderBtn2')!;
const addPromptBtn = document.getElementById('addPromptBtn')!;
const historySection = document.getElementById('historySection')!;
const historyList = document.getElementById('historyList')!;
const toggleHistoryBtn = document.getElementById('toggleHistory')!;

// 初始化
async function init() {
  await loadData();
  await loadCustomTags();
  await loadHistory();
  updateCounts();
  renderFolders();
  renderPrompts();
  setupEventListeners();
}

// 加载数据
async function loadData() {
  const [promptsRes, foldersRes] = await Promise.all([
    chrome.runtime.sendMessage({ type: 'GET_PROMPTS' }),
    chrome.runtime.sendMessage({ type: 'GET_FOLDERS' }),
  ]);
  state.prompts = promptsRes.data || [];
  state.folders = foldersRes.data || [];
}

// 加载自定义标签
async function loadCustomTags() {
  const result = await chrome.storage.local.get('promptmaster_custom_tags');
  state.customTags = (result.promptmaster_custom_tags as string[]) || [];
}

// 保存自定义标签
async function saveCustomTags() {
  await chrome.storage.local.set({ promptmaster_custom_tags: state.customTags });
}

// 加载历史记录
async function loadHistory() {
  const result = await chrome.storage.local.get('promptmaster_history');
  const history: HistoryEntry[] = (result.promptmaster_history as HistoryEntry[]) || [];
  if (history.length === 0) {
    historySection.style.display = 'none';
    return;
  }
  historySection.style.display = 'block';
  historyList.innerHTML = history.slice(0, 10).map(h => {
    const prompt = state.prompts.find(p => p.id === h.promptId);
    const title = prompt ? prompt.title : '未知模板';
    const time = new Date(h.usedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `
      <div class="history-item" data-content="${encodeURIComponent(h.content)}">
        <div class="history-item-title">${title}</div>
        <div class="history-item-preview">${h.content.slice(0, 50)}${h.content.length > 50 ? '...' : ''}</div>
        <div class="history-item-time">${time}</div>
      </div>
    `;
  }).join('');

  // 点击历史项复制内容
  historyList.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', async () => {
      const content = decodeURIComponent((item as HTMLElement).dataset.content || '');
      await navigator.clipboard.writeText(content);
      showToast('已复制');
    });
  });
}

// 更新计数
function updateCounts() {
  const allCount = state.prompts.length;
  const favCount = state.prompts.filter(p => p.isFavorite).length;
  document.getElementById('allCount')!.textContent = String(allCount);
  document.getElementById('favCount')!.textContent = String(favCount);
}

// 渲染文件夹列表
function renderFolders() {
  // 移除所有非系统文件夹（保留"全部"和"收藏"）
  const allItems = folderListEl.querySelectorAll('.folder-item[data-folder]:not([data-folder="all"]):not([data-folder="favorites"])');
  allItems.forEach(el => el.remove());

  // 重新渲染所有文件夹
  state.folders.forEach(folder => {
    const count = state.prompts.filter(p => p.folderId === folder.id).length;
    const item = document.createElement('div');
    item.className = 'folder-item';
    item.dataset.folder = folder.id;
    item.innerHTML = `${folder.icon || '📁'} ${folder.name} <span class="folder-item-count">${count}</span>`;
    folderListEl.appendChild(item);
  });
}

// 渲染提示词列表
function renderPrompts() {
  const filtered = getFilteredPrompts();

  if (filtered.length === 0) {
    promptListEl.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <p>${state.searchQuery || state.selectedTags.length > 0 ? '没有找到匹配的提示词' : '暂无提示词'}</p>
      </div>
    `;
    return;
  }

  promptListEl.innerHTML = filtered.map(prompt => `
    <div class="prompt-card${state.selectedPrompt?.id === prompt.id ? ' selected' : ''}" data-id="${prompt.id}">
      <div class="prompt-card-header">
        <span class="prompt-title">${prompt.isFavorite ? '⭐ ' : ''}${prompt.title}</span>
        <span class="prompt-favorite${prompt.isFavorite ? ' active' : ''}" data-action="toggle-favorite" data-id="${prompt.id}">${prompt.isFavorite ? '★' : '☆'}</span>
      </div>
      <div class="prompt-preview">${prompt.content.slice(0, 80)}${prompt.content.length > 80 ? '...' : ''}</div>
      ${prompt.tags.length > 0 ? `<div class="prompt-tags">${prompt.tags.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
    </div>
  `).join('');

  promptListEl.querySelectorAll('.prompt-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.action === 'toggle-favorite') {
        const id = target.dataset.id;
        if (id) toggleFavorite(id);
        return;
      }
      const id = card.getAttribute('data-id')!;
      const prompt = state.prompts.find(p => p.id === id);
      if (prompt) selectPrompt(prompt);
    });
  });
}

// 获取过滤后的提示词
function getFilteredPrompts(): Prompt[] {
  let filtered = state.prompts;

  if (state.currentFolder === 'favorites') {
    filtered = filtered.filter(p => p.isFavorite);
  } else if (state.currentFolder !== 'all') {
    filtered = filtered.filter(p => p.folderId === state.currentFolder);
  }

  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    );
  }

  if (state.selectedTags.length > 0) {
    filtered = filtered.filter(p =>
      state.selectedTags.some(tag => p.tags.includes(tag))
    );
  }

  return filtered;
}

// 渲染已选标签
function renderSelectedTags() {
  searchWrapper.querySelectorAll('.tag-chip').forEach(el => el.remove());
  const beforeInput = searchInput;
  state.selectedTags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `${tag}<span class="remove" data-tag="${tag}">✕</span>`;
    searchWrapper.insertBefore(chip, beforeInput);
  });
}

// 渲染下拉框
function renderDropdown() {
  const query = state.searchQuery.toLowerCase();

  // 收集所有标签
  const allTags = new Set<string>();
  Object.values(PRESET_TAGS).forEach(tags => tags.forEach(t => allTags.add(t)));
  state.customTags.forEach(t => allTags.add(t));

  // 匹配标签
  const matchedTags = [...allTags].filter(tag =>
    tag.toLowerCase().includes(query) && !state.selectedTags.includes(tag)
  );

  // 匹配提示词
  const matchedPrompts = getFilteredPrompts();

  // 无搜索词 - 显示分类标签
  if (!query) {
    let html = '';
    const categories = ['风格', '主体', '光线', '色调', '构图', '景别', '画质', 'Seedance视频', 'NanoBanana', 'Midjourney', '用途', '技术参数'];
    categories.forEach(cat => {
      const tags = PRESET_TAGS[cat] || PRESET_TAGS[cat.replace('视频', '')] || PRESET_TAGS[cat.replace('图片', '')];
      if (tags) {
        html += `
          <div class="tag-dropdown-section">
            <div class="tag-dropdown-title">${cat}</div>
            ${tags.slice(0, 6).map(tag => `
              <div class="tag-dropdown-item" data-action="add-tag" data-tag="${tag}">
                <span class="tag-name">${tag}</span>
              </div>
            `).join('')}
          </div>
        `;
      }
    });
    dropdownEl.innerHTML = html || '<div class="tag-dropdown-empty">无标签</div>';
    dropdownEl.classList.add('active');
    state.dropdownVisible = true;
    return;
  }

  // 有搜索词 - 显示匹配结果
  if (matchedTags.length === 0 && matchedPrompts.length === 0) {
    dropdownEl.innerHTML = `
      <div class="tag-dropdown-empty">
        没有找到 "${query}"<br>
        <span style="color:var(--accent);cursor:pointer;" data-action="add-custom-tag" data-tag="${state.searchQuery}">+ 添加为自定义标签</span>
      </div>
    `;
    dropdownEl.classList.add('active');
    state.dropdownVisible = true;
    return;
  }

  let html = '';

  if (matchedTags.length > 0) {
    html += `
      <div class="tag-dropdown-section">
        <div class="tag-dropdown-title">标签</div>
        ${matchedTags.slice(0, 10).map(tag => `
          <div class="tag-dropdown-item" data-action="add-tag" data-tag="${tag}">
            <span class="tag-name">${tag}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (matchedPrompts.length > 0) {
    html += `
      <div class="tag-dropdown-section">
        <div class="tag-dropdown-title">提示词</div>
        ${matchedPrompts.slice(0, 5).map(prompt => `
          <div class="tag-dropdown-item" data-action="select-prompt" data-id="${prompt.id}">
            <span class="tag-name">${prompt.title}</span>
            <span class="tag-count">${prompt.tags.slice(0, 2).join(', ')}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 添加自定义标签选项
  if (query && ![...allTags].includes(query) && !state.selectedTags.includes(query)) {
    html += `
      <div class="tag-dropdown-add" data-action="add-custom-tag" data-tag="${state.searchQuery}">
        <span>+ 添加标签 "${state.searchQuery}"</span>
      </div>
    `;
  }

  dropdownEl.innerHTML = html;
  dropdownEl.classList.add('active');
  state.dropdownVisible = true;
}

// 添加标签
function addTag(tag: string) {
  if (!state.selectedTags.includes(tag)) {
    state.selectedTags.push(tag);
    state.searchQuery = '';
    searchInput.value = '';
    renderSelectedTags();
    renderDropdown();
    renderPrompts();
  }
}

// 移除标签
function removeTag(tag: string) {
  state.selectedTags = state.selectedTags.filter(t => t !== tag);
  renderSelectedTags();
  renderDropdown();
  renderPrompts();
}

// 选择提示词
function selectPrompt(prompt: Prompt) {
  state.selectedPrompt = prompt;
  prompt.tags.forEach(tag => {
    if (!state.selectedTags.includes(tag)) {
      state.selectedTags.push(tag);
    }
  });
  renderSelectedTags();
  renderPrompts();
  showVariablePanel();
}

// 显示变量面板
function showVariablePanel() {
  if (!state.selectedPrompt) return;

  // 检测是否为图片生成模板
  if (state.selectedPrompt.templateType === 'image_generation') {
    showImageGenerationPanel();
    return;
  }

  const existingVars = state.selectedPrompt.variables || [];
  const parsedVars = parseVariables(state.selectedPrompt.content);
  const varNames = parsedVars.length > 0 ? parsedVars : existingVars.map(v => v.name);

  if (varNames.length === 0) {
    variableInputs.innerHTML = '<p style="color:var(--text-secondary);font-size:12px;padding:8px 0;">此提示词无变量，直接复制即可</p>';
  } else {
    variableInputs.innerHTML = varNames.map(varName => {
      const existing = existingVars.find(v => v.name === varName);
      const varDef = existing || { name: varName, description: '', required: true, options: [] as string[] };

      if (varDef.options && varDef.options.length > 0) {
        return `
          <div class="variable-item">
            <label>${varDef.name}${varDef.required ? ' *' : ''}</label>
            <select data-var="${varName}">
              ${varDef.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
            ${varDef.description ? `<div class="variable-hint">${varDef.description}</div>` : ''}
          </div>
        `;
      }

      return `
        <div class="variable-item">
          <label>${varDef.name}${varDef.required ? ' *' : ''}</label>
          <textarea data-var="${varName}" placeholder="${varDef.defaultValue || ''}" rows="2"></textarea>
          ${varDef.description ? `<div class="variable-hint">${varDef.description}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  variablePanel.classList.add('active');
}

// 图片生成模板的10维度选择面板
interface DimensionState {
  [key: string]: string[];  // dimension name -> selected options
}

const dimensionState: DimensionState = {};

function showImageGenerationPanel() {
  const dimensions = state.selectedPrompt?.imageDimensions || [];

  variableInputs.innerHTML = `
    <div style="max-height:400px;overflow-y:auto;">
      ${dimensions.map(dim => `
        <div class="variable-item" style="margin-bottom:16px;">
          <label style="font-weight:600;margin-bottom:6px;display:block;">${dim.name}</label>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">
            ${dim.options.map(opt => `
              <span class="tag-chip" data-dim="${dim.name}" data-opt="${opt}"
                style="cursor:pointer;background:${dimensionState[dim.name]?.includes(opt) ? 'var(--accent-light)' : 'var(--bg-tertiary)'};color:${dimensionState[dim.name]?.includes(opt) ? 'var(--accent)' : 'var(--text-secondary)'};border:1px solid ${dimensionState[dim.name]?.includes(opt) ? 'var(--accent)' : 'transparent'};">
                ${opt}
              </span>
            `).join('')}
            ${dim.customEnabled ? `
              <input type="text" data-dim-custom="${dim.name}" placeholder="+ 自定义"
                style="flex:1;min-width:80px;padding:4px 8px;border:1px solid var(--border);border-radius:12px;font-size:12px;outline:none;" />
            ` : ''}
          </div>
        </div>
      `).join('')}
      <div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-md);">
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px;">预览</div>
        <div id="imagePromptPreview" style="font-size:12px;color:var(--text-primary);word-break:break-all;"></div>
      </div>
    </div>
  `;

  // 绑定点击事件 - 多选标签
  variableInputs.querySelectorAll('.tag-chip[data-dim]').forEach(chip => {
    chip.addEventListener('click', () => {
      const dimName = (chip as HTMLElement).dataset.dim!;
      const opt = (chip as HTMLElement).dataset.opt!;

      if (!dimensionState[dimName]) dimensionState[dimName] = [];

      if (dimensionState[dimName].includes(opt)) {
        dimensionState[dimName] = dimensionState[dimName].filter(o => o !== opt);
      } else {
        dimensionState[dimName].push(opt);
      }

      // 更新UI
      (chip as HTMLElement).style.background = dimensionState[dimName].includes(opt) ? 'var(--accent-light)' : 'var(--bg-tertiary)';
      (chip as HTMLElement).style.color = dimensionState[dimName].includes(opt) ? 'var(--accent)' : 'var(--text-secondary)';
      (chip as HTMLElement).style.borderColor = dimensionState[dimName].includes(opt) ? 'var(--accent)' : 'transparent';

      updateImagePromptPreview();
    });
  });

  // 绑定自定义输入
  variableInputs.querySelectorAll('input[data-dim-custom]').forEach(input => {
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const dimName = (input as HTMLElement).dataset.dimCustom!;
        const value = (input as HTMLInputElement).value.trim();
        if (value && !dimensionState[dimName]?.includes(value)) {
          if (!dimensionState[dimName]) dimensionState[dimName] = [];
          dimensionState[dimName].push(value);
          (input as HTMLInputElement).value = '';
          showImageGenerationPanel(); // 重新渲染
          updateImagePromptPreview();
        }
      }
    });
  });

  variablePanel.classList.add('active');
  updateImagePromptPreview();
}

function updateImagePromptPreview() {
  const preview = document.getElementById('imagePromptPreview');
  if (!preview) return;

  const parts: string[] = [];
  for (const [dimName, options] of Object.entries(dimensionState)) {
    if (options.length > 0) {
      parts.push(...options);
    }
  }
  preview.textContent = parts.length > 0 ? parts.join('，') : '请选择标签...';
}

// 图片生成模板 - 获取组合后的prompt
function getImageGeneratedPrompt(): string {
  const parts: string[] = [];
  for (const [dimName, options] of Object.entries(dimensionState)) {
    if (options.length > 0) {
      parts.push(...options);
    }
  }
  return parts.join('，');
}

// 获取变量值
function getVariableValues(): Record<string, string> {
  const inputs = variableInputs.querySelectorAll('input[data-var], select[data-var], textarea[data-var]');
  const values: Record<string, string> = {};
  inputs.forEach(input => {
    values[(input as HTMLElement).dataset.var!] = (input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
  });
  return values;
}

// 复制到剪贴板
async function copyToClipboard() {
  if (!state.selectedPrompt) return;

  let content: string;
  if (state.selectedPrompt.templateType === 'image_generation') {
    content = getImageGeneratedPrompt();
  } else {
    content = replaceVariables(state.selectedPrompt.content, getVariableValues());
  }

  try {
    await navigator.clipboard.writeText(content);
    showToast('已复制到剪贴板');
  } catch (e) {
    console.error('Copy failed:', e);
    showToast('复制失败');
  }

  await chrome.runtime.sendMessage({
    type: 'UPDATE_PROMPT',
    payload: { id: state.selectedPrompt.id, updates: { useCount: state.selectedPrompt!.useCount + 1, lastUsedAt: Date.now() } },
  });

  // 保存到历史记录
  const variables = state.selectedPrompt.templateType === 'image_generation'
    ? dimensionState
    : getVariableValues();

  await chrome.runtime.sendMessage({
    type: 'ADD_HISTORY',
    payload: {
      promptId: state.selectedPrompt.id,
      site: '',
      variables,
      content,
    },
  });

  setTimeout(() => hideVariablePanel(), 500);
}

// 显示提示
function showToast(message: string) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2500);
}

// 隐藏变量面板
function hideVariablePanel() {
  variablePanel.classList.remove('active');
  state.selectedPrompt = null;
}

// 切换收藏状态
async function toggleFavorite(id: string) {
  const prompt = state.prompts.find(p => p.id === id);
  if (!prompt) return;

  await chrome.runtime.sendMessage({
    type: 'UPDATE_PROMPT',
    payload: { id, updates: { isFavorite: !prompt.isFavorite } },
  });

  prompt.isFavorite = !prompt.isFavorite;
  updateCounts();
  renderPrompts();
}

// 新建文件夹
async function addFolder() {
  const name = prompt('请输入文件夹名称：');
  if (!name) return;

  console.log('[PromptMaster] addFolder called, name:', name);

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'ADD_FOLDER',
      payload: { name, parentId: null, icon: '📁', order: state.folders.length },
    });

    console.log('[PromptMaster] addFolder response:', JSON.stringify(response));

    if (response && response.success) {
      state.folders.push(response.data);
      console.log('[PromptMaster] state.folders after push:', state.folders);

      // 直接在 DOM 中添加新文件夹（确保显示）
      const count = 0;
      const newFolderEl = document.createElement('div');
      newFolderEl.className = 'folder-item';
      newFolderEl.dataset.folder = response.data.id;
      newFolderEl.textContent = `${response.data.icon || '📁'} ${response.data.name} ` + count;
      folderListEl.appendChild(newFolderEl);

      // 自动滚动到底部显示新文件夹
      folderListEl.scrollTop = folderListEl.scrollHeight;

      showToast('文件夹已创建');
    } else {
      console.error('[PromptMaster] addFolder failed:', response);
      showToast('创建失败: ' + (response?.error || '未知错误'));
    }
  } catch (e) {
    console.error('[PromptMaster] addFolder error:', e);
    showToast('创建失败: ' + String(e));
  }
}

// 新建提示词
async function addPrompt() {
  const title = prompt('请输入提示词标题：');
  if (!title) return;

  const content = prompt('请输入提示词内容（可使用 {{变量名}} 作为占位符）：');
  if (content === null) return;

  const tagsStr = prompt('请输入标签（用逗号分隔）：');
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

  const newCustomTags = tags.filter(tag => {
    const allTags = new Set(Object.values(PRESET_TAGS).flat());
    return !allTags.has(tag) && !state.customTags.includes(tag);
  });
  if (newCustomTags.length > 0) {
    state.customTags.push(...newCustomTags);
    await saveCustomTags();
  }

  const newPrompt = await chrome.runtime.sendMessage({
    type: 'ADD_PROMPT',
    payload: { title, content, tags, folderId: null },
  });

  if (newPrompt.success) {
    state.prompts.push(newPrompt.data);
    updateCounts();
    renderPrompts();
    showToast('提示词已创建');
  }
}

// 设置事件监听
function setupEventListeners() {
  searchInput.addEventListener('input', () => {
    state.searchQuery = searchInput.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(renderDropdown, 150);
  });

  searchInput.addEventListener('focus', () => {
    if (state.searchQuery || state.dropdownVisible) renderDropdown();
  });

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!searchWrapper.contains(target) && !dropdownEl.contains(target)) {
      dropdownEl.classList.remove('active');
      state.dropdownVisible = false;
    }
    if (target.classList.contains('remove') && target.dataset.tag) {
      removeTag(target.dataset.tag);
    }
  });

  dropdownEl.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const action = target.dataset.action || target.closest('[data-action]')?.getAttribute('data-action');
    const tag = target.dataset.tag || target.closest('[data-tag]')?.getAttribute('data-tag');

    if (action === 'add-tag' && tag) {
      addTag(tag);
    } else if (action === 'add-custom-tag' && tag) {
      if (!state.customTags.includes(tag)) {
        state.customTags.push(tag);
        saveCustomTags();
      }
      addTag(tag);
    } else if (action === 'select-prompt' && target.dataset.id) {
      const prompt = state.prompts.find(p => p.id === target.dataset.id);
      if (prompt) {
        state.searchQuery = '';
        searchInput.value = '';
        dropdownEl.classList.remove('active');
        state.dropdownVisible = false;
        selectPrompt(prompt);
      }
    }
  });

  folderListEl.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.folder-item') as HTMLElement;
    if (!item) return;
    folderListEl.querySelectorAll('.folder-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    state.currentFolder = item.dataset.folder!;
    state.searchQuery = '';
    searchInput.value = '';
    state.selectedTags = [];
    renderSelectedTags();
    renderPrompts();
  });

  copyBtn.addEventListener('click', copyToClipboard);
  cancelBtn.addEventListener('click', hideVariablePanel);
  closeBtn.addEventListener('click', hideVariablePanel);
  addFolderBtn.addEventListener('click', addFolder);
  addFolderBtn2.addEventListener('click', addFolder);
  addPromptBtn.addEventListener('click', addPrompt);

  // 右键菜单
  const contextMenu = document.getElementById('contextMenu')!;
  const moveModal = document.getElementById('moveModal')!;
  const moveFolderList = document.getElementById('moveFolderList')!;
  const moveModalCancel = document.getElementById('moveModalCancel')!;
  let contextPromptId: string | null = null;

  // 提示词卡片右键
  promptListEl.addEventListener('contextmenu', (e) => {
    const card = (e.target as HTMLElement).closest('.prompt-card');
    if (card) {
      e.preventDefault();
      contextPromptId = card.getAttribute('data-id');
      contextMenu.style.left = (e as MouseEvent).pageX + 'px';
      contextMenu.style.top = (e as MouseEvent).pageY + 'px';
      contextMenu.style.display = 'block';
    }
  });

  // 点击其他地方关闭右键菜单
  document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target as Node)) {
      contextMenu.style.display = 'none';
    }
  });

  // 右键菜单项点击
  contextMenu.addEventListener('click', async (e) => {
    const action = (e.target as HTMLElement).dataset.action;
    contextMenu.style.display = 'none';

    if (!contextPromptId) return;
    const prompt = state.prompts.find(p => p.id === contextPromptId);
    if (!prompt) return;

    if (action === 'delete') {
      if (confirm(`删除 "${prompt.title}"？`)) {
        await chrome.runtime.sendMessage({ type: 'DELETE_PROMPT', payload: { id: prompt.id } });
        state.prompts = state.prompts.filter(p => p.id !== prompt.id);
        updateCounts();
        renderPrompts();
        showToast('已删除');
      }
    } else if (action === 'favorite') {
      await toggleFavorite(prompt.id);
    } else if (action === 'move') {
      // 显示移动弹窗
      moveFolderList.innerHTML = state.folders.map(f => `
        <div class="folder-move-item" data-folder="${f.id}" style="padding:8px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
          ${f.icon || '📁'} ${f.name}
        </div>
      `).join('') || '<div style="padding:8px;color:var(--text-secondary);">暂无文件夹</div>';

      moveFolderList.querySelectorAll('.folder-move-item').forEach(item => {
        item.addEventListener('click', async () => {
          const targetFolderId = (item as HTMLElement).dataset.folder!;
          await chrome.runtime.sendMessage({
            type: 'UPDATE_PROMPT',
            payload: { id: prompt.id, updates: { folderId: targetFolderId } },
          });
          prompt.folderId = targetFolderId;
          moveModal.style.display = 'none';
          renderPrompts();
          showToast('已移动');
        });
      });

      moveModal.style.display = 'block';
    }
  });

  // 关闭移动弹窗
  moveModalCancel.addEventListener('click', () => {
    moveModal.style.display = 'none';
  });

  // 切换历史记录显示
  toggleHistoryBtn.addEventListener('click', () => {
    if (historySection.style.display === 'none') {
      historySection.style.display = 'block';
      toggleHistoryBtn.textContent = '隐藏';
    } else {
      historySection.style.display = 'none';
      toggleHistoryBtn.textContent = '显示';
    }
  });
}

init();