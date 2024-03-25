<h3>Version 10.123.2 <span class="date">25/3/2024</span></h3>

<ul>
  <li>Update to Chromium 123.0.6312.59</li>
  <li>Style tweaks for pinned sleeping tabs so it's clearer what site they are</li>
  <li>Dragging tabs out of the main Wavebox window into a tab group wouldn't assign the group on drop. Fix this</li>
  <li>Fix an issue with password sync</li>
  <li>Fix an issue with extension sync, when the multiple instances mode is selected</li>
  <li>Usability fixes for the managed team UX</li>
  <li>Update dependencies</li>
  <li>UI updates</li>
  <li>Remove some old code that was used to support Chromium 122</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.123.2.2)

---

<h3>Version 10.122.35 <span class="date">14/3/2024</span></h3>
<ul>
  <li>Update to Chromium 122.0.6261.128</li>
  <li>Fix an issue with sync, that could cause two machines to fall out of sync for a period of time</li>
  <li>In certain configurations, dragging folders in the webdock would place them in the wrong location. Fix this</li>
  <li>Stability fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.122.35.2)

---

<h3>Version 10.122.30 <span class="date">5/3/2024</span></h3>

<ul>
  <li>Re-add the option to combine items on drag, for example by dragging tabs over groups</li>
  <li>Turn off tab scrolling by default. If you want to continue using it, head to Settings and search for Tab scrolling</li>
  <li>Add an experimental flag to change the theme parsing behavior to give greater contrast on high-contrast themes</li>
  <li>Stop explorer webdock groups collapsing when interacting with the context menu</li>
  <li>Update to Chromium 122.0.6261.95</li>
  <li>When dragging tabs in the webdock, don't place them in collapsed groups</li>
  <li>Fix dragging apps in the webdock, sometimes leading to misplacement on drag end</li>
  <li>Default the ClickUp integration to version 3</li>
  <li>Turning app badges off and on wasn't very intuitive, provide some additional visual feedback</li>
  <li>Speculative fix for a hard crash when opening a profile</li>
  <li>Fixes for managed users</li>
  <li>UI fixes for settings</li>
  <li>Update dependencies</li>
  <li>Fixes for managed teams</li>
  <li>Stability fixes</li>
  <li>Style fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.122.30.2)

---

<h3>Version 10.122.24 <span class="date">23/2/2024</span></h3>

<ul>
  <li>Update to Chromium 122.0.6261.70</li>
  <li>A keyboard shortcut that could open the cookie container popup was accidentally removed, add this back</li>
  <li>Fix Cmd/Ctrl+T failing to work properly on empty groups</li>
  <li>Fix an issue with the webdock where nested folders would fail to render correctly</li>
  <li>Fix a drag issue where starting and then stopping a drag without moving would sometimes still re-order the webdock</li>
  <li>Fix an issue where dragging an item at speed would sometimes see its placeholder offset</li>
  <li>Fix an issue where quickly dragging an item a few pixels would lock the drag areas up</li>
  <li>Style fixes</li>
  <li>Update dependencies</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.122.24.2)

---

<h3>Version 10.122.18 <span class="date">22/2/2024</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>Update to Chromium 122.0.6261.58</li>
  <li>
    Lots of improvements to the drag drop experience in the main window!
    <ul>
      <li>Change the underlying drag-drop libraries to provide a move consistent dragging experience</li>
      <li>Add support for dragging tabs in and out of the main Wavebox window</li>
      <li>Add support for dragging files/images over groups and app icons allowing you to change the active app during the drag</li>
      <li>Make app toolbars scrollable when needed</li>
      <li>Add options to make the tabstrip scrollable</li>
      <li>Add subtle scroll indicators to the webdock & toolbars to make it easier to see when there's more content</li>
      <li>Add dividers to the app toolbars. These can be created by right-clicking on any app</li>
      <li>Intelligently collapse groups & apps in the unified sidebar when not in use</li>
    </ul>
  </li>
  <li>Improve iCloud passkey support</li>
  <li>Add an option to merge groups to the right-click context menu</li>
  <li>Add a keyboard shortcut to switch to the last active group</li>
  <li>Add an option to name & bookmark notes in Smart notes</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update dependencies</li>
  <li>Improve favicon parsing</li>
  <li>Fixes for settings</li>
  <li>Stability fixes and bug fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.122.18.2)

---

<h3>Version 10.121.6 <span class="date">31/1/2024</span></h3>

<ul>
  <li>Update to Chromium 121.0.6167.140</li>
  <li>Fixes for desktop web app shortcuts</li>
  <li>Enable search in the side panel</li>
  <li>More help for users setting up sync</li>
  <li>UI tweaks and polish</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.121.6.2)

---

<h3>Version 10.121.4 <span class="date">24/1/2024</span></h3>
<ul>
  <li>Update to Chromium 121.0.6167.85</li>
  <li>UX fixes for the right-click context menus</li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
</ul>



[Downloads](https://wavebox.io/download/release/10.121.4.2)

---

<h3>Version 10.120.25 <span class="date">17/1/2024</span></h3>
<h4>🐛 Fixes</h4>
<ul>
  <li>Update to Chromium 120.0.6099.234</li>
  <li>Add a button to the tab navigator to close all tabs in the main Wavebox window</li>
  <li>Add a speculative fix for users who have been seeing the secondary window become unresponsive</li>
  <li>Fixes for new users</li>
  <li>Stability fixes</li>
  <li>Add optional logging for Brainbox</li>
  <li>Fix an issue where re-focusing the Brainbox side panel would re-affirm the "include selection" checkbox</li>
  <li>Fix for creating Desktop Web App shortcuts on Windows</li>
  <li>Fix the sizing of the window controls on Windows</li>
  <li>Improve theme parsing to ensure extra dark themes have enough contrast for certain UI elements</li>
  <li>Fix a crash with Brainbox</li>
  <li>Fix some widgets being uneditable when popped-out</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.120.25.2)

---

<h3>Version 10.120.20 <span class="date">4/1/2024</span></h3>
<ul>
  <li>Update to Chromium 120.0.6099.200</li>
  <li>Update dependencies</li>
  <li>Add a new keyboard shortcut to close all tabs in the main Wavebox window</li>
  <li>Better error handling to improve app stability</li>
  <li>Fix a text encoding issue that would sometimes cause the Wavebox sign-in flow to fail</li>
  <li>Stability fixes for Slack</li>
  <li>Tweaks for new users to make getting started easier</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.120.20.2)

---

<h3>Version 10.120.17 <span class="date">22/12/2023</span></h3>
<ul>
  <li>Update to Chromium 120.0.6099.130</li>
  <li>Fixes for settings</li>
  <li>When choosing notification sounds through settings, play a sample sound</li>
  <li>Update dependencies</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.120.17.2)

---
[More versions](https://wavebox.io/changelog/stable/)