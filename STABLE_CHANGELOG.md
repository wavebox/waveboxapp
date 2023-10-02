<h3>Version 10.117.21 <span class="date">2/10/2023</span></h3>
<ul>
  <li>Update to Chromium 117.0.5938.132</li>
  <li>Turn on the new bookmarks sidebar</li>
  <li>Fix Brainbox skills not working from Smart Notes</li>
  <li>Fix the send to Smart Notes button not working in Brainbox</li>
  <li>Fix opening emails from Outlook failing to load the window</li>
  <li>Fix a silent crash</li>
  <li>Fix a crash in the extension tabs api</li>
  <li>Don't open finder when updating a Desktop web app on macOS</li>
  <li>Stability fixes for sync</li>
  <li>UI Tweaks</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.117.21.2)

---

<h3>Version 10.117.18 <span class="date">25/9/2023</span></h3>
<ul>
  <li>Update to Chromium 117.0.5938.92</li>
  <li>Add Brainbox to the tray menu</li>
  <li>Fix an issue where popping out a Gmail window would not prevent the app from going to sleep and destroying the window</li>
  <li>Fix an issue where in some configurations the tab bar could be incorrectly hidden when it only contains pinned tabs</li>
  <li>Fix an issue with Desktop web apps where some would disappear after a restart</li>
  <li>Fixes to the Desktop web apps UI</li>
  <li>Fix an issue where Groups with a single App would continue showing the badge even with the group setting disabled</li>
  <li>Fix a silent crash on window creation</li>
  <li>Fix notifications from service workers failing to link back to their opening app</li>
  <li>Fixes for Linux window styling</li>
  <li>Remove Smart Notes from the right-click menu when disabled</li>
  <li>Multiple other stability fixes</li>
  <li>Speculative fix for a hard crash on Windows</li>
  <li>UI fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.117.18.2)

---

<h3>Version 10.117.10 <span class="date">13/9/2023</span></h3>
<ul>
  <li>Update to Chromium 117.0.5938.62</li>
  <li>Add the option to the right click menu to duplicate a Group</li>
  <li>New password manager</li>
  <li>Update dependencies</li>
  <li>Performance fixes</li>
  <li>Stability fixes</li>
  <li>UI fixes</li>
  <li>Remove the Ctrl/Cmd+Enter keybinding for sending a Brainbox message and automatically including the page content</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.117.10.2)

---

<h3>Version 10.116.10 <span class="date">30/8/2023</span></h3>
<ul>
  <li>Update to Chromium 116.0.5845.141</li>
  <li>Fix a UI issue when the address bar was hidden</li>
  <li>Fix being unable to remove passwords</li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.116.10.2)

---

<h3>Version 10.116.8 <span class="date">23/8/2023</span></h3>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 116.0.5845.111</li>
  <li>Update dependencies</li>
  <li>Allow different desktop web apps for different site paths</li>
  <li>Auto expand the webdock when opening a group</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix the "New workspace" button not appearing for some users</li>
  <li>Fix the search button not appearing in the toolbar</li>
  <li>Fix collection widget links incorrectly opening in-situ</li>
  <li>Stability fixes from crash reports</li>
  <li>UI fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.116.8.2)

---

<h3>Version 10.115.27 <span class="date">3/8/2023</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    Add a feature to the collection widget, so changes you make when all links are opened in a window
    can be sent back to the workspace. To use this, click the cog icon in the collection widget and
    select 'Open & track shortcuts in a new window'.
  </li>
  <li>Add menu item in Wavebox Mini to clear notifications older than</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 115.0.5790.171</li>
  <li>Update dependencies</li>
  <li>Improve sync for workspaces so workspace apps also sync the reference to the workspace that's open</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixes for notifications that originate from ServiceWorkers</li>
  <li>Fixes for clicking on notifications in Wavebox Mini</li>
  <li>Fix an issue sending a single tab to a workspace</li>
  <li>Fixes to the extension tabs API</li>
  <li>Fix an issue with sync when importing bookmarks</li>
  <li>Fix editing collections in workspaces</li>
  <li>UI tweaks to the tab navigator</li>
  <li>UI fixes</li>
  <li>Sync fixes</li>
  <li>Fix for opening tabs from a collection widget</li>
  <li>Fixes for the collection widgets</li>
  <li>Fix the sticky notes widgets not being draggable</li>
  <li>Fixes for new users</li>
  <li>Fix a data integrity issue with sync</li>
  <li>Fix some apps failing to remember the url that's configured during the add wizard</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.115.27.2)

