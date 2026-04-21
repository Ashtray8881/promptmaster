import { SUPPORTED_SITES, replaceVariables } from '../shared/types';

// 获取当前站点的检测配置
function getSiteConfig(): typeof SUPPORTED_SITES[0] | null {
  const hostname = window.location.hostname;
  console.log('[PromptMaster] hostname:', hostname);
  return SUPPORTED_SITES.find(site => hostname.includes(site.urlPattern)) || null;
}

// 查找输入框
function findTextarea(): HTMLTextAreaElement | HTMLInputElement | null {
  const site = getSiteConfig();
  if (!site) {
    console.log('[PromptMaster] No site config for current page');
    return null;
  }

  const textarea = document.querySelector(site.textareaSelector) as HTMLTextAreaElement | HTMLInputElement;
  console.log('[PromptMaster] Found textarea:', textarea ? 'yes' : 'no', site.textareaSelector);
  return textarea;
}

// 填充文本到输入框
function fillTextarea(text: string): boolean {
  const textarea = findTextarea();
  if (!textarea) return false;

  try {
    // 清空现有内容
    textarea.focus();
    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // 设置新内容
    textarea.value = text;

    // 触发事件以确保 React 等框架能响应
    const event = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text,
    });
    textarea.dispatchEvent(event);

    console.log('[PromptMaster] Filled textarea with:', text.substring(0, 50));
    return true;
  } catch (e) {
    console.error('[PromptMaster] Fill error:', e);
    return false;
  }
}

// 监听来自 service worker 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[PromptMaster] Message received:', message.type);

  if (message.type === 'FILL_TEXTAREA') {
    const site = getSiteConfig();
    if (!site) {
      console.log('[PromptMaster] Unsupported site');
      sendResponse({ success: false, error: 'Unsupported site' });
      return;
    }

    const content = message.payload?.content || '';
    console.log('[PromptMaster] Filling with content:', content.substring(0, 50));

    const success = fillTextarea(content);
    console.log('[PromptMaster] Fill result:', success);
    sendResponse({ success });
  }

  if (message.type === 'GET_SITE_INFO') {
    const site = getSiteConfig();
    sendResponse({
      success: true,
      data: {
        supported: !!site,
        siteName: site?.name || null,
        hasTextarea: !!findTextarea(),
      },
    });
  }
});