// FinMind token 怎麼申請（不是首頁卡片；各計算機的 token 欄連到這裡）。
import { h, toolHeader, infoChip, disclaimer } from '../ui/components.js';
import { TOKEN_GUIDE } from '../data/token.js';

document.getElementById('app').append(
  toolHeader({ no: '', title: 'FinMind token 怎麼申請', oneLine: '填代號自動抓股價用的免費鑰匙' }),
  h('section', { class: 'card', id: 'token' },
    h('div', { class: 'field' }, h('h2', {}, '為什麼要 token', infoChip('finmind-token'))),
    h('p', {}, TOKEN_GUIDE.why),
    h('p', {}, TOKEN_GUIDE.limit),
    h('h3', {}, '申請步驟'),
    h('ol', {}, TOKEN_GUIDE.steps.map(s => h('li', {}, s)))),
  h('section', { class: 'card' },
    h('h2', {}, '看到錯誤怎麼辦'),
    TOKEN_GUIDE.errors.map(e => h('div', { class: 'guide-field' },
      h('p', {}, h('strong', {}, e.sign)),
      h('p', {}, e.meaning),
      h('p', { class: 'tip' }, e.todo)))),
  h('section', { class: 'card' }, h('h2', {}, '保密'), h('p', {}, TOKEN_GUIDE.privacy)),
  disclaimer('general'));
