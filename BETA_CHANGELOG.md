<h3>Version 148.2.3 beta <span class="date">1/5/2026</span></h3>
<ul>
  <li>Fixed a connection leak in Slack that could exhaust resources during reconnects on unstable networks</li>
  <li>Customized spaces are now preserved when their last group, app or tab is removed</li>
  <li>Added an 'Add group' option to the webdock divider context menu</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.2.3.3)

---

<h3>Version 148.2.1 beta <span class="date">30/4/2026</span></h3>
<ul>
  <li>Update to Chromium 148.0.7778.96</li>
  <li>Fixed a Windows update issue that could leave a corrupt database after restart</li>
  <li>Stability fixes for the Slack integration</li>
  <li>Slack emoji rendering now supports extended icon codes and skin tone variants</li>
  <li>Fixed custom notification sound uploads silently failing to appear in the sound list</li>
  <li>Fixed dragging a tab branch between groups sometimes leaving stale references</li>
  <li>Replaced Group &amp; App icons are now cleaned up properly instead of accumulating in local storage</li>
  <li>Fixed an issues that prevented spacial-navigator search fallback from finding the active tab</li>
  <li>Moving apps or groups to the end of a list now behaves consistently</li>
  <li>Fixes for crash uploads and Brainbox backups</li>
  <li>Various stability and reliability improvements from internal fuzzing</li>
  <li>Various stability and code-quality improvements</li>
  <li>Update dependencies</li>
  <li>UI tweaks</li>
  <li>Release test</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.2.1.3)

---

<h3>Version 148.1.63 beta <span class="date">27/4/2026</span></h3>
<ul>
  <li>Update to Chromium 148.0.7778.56</li>
  <li>Added account sign-in recovery option to the sync join password dialog</li>
  <li>~2x faster cross-process messaging</li>
  <li>Performance fixes for integrated apps</li>
  <li>Updated the Outlook integration to mac additional url configurations</li>
  <li>Improved the Slack notification emoji parsing</li>
  <li>Added a flag to restore colored fill backgrounds on group icons</li>
  <li>Fixed a crash on macOS when entering or exiting fullscreen mode</li>
  <li>PWAs are now correctly restored when importing from a backup</li>
  <li>Fixed extension restore during snapshot import now correctly handling locally installed extensions</li>
  <li>Fixed split tabs not updating their title, favicon, URL, or audio indicator in real time</li>
  <li>Fixed the correct app now being selected when closing a tab, respecting the last-active app</li>
  <li>Fixed tabs in the tab strip failing to shrink correctly in scroll modes</li>
  <li>Fixed trackpad scrolling across the tab strip and restored overflow indicators</li>
  <li>Fixed the scroll shadow not appearing at the end of the tab strip</li>
  <li>Fixed an issue on macOS where fullscreen mode could show a black bar when the toolbar is hidden</li>
  <li>Fixed the privacy settings page not displaying correctly</li>
  <li>Various UI polish and visual fixes</li>
  <li>Brainbox updates and fixes</li>
  <li>Various internal type-safety and code-quality improvements across the codebase</li>
</ul>


[Downloads](https://wavebox.io/download/release/148.1.63.3)

---

<h3>Version 148.1.59 beta <span class="date">20/4/2026</span></h3>
<ul>
    <li>Update Chromium to 148.0.7778.40</li>
    <li>Fix the webdock hiding behind the signed out panel in some configurations</li>
    <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/148.1.59.3)

---

<h3>Version 147.1.54 beta <span class="date">16/4/2026</span></h3>
<p>
  Notice something different about the numbers? We're
  dropping the '10' prefix from our versioning.
</p>
<p>
  Previously, today's update would have been <i>10.147.55</i>. For a
  bunch of boring technical reasons, we're switching to a
  <i>[chromium major].version.version</i> format, which makes
  this release <i>147.1.54</i>. This new setup actually allows us
  to ship Chromium updates to our beta channel with less friction!
</p>
<p>
  So, it might look like we just skipped ahead 137 versions overnight.
  If you're impressed by that, then yes, we are coding time-travelers 🛸.
  If not, it's just a naming tweak to keep things running smoothly.
</p>
<ul>
  <li>Update to Chromium 147.0.7727.102</li>
  <li>Update dependencies</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/147.1.54.3)

---

<h3>Version 10.147.47 beta <span class="date">16/4/2026</span></h3>
<ul>
  <li>Update to Chromium 147.0.7727.102</li>
  <li>Update dependencies</li>
  <li>UI fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.147.47.3)

---

<h3>Version 10.147.44 beta <span class="date">8/4/2026</span></h3>
<ul>
  <li>Update to Chromium 147.0.7727.56</li>
  <li>Bugfix</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.147.44.3)

---

<h3>Version 10.147.43 beta <span class="date">8/4/2026</span></h3>
<ul>
  <li>Update to Chromium 147.0.7727.56</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.147.43.3)

---

<h3>Version 10.147.41 beta <span class="date">7/4/2026</span></h3>
<p>
  <b>⚠️ Windows users on 10.147.9 or 10.147.12 beta</b> — the auto-update for this version will appear
  to download and apply, but when you click install the app will quit without updating. Please
  download and install this version manually from
  <a href="https://wavebox.io/beta">https://wavebox.io/beta</a>.
</p>
<ul>
  <li>Less intrusive update notifications</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.147.41.3)

---

<h3>Version 10.147.12 beta <span class="date">2/4/2026</span></h3>
<ul>
  <li>Crash fix for certain locales</li>
  <li>Add options to customize the height of the title bar in the main Wavebox window</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.147.12.3)

---
[More versions](https://wavebox.io/changelog/beta/)