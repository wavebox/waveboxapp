<h3>Version 10.106.5 <span class="date">3/10/2022</span></h3>
<ul>
  <li>Update to Chromium 106.0.5249.91</li>
  <li>Update dependencies</li>
  <li>Fix webdock apps not collapsing when the group is inactive</li>
  <li>Fix being unable to edit passwords</li>
  <li>Sync fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.106.5.2)

---

<h3>Version 10.106.2 <span class="date">28/9/2022</span></h3>
<ul>
  <li>Update to Chromium 106.0.5249.61</li>
  <li>Update dependecies</li>
  <li>Performance boost for UI components</li>
  <li>Performance boost on first launch</li>
  <li>Fix not being able to select elements using the keyboard in the switcher</li>
  <li>Fix highlight style not having enough contrast in the switcher</li>
  <li>Changing the Cookie container icon had stopped working, until now! (We fixed it)</li>
  <li>Stability fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.106.2.2)

---

<h3>Version 10.105.31 <span class="date">21/9/2022</span></h3>

<ul>
  <li>Update to Chromium 105.0.5195.125</li>
  <li>Update other dependencies</li>
  <li>More fixes for sync</li>
  <li>Fix Wavebox Connect colors not reflecting the main Wavebox theme</li>
  <li>Fix a crash when setting the Cookie Container on manifest 3 extensions</li>
  <li>Add a keyboard shortcut to toggle the side search (this can be setup under Settings > Keyboard shortcuts)</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.105.31.2)

---

<h3>Version 10.105.26 <span class="date">14/9/2022</span></h3>
<p>
  This release contains some bugfixes that were reported in the previous
  version. Thanks to everyone who has requested access to the new Wavebox sync, we're
  rolling this out in batches to ensure that it's working as expected 👍
</p>

<ul>
  <li>Fixes for extensions that use the chrome.identity API</li>
  <li>Fix the new tab workspace not being remembered after a restart</li>
  <li>Fix being unable to move an app in some instances</li>
  <li>Fix an edge case where sync would fail to reconnect properly</li>
  <li>Fix Smart Note sync needlessly always uploading images on the first run</li>
  <li>Rewrite the sync dispatcher to be more consistent and reslient</li>
  <li>Handle invalid password entries more consistently in sync</li>
  <li>Fix an issue where dragging sidebar items could move Wavebox into an undefined state and require a full restart to fix</li>
  <li>Update dependencies</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.105.26.2)

---

<h3>Version 10.105.22 <span class="date">12/9/2022</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>
    Wavebox sync is now available as part of labs. This allows you to keep
    more than one Wavebox install in sync, so you can have the same Groups,
    Apps, Bookmarks, Extensions, Smart notes, Passwords and more all in sync
    across multiple devices. To get started open Settings > Data & Sync and
    request access!
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Improvements when setting default search engine</li>
  <li>UI updates when opening links from outside of Wavebox</li>
  <li>UI updates for context menus</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Some links would fail to match through the link engine, when opened from google sites. Fix this.</li>
  <li>Fix memory leak with ClickUp</li>
  <li>Fix a hard crash that could bring Wavebox down completely</li>
  <li>Fixes for sharing passwords</li>
  <li>Fix the settings tooltip not being clickable</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.105.22.2)

---

<h3>Version 10.105.21 <span class="date">12/9/2022</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>
    Wavebox sync is now available as part of labs. This allows you to keep
    more than one Wavebox install in sync, so you can have the same Groups,
    Apps, Bookmarks, Extensions, Smart notes, Passwords and more all in sync
    across multiple devices. To get started open Settings > Data & Sync and
    request access!
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Improvements when setting default search engine</li>
  <li>UI updates when opening links from outside of Wavebox</li>
  <li>UI updates for context menus</li>
  <li>Reduce Wavebox's memory consumption by approximately 50MB 🤩</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Some links would fail to match through the link engine, when opened from google sites. Fix this.</li>
  <li>Fix memory leak with ClickUp</li>
  <li>Fix a hard crash that could bring Wavebox down completely</li>
  <li>Fixes for sharing passwords</li>
  <li>Fix the settings tooltip not being clickable</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.105.21.2)

---

<h3>Version 10.105.8 <span class="date">5/9/2022</span></h3>
<ul>
  <li>Update to Chromium 105.0.5195.102</li>
  <li>Update dependencies</li>
  <li>Fixes for removing and importing passwords</li>
  <li>Faster launching of Sticky Notes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.105.8.2)

---

<h3>Version 10.104.14 <span class="date">22/8/2022</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    New Side Search allows you to open the search page in a side panel
    after you start opening results. When Side Search is available, a
    prompt will appear in the address bar allowing you to open it.
    Side Search works when Google or You.com are set as your
    default search.
  </li>
  <li>Add You.com as a search provider</li>
  <li>Add search engine picker to the main Wavebox settings</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 104.0.5112.101</li>
  <li>Update dependencies</li>
  <li>Include add buttons in the explorer webdock</li>
  <li>Updates to the template sharing process</li>
  <li>Faster extension downloads, especially with larger extensions</li>
  <li>UI & Stability fixes</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix some dragging issue in the explorer webdock</li>
  <li>Fix not being able to add new passwords in settings</li>
  <li>Fix some UI styling when the devtools are open</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.104.14.2)

---

<h3>Version 10.104.12 <span class="date">22/8/2022</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>
    New Side Search allows you to open the search page in a side panel
    after you start opening results. When Side Search is available, a
    prompt will appear in the address bar allowing you to open it.
    Side Search works when Google or You.com are set as your
    default search.
  </li>
  <li>Add You.com as a search provider</li>
  <li>Add search engine picker to the main Wavebox settings</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 104.0.5112.101</li>
  <li>Update dependencies</li>
  <li>Include add buttons in the explorer webdock</li>
  <li>Updates to the template sharing process</li>
  <li>Faster extension downloads, especially with larger extensions</li>
  <li>UI & Stability fixes</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix some dragging issue in the explorer webdock</li>
  <li>Fix not being able to add new passwords in settings</li>
  <li>Fix some UI styling when the devtools are open</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.104.12.2)

---

<h3>Version 10.104.7 <span class="date">3/8/2022</span></h3>
<ul>
  <li>Update to Chromium 104.0.5112.81</li>
  <li>
    Wavebox had a secret disco mode! You could sometimes trigger this
    when interacting with Groups that are in split screen, and you'd see tabs
    switching every half a second or so. Fun as disco mode was, it was actually a
    bug and not a feature. So the Wavebox dev team have been party-poopers and
    shut the disco down.
  </li>
  <li>Dragging apps into the Webdock and creating a group was broken, fix this.</li>
  <li>
    Fix an issue where the "This tab is sleeping" or "Add your first tab to the group"
    screen would end up in error.
  </li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
  <li>First launch improvements</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.104.7.2)

---
[More versions](https://wavebox.io/changelog/stable/)