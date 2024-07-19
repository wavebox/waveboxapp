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

<h3>Version 10.126.5 beta <span class="date">13/6/2024</span></h3>
<ul>
  <li>Update to Chromium 126.0.6478.57</li>
  <li>UI & Stability fixex</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.126.5.3)

---

<h3>Version 10.126.2 beta <span class="date">11/6/2024</span></h3>
<ul>
  <li>Update to Chromium 126.0.6478.36</li>
  <li>Add a new mode to the Ctrl+Tab switcher that allows you to switch between ordered tabs/apps in the current group/window</li>
  <li>Add an option to disable tab tooltips</li>
  <li>Fix an issue with some link open rules that cross identities failing to work correctly</li>
  <li>Fix the group new tab url not working when opening tabs using Ctrl/Cmd+T</li>
  <li>Prompt to restart when changing the built-in system theme to ensure all changes are applied</li>
  <li>Add a warning when overwriting a keyboard shortcut</li>
  <li>Drag and drop fixes</li>
  <li>Performance & stability fixes</li>
  <li>Styling fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.126.2.3)

---

<h3>Version 10.125.53 beta <span class="date">5/6/2024</span></h3>
<ul>
  <li>Add support for 'Collapse webdock apps when the group is inactive' in spaces sidebar</li>
  <li>Chromium 125.0.6422.142</li>
  <li>Add a flag to show the tabstrip for groups containing a single dashboard</li>
  <li>UI fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.125.53.3)

---
[More versions](https://wavebox.io/changelog/beta/)