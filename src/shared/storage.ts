import { Prompt, Folder, STORAGE_KEYS, BUILTIN_PROMPTS, generateId } from './types';

export class Storage {
  // 初始化存储，首次安装时写入内置框架
  static async initialize(): Promise<void> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.INITIALIZED);
    if (result[STORAGE_KEYS.INITIALIZED]) {
      return;
    }

    // 写入内置框架
    const prompts: Prompt[] = BUILTIN_PROMPTS.map(p => ({
      ...p,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastUsedAt: null,
    }));

    await chrome.storage.local.set({
      [STORAGE_KEYS.PROMPTS]: prompts,
      [STORAGE_KEYS.FOLDERS]: [],
      [STORAGE_KEYS.HISTORY]: [],
      [STORAGE_KEYS.INITIALIZED]: true,
    });
  }

  // Prompt CRUD
  static async getPrompts(): Promise<Prompt[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.PROMPTS);
    return (result[STORAGE_KEYS.PROMPTS] as Prompt[]) || [];
  }

  static async getPrompt(id: string): Promise<Prompt | null> {
    const prompts = await this.getPrompts();
    return prompts.find(p => p.id === id) || null;
  }

  static async addPrompt(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt> {
    const prompts = await this.getPrompts();
    const newPrompt: Prompt = {
      ...prompt,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    prompts.push(newPrompt);
    await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: prompts });
    return newPrompt;
  }

  static async updatePrompt(id: string, updates: Partial<Prompt>): Promise<Prompt | null> {
    const prompts = await this.getPrompts();
    const index = prompts.findIndex(p => p.id === id);
    if (index === -1) return null;

    prompts[index] = { ...prompts[index], ...updates, updatedAt: Date.now() };
    await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: prompts });
    return prompts[index];
  }

  static async deletePrompt(id: string): Promise<boolean> {
    const prompts = await this.getPrompts();
    const filtered = prompts.filter(p => p.id !== id);
    if (filtered.length === prompts.length) return false;
    await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: filtered });
    return true;
  }

  // Folder CRUD
  static async getFolders(): Promise<Folder[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.FOLDERS);
    return (result[STORAGE_KEYS.FOLDERS] as Folder[]) || [];
  }

  static async addFolder(folder: Omit<Folder, 'id'>): Promise<Folder> {
    const folders = await this.getFolders();
    const newFolder: Folder = { ...folder, id: generateId() };
    folders.push(newFolder);
    await chrome.storage.local.set({ [STORAGE_KEYS.FOLDERS]: folders });
    return newFolder;
  }

  static async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    const folders = await this.getFolders();
    const index = folders.findIndex(f => f.id === id);
    if (index === -1) return null;
    folders[index] = { ...folders[index], ...updates };
    await chrome.storage.local.set({ [STORAGE_KEYS.FOLDERS]: folders });
    return folders[index];
  }

  static async deleteFolder(id: string): Promise<boolean> {
    const folders = await this.getFolders();
    const filtered = folders.filter(f => f.id !== id);
    if (filtered.length === folders.length) return false;
    await chrome.storage.local.set({ [STORAGE_KEYS.FOLDERS]: filtered });
    return true;
  }

  // 从 Obsidian md 文件导入
  static async importFromMarkdown(content: string): Promise<Prompt | null> {
    // 解析 YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;

    const frontmatter = this.parseFrontmatter(frontmatterMatch[1]);
    const bodyContent = content.replace(/^---[\s\S]*?---\n/, '');

    // 提取 {{变量名}}
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: Prompt['variables'] = [];
    const seen = new Set<string>();
    let match;
    while ((match = variableRegex.exec(bodyContent)) !== null) {
      if (!seen.has(match[1])) {
        seen.add(match[1]);
        variables.push({ name: match[1], description: '' });
      }
    }

    const prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> = {
      title: frontmatter.title || '未命名',
      content: bodyContent.trim(),
      folderId: frontmatter.folder || null,
      tags: frontmatter.tags || [],
      useCount: 0,
      isFavorite: false,
      lastUsedAt: null,
      variables: variables.length > 0 ? variables : undefined,
    };

    return await this.addPrompt(prompt);
  }

  private static parseFrontmatter(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = content.split('\n');
    let currentKey = '';
    let currentValue: any = null;

    for (const line of lines) {
      const keyMatch = line.match(/^(\w+):\s*/);
      if (keyMatch) {
        if (currentKey) {
          result[currentKey] = currentValue;
        }
        currentKey = keyMatch[1];
        const valuePart = line.substring(keyMatch[0].length).trim();
        if (valuePart.startsWith('[')) {
          // 数组
          currentValue = valuePart.slice(1, -1).split(',').map(s => s.trim());
        } else {
          currentValue = valuePart;
        }
      }
    }
    if (currentKey) {
      result[currentKey] = currentValue;
    }
    return result;
  }
}