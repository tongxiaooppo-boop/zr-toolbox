// 每頁都載入：註冊 service worker（只在 http/https 下；file:// 與 Node 測試不跑）。
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register(new URL('../sw.js', import.meta.url)).catch(() => {});
}
