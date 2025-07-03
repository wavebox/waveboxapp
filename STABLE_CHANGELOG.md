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

<h3>Version 10.137.9 <span class="date">4/6/2025</span></h3>
<ul>
  <li>Update to Chromium 137.0.7151.69</li>
  <li>Add an option to delay the opening of next tooltips</li>
  <li>Fixed an issue where adding a new pinned item would fail to link it back to the app</li>
  <li>Fix an issue with diagnostics failing to generate everything</li>
  <li>Fix not being able to share dashboards from the share menu</li>
  <li>Performance and stability fixes for Wavebox connect</li>
  <li>Fix a hard crash that could happen when opening an app</li>
  <li>Fix an issue where new users could have the incorrect configuration on first launch</li>
  <li>Sleep exclusions used to match the url exactly, not accounting for "www." at the beginning. They now match this more gracefully.</li>
  <li>Fix the link opener rules sometimes not matching when a site includes a www. prefix</li>
  <li>Upgrade our UI to React 19, which includes several performance improvements and new features</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.137.9.2)

---

<h3>Version 10.136.20 <span class="date">2/6/2025</span></h3>
<ul>
  <li>Chromium 136.0.7103.149</li>
  <li>Fix a usability issue when opening links from outside Wavebox and using spaces webdock</li>
  <li>Multiple bug fixes from auto-reported errors</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.136.20.2)

---

<h3>Version 10.136.15 <span class="date">15/5/2025</span></h3>
<ul>
  <li>Update to Chromium 136.0.7103.114, which includes some important security fixes</li>
  <li>Fix regression with linux password saving</li>
  <li>Fix for right-clicking dashboard shortcuts auto-launching the shortcuts on Windows</li>
  <li>Update dependencies</li>
  <li>Fix a hard crash when switching between versions</li>
  <li>Speculative fix for a crash on startup</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.136.15.2)

---

<h3>Version 10.136.12 <span class="date">14/5/2025</span></h3>
<ul>
  <li>Fix regression with linux password saving</li>
  <li>Fix for right-clicking dashboard shortcuts auto-launching the shortcuts on Windows</li>
  <li>Update dependencies</li>
  <li>Fix a hard crash when switching between versions</li>
  <li>Speculative fix for a crash on startup</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.136.12.2)

---

<h3>Version 10.136.8 <span class="date">8/5/2025</span></h3>

<ul>
  <li>Update to Chromium 136.0.7103.93</li>
  <li>Add tooltips as an option for focus mode</li>
  <li>Fix a fullscreen issue on macOS where it incorrectly show parts of the UI when watching videos</li>
  <li>Fix duplicate tab in new window</li>
  <li>Fix Wavebox flow failing to start in Wavebox</li>
  <li>Fix a race condition when making calls to other processes resulting in sporadic errors</li>
  <li>Stability fixes for socket connections</li>
  <li>Fix a crash reported by some users</li>
  <li>Performance fix for some sites that could see high CPU usage</li>
  <li>Update dependencies</li>
  <li>Fix a permission check that was too strict and prevented some file upload dialog boxes from opening</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.136.8.2)

---

<h3>Version 10.135.21 <span class="date">24/4/2025</span></h3>
<ul>
  <li>Update to Chromium 135.0.7049.115</li>
  <li>Fix a hard crash some users reported when launching Wavebox or signing into Google</li>
  <li>Fix a hard crash when installing extensions during sync or profile restore</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.135.21.2)

---
[More versions](https://wavebox.io/changelog/stable/)