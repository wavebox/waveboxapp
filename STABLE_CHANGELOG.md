<h3>Version 150.2.117 <span class="date">6/7/2026</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    New on-device grammar assistant that checks your writing as you type, with inline
    underlines, a click-to-fix popover, a status indicator, and a Check grammar
    option in the right-click menu. This is turned off by default but can be enabled
    under Settings > Language.
  </li>
  <li>
    New on-device AI in Wavebox that runs language models locally on your computer,
    for websites that request it. This brings Wavebox into spec with other browsers
    for these new capabilities.
  </li>
  <li>Connect your own AI models from Ollama, OpenAI or Anthropic to power Wavebox's web AI features</li>
  <li>
    New option on a group's menu to move all of its apps out into their own window
    as pinned tabs with their app icons, with a one-click way to bring them all back.
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 150.0.7871.47</li>
  <li>The Brainbox assistant has been rebuilt to help you with your Wavebox setup, so you can ask it things like "Move my tabs into a new group"</li>
  <li>Added search and keyboard navigation to the "Open in app or webdock group" picker, so you can filter by app or group name and choose with the arrow keys</li>
  <li>New advanced settings to reduce GPU memory usage on some setups</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed several crashes, including disabling an extension with an open side panel, applying themes, and omnibox and network-request edge cases</li>
  <li>Fixed a crash that could occur when dragging a group in the webdock</li>
  <li>Fixed crashes that could occur while profile sync was applying changes from another device</li>
  <li>Fixed detached apps collapsing back into the main window after quitting and relaunching Wavebox</li>
  <li>Fixed a range of background errors caused by closing tabs, windows and dialogs while they were still updating</li>
  <li>The delete-space dialog no longer shows an empty bordered box when nothing is using the space</li>
  <li>Fixes and UI improvements for the new grammar checker</li>
  <li>Various stability improvements, UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.117.2)

---

<h3>Version 149.2.103 <span class="date">24/6/2026</span></h3>


<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 149.0.7827.197</li>
  <li>Detached apps now stay detached after a restart</li>
  <li>More reliable syncing of tabs across devices when the network is briefly unresponsive</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a batch of background crashes affecting tab reloading, account authentication, RSS widgets, importing data, and integrations like Freshdesk</li>
  <li>Fixed a crash during password import that could occur with invalid saved logins</li>
  <li>Fixed two browser crashes involving the address bar and saved tab groups</li>
  <li>Fixed a browser crash in split screen when dragging a tab</li>
  <li>Fixed a crash when dragging text or other non-link content onto your tabs</li>
  <li>Fixed a crash on Windows when using speech recognition more than once in a session</li>
  <li>Fixed a crash that could occur when entering fullscreen on macOS</li>
  <li>Fixed a crash in the extension menu</li>
  <li>Fixed an issue that could cause excessive re-rendering across the main panel, webdock, tabs and workspaces</li>
  <li>Language settings now correctly prompt for a restart when needed</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.103.2)

---

<h3>Version 149.2.96 <span class="date">17/6/2026</span></h3>
<p></p>
<h4>🆕 New!</h4>
<ul>
  <li>Manage your preferred languages directly in settings, with add, remove and reorder, per-language translate offers, and (on Windows) a browser interface language picker</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 149.0.7827.156</li>
  <li>Per-space proxy now supports PAC file URLs alongside fixed-server addresses</li>
  <li>More reliable window restoring when a saved window or dragged tab lands off-screen or on a disconnected display</li>
  <li>More resilient cross-device tab restore when the sync connection drops</li>
  <li>Connect now remembers your last active team across restarts, so you no longer appear online in the wrong team after launch</li>
  <li>Update fixes on macOS to make app restarts and updates more reliable</li>
  <li>Web search suggestions now fail gracefully when offline or behind a captive portal</li>
  <li>Restored windows on macOS now appear in the Finder window picker</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a crash during session restore when saved tab groups got out of sync, now self-healing without losing tabs</li>
  <li>Fixed a crash in the built-in AI features that could occur when a background worker shut down</li>
  <li>Fixed a crash that could happen when dragging and dropping items in the webdock</li>
  <li>Fixed sync getting stuck retrying when an app had a corrupt or empty asset reference</li>
  <li>Fixed re-authenticating Outlook accounts wiping their sign-in tokens</li>
  <li>Setting a default search engine now works reliably instead of failing with an error</li>
  <li>Fixed picture-in-picture and fullscreen glitches when sharing video in Wavebox Connect</li>
  <li>Fixed a rare error when closing a window while its theme gradient was updating</li>
  <li>Fixed the titlebar arrow anchor in appearance settings for secondary windows</li>
  <li>Various UI polish and visual fixes</li>
  <li>Various UI polish, visual fixes and stability and performance fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.96.2)

