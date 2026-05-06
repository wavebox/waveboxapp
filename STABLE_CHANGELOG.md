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

<h3>Version 10.145.41 <span class="date">24/2/2026</span></h3>
<ul>
  <li>Update to Chromium 145.0.7632.117</li>
  <li>Fix an edge case issue reported by some users where the UI starts to render incorrectly and parts of Wavebox stop working</li>
  <li>Add data integrity protection for the stores to make them more reliable</li>
  <li>Multiple stability fixes and error handling cases for a faster and more reliable Wavebox</li>
  <li>Fix an issue where dragging Groups/Apps/Tabs around could fail</li>
  <li>Fix an issue that could see the loading dots render incorrectly on launch</li>
  <li>Speculative fix for crash when using tab groups</li>
  <li>Speculative fix for a hard crash on startup when using tab groups</li>
  <li>Speculative fix for parts of the UI becoming unresponsive</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.145.41.2)

---

<h3>Version 10.145.17 <span class="date">16/2/2026</span></h3>
<ul>
  <li>Update to Chromium 145.0.7632.76</li>
  <li>Fix a startup crash reported by some users</li>
  <li>Fix another hard crash reported by some users with certain extension configurations</li>
  <li>Add an auto setting for which app to launch on startup, allowing you to restore the last used app/tab</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.145.17.2)

---

<h3>Version 10.145.11 <span class="date">11/2/2026</span></h3>
<ul>
  <li>Update to Chromium 145.0.7632.46</li>
  <li>Allow the space webdock to be resized further and have group & app names show once it's over 100px</li>
  <li>Save the tabstrip scroll position when switching Groups</li>
  <li>Make dragging the main Wavebox window on Windows easier</li>
  <li>Fixes for desktop web apps</li>
  <li>Improve frameless window styling on Windows</li>
  <li>Speculative fix for some windows growing automatically when opened</li>
  <li>Make the webdock dragger easier to grab</li>
  <li>Fix some parts of the UI still being visible when the privacy lock shows</li>
  <li>Fix a bug where the webdock divider state didn't save when switching spaces</li>
  <li>Speculative fix for silent crash that could then cause graphical issues</li>
  <li>Fix crash on exit after using an incognito window</li>
  <li>UI updates</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.145.11.2)

---

<h3>Version 10.144.72 <span class="date">28/1/2026</span></h3>
<ul>
  <li>Update to Chromium 144.0.7559.110</li>
  <li>Fix dependency issue with the RPM distribution</li>
  <li>Add email tab to sharing menu and space popovers</li>
  <li>Add speech to text support for Brainbox 5</li>
  <li>Fix tab titles not being populated when sending tabs to a dashboard</li>
  <li>Fix an issue where the sidepanel title would not update</li>
  <li>Fix two launch crashes</li>
  <li>UI updates for settings</li>
  <li>Improve the auto-focus behaviour in the tabstrip when tab scrolling is enabled</li>
  <li>Fix Zoom not opening in the desktop app by default</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.144.72.2)

---

<h3>Version 10.144.66 <span class="date">21/1/2026</span></h3>
<ul>
  <li>Update to Chromium 144.0.7559.97</li>
  <li>Add browser support for sites and extensions that use speech to text</li>
  <li>Add more support for customizing the left and right click actions on the menu bar (macOS) and tray (Windows)</li>
  <li>Experiment with a new Wavebox mini experience when Wavebox mini is opened from the menu bar/tray</li>
  <li>Fix the unread count for LinkedIn when there's more than 99 unreads</li>
  <li>Fix the unread count not showing for Discord</li>
  <li>Fix a display issue with the tab switcher when holding down Ctrl+Tab</li>
  <li>Fix the Brainbox popout button not working</li>
  <li>Fix a crash when dragging a tab group into a new window</li>
  <li>Fix a visual glitch where a white border would appear around non-floating webviews when using dark themes</li>
  <li>Fix some edge case issues with Wavebox sign in</li>
  <li>Update the Outlook integration so it gracefully handles accounts that don't support API access</li>
  <li>Update dependencies</li>
  <li>Resolve an issue where Zoom wasn't displaying virtual backgrounds correctly</li>
  <li>Fix a white border appearing around tabs in certain display configurations</li>
  <li>Streamline the experience when setting up a second profile for smoother multi-account workflows</li>
  <li>Squash several stability issues including crashes on launch and exit that affected some users</li>
  <li>Update dependencies</li>
  <li>Re-order settings when searching to bubble the most relevant results to the top</li>
  <li>Speculative fix for a split view crash</li>
  <li>UI fixes for the focus mode popover</li>
  <li>Style fixes for the tab strip on varying display widths</li>
  <li>Tidy a bunch of the dialog actions to make them more uniform</li>
  <li>Fixes for the Chrome webstore</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.144.66.2)

---
[More versions](https://wavebox.io/changelog/stable/)