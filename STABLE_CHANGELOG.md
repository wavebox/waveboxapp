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

<h3>Version 148.2.4 <span class="date">6/5/2026</span></h3>
<p>
  Notice something different about the numbers? We're
  dropping the '10' prefix from our versioning.
</p>
<p>
  Previously, today's update would have been something like <i>10.148.4</i>. For a
  bunch of boring technical reasons, we're switching to a
  <i>[chromium major].version.version</i> format, which makes
  this release <i>148.2.4</i>. This new setup actually allows us
  to ship Chromium updates to our beta channel with less friction!
</p>
<p>
  So, it might look like we just skipped ahead 137 versions overnight.
  If you're impressed by that, then yes, we are coding time-travelers 🛸.
  If not, it's just a naming tweak to keep things running smoothly.
</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    Brainbox gets a major upgrade with a completely redesigned experience that makes AI assistance
    feel more natural and powerful than ever.
    <ul>
      <li>
        Share context effortlessly - drag and drop images, upload attachments, or capture screenshots
        directly into your conversation. Brainbox can now see what you see.
      </li>
      <li>
        Reference your open tabs instantly by typing @tab followed by the name, or use the handy
        menu to attach tab content to your chat. It's the fastest way to get AI help with what
        you're working on.
      </li>
      <li>
        Discover the power of Skills - specialized AI commands that supercharge your workflow.
        Trigger them your way: hit a keyboard shortcut, right-click for the context menu, or
        simply type /skill in the chat.
      </li>
      <li>
        Find past conversations in a flash with the new chat search, and let automatic chat naming
        keep everything organized without lifting a finger.
      </li>
    </ul>
  </li>
  <li>Added account sign-in recovery option to the sync join password dialog</li>
  <li>Added a flag to restore colored fill backgrounds on group icons</li>
  <li>Added an 'Add group' option to the webdock divider context menu</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 148.0.7778.96</li>
  <li>~2x faster cross-process messaging</li>
  <li>Updated the Outlook integration to map additional url configurations</li>
  <li>Improved the Slack notification emoji parsing and rendering now supports extended icon codes and skin tone variants</li>
  <li>AppImage builds now run on newer Linux distributions such as Fedora 44 that no longer ship libfuse2</li>
  <li>Improved resilience of internal messaging so transient data-copy failures no longer break communication between windows</li>
  <li>Hardened notification sound playback to avoid errors when no sound is configured</li>
  <li>Performance fixes for integrated apps</li>
  <li>Update dependencies</li>
  <li>Various stability and reliability improvements from internal fuzzing</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a Windows update issue that could leave a corrupt database after restart</li>
  <li>Fixed a crash on macOS when entering or exiting fullscreen mode</li>
  <li>Fixed a crash that could occur when bulk-moving two or more tabs from the same group</li>
  <li>Fixed a connection leak in Slack that could exhaust resources during reconnects on unstable networks</li>
  <li>Stability fixes for the Slack integration</li>
  <li>Fixes for crash uploads and Brainbox backups</li>
  <li>PWAs are now correctly restored when importing from a backup</li>
  <li>Fixed extension restore during snapshot import now correctly handling locally installed extensions</li>
  <li>Customized spaces are now preserved when their last group, app or tab is removed</li>
  <li>Replaced Group &amp; App icons are now cleaned up properly instead of accumulating in local storage</li>
  <li>Fixed split tabs not updating their title, favicon, URL, or audio indicator in real time</li>
  <li>Fixed tabs in the tab strip failing to shrink correctly in scroll modes</li>
  <li>Fixed trackpad scrolling across the tab strip and restored overflow indicators</li>
  <li>Fixed custom notification sound uploads silently failing to appear in the sound list</li>
  <li>Fixed a bug where setting Wavebox as the default mail handler always showed an error toast even when registration succeeded</li>
  <li>Fixed the correct app now being selected when closing a tab, respecting the last-active app</li>
  <li>Moving apps or groups to the end of a list now behaves consistently</li>
  <li>Fixed dragging a tab branch between groups sometimes leaving stale references</li>
  <li>Fixed an issues that prevented spacial-navigator search fallback from finding the active tab</li>
  <li>Fix the webdock hiding behind the signed out panel in some configurations</li>
  <li>Fixed an issue on macOS where fullscreen mode could show a black bar when the toolbar is hidden</li>
  <li>Fixed the scroll shadow not appearing at the end of the tab strip</li>
  <li>Brainbox updates and fixes</li>
  <li>Various UI polish and visual fixes</li>
  <li>Fixed several small UI issues</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.2.4.2)