---

<h3>Version 149.2.92 <span class="date">12/6/2026</span></h3>
<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 149.0.7827.115</li>
  <li>Update fixes on macOS to make app restarts and updates more reliable</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a Mac crash where restarting Wavebox during an update could leave it failing to load or signing you out of everything</li>
  <li>Opening a link from an app's child tab no longer creates a bogus self-targeting rule or unexpectedly prompts to save the behaviour</li>
  <li>Fixed some refresh state on the docked mini toolbar</li>
  <li>Fixed the titlebar arrow anchor in appearance settings for secondary windows</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.92.2)

---

<h3>Version 149.2.69 <span class="date">9/6/2026</span></h3>
<p>
  We're now testing language support in Wavebox! If you're interested in trying it out,
  you'll need to switch to the beta channel available at <b>https://wavebox.io/beta/</b>.
</p>
<p>
  The current set of languages are
  <ul>
    <li>English (UK)</li>
    <li>Spanish</li>
    <li>Spanish (Latin America)</li>
    <li>German</li>
    <li>Italian</li>
    <li>French</li>
    <li>Danish</li>
    <li>Dutch</li>
    <li>Portuguese (Brazil)</li>
    <li>Portuguese (Portugal)</li>
    <li>Japanese</li>
    <li>Korean</li>
    <li>Chinese (Simplified)</li>
    <li>Polish</li>
    <li>Swedish</li>
    <li>Norwegian Bokmål</li>
    <li>Finnish</li>
    <li>Czech</li>
    <li>Welsh</li>
  </ul>
</p>
<h4>🆕 New!</h4>
<ul>
  <li>Add an option to lock an app to its domain so navigations that try to leave are kept in the browser</li>
  <li>Added a relaunch prompt on macOS when your profile data can't be unlocked at startup, so you can recover from rare sign-out-everywhere issues with one click</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 149.0.7827.103</li>
  <li>Improved Outlook sign-in for people with multiple Microsoft accounts by always prompting for account selection, reducing cases where the wrong account was picked or no token was captured</li>
  <li>Dependency updates and security improvements</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Resolved three crashes carried over from the recent Chromium 149 update, including an extension permissions issue, a browser teardown crash, and a password autofill crash</li>
  <li>Fixed crashes in the app and Space pickers when opening tab and app options</li>
  <li>Fixed an issue that could sign you out of Outlook shortly after a successful sign-in, with more resilient token handling and de-duplicated refreshes</li>
  <li>Fixed Microsoft Outlook sign-in asking you to pick your account twice</li>
  <li>Fixed Wavebox Chat showing team members as away when their system was idle, so presence now reflects active online status</li>
  <li>Various polish and behind-the-scenes fixes for the macOS updater and diagnostics page</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.69.2)

---

<h3>Version 149.2.63 <span class="date">3/6/2026</span></h3>
<p><em>This version is small patchfix over 149.2.58 that addresses some crashing issues seen by some users. Here's everything else that's new...</em></p>

<p>
  We're working on bringing Wavebox to a language near you! If you'd like to help
  us test Wavebox in your language, please reach out to support!
