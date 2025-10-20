const POSTCARD_REGEX = /postcards\/([A-Za-z]{2})-(\d+)/i;

async function sortPostcrossingTabs() {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const matching = [];
    for (const t of tabs) {
      if (!t.url) continue;
      const m = t.url.match(POSTCARD_REGEX);
      if (m) {
        const country = m[1].toUpperCase();
        const num = parseInt(m[2], 10);
        matching.push({ tab: t, country, num });
      }
    }

    if (matching.length <= 1) return;

    matching.sort((a, b) => a.num - b.num);
    const firstIndex = Math.min(...matching.map(m => m.tab.index));

    for (let i = 0; i < matching.length; i++) {
      const targetPos = firstIndex + i;
      try {
        await browser.tabs.move(matching[i].tab.id, { index: targetPos });
      } catch (err) {
        console.error('Failed to move tab', matching[i].tab.id, err);
      }
    }
  } catch (err) {
    console.error('Error sorting PostCrossing tabs', err);
  }
}

browser.browserAction.onClicked.addListener(() => {
  sortPostcrossingTabs();
});
