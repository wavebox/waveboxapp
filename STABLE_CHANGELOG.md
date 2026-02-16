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

<h3>Version 10.143.21 <span class="date">15/12/2025</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>
    Improved search for things like the app store and tabs, making it both
    faster and more accurate.
  </li>
  <li>
    Add some optimizations for users with a large number of tabs per window (800+)
    that should help with some performance issues.
  </li>
  <li>Add tooltips to the dividers</li>
  <li>Show more search results in global search when using the individual tabs</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 143.0.7499.110</li>
  <li>Add escape keybinding to open link in group & space dialogs</li>
  <li>Clearer styling for settings windows</li>
  <li>Stability fixes in settings</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix an issue with the positioning of some widget menus</li>
  <li>Fix copying the current url not working</li>
  <li>Fix the titlebar height when the collapsed titlebar is turned off</li>
  <li>Fix a crash that popped up in the previous version</li>
  <li>On macOS the toolbar was incorrectly showing on fullscreen videos, fix this</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.143.21.2)

---

<h3>Version 10.143.17 <span class="date">3/12/2025</span></h3>
<p>
  This patch release fixes a number of issue that were reported early with the 10.143 branch. Here's everything else that's new in these versions
</p>
<h4>🆕 New!</h4>
<ul>
  <li>Add a marker to the macOS menus to differentiate the main Wavebox window</li>
  <li>Add an option to the collection widget, so links can be opened in a specific group</li>
  <li>Update the ClickUp integration and add support for getting chat counts</li>
  <li>Update the context menus when opening items in groups/spaces so you can search across your groups/spaces</li>
  <li>Add deep-sleep feature that reduces tab power consumption further after an extended period of inactivity</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Save the icon state from the icon picker to make it easier between sessions</li>
  <li>Update to Chromium 143.0.7499.41</li>
  <li>Performance improvements for long virtualized lists</li>
  <li>Smooth out some UI jank during launch</li>
  <li>Update the group and space pickers across the app with a unified component that includes search</li>
  <li>Update dependencies</li>
  <li>Some behind the scenes Brainbox stuff ready for our next update :-)</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix the process info sometimes failing to populate</li>
  <li>UI tweaks to settings so it's easier to enable advanced mode</li>
  <li>Speculative crashfix that involved the bookmark bar and split view</li>
  <li>Fix an issue with the webdock auto-hiding when window dragging is enabled</li>
  <li>UI fixes for settings and creating custom apps</li>
  <li>Changing to empty group would not update the active tab, fix this</li>
  <li>Fix a crash that could happen with some keyboard shortcuts</li>
  <li>Fix frameless windows not actually being frameless</li>
  <li>Fix a style issue in the tooltip menus</li>
  <li>Fix the status bubble and new tab buttons having bright red backgrounds with some theme configurations</li>
  <li>Fix a couple of typographical whoopsies</li>
  <li>A couple of stability fixes picked up by the team</li>
  <li>Fixes for the side panels</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.143.17.2)

---

<h3>Version 10.143.16 <span class="date">3/12/2025</span></h3>
<p>
  This patch release fixes an issue with the context menus. Here's everything else that's new
</p>
<h4>🆕 New!</h4>
<ul>
  <li>Add a marker to the macOS menus to differentiate the main Wavebox window</li>
  <li>Add an option to the collection widget, so links can be opened in a specific group</li>
  <li>Update the ClickUp integration and add support for getting chat counts</li>
  <li>Update the context menus when opening items in groups/spaces so you can search across your groups/spaces</li>
  <li>Add deep-sleep feature that reduces tab power consumption further after an extended period of inactivity</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Save the icon state from the icon picker to make it easier between sessions</li>
  <li>Update to Chromium 143.0.7499.41</li>
  <li>Performance improvements for long virtualized lists</li>
  <li>Smooth out some UI jank during launch</li>
  <li>Update the group and space pickers across the app with a unified component that includes search</li>
  <li>Update dependencies</li>
  <li>Some behind the scenes Brainbox stuff ready for our next update :-)</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix the process info sometimes failing to populate</li>
  <li>UI tweaks to settings so it's easier to enable advanced mode</li>
  <li>Speculative crashfix that involved the bookmark bar and split view</li>
  <li>Fix an issue with the webdock auto-hiding when window dragging is enabled</li>
  <li>UI fixes for settings and creating custom apps</li>
  <li>Changing to empty group would not update the active tab, fix this</li>
  <li>Fix a crash that could happen with some keyboard shortcuts</li>
  <li>Fix frameless windows not actually being frameless</li>
  <li>Fix a style issue in the tooltip menus</li>
  <li>Fix the status bubble and new tab buttons having bright red backgrounds with some theme configurations</li>
  <li>Fix a couple of typographical whoopsies</li>
  <li>A couple of stability fixes picked up by the team</li>
  <li>Fixes for the side panels</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.143.16.2)

---

<h3>Version 10.143.15 <span class="date">3/12/2025</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>Add a marker to the macOS menus to differentiate the main Wavebox window</li>
  <li>Add an option to the collection widget, so links can be opened in a specific group</li>
  <li>Update the ClickUp integration and add support for getting chat counts</li>
  <li>Update the context menus when opening items in groups/spaces so you can search across your groups/spaces</li>
  <li>Add deep-sleep feature that reduces tab power consumption further after an extended period of inactivity</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Save the icon state from the icon picker to make it easier between sessions</li>
  <li>Update to Chromium 143.0.7499.41</li>
  <li>Performance improvements for long virtualized lists</li>
  <li>Smooth out some UI jank during launch</li>
  <li>Update the group and space pickers across the app with a unified component that includes search</li>
  <li>Update dependencies</li>
  <li>Some behind the scenes Brainbox stuff ready for our next update :-)</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix the process info sometimes failing to populate</li>
  <li>UI tweaks to settings so it's easier to enable advanced mode</li>
  <li>Speculative crashfix that involved the bookmark bar and split view</li>
  <li>Fix an issue with the webdock auto-hiding when window dragging is enabled</li>
  <li>UI fixes for settings and creating custom apps</li>
  <li>Changing to empty group would not update the active tab, fix this</li>
  <li>Fix a crash that could happen with some keyboard shortcuts</li>
  <li>Fix frameless windows not actually being frameless</li>
  <li>Fix a style issue in the tooltip menus</li>
  <li>Fix the status bubble and new tab buttons having bright red backgrounds with some theme configurations</li>
  <li>Fix a couple of typographical whoopsies</li>
  <li>A couple of stability fixes picked up by the team</li>
  <li>Fixes for the side panels</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.143.15.2)

---

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
[More versions](https://wavebox.io/changelog/stable/)