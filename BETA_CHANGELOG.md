<h3>Version 10.143.19 beta <span class="date">7/12/2025</span></h3>
<ul>
  <li>
    Improved search for things like the app store and tabs, making it both
    faster and more accurate.
  </li>
  <li>
    Add some optimizations for users with a large number of tabs per window (800+)
    that should help with some performance issues.
  </li>
  <li>Fix an issue with the positioning of some widget menus</li>
  <li>Fix copying the current url not working</li>
  <li>Fix the titlebar height when the collapsed titlebar is turned off</li>
  <li>Add escape keybinding to open link in group & space dialogs</li>
  <li>Clearer styling for settings windows</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.143.19.3)

---

<h3>Version 10.143.17 beta <span class="date">3/12/2025</span></h3>
<ul>
  <li>On macOS when using a window in fullscreen, the contents of the tab would fail to show. Fix this</li>
  <li>The icon pickers in the context menus had vanished, add these back in</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.143.17.3)

---

<h3>Version 10.143.16 beta <span class="date">3/12/2025</span></h3>
<ul>
  <li>Fix an issue with context menus</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.143.16.3)

---

<h3>Version 10.143.15 beta <span class="date">3/12/2025</span></h3>
<ul>
  <li>Stability updates</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.143.15.3)

---

<h3>Version 10.143.12 beta <span class="date">1/12/2025</span></h3>
<ul>
  <li>Update the ClickUp integration and add support for getting chat counts</li>
  <li>Update the group and space pickers across the app with a unified component that includes search</li>
  <li>Update the context menus when opening items in groups/spaces so you can search across your groups/spaces</li>
  <li>Add an option to import old Brainbox chats</li>
  <li>Update dependencies</li>
  <li>Add deep-sleep feature that reduces tab power consumption further after an extended period of inactivity</li>
  <li>Fixes for the side panels</li>
  <li>Stability fixes</li>
  <li>Brainbox work</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.143.12.3)

---

<h3>Version 10.143.10 beta <span class="date">24/11/2025</span></h3>
<ul>
  <li>Update to Chromium 143.0.7499.41</li>
  <li>Performance improvements for long virtualized lists</li>
  <li>Fix the process info sometimes failing to populate</li>
  <li>UI tweaks to settings so it's easier to enable advanced mode</li>
  <li>Add a marker to the macOS menus to differentiate the main Wavebox window</li>
  <li>Add an option to the collection widget, so links can be opened in a specific group</li>
  <li>Speculative crashfix that involved the bookmark bar and split view</li>
  <li>Fix an issue with the webdock auto-hiding when window dragging is enabled</li>
  <li>Stability fixes</li>
  <li>UI fixes for settings and creating custom apps</li>
  <li>Changing to empty group would not update the active tab, fix this</li>
  <li>Save the icon state from the icon picker to make it easier between sessions</li>
  <li>Fix a crash that could happen with some keyboard shortcuts</li>
  <li>Smooth out some UI jank during launch</li>
  <li>Fix frameless windows not actually being frameless</li>
  <li>Fix a style issue in the tooltip menus</li>
  <li>Fix the status bubble and new tab buttons having bright red backgrounds with some theme configurations</li>
  <li>Fix a couple of typographical whoopsies</li>
  <li>A couple of stability fixes picked up by the team</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.143.10.3)

---

<h3>Version 10.142.47 beta <span class="date">18/11/2025</span></h3>
<ul>
  <li>Update to Chromium 142.0.7444.176</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.142.47.3)

---

<h3>Version 10.142.43 beta <span class="date">10/11/2025</span></h3>
<ul>
  <li>Fix a crash that could happen on startup depending on current config</li>
  <li>Fix the webdock resizer only being available in the top part of the window</li>
  <li>Network stability fix</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.142.43.3)

---

<h3>Version 10.142.42 beta <span class="date">6/11/2025</span></h3>
<ul>
  <li>Update to Chromium 142.0.7444.135</li>
  <li>UI fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.142.42.3)

---

<h3>Version 10.142.40 beta <span class="date">5/11/2025</span></h3>
<ul>
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
  <li>Make shift+clicking the Webdock mode also collapse/expand dividers in the explorer view</li>
  <li>When changing app or tab, ensure that it's always scrolled into view in the Webdock</li>
  <li>Fix some cookie/space consistency issues when duplicating groups in the spaces Webdock</li>
  <li>Add support for dragging & dropping spaces in the drag & drop spaces editor</li>
  <li>Fixes for local translate</li>

  <li>Update to Chromium 142.0.7444.60</li>
  <li>Added support for local translation models</li>
  <li>Added progress indicators when translating content</li>
  <li>Added automatic picture-in-picture mode that opens playing videos in a separate window when you navigate away from the tab</li>
  <li>Added "Now Playing" helper to quickly return to tabs with active audio or video</li>
  <li>Added display options to the switcher (Ctrl+Tab) to toggle between showing apps & tabs or apps only</li>
  <li>Updated group sleep/wake menu with more granular controls for sleeping/waking apps or tabs</li>
  <li>Improved group sleep/wake menu logic to better handle toggling between current states of apps and tabs</li>
  <li>Fixed tabs to properly undock when moved away from the main Wavebox window</li>
  <li>Ensure tabs are saved for session restore when shutting down a profile</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.142.40.3)

---
[More versions](https://wavebox.io/changelog/beta/)