</p>
<h4>🆕 New!</h4>
<ul>
  <li>Groundwork for translating Wavebox into other languages.</li>
  <li>Ctrl+click and middle-click on bookmarks now open them in a new tab within the same space</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 149.0.7827.54</li>
  <li>Connect has been rebuilt to run natively inside Wavebox, for faster startup and a smoother, more reliable experience across calls, notifications and messaging</li>
  <li>Improved tab grouping in the tabstrip so branches across different apps render correctly as pills, drag and drop lands where you expect, and joining tabs into a branch happens in a single smooth step</li>
  <li>Tab groups now work in the tabstrip when tabs are grouped by app</li>
  <li>Removing a tab from a tab group in the tabstrip now keeps the tab in place next to its original group instead of jumping to the start of the strip</li>
  <li>Fixed dragging a tab between two adjacent tab groups in the horizontal tabstrip so it lands in the group your cursor is closest to instead of always joining the left group</li>
  <li>Closing a backgrounded child tab now advances to the next tab like Chrome, instead of jumping back to the tab that opened it</li>
  <li>External links opened into an existing Wavebox window now properly raise and focus that window on Windows, instead of leaving Wavebox behind the other app</li>
  <li>External links that focus an existing window now preserve its fullscreen or maximized state</li>
  <li>Improved reliability when reordering tabs if one is closed mid-operation</li>
  <li>Recovers spaces affected by an earlier sync bug that could collapse multiple spaces into one — click Resync on an affected device to heal the data</li>
  <li>Upgraded the underlying Material UI library to version 9 for a more consistent and polished look across settings and dialogs</li>
  <li>Refreshed the Gmail app icon</li>
  <li>UI tweaks to the Windows installer</li>
  <li>Improved crash reporting</li>
  <li>Updated bundled dependencies</li>
  <li>Various stability and polish improvements</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a startup crash caused by a cookie setting that could leave the browser unable to launch</li>
  <li>Fixed a long-standing sync issue where on some setups, spaces could go missing or leave stale data behind when restoring or removing them</li>
  <li>More resilient sync, search and app integrations, with several crashes around Gmail, identity lookups, suggestion fetches and settings panels now handled gracefully</li>
  <li>Fullscreen windows on macOS now restore correctly on relaunch, with no leftover floating toolbar</li>
  <li>Speculative fix for glitchy fullscreen rendering on macOS</li>
  <li>Fixed a macOS issue where titlebar buttons could be positioned incorrectly</li>
  <li>Fixed an issue on Windows where crash reports were not being uploaded</li>
  <li>Fixed crash report auto-upload not being enabled on Linux and Mac</li>
  <li>Collapsing a nested tab pill no longer also collapses its parent</li>
  <li>Keyboard shortcut settings now show proper localized labels instead of raw placeholder text</li>
  <li>Fixed shadows and rounded corners on the side panel</li>
  <li>Fixes for Windows installer packaging</li>
</ul>




<p></p>
<h4>🆕 New!</h4>
<ul>

</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>UI tweaks</li>
  <li>Dependency updates and under-the-hood improvements</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Speculative fix for hard crash reported on Linux, but potentially affecting all platforms</li>
  <li>Split-view tabs now stay paired correctly when the main window reorders them</li>
  <li>Removed a stray focus outline on dialog windows</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.63.2)

---

<h3>Version 149.2.58 <span class="date">3/6/2026</span></h3>
<p>
  We're working on bringing Wavebox to a language near you! If you'd like to help
  us test Wavebox in your language, please reach out to support!
</p>
<h4>🆕 New!</h4>
<ul>
  <li>Groundwork for translating Wavebox into other languages.</li>
  <li>Ctrl+click and middle-click on bookmarks now open them in a new tab within the same space</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 149.0.7827.54</li>
  <li>Connect has been rebuilt to run natively inside Wavebox, for faster startup and a smoother, more reliable experience across calls, notifications and messaging</li>
  <li>Improved tab grouping in the tabstrip so branches across different apps render correctly as pills, drag and drop lands where you expect, and joining tabs into a branch happens in a single smooth step</li>
  <li>Tab groups now work in the tabstrip when tabs are grouped by app</li>
  <li>Removing a tab from a tab group in the tabstrip now keeps the tab in place next to its original group instead of jumping to the start of the strip</li>
  <li>Fixed dragging a tab between two adjacent tab groups in the horizontal tabstrip so it lands in the group your cursor is closest to instead of always joining the left group</li>
  <li>Closing a backgrounded child tab now advances to the next tab like Chrome, instead of jumping back to the tab that opened it</li>
  <li>External links opened into an existing Wavebox window now properly raise and focus that window on Windows, instead of leaving Wavebox behind the other app</li>
  <li>External links that focus an existing window now preserve its fullscreen or maximized state</li>
  <li>Improved reliability when reordering tabs if one is closed mid-operation</li>
  <li>Recovers spaces affected by an earlier sync bug that could collapse multiple spaces into one — click Resync on an affected device to heal the data</li>
  <li>Upgraded the underlying Material UI library to version 9 for a more consistent and polished look across settings and dialogs</li>
  <li>Refreshed the Gmail app icon</li>
  <li>UI tweaks to the Windows installer</li>
  <li>Improved crash reporting</li>
  <li>Updated bundled dependencies</li>
  <li>Various stability and polish improvements</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a startup crash caused by a cookie setting that could leave the browser unable to launch</li>
  <li>Fixed a long-standing sync issue where on some setups, spaces could go missing or leave stale data behind when restoring or removing them</li>
  <li>More resilient sync, search and app integrations, with several crashes around Gmail, identity lookups, suggestion fetches and settings panels now handled gracefully</li>
  <li>Fullscreen windows on macOS now restore correctly on relaunch, with no leftover floating toolbar</li>
  <li>Speculative fix for glitchy fullscreen rendering on macOS</li>
  <li>Fixed a macOS issue where titlebar buttons could be positioned incorrectly</li>
  <li>Fixed an issue on Windows where crash reports were not being uploaded</li>
  <li>Fixed crash report auto-upload not being enabled on Linux and Mac</li>
  <li>Collapsing a nested tab pill no longer also collapses its parent</li>
  <li>Keyboard shortcut settings now show proper localized labels instead of raw placeholder text</li>
  <li>Fixed shadows and rounded corners on the side panel</li>
  <li>Fixes for Windows installer packaging</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.58.2)

