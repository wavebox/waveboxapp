<h3>Version 10.129.27 <span class="date">25/9/2024</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    An all new, more capable link open engine with more flexibility to
    create global rules and tailor your Wavebox! We've added an all-new UI
    for rule management - no more hunting through apps to find where a rule
    was created. Wavebox now features an intuitive list (with search of course)
    so you can easily find and manage each rule.
    <br /><br />
    We've added robust support for cross-space rules across the board. If you need
    to move a link to a new space, Wavebox gives you the tools to do this!
    <br /><br />
    We've also made it easier to figure out when a rule is being applied, with
    a new indicator in the URL bar. This will show you which rule is being applied
    to the current page, and you can click on it to see more details.
    <br /><br />
    Rules now have support for more scopes (where they're opened from), with then new
    version allowing matches for:
    <ul>
      <li>Anywhere in Wavebox</li>
      <li>Typed into the Omnibox/Location bar</li>
      <li>Anywhere in a Space</li>
      <li>Anywhere in a Group</li>
      <li>From within an app</li>
      <li>Outside of Wavebox (if Wavebox is set as your default browser)</li>
    </ul>

    URL matching has been enhanced, making it simpler to create URL matches with support for:
    <ul>
      <li>Contains</li>
      <li>Starts with</li>
      <li>Equality</li>
      <li>Patterns</li>
      <li>Hostnames</li>
    </ul>
  </li>
  <li>Add more options to customize and re-order the items in the Group, App & Tab tooltips</li>
  <li>Add an experimental flag that allows groups with more than one spaces to either be displayed in both spaces or just one</li>
  <li>Add a helper for when using a group with multiple spaces</li>
  <li>Make it easier to create a custom app from toolbar by pre-filling a bunch of things based on the search</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 129.0.6668.71</li>
  <li>Usability improvements and fixes to the drag & drop space manager</li>
  <li>Update our underlying UI libraries for faster performance</li>
  <li>Add a duplicate option to window open rules through the right-click menu</li>
  <li>Under certain configurations the font used in the webdock would display incorrectly, fix this</li>
  <li>Usability fixes when creating a group from the webdock</li>
  <li>Stability fixes for the tab loading indicator</li>
  <li>UI updates for the switcher</li>
  <li>UI tweaks for restoring cloud sync</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>When saving tabs to a dashboard, custom tab names were saved from secondary windows but not the main Wavebox window. Fix this.</li>
  <li>Fix a hard crash with the side panel</li>
  <li>Fix incognito search sometimes not working</li>
  <li>Fix crash on launch</li>
  <li>Fix theming for context menus</li>
  <li>Speculative fix for tab restore sometimes failing</li>
  <li>Fixes for the first-run tooltips</li>
  <li>Stability fixes for preference saving</li>
  <li>Stability fixes</li>
  <li>Speculative fix for privacy badger</li>
  <li>Usability fixes for the first install tooltips</li>
  <li>Fixes for Slack sign-in</li>
  <li>Fixes for the focus mode popup not resizing the window correctly</li>
  <li>Fixes for the url pattern migration of link open rules</li>
  <li>Fix some links failing to open</li>
  <li>Under some configurations a cross space rule would fail to re-assign the space correctly. Fix this.</li>
  <li>Theme fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.129.27.2)

---

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
[More versions](https://wavebox.io/changelog/stable/)