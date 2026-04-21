// 数据模型
export interface PromptVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required?: boolean;
  options?: string[];
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number | null;
  useCount: number;
  isFavorite: boolean;
  variables?: PromptVariable[];
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  icon?: string;
  order: number;
}

export interface UsageHistory {
  id: string;
  promptId: string;
  usedAt: number;
  site: string;
  variables: Record<string, string>;
}

// 图片生成模板维度
export interface ImageDimension {
  name: string;           // 维度名称：如 "风格"
  options: string[];      // 预制选项
  customEnabled: boolean; // 是否允许手动输入
}

// 图片生成模板
export interface ImageGenerationTemplate {
  id: string;
  title: string;
  dimensions: ImageDimension[];  // 通常10个维度
  basePrompt?: string;          // 基础前缀（可选）
  suffix?: string;              // 结尾后缀（可选）
}

// 模板类型
export type TemplateType = 'framework' | 'image_generation';

// 扩展 Prompt 支持模板类型
export interface Prompt {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number | null;
  useCount: number;
  isFavorite: boolean;
  variables?: PromptVariable[];
  templateType?: TemplateType;     // 模板类型
  imageDimensions?: ImageDimension[];  // 图片生成模板的维度（仅 templateType=image_generation 时有效）
  basePrompt?: string;            // 图片生成基础前缀
  promptSuffix?: string;          // 图片生成后缀
}

// 存储键名
export const STORAGE_KEYS = {
  PROMPTS: 'promptmaster_prompts',
  FOLDERS: 'promptmaster_folders',
  HISTORY: 'promptmaster_history',
  SETTINGS: 'promptmaster_settings',
  INITIALIZED: 'promptmaster_initialized',
  CUSTOM_DIMENSIONS: 'promptmaster_custom_dimensions',
} as const;

// 图片生成模板10维度定义
export const IMAGE_DIMENSIONS: ImageDimension[] = [
  { name: '风格', options: ['写实', '科幻', '奇幻', '绘画', '插画', '设计', '电影感', '摄影', '动漫', '赛博朋克', '蒸汽朋克', '复古', '极简', '梦幻', '暗黑', '治愈', '清新'], customEnabled: true },
  { name: '质量', options: ['4K', '8K', '16K', '超高清', '无损', 'RAW', '高清', '超细腻', '专业级', '商业级', '电影级'], customEnabled: true },
  { name: '光照', options: ['自然光', '日光', '柔光', '硬光', '逆光', '侧光', '背光', '霓虹灯', '烛光', '月光', '荧光', '体积光', '散射光', '伦勃朗光', '蝴蝶光'], customEnabled: true },
  { name: '构图', options: ['三分法', '黄金螺旋', '对称', '对角线', '框架', '引导线', '留白', '居中', '紧凑', '宽松'], customEnabled: true },
  { name: '色调', options: ['暖色调', '冷色调', '黑白', '单色', '高饱和', '低饱和', '赛博朋克色调', '电影色调', '金属色', '鲜艳', '柔和'], customEnabled: true },
  { name: '材质', options: ['金属', '大理石', '丝绸', '毛绒', '玻璃', '水晶', '皮革', '木材', '布料', '混凝土', '镜面', '磨砂'], customEnabled: true },
  { name: '氛围', options: ['宁静', '平和', '紧张', '悬疑', '喜悦', '忧郁', '神秘', '诡异', '史诗', '壮丽', '浪漫', '温馨', '孤独', '荒凉', '梦幻', '超现实'], customEnabled: true },
  { name: '艺术流派', options: ['印象派', '浮世绘', '水墨', '工笔', '油画', '素描', '涂鸦', '波普', '极简主义', '超现实主义', 'Blender渲染', 'OC渲染', 'Unreal Engine'], customEnabled: true },
  { name: '年代', options: ['古代', '中世纪', '文艺复兴', '维多利亚时代', '1920年代', '1950年代', '1980年代', '1990年代', '近未来', '2050', '赛博朋克'], customEnabled: true },
  { name: '负面词', options: ['低质量', '模糊', '噪点', '扭曲', '畸形', '残缺', '比例失调', '色彩溢出', '过曝', '欠曝', '锯齿', '毛刺', '不自然', '塑料感', '水印'], customEnabled: true },
];

// 站点检测配置
export interface SiteDetector {
  name: string;
  urlPattern: string;
  textareaSelector: string;
  inputEventType: 'input' | 'change' | 'inputEvent';
}