---

<h3>Version 148.2.44 <span class="date">28/5/2026</span></h3>
<p>
  This patch-release over 148.2.43 contains some fixes for crash reporting. Here's everything else that's new!
</p>
<h4>🆕 New!</h4>
<ul>
  <li>Groundwork for translating Wavebox into other languages</li>
  <li>Recovers spaces affected by an earlier sync bug that could collapse multiple spaces into one — click Resync on an affected device to heal the data</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 148.0.7778.217</li>
  <li>Improved tab grouping in the tabstrip so branches across different apps render correctly as pills, drag and drop lands where you expect, and joining tabs into a branch happens in a single smooth step</li>
  <li>Tab groups now work in the tabstrip when tabs are grouped by app</li>
  <li>External links opened into an existing Wavebox window now properly raise and focus that window on Windows, instead of leaving Wavebox behind the other app</li>
  <li>Improved reliability when reordering tabs if one is closed mid-operation</li>
  <li>Improved crash reporting</li>
  <li>Refreshed the Gmail app icon</li>
  <li>Various stability and polish improvements</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a startup crash caused by a cookie setting that could leave the browser unable to launch</li>
  <li>Fixed a long-standing sync issue where on some setups, spaces could go missing or leave stale data behind when restoring or removing them</li>
  <li>More resilient sync, search and app integrations, with several crashes around Gmail, identity lookups, suggestion fetches and settings panels now handled gracefully</li>
  <li>Fullscreen windows on macOS now restore correctly on relaunch, with no leftover floating toolbar</li>
  <li>Speculative fix for glitchy fullscreen rendering on macOS</li>
  <li>Fixed dragging a tab between two adjacent tab groups in the horizontal tabstrip so it lands in the group your cursor is closest to instead of always joining the left group</li>
  <li>Removing a tab from a tab group in the tabstrip now keeps the tab in place next to its original group instead of jumping to the start of the strip</li>
  <li>Collapsing a nested tab pill no longer also collapses its parent</li>
  <li>Fixed a macOS issue where titlebar buttons could be positioned incorrectly</li>
  <li>Keyboard shortcut settings now show proper localized labels instead of raw placeholder text</li>
  <li>Fixed shadows and rounded corners on the side panel</li>
  <li>Fixes for Windows installer packaging</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.2.44.2)

---

<h3>Version 148.2.43 <span class="date">28/5/2026</span></h3>
<p></p>
<h4>🆕 New!</h4>
<ul>
  <li>Groundwork for translating Wavebox into other languages</li>
  <li>Recovers spaces affected by an earlier sync bug that could collapse multiple spaces into one — click Resync on an affected device to heal the data</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 148.0.7778.217</li>
  <li>Improved tab grouping in the tabstrip so branches across different apps render correctly as pills, drag and drop lands where you expect, and joining tabs into a branch happens in a single smooth step</li>
  <li>Tab groups now work in the tabstrip when tabs are grouped by app</li>
  <li>External links opened into an existing Wavebox window now properly raise and focus that window on Windows, instead of leaving Wavebox behind the other app</li>
  <li>Improved reliability when reordering tabs if one is closed mid-operation</li>
  <li>Improved crash reporting</li>
  <li>Refreshed the Gmail app icon</li>
  <li>Various stability and polish improvements</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a startup crash caused by a cookie setting that could leave the browser unable to launch</li>
  <li>Fixed a long-standing sync issue where on some setups, spaces could go missing or leave stale data behind when restoring or removing them</li>
  <li>More resilient sync, search and app integrations, with several crashes around Gmail, identity lookups, suggestion fetches and settings panels now handled gracefully</li>
  <li>Fullscreen windows on macOS now restore correctly on relaunch, with no leftover floating toolbar</li>
  <li>Speculative fix for glitchy fullscreen rendering on macOS</li>
  <li>Fixed dragging a tab between two adjacent tab groups in the horizontal tabstrip so it lands in the group your cursor is closest to instead of always joining the left group</li>
  <li>Removing a tab from a tab group in the tabstrip now keeps the tab in place next to its original group instead of jumping to the start of the strip</li>
  <li>Collapsing a nested tab pill no longer also collapses its parent</li>
  <li>Fixed a macOS issue where titlebar buttons could be positioned incorrectly</li>
  <li>Keyboard shortcut settings now show proper localized labels instead of raw placeholder text</li>
  <li>Fixed shadows and rounded corners on the side panel</li>
  <li>Fixes for Windows installer packaging</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.2.43.2)

