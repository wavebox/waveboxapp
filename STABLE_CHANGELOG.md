<h3>Version 10.140.30 <span class="date">17/9/2025</span></h3>
<ul>
  <li>
    New Dock & Split View replaces classic split-screen with flexible multitasking: dock
    apps across groups, split tabs side-by-side and 2+ views. Access via address bar,
    right-click menu, tooltips, or page context menus for seamless workflow enhancement.
  </li>
  <li>Update to Chromium 140.0.7339.133</li>
  <li>Improve macOS Tahoe compatibility</li>
  <li>Add sleep all in group to context menus</li>
  <li>Fix an issue where under some configurations the bookmarks bar could incorrectly show in the main Wavebox window</li>
  <li>Fix the new tab page url failing to save when http or https are omitted</li>
  <li>Add new wallpapers to dashboards</li>
  <li>Fix a focus issue, that under some configs could see a tab focused after sleeping another rather than switching to the 'sleeping' holder</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.140.30.2)

---

<h3>Version 10.139.23 <span class="date">3/9/2025</span></h3>
<ul>
  <li>Update to Chromium 139.0.7258.155</li>
  <li>Update dependencies</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.139.23.2)

---

<h3>Version 10.139.20 <span class="date">14/8/2025</span></h3>
<ul>
  <li>Update to Chromium 139.0.7258.128</li>
  <li>Fix an issue with the 1Password extension reporting Wavebox is out of date</li>
  <li>Fix an issue that could cause some antivirus software to incorrectly quarantine Wavebox</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.139.20.2)

---

<h3>Version 10.139.12 <span class="date">11/8/2025</span></h3>
<p>
  This patch release fixes a number of important issues that were reported
  in version 10.139.10.
</p>
<ul>
  <li>Fix styling issue for new users</li>
  <li>Fix the webdock being inaccessible when offscreen hiding is enabled</li>
  <li>Fix the styling with the "Sign back in" panel</li>
  <li>Fix split screen failing to resize on Linux & Windows</li>
</ul>
<p>
  If you hadn't updated to 10.139.10, here's everything else new in the 10.139.x series:
</p>
<ul>
  <li>Update to Chromium 139.0.7258.66</li>
  <li>Speculative fix for one of our rendering services returning an error</li>
  <li>Performance fixes for split-screen, particularly in the main Wavebox window</li>
  <li>Fix an instance where a tab crashing, could crash the entire app</li>
  <li>When opening the app store from the Omnibox, it would add an app in a new group. Instead reuse the current group</li>
  <li>When opening links from outside of Wavebox, give the option to open the link in a group or empty group rather than just apps</li>
  <li>Fixes for dragging split screen on macOS</li>
  <li>Fix Smart notes failing to auto-open or auto-create a new note when using the side panel mode</li>
  <li>A whole bunch of UI fixes</li>
  <li>Add a flag to hide the add group button in the webdock</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
  <li>Fix an issue where it was almost impossible to resize the webdock</li>
  <li>Performance improvements when opening smaller popup windows</li>
  <li>UI tweaks for focus mode to make it clearer</li>
  <li>Speculative fix for Slack audio issues reported by some users</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.139.12.2)

---

<h3>Version 10.139.10 <span class="date">11/8/2025</span></h3>
<ul>
  <li>Update to Chromium 139.0.7258.66</li>
  <li>Speculative fix for one of our rendering services returning an error</li>
  <li>Performance fixes for split-screen, particularly in the main Wavebox window</li>
  <li>Fix an instance where a tab crashing, could crash the entire app</li>
  <li>When opening the app store from the Omnibox, it would add an app in a new group. Instead reuse the current group</li>
  <li>When opening links from outside of Wavebox, give the option to open the link in a group or empty group rather than just apps</li>
  <li>Fixes for dragging split screen on macOS</li>
  <li>Fix Smart notes failing to auto-open or auto-create a new note when using the side panel mode</li>
  <li>A whole bunch of UI fixes</li>
  <li>Add a flag to hide the add group button in the webdock</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
  <li>Fix an issue where it was almost impossible to resize the webdock</li>
  <li>Performance improvements when opening smaller popup windows</li>
  <li>UI tweaks for focus mode to make it clearer</li>
  <li>Speculative fix for Slack audio issues reported by some users</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.139.10.2)