---

<h3>Version 10.147.47 <span class="date">16/4/2026</span></h3>
<ul>
  <li>Update to Chromium 147.0.7727.102</li>
  <li>Update dependencies</li>
  <li>UI fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.147.47.2)

---

<h3>Version 10.147.44 <span class="date">8/4/2026</span></h3>

<ul>
  <li>UI refresh</li>
  <li>Update to Chromium 147.0.7727.56</li>
  <li>Add an option to disable tab tooltips</li>
  <li>Add new springtime wallpapers to the wallpaper gallery</li>
  <li>Add an option to disable search customization</li>
  <li>Add right-click > create link rule in all tabs</li>
  <li>Add a capture tool to the link opener to help creating new rules</li>
  <li>Add options to customize the height of the title bar in the main Wavebox window</li>
  <li>Less intrusive update notifications</li>
  <li>Stability fixes</li>
  <li>Speculative fix for crash on launch under certain configurations</li>
  <li>Fix a crash on launch that could affect certain configs</li>
  <li>Fixed pinned tabs not showing their favicon</li>
  <li>Fix tab cycling when all group tabs are docked</li>
  <li>Fix the docked alert state not showing on apps</li>
  <li>Fix an issue where some windows could infinitely resize</li>
  <li>Fixes to make tab groups play nicer with Wavebox groups</li>
  <li>Speculative fix for macOS where you could see white flashing</li>
  <li>Fix a crash when the vertical tabs flag is enabled</li>
  <li>Fix extensions failed to show inactive for the current space</li>
  <li>UI fixes</li>
  <li>Update dependencies</li>
  <li>Crash fix for certain locales</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.147.44.2)

---

<h3>Version 10.147.43 <span class="date">8/4/2026</span></h3>
<ul>
  <li>UI refresh</li>
  <li>Update to Chromium 147.0.7727.56</li>
  <li>Add an option to disable tab tooltips</li>
  <li>Add new springtime wallpapers to the wallpaper gallery</li>
  <li>Add an option to disable search customization</li>
  <li>Add right-click > create link rule in all tabs</li>
  <li>Add a capture tool to the link opener to help creating new rules</li>
  <li>Add options to customize the height of the title bar in the main Wavebox window</li>
  <li>Less intrusive update notifications</li>
  <li>Stability fixes</li>
  <li>Speculative fix for crash on launch under certain configurations</li>
  <li>Fix a crash on launch that could affect certain configs</li>
  <li>Fixed pinned tabs not showing their favicon</li>
  <li>Fix tab cycling when all group tabs are docked</li>
  <li>Fix the docked alert state not showing on apps</li>
  <li>Fix an issue where some windows could infinitely resize</li>
  <li>Fixes to make tab groups play nicer with Wavebox groups</li>
  <li>Speculative fix for macOS where you could see white flashing</li>
  <li>Fix a crash when the vertical tabs flag is enabled</li>
  <li>Fix extensions failed to show inactive for the current space</li>
  <li>UI fixes</li>
  <li>Update dependencies</li>
  <li>Crash fix for certain locales</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.147.43.2)

---

<h3>Version 10.146.26 <span class="date">16/3/2026</span></h3>
<ul>
  <li>Update to Chromium 146.0.7680.80</li>
  <li>Fix recent tab ordering in the search popup</li>
  <li>Fix an issue where Wavebox would sometimes take focus on macOS during a FedCM sign-in</li>
  <li>Fix the current space not being used correctly during a FedCM sign-in</li>
  <li>Fix a hard crash on launch</li>
  <li>Fixes for the macOS updater on Tahoe</li>
  <li>Speculative fixes for Wavebox stealing focus when it's not in the foreground</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.146.26.2)

---
[More versions](https://wavebox.io/changelog/stable/)