---

<h3>Version 10.115.15 <span class="date">19/7/2023</span></h3>
<p>
  The previous release broke creating new profiles, this release fixes that.
  Here's everything that's new...
</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    Add more options to the custom web app settings to allow for more control over
    generating unread counts and activity. You can now create inline functions to
    generate these values that run inside the apps tab.
  </li>
  <li>Add sorting for Smart Notes</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 115.0.5790.98</li>
  <li>Update dependencies</li>
  <li>Tab styling was different between the primary and secondary windows. Fix this.</li>
  <li>Updates to the network code so it's more resilient and makes sync more responsive</li>
  <li>Compatibility improvements for the embedded iframe widget in workspaces</li>
  <li>Add the bookmarks manager back into the app menu</li>
  <li>Ensure notification sounds are not played when macOS is in focus mode</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>
    Fix an issue on Windows where dragging the sticky notes widget could make the
    window resize unexpectedly
  </li>
  <li>Fix cookie container proxy settings not being configurable</li>
  <li>Fix clearing the default cookie container on exit not being configurable</li>
  <li>Fix text overflowing in workspaces</li>
  <li>Fixes for the cookie container popup</li>
  <li>Fix the Brainbox toggle shortcut not closing side panels</li>
  <li>Stability fixes</li>
  <li>UI fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.115.15.2)

---

<h3>Version 10.115.14 <span class="date">19/7/2023</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>
    Add more options to the custom web app settings to allow for more control over
    generating unread counts and activity. You can now create inline functions to
    generate these values that run inside the apps tab.
  </li>
  <li>Add sorting for Smart Notes</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 115.0.5790.98</li>
  <li>Update dependencies</li>
  <li>Tab styling was different between the primary and secondary windows. Fix this.</li>
  <li>Updates to the network code so it's more resilient and makes sync more responsive</li>
  <li>Compatibility improvements for the embedded iframe widget in workspaces</li>
  <li>Add the bookmarks manager back into the app menu</li>
  <li>Ensure notification sounds are not played when macOS is in focus mode</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>
    Fix an issue on Windows where dragging the sticky notes widget could make the
    window resize unexpectedly
  </li>
  <li>Fix cookie container proxy settings not being configurable</li>
  <li>Fix clearing the default cookie container on exit not being configurable</li>
  <li>Fix text overflowing in workspaces</li>
  <li>Fixes for the cookie container popup</li>
  <li>Fix the Brainbox toggle shortcut not closing side panels</li>
  <li>Stability fixes</li>
  <li>UI fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.115.14.2)

---

<h3>Version 10.114.32 <span class="date">27/6/2023</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    Add experimental support for running multiple copies of the same extension, a different
    one for each cookie container. You can enable this by opening wavebox://extensions in a new
    tab and opening the extensions settings.
  </li>
  <li>
    Add support for Firefox contextual identity extension APIs, allowing extensions to
    interact with cookie containers.
  </li>
  <li>UI updates to the extensions screens.</li>
  <li>New cookie container popover when clicking the cookie container button in the toolbar.</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 114.0.5735.199.</li>
  <li>Expose more Chromium settings to the main Wavebox settings.</li>
  <li>UI tweaks.</li>
  <li>Stability fixes.</li>
  <li>Update dependencies.</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix Smart Notes not being scrollable with the on-screen scroll handle.</li>
  <li>Fix the tab close button incorrectly showing on unfocused tabs when the tab strip is compressed.</li>
  <li>Fix the connect button doing nothing when the side panel is disabled.</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.114.32.2)

---

<h3>Version 10.114.26 <span class="date">15/6/2023</span></h3>
<ul>
  <li>Update to Chromium 114.0.5735.134</li>
  <li>Add Smart notes to the side panel</li>
  <li>Add Wavebox Mini to the side panel</li>
  <li>Add an option to cookie containers to clear cookies on exit</li>
  <li>Add a menu item to clear all cookies in a single cookie container</li>
  <li>Add an advanced flag to turn off what's new badges</li>
  <li>Add "Wake all in group" to the tab right-click menu</li>
  <li>Update dependencies</li>
  <li>Fix tab thumbnails not generating</li>
  <li>Fixes for new users</li>
  <li>Fixes for settings</li>
  <li>Fix bookmarks opened from the toolbar creating a new tab</li>
  <li>Stability fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.114.26.2)

---
[More versions](https://wavebox.io/changelog/stable/)