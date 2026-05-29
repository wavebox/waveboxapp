<h3>Version 149.2.45 beta <span class="date">29/5/2026</span></h3>
<ul>
  <li>Fixed crash report auto-upload not being enabled on Linux and Mac</li>
  <li>Ctrl+click and middle-click on bookmarks now open them in a new tab within the same space</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.45.3)

---

<h3>Version 149.2.44 beta <span class="date">28/5/2026</span></h3>
<ul>
  <li>Recovers spaces affected by an earlier sync bug that could collapse multiple spaces into one — click Resync on an affected device to heal the data</li>
  <li>Fixes for Windows installer packaging</li>
  <li>Fixed an issue on Windows where crash reports were not being uploaded</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.44.3)

---

<h3>Version 149.2.43 beta <span class="date">28/5/2026</span></h3>
<ul>
  <li>Recovers spaces affected by an earlier sync bug that could collapse multiple spaces into one — click Resync on an affected device to heal the data</li>
  <li>Fixes for Windows installer packaging</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.43.3)

---

<h3>Version 149.2.38 beta <span class="date">27/5/2026</span></h3>
<ul>
  <li>Fixed a long-standing sync issue where on some setups, spaces could go missing or leave stale data behind when restoring or removing them</li>
  <li>Improved crash reporting</li>
  <li>Keyboard shortcut settings now show proper localized labels instead of raw placeholder text</li>
  <li>Fixed shadows and rounded corners on the side panel</li>
  <li>Refreshed the Gmail app icon</li>
  <li>Various stability and polish improvements</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.38.3)

---

<h3>Version 149.2.35 beta <span class="date">24/5/2026</span></h3>
<ul>
  <li>Fixed a startup crash caused by a cookie setting that could leave the browser unable to launch</li>
  <li>Improved tab grouping in the tabstrip so branches across different apps render correctly as pills, drag and drop lands where you expect, and joining tabs into a branch happens in a single smooth step</li>
  <li>External links opened into an existing Wavebox window now properly raise and focus that window on Windows, instead of leaving Wavebox behind the other app</li>
  <li>Collapsing a nested tab pill no longer also collapses its parent</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.35.3)

---

<h3>Version 149.2.34 beta <span class="date">22/5/2026</span></h3>
<ul>
  <li>Update to Chromium 149.0.7827.22</li>
  <li>Groundwork for translating Wavebox into other languages</li>
  <li>Tab groups now work in the tabstrip when tabs are grouped by app</li>
  <li>Fullscreen windows on macOS now restore correctly on relaunch, with no leftover floating toolbar</li>
  <li>More resilient sync, search and app integrations, with several crashes around Gmail, identity lookups, suggestion fetches and settings panels now handled gracefully</li>
  <li>Removing a tab from a tab group in the tabstrip now keeps the tab in place next to its original group instead of jumping to the start of the strip</li>
  <li>Fixed dragging a tab between two adjacent tab groups in the horizontal tabstrip so it lands in the group your cursor is closest to instead of always joining the left group</li>
  <li>Improved reliability when reordering tabs if one is closed mid-operation</li>
  <li>Speculative fix for glitchy fullscreen rendering on macOS</li>
  <li>Fixed a macOS issue where titlebar buttons could be positioned incorrectly</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.34.3)

---

<h3>Version 148.2.23 beta <span class="date">20/5/2026</span></h3>
<ul>
  <li>Update to Chromium 148.0.7778.179</li>
  <li>Speculative fix for glitchy fullscreen rendering on macOS</li>
  <li>Fixed dragging a tab between two adjacent tab groups in the horizontal tabstrip so it lands in the group your cursor is closest to instead of always joining the left group</li>
  <li>Removing a tab from a tab group in the tabstrip now keeps the tab in place next to its original group instead of jumping to the start of the strip</li>
  <li>Improved reliability when reordering tabs if one is closed mid-operation</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.2.23.3)

---

<h3>Version 148.2.16 beta <span class="date">15/5/2026</span></h3>
<ul>
  <li>Add support for tab groups to the Wavebox tabstrip in the main window, matching the experience of secondary windows</li>
  <li>Tab right-click menu is now fully multi-select aware — close, reload, mute, pin, sleep, move and group actions all apply to every selected tab</li>
  <li>Tabs filed inside a tab group are now preserved across restarts, just like pinned tabs</li>
  <li>Faster multi-tab sleep, wake and move operations</li>
  <li>Added a Webdock layout option to the Webdock context menu for quicker access to the layout switcher</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.2.16.3)

---

<h3>Version 148.2.14 beta <span class="date">13/5/2026</span></h3>
<ul>
  <li>Update to Chromium 148.0.7778.168</li>
  <li>All new more intelligent Brainbox assistant</li>
  <li>Enter no longer prematurely commits unfinished input while composing characters with an IME (Japanese, Chinese, Korean)</li>
  <li>Fixed users with a configured LiveSync key being prompted for the team master password on every relaunch</li>
  <li>Fixed the Brainbox side panel refusing to close after tool usage</li>
  <li>Fixed some Smartnote launch actions failing</li>
  <li>Update dependencies</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.2.14.3)

---

<h3>Version 148.2.9 beta <span class="date">8/5/2026</span></h3>
<ul>
  <li>Restored profile sync reliability by clearing stale cluster IDs when the server reports none, preventing sync errors</li>
  <li>Fixed traffic control and partition routing so rules targeting the default partition open correctly again</li>
  <li>Fixed several default-space edge cases when switching, duplicating, or routing tabs between spaces</li>
  <li>Fixed Clear browsing data being skipped for the default space in privacy settings and dialogs</li>
  <li>Fixed links opened from an app sometimes inheriting the wrong space</li>
  <li>Fixed exact-match lookups for id: and source: searches in the window opener manager</li>
  <li>Resolved an onboarding error when fetching containers and tidied tile alignment plus broken search engine favicons</li>
  <li>Improved internal reliability of app and space data handling to prevent future issues</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.2.9.3)

---
[More versions](https://wavebox.io/changelog/beta/)