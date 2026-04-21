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

  sendResponse({ success: false, error: 'Unknown message type' });
});

console.log('[PromptMaster] Service Worker ready');