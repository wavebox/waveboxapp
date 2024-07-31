<h3>Version 10.127.9 beta <span class="date">31/7/2024</span></h3>
<ul>
  <li>Update to Chromium 127.0.6533.89</li>
  <li>When adding an app through the omnibox ensure it's added to the active group</li>
  <li>Make it easier to configure enhanced safe browsing protection</li>
  <li>Some routes to making a new tab would incorrectly link the tab to the group instead of the active app</li>
  <li>Auto-reported stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.127.9.3)

---

<h3>Version 10.127.7 beta <span class="date">28/7/2024</span></h3>
<ul>
  <li>Add an indicator to show which group/app tabs have been opened from by adding the parents color to the tab along with some extra info in the tooltip</li>
  <li>Add a hint that using the home button in the toolbar returns the app to it's base url</li>
  <li>Fix some bugs when reordering tabs</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.127.7.3)

---

<h3>Version 10.127.6 beta <span class="date">24/7/2024</span></h3>
<ul>
  <li>Update to Chromium 127.0.6533.73</li>
  <li>Fix right-click open in group/space crashing</li>
  <li>Fix the split-state of tabs not restoring on restart</li>
  <li>Fixes when downloading untrusted files</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.127.6.3)

---

<h3>Version 10.127.4 beta <span class="date">19/7/2024</span></h3>
<ul>
  <li>Speculative fix for a hard crash on startup</li>
  <li>Fixes for space settings</li>
  <li>Fix some edit fields in the UI being unfocusable</li>
  <li>Fix a bug where removing the last app in a space, would sometimes remove the space despite tabs still using it</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.127.4.3)

---

<h3>Version 10.127.3 beta <span class="date">18/7/2024</span></h3>
<ul>
  <li>Update to Chromium 127.0.6533.57</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.127.3.3)

---

<h3>Version 10.126.22 beta <span class="date">17/7/2024</span></h3>
<ul>
  <li>Update to Chromium 126.0.6478.183</li>
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
  <li>Fix an issue where moving an app into a new window, would sometimes unexpectedly change the active app</li>
  <li>Fix an issue where some first time users would sometimes be signed back out the second time the launch the app</li>
  <li>Fixes for the Slack integration</li>
  <li>Fix some naming issues when creating a group/app</li>
  <li>Update dependencies</li>
  <li>Style fixes</li>
  <li>Stability fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.126.22.3)

---

<h3>Version 10.126.16 beta <span class="date">9/7/2024</span></h3>
<ul>
  <li>Add a setting to the space settings to blanket change all the group, app & badge colors</li>
  <li>Make the active app color the same as the app and add an option to change this back to the default highlight</li>
  <li>When boosting a tab into an app, automatically pick the icon from the pages favicon</li>
  <li>Change the visual ordering of groups in some menus and other parts of the UI when using the spaces webdock</li>
  <li>In some configurations, some of the moving options were missing from the group & app right-click menus - fix this</li>
  <li>UI fixes for overly long text in Wavebox Mini</li>
  <li>Fix the navigator being undraggable & zoomable on first launch</li>
  <li>Style fixes for the navigator</li>
  <li>Moving the last app in a group somewhere else could result in the group & and any tabs left in it being automatically destroyed - fix this</li>
  <li>Fix the webdock text preview size in settings getting larger the smaller the selected size 🤦‍♂️</li>
  <li>Change the arrows in settings to be smooth</li>
  <li>Fix an issue where a set of links opened from a dashboard would open them in reverse order</li>
  <li>Fix a crash when trying to remove a space through settings</li>
  <li>We broke dragging tabs in and out of the main window during a Chromium update. Fix this so it works again</li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.126.16.3)

---

<h3>Version 10.126.15 beta <span class="date">26/6/2024</span></h3>
<ul>
  <li>Speculative fix for a crash on launch</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.126.15.3)

---

<h3>Version 10.126.14 beta <span class="date">25/6/2024</span></h3>
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

[Downloads](https://wavebox.io/download/release/10.126.14.3)

---

<h3>Version 10.126.9 beta <span class="date">17/6/2024</span></h3>
<ul>
  <li>Update to Chromium 126.0.6478.62</li>
  <li>Automatically open Smart Notes in the side panel. Add an option to change this to popout/side panel</li>
  <li>Add an option to Smart Notes so it's possible to open them from the toolbar and not create a new note</li>
  <li>UI Fixes</li>
  <li>Fix when repairing store integrity</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.126.9.3)

---
[More versions](https://wavebox.io/changelog/beta/)