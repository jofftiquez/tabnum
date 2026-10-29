const TAGS = { pull: 'PR', merge_requests: 'MR', issues: 'IS', work_items: 'IS' };
const OURS = /^(PR|MR|IS) \d+(?: · |$)/;
// GitHub's "· Pull Request #N" and GitLab's "(!N)" / "(#N)" repeat the number we just prefixed
const REDUNDANT = / · (Pull Request|Issue) #\d+| \([!#]\d+\)/;
// GitHub Primer colours: purple = shipped, red = abandoned, grey = draft / not planned
const COLORS = { open: '#1f883d', draft: '#8c959f', merged: '#8250df', done: '#8250df', closed: '#d1242f', notplanned: '#8c959f' };

// GitHub: /owner/repo/pull/N, /owner/repo/issues/N
// GitLab: /group/.../-/merge_requests/N, /-/issues/N, /-/work_items/N
function prefix(pathname) {
  const m = pathname.match(/^\/[^/]+\/[^/]+\/(pull|issues)\/(\d+)/) ||
            pathname.match(/\/-\/(merge_requests|issues|work_items)\/(\d+)/);
  return m ? `${TAGS[m[1]]} ${m[2]}` : null;
}

// status: GitHub's StateLabel data-status (pullMerged, draft, issueClosedNotPlanned, ...) or GitLab's badge text.
// GitLab has no draft badge, only a "Draft:" title prefix.
function state(tag, status, title) {
  const s = status.toLowerCase();
  if (s.includes('merged')) return 'merged';
  if (/notplanned|duplicate/.test(s)) return 'notplanned';
  if (s.includes('closed')) return tag === 'IS' ? 'done' : 'closed';
  if (s.includes('draft') || /^(draft:|\[draft\])/i.test(title)) return 'draft';
  if (s.includes('open')) return 'open';
  return '';
}

function status() {
  const gh = document.querySelector('[data-component="StateLabel"]');
  if (gh) return gh.dataset.status || gh.textContent;
  const gl = [...document.querySelectorAll('.gl-badge')].find(e => /^(Open|Closed|Merged)$/.test(e.textContent.trim()));
  return gl ? gl.textContent.trim() : '';
}

function paint(img, color) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  if (img.naturalWidth) g.drawImage(img, 0, 0, 32, 32);
  g.globalCompositeOperation = 'destination-out'; // cut a gap so the dot reads on light and dark tab bars
  g.beginPath(); g.arc(23, 23, 11, 0, 2 * Math.PI); g.fill();
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = color;
  g.beginPath(); g.arc(23, 23, 9, 0, 2 * Math.PI); g.fill();
  return c.toDataURL();
}

let icon, drawn = '';
// The site's own icon links get rel="tabnum-hidden" so ours is the only icon; they stay in place because
// GitHub/GitLab swap their href (CI status etc.), which we pick up and redraw from.
function badge(color) {
  icon ||= Object.assign(document.createElement('link'), { id: 'tabnum', rel: 'icon' });
  if (!color) {
    for (const l of document.querySelectorAll('link[data-tabnum-rel]')) l.rel = l.dataset.tabnumRel;
    icon.remove();
    drawn = '';
    return;
  }
  for (const l of document.querySelectorAll('link[rel~="icon"]:not(#tabnum)')) {
    l.dataset.tabnumRel = l.rel;
    l.rel = 'tabnum-hidden';
  }
  const links = [...document.querySelectorAll('link[data-tabnum-rel]')];
  const src = (links.find(l => l.dataset.tabnumRel === 'icon') || links[0])?.href || '/favicon.ico';
  const key = src + color;
  if (drawn === key && icon.isConnected) return;
  drawn = key;
  if (!icon.isConnected) { icon.href = src; document.head.append(icon); }
  const img = new Image();
  img.crossOrigin = 'anonymous'; // without CORS the load fails and we draw the dot alone
  img.onload = img.onerror = () => { if (drawn === key) icon.href = paint(img, color); };
  img.src = src;
}

function retitle() {
  const base = document.title.replace(OURS, '');
  const p = prefix(location.pathname);
  // empty base: no trailing " · ", the browser trims title whitespace and we'd stop recognising our prefix
  const want = p ? [p, base.replace(REDUNDANT, '')].filter(Boolean).join(' · ') : base;
  if (want !== document.title) document.title = want; // guard keeps the observer from looping
  badge(p && COLORS[state(p.slice(0, 2), status(), base)]);
}

if (typeof module !== 'undefined') {
  module.exports = { prefix, state, OURS };
} else {
  retitle();
  // both sites are SPAs that swap the title without a reload; the status badge renders/changes after load
  new MutationObserver(retitle).observe(document.documentElement,
    { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['href', 'data-status'] });
}