---

<h3>Version 148.2.23 <span class="date">20/5/2026</span></h3>
<p></p>
<h4>🆕 New!</h4>
<ul>
  <li>Add support for tab groups to the Wavebox tabstrip in the main window, matching the experience of secondary windows</li>
  <li>Tabs filed inside a tab group are now preserved across restarts, just like pinned tabs</li>
  <li>New 'Move to new group' option in the tab right-click menu, with a clearer label when moving multiple tabs</li>
  <li>Added a Webdock layout option to the Webdock context menu for quicker access to the layout switcher</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 148.0.7778.179</li>
  <li>Tab right-click menu is now fully multi-select aware — close, reload, mute, pin, sleep, move and group actions all apply to every selected tab</li>
  <li>Faster multi-tab sleep, wake and move operations</li>
  <li>Startup restore and start-up URLs are now combined into a single, clearer settings panel with an empty-state hint</li>
  <li>Diagnostics now report data integrity issues for your apps and offer to include store data when uploading a report</li>
  <li>Improved reliability when reordering tabs if one is closed mid-operation</li>
  <li>Improved error reporting for tab messaging and chromium API failures</li>
  <li>Improved error reporting when a tab is destroyed mid-action for easier diagnosis</li>
  <li>Improved internal reliability of app and space data handling to prevent future issues</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a sync issue that could cause synced data to be written to the wrong location</li>
  <li>Restored profile sync reliability by clearing stale cluster IDs when the server reports none, preventing sync errors</li>
  <li>Fixed users with a configured sync key being prompted for the team master password on every relaunch</li>
  <li>Fixed a rare race during cloud snapshot uploads that could keep scheduling new uploads after being stopped</li>
  <li>Fixed link open rules and space routing so rules targeting the default space open correctly again</li>
  <li>Fixed several default-space edge cases when switching, duplicating, or routing tabs between spaces</li>
  <li>Fixed links opened from an app sometimes inheriting the wrong space</li>
  <li>Notification action buttons (e.g. Snooze in Google Calendar) no longer steal focus by activating the underlying app</li>
  <li>Enter no longer prematurely commits unfinished input while composing characters with an IME (Japanese, Chinese, Korean)</li>
  <li>Fixed an issue where tabs could be stranded in a separate window on startup when start-up URLs mode had no URLs configured</li>
  <li>Fixed orphaned tab cleanup on startup so removed tabs no longer linger in memory</li>
  <li>Fixed an issue on startup where some URLs were incorrectly treated as external links</li>
  <li>Fixed widget deletion so workspaces no longer keep stale references to removed widgets</li>
  <li>More reliable opening of dialog windows in cases where a stale focus cache could prevent them from appearing</li>
  <li>Fixed the Brainbox side panel refusing to close after tool usage</li>
  <li>Fixed some Smartnote launch actions failing</li>
  <li>Fixed exact-match lookups for id: and source: searches in the window opener manager</li>
  <li>Removing a tab from a tab group in the tabstrip now keeps the tab in place next to its original group instead of jumping to the start of the strip</li>
  <li>Fixed dragging a tab between two adjacent tab groups in the horizontal tabstrip so it lands in the group your cursor is closest to instead of always joining the left group</li>
  <li>Speculative fix for glitchy fullscreen rendering on macOS</li>
  <li>Resolved an onboarding error when fetching containers and tidied tile alignment plus broken search engine favicons</li>
  <li>Various stability and reliability fixes across apps, spaces and the webdock</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.2.23.2)

---
[More versions](https://wavebox.io/changelog/stable/)