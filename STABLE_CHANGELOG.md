<h3>Version 10.142.47 <span class="date">18/11/2025</span></h3>
<ul>
  <li>Update to Chromium 142.0.7444.176</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.142.47.2)

---

<h3>Version 10.142.43 <span class="date">10/11/2025</span></h3>
<ul>
  <li>Fix a crash that could happen on startup depending on current config</li>
  <li>Fix the webdock resizer only being available in the top part of the window</li>
  <li>Network stability fix</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.142.43.2)

---

<h3>Version 10.142.42 <span class="date">6/11/2025</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>Add support for in-page translate with Brainbox using both local and cloud models</li>
  <li>Added automatic picture-in-picture mode that opens playing videos in a separate window when you navigate away from the tab</li>
  <li>Make shift+clicking the Webdock mode also collapse/expand dividers in the explorer view</li>
  <li>When changing app or tab, ensure that it's always scrolled into view in the Webdock</li>
  <li>Add support for dragging & dropping spaces in the drag & drop spaces editor</li>
  <li>Added "Now Playing" helper to quickly return to tabs with active audio or video</li>
  <li>Added display options to the switcher (Ctrl+Tab) to toggle between showing apps & tabs or apps only</li>
  <li>Updated group sleep/wake menu with more granular controls for sleeping/waking apps or tabs</li>
  <li>Improved group sleep/wake menu logic to better handle toggling between current states of apps and tabs</li>
  <li>
    Add the "Webview layout composer" flag. This uses a different layout engine for webviews and tabs, but comes
    with a number of bug fixes and advantages. This flag is disabled by default and can be turned on under Settings > Advanced > Advanced flags.
    <ul>
      <li>Add support for space background gradients in secondary windows</li>
      <li>Fix issues with file dragging files on macOS (first reported with Gmail & Google Chat)</li>
      <li>Fix issues with in-page drag on some HubSpot pages</li>
      <li>Rendering performance improvements</li>
      <li>Fixes some graphical glitches</li>
    </ul>
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 142.0.7444.135</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix an issue with dragging files from the OS to file upload areas not working</li>
  <li>Speculative fix for the menu bar icon on macOS sometimes vanishing when theres more than one profile</li>
  <li>Fix the cycle docked sizes keyboard shortcut not working</li>
  <li>Fix some cookie/space consistency issues when duplicating groups in the spaces Webdock</li>
  <li>Fixed tabs to properly undock when moved away from the main Wavebox window</li>
  <li>Ensure tabs are saved for session restore when shutting down a profile</li>
  <li>UI fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.142.42.2)

---

<h3>Version 10.141.33 <span class="date">22/10/2025</span></h3>

<ul>
  <li>Update to Chromium 141.0.7390.123</li>
  <li>Fix an issue that prevented passwords from being saved on some setups</li>
  <li>Update the knowledge base urls</li>
  <li>Stability fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.141.33.2)

---

<h3>Version 10.141.29 <span class="date">15/10/2025</span></h3>

<ul>
  <li>Update to Chromium 141.0.7390.108</li>
  <li>Update the styling for the split tab page</li>
  <li>Update integrations with slack enterprise speculative fix</li>
  <li>Fix keyboard shortcuts with suggested keys being overwritten on start</li>
  <li>Add a context menu option to close tabs in an app when using the unified sidebar</li>
  <li>Other stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.141.29.2)

---

<h3>Version 10.141.25 <span class="date">8/10/2025</span></h3>
<ul>
  <li>Update to Chromium 141.0.7390.66</li>
  <li>Fix an overflow issue with tooltips issue</li>
  <li>Fix the split and docked icons not always taking the window orientation into account</li>
  <li>Fix a crash when double clicking split tabs</li>
  <li>Some Apple apps send HTML to 3rd party mail clients when sharing via email. Attempt to sanitize this and strip markup</li>
  <li>Speculative fix for a crash when switching tabs</li>
  <li>Fix a crash when importing passwords from another browser</li>
  <li>Improve the feed discovery in the RSS widget</li>
  <li>Fix the RSS widget failing to fetch some feeds</li>
  <li>Fix a docked keyboard shortcut erroring</li>
  <li>Fix keyboard shortcuts not working on restart for some users</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.141.25.2)

---

<h3>Version 10.141.23 <span class="date">6/10/2025</span></h3>
<ul>
  <li>Update to Chromium 141.0.7390.55</li>
  <li>Allow the main Wavebox window to be dragged around by using un-used tabstrip and webdock space</li>
  <li>
    Added new up & down layouts for docked and splits along with left & right, giving you
    more flexibility in how you organize your workspace
  </li>
  <li>Stability fixes for the updater on macOS and Windows</li>
  <li>Build updates and improvements</li>
  <li>Add clearer explanation in the "What are spaces" popover</li>
  <li>Update links to use the new help hub</li>
  <li>Style fix on the internal settings pages</li>
  <li>Fixed reload issues that were causing DevTools to behave unexpectedly</li>
  <li>Faster build times</li>
  <li>Fix a split screen issue where splitting in the window didn't work</li>
  <li>Fix a Slack issue with generating debug logs</li>
  <li>Update the naming of docked and split positioning</li>
  <li>Speculative fix for tabs being greyed out</li>
  <li>Fix a link rule matching error, where "anywhere" rules were initially matched through the omnibox, but then dropped later on</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.141.23.2)

---

<h3>Version 10.140.38 <span class="date">24/9/2025</span></h3>

<h4>🐛 Fixes</h4>
<ul>
  <li>Update Chromium to 140.0.7339.208</li>
  <li>Crash fix when closing tab groups</li>
  <li>Updated bookmark sync (this is currently opt-in. Contact support for more information)</li>
  <li>Fix pinned tab styling</li>
  <li>Various bug fixes for soft-crashes</li>
  <li>Improve Feedly token exchange for more reliable sync</li>
  <li>Update the WhatsApp integration for the latest UI update</li>
  <li>Fix for hard crash with split screen</li>
  <li>Fix tooltips sometimes staying on screen too long and messing up other parts of the UI</li>
  <li>Fix a crash when opening the bookmarks side panel</li>
  <li>Other stability improvements</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.140.38.2)

---

<h3>Version 10.140.34 <span class="date">18/9/2025</span></h3>
<ul>
  <li>Update to Chromium 140.0.7339.186</li>
  <li>Crash fix when splitting tabs</li>
  <li>Fix an issue with tabs collapsing too small and not respecting the tab scroll settings</li>
  <li>Add keyboard shortcuts to replace docked tabs</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.140.34.2)

---

<h3>Version 10.140.30 <span class="date">17/9/2025</span></h3>
<ul>
  <li>
    New Dock & Split View replaces classic split-screen with flexible multitasking: dock
    apps across groups, split tabs side-by-side and 2+ views. Access via address bar,
    right-click menu, tooltips, or page context menus for seamless workflow enhancement.
  </li>
  <li>Update to Chromium 140.0.7339.133</li>
  <li>Improve macOS Tahoe compatibility</li>
  <li>Add sleep all in group to context menus</li>
  <li>Fix an issue where under some configurations the bookmarks bar could incorrectly show in the main Wavebox window</li>
  <li>Fix the new tab page url failing to save when http or https are omitted</li>
  <li>Add new wallpapers to dashboards</li>
  <li>Fix a focus issue, that under some configs could see a tab focused after sleeping another rather than switching to the 'sleeping' holder</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.140.30.2)

---
[More versions](https://wavebox.io/changelog/stable/)