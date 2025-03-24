<h3>Version 10.134.18 beta <span class="date">24/3/2025</span></h3>
<ul>
  <li>Update to Chromium 134.0.6998.166</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.134.18.3)

---

<h3>Version 10.134.16 beta <span class="date">20/3/2025</span></h3>
<ul>
  <li>Update to Chromium 134.0.6998.118</li>
  <li>UI fixes and tweaks</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.134.16.3)

---

<h3>Version 10.134.15 beta <span class="date">13/3/2025</span></h3>
<ul>
  <li>Fix a hard crash that some users reported when downloading files from popup windows</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.134.15.3)

---

<h3>Version 10.134.14 beta <span class="date">13/3/2025</span></h3>
<ul>
  <li>Speculative fixes for hard crashes</li>
  <li>Fix Brainbox skills opening and reopening the side panel in some states</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.134.14.3)

---

<h3>Version 10.134.11 beta <span class="date">11/3/2025</span></h3>
<ul>
  <li>Update to Chromium 134.0.6998.89</li>
  <li>
    Move some of the Wavebox tools like Brainbox, Smartnotes & Connect out of
    the extension area and into the main toolbar (just to the side of the extension area).
    This gives more customization options and makes them easier to access.
  </li>
  <li>Saved items can now be opened in a new tab using Ctrl/Cmd+Click</li>
  <li>Performance improvements that will shave a little bit of memory usage</li>
  <li>Fix naming issue where importing from Chrome was actually called importing from Wavebox</li>
  <li>Under the hood improvements in prep for some upcoming features</li>
  <li>Usability fixes for the pin input when locking Wavebox</li>
  <li>Fix for the tray icon flickering and sometimes behaving erratically on Linux</li>
  <li>Remove and cleanup some now unused dependencies</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.134.11.3)

---

<h3>Version 10.134.6 beta <span class="date">5/3/2025</span></h3>
<ul>
  <li>Updated to Chromium 134.0.6998.45 for better speed, security, and latest web features.</li>
  <li>Build performance optimizations to keep things snappy.</li>
  <li>You can now pin downloads to the toolbar for quick access!</li>
  <li>Improvements to creating custom Wavebox apps.</li>
  <li>Styling fixes for side panels to keep the look and feel consistent with the theme.</li>
  <li>Various dark mode fixes, including improvements to the app switcher.</li>
  <li>Resolved an issue where the tab loading spinner would mysteriously vanish too soon.</li>
  <li>Improvements to the first-run experience to make onboarding smoother for new users.</li>
  <li>Developers can now fully customize HTML select elements for a more tailored UI experience.</li>
  <li>New dialog styling options for sites to make pop-ups look even better.</li>
  <li>Added support for weblocks, allowing sites to seamlessly update shared storage across tabs.</li>
  <li>Updated dependencies to keep everything running smoothly.</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.134.6.3)

---

<h3>Version 10.134.2 beta <span class="date">18/2/2025</span></h3>
<ul>
  <li>Update to Chromium 134.0.6998.15</li>
  <li>Add a slider to customize the space/group background tint behind the webdock</li>
  <li>Performance fixes when switching between split/non-split tabs</li>
  <li>Huge startup performance improvement, especially for setups that have lots of tabs (e.g. more than 500)</li>
  <li>Fix for extensions not always being locked to a single space when set through settings</li>
  <li>Fix Google sign-in for some extensions that use the Identity APIs (originally reported with Autoclicker)</li>
  <li>Fix the webdock auto-hiding when context menus are open</li>
  <li>Improve the quality of the macOS menu bar icon, especially on retina displays</li>
  <li>Remove some redundant items from the customize side panel</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.134.2.3)

---

<h3>Version 10.133.4 beta <span class="date">13/2/2025</span></h3>
<ul>
  <li>Update to Chromium 133.0.6943.99 which includes some important security fixes</li>
  <li>Fix an issue where the "Anywhere" link open rule would fail to match under some configurations and use cases</li>
  <li>UI updates when adding apps to make it easier to create custom apps from urls/wildcard searches</li>
  <li>Set the window title in Wavebox Mini to include the current profile when there's more than 1</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.133.4.3)

---

<h3>Version 10.133.3 beta <span class="date">5/2/2025</span></h3>
<ul>
  <li>Update to Chromium 133.0.6943.54.</li>
  <li>Speculative fix for notifications that do nothing when clicked.</li>
  <li>Add "Open in split tab" to the right-click menu.</li>
  <li>Add a "Skills" option to the Brainbox chat side panel that shows some skills that were previously only accessible from the right-click menu.</li>
  <li>Add an experimental customize side panel under the main burger menu &gt; more tools &gt; customize that allows you to change Wavebox theming and what's shown in the toolbar.</li>
  <li>Add the ability to pin frequently used Wavebox tools to the toolbar, like the password manager, bookmarks, etc.</li>
  <li>Update the styling of webdock groups that have no icon set and that contain only tabs, so they now show the tabs within them.</li>
  <li>Unify the favicon resolver so favicons always resolve to be the same throughout the app.</li>
  <li>When opening tabs from the main app burger menu, these tabs would always use the default space. They are now spatially aware and inherit from the currently active space.</li>
  <li>Make our builds more resilient so we can save some CPU-build time on failed builds.</li>
  <li>Fix an issue in Brainbox where using the "Open links" button would sometimes open duplicate tabs depending on the original text.</li>
  <li>Update the styling when searching for apps so it's easier to create your own.</li>
  <li>Change the default setting for new installs so that new users don't have the mixed space webdock view.</li>
  <li>Update dependencies.</li>
  <li>We've been continuing to broaden our support for the latest CSS standards with new support for the attr() function, open pseudo classes, scroll state container queries and more!</li>
  <li>This Wavebox brings new Web APIs for developers to use, which means no matter how advanced the site you visit, Wavebox has all the tools to support it. These APIs include new progress callbacks for animations, DOM state preserving moves and more enhancements for native popovers.</li>
  <li>Efficiency improvements when Wavebox has energy saver active. This suspends unused tab groups so they use less resources and preserve battery life so you can keep going.</li>
  <li>Rendering large blocks of code in Brainbox was becoming very CPU intensive. Add a fix to defer formatted rendering until the AI has finished generating</li>
  <li>Add options to customize what's show in the group grid views</li>
  <li>Updates for new users</li>
  <li>Slack was playing duplicate sounds for notifications, fix this</li>
  <li>Slack was not sending desktop notifications for channels that had their notification preference set to "Everything". Re-add support for this.</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.133.3.3)

---

<h3>Version 10.132.2 beta <span class="date">23/1/2025</span></h3>
<ul>
  <li>Update to Chromium 132.0.6834.111</li>
  <li>When moving tabs & using the Spaces webdock, auto update the tabs space on move</li>
  <li>Update dependencies</li>
  <li>Usability fixes for the profile popup</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.132.2.3)

---
[More versions](https://wavebox.io/changelog/beta/)