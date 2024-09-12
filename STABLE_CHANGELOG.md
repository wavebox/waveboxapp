<h3>Version 10.128.7 <span class="date">12/9/2024</span></h3>
<ul>
  <li>Update to Chromium 128.0.6613.13</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.128.7.2)

---

<h3>Version 10.128.5 <span class="date">1/9/2024</span></h3>
<ul>
  <li>Update to Chromium 128.0.6613.114</li>
  <li>Fix an issue where closing a window with a split tab would cause a crash</li>
  <li>Stability fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.128.5.2)

---

<h3>Version 10.128.4 <span class="date">27/8/2024</span></h3>

<ul>
  <li>Speculative fix for crash on launch</li>
  <li>When sending all tabs to the dashboard save the custom tab titles</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.128.4.2)

---

<h3>Version 10.128.3 <span class="date">22/8/2024</span></h3>
<ul>
  <li>Update to Chromium 128.0.6613.85</li>
  <li>Add close all tabs to the group context menu</li>
  <li>Add restore last closed window/tab to the right-click tabstrip menu</li>
  <li>Add a button to create a saved item in the app tooltip, rather than always needing to create one from a history item</li>
  <li>Fix an issue where the closing the color picker popup in the add group/space popup would also close the add popup</li>
  <li>Opening links from outside of Wavebox would sometimes fail to focus the window, fix this</li>
  <li>Fix a large toolbar that appeared on macOS when using Wavebox in fullscreen</li>
  <li>Fixes for settings</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.128.3.2)

---

<h3>Version 10.127.16 <span class="date">14/8/2024</span></h3>

<ul>
  <li>Update to Chromium 127.0.6533.120</li>
  <li>When switching spaces in the webdock, remember the scroll position</li>
  <li>Add an option to open external links in an incognito window</li>
  <li>Speculative fix for Slack, where it would incorrectly show an unread indicator</li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.127.16.2)

---

<h3>Version 10.127.10 <span class="date">31/7/2024</span></h3>
<ul>
  <li>Update to Chromium 127.0.6533.89</li>
  <li>When adding an app through the omnibox ensure it's added to the active group</li>
  <li>Make it easier to configure enhanced safe browsing protection</li>
  <li>Fix the history side panel failing to open</li>
  <li>Always enable the history and reading list side panels by default</li>
  <li>Some routes to making a new tab would incorrectly link the tab to the group instead of the active app</li>
  <li>Auto-reported stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.127.10.2)

---

<h3>Version 10.127.7 <span class="date">29/7/2024</span></h3>
<ul>
  <li>Add an indicator to show which group/app tabs have been opened from by adding the parents color to the tab along with some extra info in the tooltip</li>
  <li>Add a hint that using the home button in the toolbar returns the app to it's base url</li>
  <li>Update to Chromium 127.0.6533.73</li>
  <li>Speculative fix for a hard crash on startup</li>
  <li>Fixes for space settings</li>
  <li>Fix some edit fields in the UI being unfocusable</li>
  <li>Fix a bug where removing the last app in a space, would sometimes remove the space despite tabs still using it</li>
  <li>Fix right-click open in group/space crashing</li>
  <li>Fix the split-state of tabs not restoring on restart</li>
  <li>Fixes when downloading untrusted files</li>
  <li>Fix some bugs when reordering tabs</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.127.7.2)

---

<h3>Version 10.126.22 <span class="date">17/7/2024</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    Add a new settings section for the spaces in the webdock. This includes
    some extra options such as
    <ul>
      <li>Disable the space popups</li>
      <li>Show sleeping spaces in grey</li>
      <li>Customize opacity and greyscale of inactive and sleeping spaces</li>
    </ul>
  </li>
  <li>Make the space name editable in the location bar popup</li>
  <li>Add the option to name a space when creating one through the add app wizard</li>
  <li>Add a setting to the space settings to blanket change all the group, app & badge colors</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 126.0.6478.183</li>
  <li>Update dependencies</li>
  <li>Make the active app color the same as the app and add an option to change this back to the default highlight</li>
  <li>When boosting a tab into an app, automatically pick the icon from the pages favicon</li>
  <li>Change the visual ordering of groups in some menus and other parts of the UI when using the spaces webdock</li>
  <li>In some configurations, some of the moving options were missing from the group & app right-click menus - fix this</li>
  <li>UI fixes for overly long text in Wavebox Mini</li>
  <li>Style fixes for the navigator</li>
  <li>Change the arrows in settings to be smooth</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix an issue where moving an app into a new window, would sometimes unexpectedly change the active app</li>
  <li>Fix an issue where some first time users would sometimes be signed back out the second time the launch the app</li>
  <li>Fixes for the Slack integration</li>
  <li>Fix some naming issues when creating a group/app</li>
  <li>Fix the navigator being undraggable & zoomable on first launch</li>
  <li>Style fixes</li>
  <li>Stability fixes</li>
  <li>Moving the last app in a group somewhere else could result in the group & and any tabs left in it being automatically destroyed - fix this</li>
  <li>Fix the webdock text preview size in settings getting larger the smaller the selected size 🤦‍♂️</li>
  <li>Fix an issue where a set of links opened from a dashboard would open them in reverse order</li>
  <li>Fix a crash when trying to remove a space through settings</li>
  <li>We broke dragging tabs in and out of the main window during a Chromium update. Fix this so it works again</li>
  <li>Fix for a hard crash on launch</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.126.22.2)

---

<h3>Version 10.126.14 <span class="date">26/6/2024</span></h3>
<ul>
  <li>Update to Chromium 126.0.6478.127</li>
  <li>Add a space indicator to tabs when using the spaces webdock and the group uses mixed spaces</li>
  <li>Add new shortcuts to change to the prev/next space and space at index when using the spaces webdock</li>
  <li>Make it possible to delete in-use spaces through settings</li>
  <li>Automatically suggest an icon when creating a custom Wavebox app</li>
  <li>Add the current pages favicon as a preset when picking an icon for a custom app</li>
  <li>Fix an issue where restoring a tab could sometimes open it in the wrong window</li>
  <li>Fix the prev/next group keyboard shortcuts not being bound to the active space when using the spaced webdock</li>
  <li>Resiliency fixes when updating integrations on the fly</li>
  <li>Update dependencies</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.126.14.2)

---

<h3>Version 10.126.9 <span class="date">17/6/2024</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>Add a new mode to the Ctrl+Tab switcher that allows you to switch between ordered tabs/apps in the current group/window</li>
  <li>Add an option to disable tab tooltips</li>
  <li>Add a warning when overwriting a keyboard shortcut</li>
  <li>Automatically open Smart Notes in the side panel. Add an option to change this to popout/side panel</li>
  <li>Add an option to Smart Notes so it's possible to open them from the toolbar and not create a new note</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 126.0.6478.62</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix an issue with some link open rules that cross identities failing to work correctly</li>
  <li>Fix the group new tab url not working when opening tabs using Ctrl/Cmd+T</li>
  <li>Prompt to restart when changing the built-in system theme to ensure all changes are applied</li>
  <li>Drag and drop fixes</li>
  <li>Performance & stability fixes</li>
  <li>Styling fixes</li>
  <li>Update dependencies</li>
  <li>UI & Stability fixes</li>
  <li>Fix when repairing store integrity</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.126.9.2)

---
[More versions](https://wavebox.io/changelog/stable/)