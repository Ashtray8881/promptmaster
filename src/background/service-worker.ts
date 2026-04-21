// Service Worker 入口
console.log('[PromptMaster] Service Worker starting...');

import { Storage } from '../shared/storage';
import { STORAGE_KEYS, BUILTIN_PROMPTS, generateId } from '../shared/types';

// 监听安装事件
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[PromptMaster] Extension installed');
  await initializeStorage();
  console.log('[PromptMaster] Initialized');
});

// 初始化存储
async function initializeStorage(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.INITIALIZED, async (result) => {
      if (result[STORAGE_KEYS.INITIALIZED]) {
        resolve();
        return;
      }

      const prompts = BUILTIN_PROMPTS.map(p => ({
        ...p,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastUsedAt: null,
      }));

      await new Promise<void>((res) => {
        chrome.storage.local.set({
          [STORAGE_KEYS.PROMPTS]: prompts,
          [STORAGE_KEYS.FOLDERS]: [],
          [STORAGE_KEYS.HISTORY]: [],
          [STORAGE_KEYS.INITIALIZED]: true,
        }, () => {
          console.log('[PromptMaster] Data written to storage');
          res();
        });
      });
      resolve();
    });
  });
}

// 监听来自 side panel 或 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[PromptMaster] Message received:', message.type);

  if (message.type === 'GET_PROMPTS') {
    chrome.storage.local.get(STORAGE_KEYS.PROMPTS, (result) => {
      sendResponse({ success: true, data: result[STORAGE_KEYS.PROMPTS] || [] });
    });
    return true;
  }

  if (message.type === 'GET_FOLDERS') {
    chrome.storage.local.get(STORAGE_KEYS.FOLDERS, (result) => {
      sendResponse({ success: true, data: result[STORAGE_KEYS.FOLDERS] || [] });
    });
    return true;
  }

  if (message.type === 'UPDATE_PROMPT') {
    const { id, updates } = message.payload;
    chrome.storage.local.get(STORAGE_KEYS.PROMPTS, (result) => {
      const prompts: any[] = (result[STORAGE_KEYS.PROMPTS] as any[]) || [];
      const index = prompts.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        prompts[index] = { ...prompts[index], ...updates };
        chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: prompts }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false });
      }
    });
    return true;
  }

  if (message.type === 'FILL_TEXTAREA') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'FILL_TEXTAREA',
          payload: message.payload,
        }).then(sendResponse).catch(() => {
          sendResponse({ success: false, error: 'Content script not available' });
        });
      } else {
        sendResponse({ success: false, error: 'No active tab' });
      }
    });
    return true;
  }

  if (message.type === 'ADD_FOLDER') {
    console.log('[PromptMaster] ADD_FOLDER received:', message.payload);
    const { name, parentId, icon, order } = message.payload;
    chrome.storage.local.get(STORAGE_KEYS.FOLDERS, (result) => {
      const folders: any[] = (result[STORAGE_KEYS.FOLDERS] as any[]) || [];
      console.log('[PromptMaster] Current folders:', folders);
      const newFolder = {
        id: generateId(),
        name,
        parentId: parentId || null,
        icon: icon || '📁',
        order: order || folders.length,
      };
      folders.push(newFolder);
      console.log('[PromptMaster] Folders after push:', folders);
      chrome.storage.local.set({ [STORAGE_KEYS.FOLDERS]: folders }, () => {
        console.log('[PromptMaster] Folders saved, verifying...');
        // Verify by reading back
        chrome.storage.local.get(STORAGE_KEYS.FOLDERS, (verifyResult) => {
          console.log('[PromptMaster] Verified folders:', verifyResult);
          sendResponse({ success: true, data: newFolder });
        });
      });
    });
    return true;
  }

  if (message.type === 'ADD_PROMPT') {
    const { title, content, tags, folderId } = message.payload;
    chrome.storage.local.get(STORAGE_KEYS.PROMPTS, (result) => {
      const prompts: any[] = (result[STORAGE_KEYS.PROMPTS] as any[]) || [];
      const newPrompt = {
        id: generateId(),
        title,
        content: content || '',
        folderId: folderId || null,
        tags: tags || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastUsedAt: null,
        useCount: 0,
        isFavorite: false,
      };
      prompts.push(newPrompt);
      chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: prompts }, () => {
        sendResponse({ success: true, data: newPrompt });
      });
    });
    return true;
  }

  if (message.type === 'DELETE_PROMPT') {
    const { id } = message.payload;
    chrome.storage.local.get(STORAGE_KEYS.PROMPTS, (result) => {
      const prompts: any[] = (result[STORAGE_KEYS.PROMPTS] as any[]) || [];
      const filtered = prompts.filter((p: any) => p.id !== id);
      chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: filtered }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (message.type === 'UPDATE_FOLDER') {
    const { id, updates } = message.payload;
    chrome.storage.local.get(STORAGE_KEYS.FOLDERS, (result) => {
      const folders: any[] = (result[STORAGE_KEYS.FOLDERS] as any[]) || [];
      const index = folders.findIndex((f: any) => f.id === id);
      if (index !== -1) {
        folders[index] = { ...folders[index], ...updates };
        chrome.storage.local.set({ [STORAGE_KEYS.FOLDERS]: folders }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false });
      }
    });
    return true;
  }

  if (message.type === 'DELETE_FOLDER') {
    const { id } = message.payload;
    chrome.storage.local.get(STORAGE_KEYS.FOLDERS, (result) => {
      const folders: any[] = (result[STORAGE_KEYS.FOLDERS] as any[]) || [];
      const filtered = folders.filter((f: any) => f.id !== id);
      chrome.storage.local.set({ [STORAGE_KEYS.FOLDERS]: filtered }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (message.type === 'UPDATE_PROMPTS_BATCH') {
    const { payload } = message.payload; // payload 是数组
    chrome.storage.local.get(STORAGE_KEYS.PROMPTS, (result) => {
      const prompts: any[] = (result[STORAGE_KEYS.PROMPTS] as any[]) || [];
      payload.forEach(({ id, updates }: { id: string; updates: any }) => {
        const index = prompts.findIndex((p: any) => p.id === id);
        if (index !== -1) {
          prompts[index] = { ...prompts[index], ...updates };
        }
      });
      chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: prompts }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (message.type === 'ADD_HISTORY') {
    const { promptId, site, variables, content } = message.payload;
    chrome.storage.local.get(STORAGE_KEYS.HISTORY, (result) => {
      const history: any[] = (result[STORAGE_KEYS.HISTORY] as any[]) || [];
      const newEntry = {
        id: generateId(),
        promptId,
        usedAt: Date.now(),
        site: site || '',
        variables: variables || {},
        content: content || '',
      };
      history.unshift(newEntry); // 最新在前
      // 保留最近100条
      if (history.length > 100) {
        history.splice(100);
      }
      chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: history }, () => {
        sendResponse({ success: true, data: newEntry });
      });
    });
    return true;
  }

  sendResponse({ success: false, error: 'Unknown message type' });
});

console.log('[PromptMaster] Service Worker ready');