---

<h3>Version 10.138.14 <span class="date">16/7/2025</span></h3>

<ul>
  <li>Update to Chromium 138.0.7204.158</li>
  <li>Speculative fix for one of our rendering services returning an error</li>
  <li>Performance fixes for split-screen, particularly in the main Wavebox window</li>
  <li>Fix an instance where a tab crashing, could crash the entire app</li>
  <li>When opening the app store from the Omnibox, it would add an app in a new group. Instead reuse the current group</li>
  <li>When opening links from outside of Wavebox, give the option to open the link in a group or empty group rather than just apps</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.138.14.2)

---

<h3>Version 10.138.8 <span class="date">3/7/2025</span></h3>
<p>
  The previous 10.138 version (10.138.7) had a hard crash on launch that affected
  some installs with a specific set of desktop web apps installed. This version includes
  a fix for that crash. Here's the full set of release notes for Wavebox 10.138, in case
  you missed the previous update!
</p>
<ul>
  <li>Fix a hard crash on launch that affected some users with specific desktop web apps installed</li>
  <li>Update to Chromium 138.0.7204.97</li>
  <li>Add a customize Wavebox button to the new tab page</li>
  <li>Performance and memory improvements when using the side panel</li>
  <li>Fixes for sync & new users</li>
  <li>Fixes for the customize side panel</li>
  <li>Theme fixes when using custom colors</li>
  <li>Theme fixes for Wavebox Connect</li>
  <li>
    Split screen had some stability issues with the state not being propagated everywhere
    properly. Fix this and hopefully resolve a bunch of flakey split-screen related issues.
  </li>
  <li>Fix the switcher favicons sometimes incorrectly falling back to the default icon</li>
  <li>Opening external links through a rule would not automatically focus the main Wavebox window. Fix this.</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.138.8.2)

---

<h3>Version 10.138.7 <span class="date">2/7/2025</span></h3>
<ul>
  <li>Update to Chromium 138.0.7204.97</li>
  <li>Add a customize Wavebox button to the new tab page</li>
  <li>Performance and memory improvements when using the side panel</li>
  <li>Fixes for sync & new users</li>
  <li>Fixes for the customize side panel</li>
  <li>Theme fixes when using custom colors</li>
  <li>Theme fixes for Wavebox Connect</li>
  <li>
    Split screen had some stability issues with the state not being propagated everywhere
    properly. Fix this and hopefully resolve a bunch of flakey split-screen related issues.
  </li>
  <li>Fix the switcher favicons sometimes incorrectly falling back to the default icon</li>
  <li>Opening external links through a rule would not automatically focus the main Wavebox window. Fix this.</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.138.7.2)

---

<h3>Version 10.137.12 <span class="date">18/6/2025</span></h3>
<ul>
  <li>Update to Chromium 137.0.7151.120</li>
  <li>Update other dependencies</li>
  <li>Usability fixes when creating link open rules</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.137.12.2)

---

<h3>Version 10.137.11 <span class="date">11/6/2025</span></h3>
<ul>
  <li>Update to Chromium 137.0.7151.104</li>
  <li>Fix the link opener rules sometimes not matching when a site includes a www. prefix</li>
  <li>Performance and memory improvements when using the side panel</li>
  <li>Fixes for sync & new users</li>
  <li>Fix the switcher favicons sometimes incorrectly falling back to the default icon</li>
  <li>Opening external links through a rule would not automatically focus the main Wavebox window. Fix this.</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.137.11.2)

---
[More versions](https://wavebox.io/changelog/stable/)