export const SUPPORTED_SITES: SiteDetector[] = [
  {
    name: 'ChatGPT',
    urlPattern: 'chatgpt.com',
    textareaSelector: 'textarea[data-testid="prompt-textarea"]',
    inputEventType: 'input',
  },
  {
    name: 'Claude',
    urlPattern: 'claude.ai',
    textareaSelector: 'textarea[data-testid="composer"]',
    inputEventType: 'input',
  },
  {
    name: 'Gemini',
    urlPattern: 'gemini.google.com',
    textareaSelector: 'textarea[placeholder*="Message"]',
    inputEventType: 'input',
  },
  {
    name: 'DeepSeek',
    urlPattern: 'deepseek.com',
    textareaSelector: 'textarea[name="search"]',
    inputEventType: 'input',
  },
];

// 内置框架常量
export const BUILTIN_PROMPTS: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'lastUsedAt'>[] = [
  {
    title: 'BROKE 框架',
    content: `# BROKE 框架

## 描述
BROKE 是一个结构化的提示词框架，包含五个核心要素。

## 框架结构

### B - Background（背景）
{{Background}}

### R - Role（角色）
{{Role}}

### O - Objective（目标）
{{Objective}}

### K - Key Result（关键结果）
{{KeyResult}}

### E - Evolve（演化）
持续优化和调整策略。

## 使用方法
按顺序填写上述五个要素，形成完整的 BROKE 提示词。`,
    folderId: null,
    tags: ['框架', 'BROKE'],
    useCount: 0,
    isFavorite: false,
    variables: [
      { name: 'Background', description: '当前背景和情境', required: true },
      { name: 'Role', description: 'AI 扮演的角色', required: true },
      { name: 'Objective', description: '你想要达成的目标', required: true },
      { name: 'KeyResult', description: '可衡量的关键结果', required: true },
    ],
  },
  {
    title: 'CO-STAR 框架',
    content: `# CO-STAR 框架

## 描述
CO-STAR 是一个全面的提示词构建框架，帮助你创建结构化的提示词。

## 框架结构

### C - Context（上下文）
{{Context}}

### O - Objective（目标）
{{Objective}}

### S - Style（风格）
{{Style}}

### T - Tone（语气）
{{Tone}}

### A - Audience（受众）
明确目标读者。

### R - Response（回复）
说明期望的回复格式。

## 使用方法
依次填写每个要素，构建完整的提示词。`,
    folderId: null,
    tags: ['框架', 'CO-STAR'],
    useCount: 0,
    isFavorite: false,
    variables: [
      { name: 'Context', description: '背景信息', required: true },
      { name: 'Objective', description: '具体目标', required: true },
      { name: 'Style', description: '期望风格', required: false },
      { name: 'Tone', description: '期望语气', required: false },
    ],
  },
  {
    title: 'CRISPE 框架',
    content: `# CRISPE 框架

## 描述
CRISPE 是一个专业的提示词框架，适合复杂任务。

## 框架结构

### C - Capacity（能力）
{{Capacity}}

### R - Role（角色）
{{Role}}

### I - Insight（洞察）
{{Insight}}

### S - Statement（陈述）
{{Statement}}

### P - Personality（个性）
指定回复个性。

### E - Experiment（实验）
鼓励尝试和实验。

## 使用方法
按照框架要素系统地构建提示词。`,
    folderId: null,
    tags: ['框架', 'CRISPE'],
    useCount: 0,
    isFavorite: false,
    variables: [
      { name: 'Capacity', description: 'AI 需要具备的能力', required: true },
      { name: 'Role', description: 'AI 扮演的角色', required: true },
      { name: 'Insight', description: '背景和洞察', required: true },
      { name: 'Statement', description: '清晰的任务陈述', required: true },
    ],
  },
  {
    title: 'RTF 框架',
    content: `# RTF 框架

## 描述
RTF 是一个简洁的提示词框架。

## 框架结构

### R - Role（角色）
{{Role}}

### T - Task（任务）
{{Task}}

### F - Format（格式）
{{Format}}

## 使用方法
简明扼要地填写三个要素即可。`,
    folderId: null,
    tags: ['框架', 'RTF'],
    useCount: 0,
    isFavorite: false,
    variables: [
      { name: 'Role', description: 'AI 角色', required: true },
      { name: 'Task', description: '具体任务', required: true },
      { name: 'Format', description: '输出格式', required: false },
    ],
  },
  {
    title: 'AI通用模板',
    content: `# AI通用模板

## 描述
适用于日常问答、翻译、总结、创作等通用场景的提示词模板。

## 使用场景

请{{场景}}：{{内容}}`,
    folderId: null,
    tags: ['通用', '模板'],
    useCount: 0,
    isFavorite: false,
    variables: [
      { name: '场景', description: '使用场景：问答/翻译/总结/创作', required: true, options: ['问答', '翻译', '总结', '创作'] },
      { name: '内容', description: '具体内容', required: true },
    ],
  },
  {
    title: '📁 图片生成',
    content: `# 📁 图片生成提示词

## 说明
这是一个提示词文件夹，内置多种图片生成风格模板。

## 使用方法
1. 选择下方对应的提示词模板
2. 根据需求修改参数
3. 复制到图片生成工具中使用

## 适用模型
- Seedance（字节跳动）：适合视频、动态叙事
- Nano Banana（谷歌）：适合静态图、文字精准渲染
- 通义万相、文心一格：适合中文文字流程图

## 包含风格
- 赛博科技感（Seedance）
- 微距鲜艳风（Nano Banana）
- 商务极简
- 手绘草图
- 扁平图标风`,
    folderId: null,
    tags: ['图片', '生成', '文件夹'],
    useCount: 0,
    isFavorite: false,
    variables: [],
  },
  {
    title: '🎬 Seedance 视频风格',
    content: `# Seedance 视频生成提示词
## 适用场景：短视频、动态故事板、预告片

## 基础模板
{{风格描述}}流程图，共{{步数}}步：{{步骤}}. 文字写在清晰的小方框内，用平滑箭头连接。

画质要求：{{质量词}} – 高分辨率，对焦清晰，线条干净，无衬线字体文字可读。

画面比例：{{宽高比}}
主色调：{{色彩氛围}}
背景：{{背景描述}}

## 变量说明
| 变量 | 说明 | 可选值 |
|------|------|--------|
| 风格描述 | 整体视觉风格 | 赛博科技感、电影级质感、专业电影感 |
| 步数 | 流程节点数量 | 3～6 |
| 步骤 | 具体步骤（用→连接） | 如：用户请求→API网关→认证服务→返回结果 |
| 质量词 | 输出质量 | 8K高清、超细腻、专业图表级精度 |
| 宽高比 | 画面比例 | 16:9（横版）、9:16（竖版） |
| 色彩氛围 | 色调选择 | 霓虹蓝+暗灰、明亮粉彩、海军蓝单色 |
| 背景 | 背景描述 | 深色科技网格、纯白画布、柔和渐变 |

## 运镜控制（Seedance 特色）
支持推、拉、摇、移、跟、环绕等7种基础运镜
支持专业电影术语：希区柯克变焦、一镜到底`,
    folderId: null,
    tags: ['视频', 'Seedance', '电影感', '运镜'],
    useCount: 0,
    isFavorite: false,
    variables: [
      { name: '风格描述', description: '整体视觉风格', required: true, options: ['赛博科技感', '电影级质感', '专业电影感'] },
      { name: '步数', description: '流程节点数量', required: true, options: ['3步', '4步', '5步', '6步'] },
      { name: '步骤', description: '用→连接各步骤', required: true },
      { name: '质量词', description: '输出质量', required: false, options: ['8K高清', '超细腻', '专业图表级精度'] },
      { name: '宽高比', description: '画面比例', required: false, options: ['16:9横版', '9:16竖版'] },
      { name: '色彩氛围', description: '色调选择', required: false, options: ['霓虹蓝+暗灰', '明亮粉彩', '海军蓝单色'] },
      { name: '背景描述', description: '背景样式', required: false, options: ['深色科技网格', '纯白画布', '柔和渐变'] },
    ],
  },
  {
    title: '🖼️ Nano Banana 静态图风格',
    content: `# Nano Banana 静态图生成提示词
## 适用场景：海报、产品图、概念插画、文字精准渲染

## 基础模板
{{风格描述}}流程图，共{{步数}}步：{{步骤}}. 文字写在{{文字框形状}}内。

画质要求：{{质量词}} – 近乎完美的文字渲染，细节逼真。

画面比例：{{宽高比}}
主色调：{{色彩氛围}}
背景：{{背景描述}}

## 变量说明
| 变量 | 说明 | 可选值 |
|------|------|--------|
| 风格描述 | 整体视觉风格 | 微距鲜艳风、写实风格、精准渲染 |
| 步数 | 流程节点数量 | 3～6 |
| 步骤 | 各步骤名称 | 如：播种→浇水日照→收获果实 |
| 文字框形状 | 文字容器形状 | 发光六边形、水滴形小标签、长方形框 |
| 质量词 | 输出质量 | 超高清、文字锐利、无错别字 |
| 宽高比 | 画面比例 | 1:1方图、16:9横版、9:16竖版 |
| 色彩氛围 | 色调选择 | 黄绿色调、柔和暖色、黑白单色 |
| 背景 | 背景样式 | 背景虚化、纯色填充、科技网格 |

## Nano Banana 特色
- 近乎完美的文字渲染
- 角色与风格一致性（多张图片保持统一）
- 精确的指令执行
- 支持统一画布编辑`,
    folderId: null,
    tags: ['静态图', 'NanoBanana', '文字渲染', '高清'],
    useCount: 0,
    isFavorite: false,
    variables: [
      { name: '风格描述', description: '整体视觉风格', required: true, options: ['微距鲜艳风', '写实风格', '精准渲染'] },
      { name: '步数', description: '流程节点数量', required: true, options: ['3步', '4步', '5步', '6步'] },
      { name: '步骤', description: '用→连接各步骤', required: true },
      { name: '文字框形状', description: '文字容器形状', required: false, options: ['发光六边形', '水滴形小标签', '长方形框'] },
      { name: '质量词', description: '输出质量', required: false, options: ['超高清', '文字锐利', '无错别字'] },
      { name: '宽高比', description: '画面比例', required: false, options: ['1:1方图', '16:9横版', '9:16竖版'] },
      { name: '色彩氛围', description: '色调选择', required: false, options: ['黄绿色调', '柔和暖色', '黑白单色'] },
    ],
  },
  {
    title: '💼 商务极简风格',
    content: `# 商务极简流程图
## 适用场景：商务报告、演示文稿、专业文档

## 提示词模板
商务极简流程图，共{{步数}}步：{{步骤}}. 干净的长方形框，细灰色箭头，白底浅灰色网格。文字用无衬线字体，完美对齐。

画质要求：专业图表，高分辨率，线条清晰。

画面比例：{{宽高比}}
主色调：{{色彩氛围}}

## 风格标签
- 扁平化设计
- 简洁线条
- 专业商务
- 数据可视化

## 适用模型
通义万相（阿里）：⭐⭐⭐⭐⭐ 首选
文心一格（百度）：⭐⭐⭐⭐ 商务风格良好`,
    folderId: null,
    tags: ['商务', '极简', '专业', '报告'],
    useCount: 0,
    isFavorite: false,
    variables: [
      { name: '步数', description: '流程节点数量', required: true, options: ['3步', '4步', '5步', '6步'] },
      { name: '步骤', description: '用→连接各步骤', required: true },
      { name: '宽高比', description: '画面比例', required: false, options: ['16:9横版', '9:16竖版', '4:3标准'] },
      { name: '色彩氛围', description: '色调选择', required: false, options: ['蓝灰商务', '绿色专业', '紫色优雅'] },
    ],
  },
  {
    title: '✏️ 手绘草图风格',
    content: `# 手绘草图风格流程图
## 适用场景：创意展示、头脑风暴、用户教育材料

## 提示词模板
手绘草图风格流程图，共{{步数}}步：{{步骤}}. 铅笔线条的粗糙箭头，便利贴形状的不规则框，纸纹背景，蓝色墨水笔触。

画质要求：素描本扫描效果，可读的手写感文字，艺术感。

画面比例：{{宽高比}}

## 风格标签
- 手绘感
- 艺术化
- 创意表达
- 非正式风格

## 适用模型
通义万相：⭐⭐⭐⭐ 适合商务/手绘混合风格`,
    folderId: null,
    tags: ['手绘', '草图', '艺术', '创意'],
    useCount: 0,
    isFavorite: false,
    variables: [
      { name: '步数', description: '流程节点数量', required: true, options: ['3步', '4步', '5步'] },
      { name: '步骤', description: '用→连接各步骤', required: true },
      { name: '宽高比', description: '画面比例', required: false, options: ['1:1方图', '4:3标准'] },
    ],
  },
  {
    title: '🎨 扁平图标风格',
    content: `# 扁平图标风格流程图
## 适用场景：移动端界面、社交媒体内容、教学视频封面

## 提示词模板
扁平图标风格流程图（竖向），共{{步数}}步：{{步骤}}. 每一步都是一个彩色图标加短标签，用点状箭头连接。干净矢量感，明亮粉彩色调（薄荷绿、桃色、薰衣草紫）。

画质要求：超高清，文字锐利，无阴影。

画面比例：9:16（竖版推荐）

## 风格标签
- 扁平化设计
- 矢量风格
- 明亮配色
- 移动端友好

## 适用模型
通义万相：⭐⭐⭐⭐⭐ 扁平风格首选`,
    folderId: null,
    tags: ['扁平', '图标', '矢量', '社交媒体'],
    useCount: 0,
    isFavorite: false,
    variables: [
      { name: '步数', description: '流程节点数量', required: true, options: ['3步', '4步'] },
      { name: '步骤', description: '用→连接各步骤', required: true },
    ],
  },
  // ========== 图片生成模板 ==========
  {
    title: '📷 图片生成器',
    content: '图片生成模板',
    folderId: null,
    tags: ['图片', '生成'],
    useCount: 0,
    isFavorite: false,
    templateType: 'image_generation',
    imageDimensions: IMAGE_DIMENSIONS,
    basePrompt: '',
    promptSuffix: '',
  },
];

// 生成唯一 ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// 变量替换函数
export function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

// 解析 {{变量名}} 语法
export function parseVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = content.matchAll(regex);
  const variables: string[] = [];
  for (const match of matches) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  return variables;
}