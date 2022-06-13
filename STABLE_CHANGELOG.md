<h3>Version 10.102.21 <span class="date">13/6/2022</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>Add an option to auto-wakeup apps in the background. You can find this by right-clicking on an app</li>
  <li>
    Add an experimental option to show tabs along the top of Desktop Web Apps.
    This can be enabled, by right-clicking on the app > Settings &
    enabling the "Tabstrip"
  </li>
  <li>
    Add an option to keep notifications on screen, until dismissed (Integrated apps only).
    This can be enabled under app settings > "Keep notifications on-screen until dismissed"
  </li>
  <li>
    Updates to the Quick Switch
    <ul>
      <li>Add sections when searching to help you locate what you're looking for</li>
      <li>Add an option to change the order of the search results. Right click on the section titles to change</li>
      <li>Add group results into the search results</li>
    </ul>
  </li>
  <li>
    Link engine updates & fixes
    <ul>
      <li>
        Add an option to open links across cookie container, when opening links alongside their matched app.
        These rules can be created in the customizer, when using "Open in tab as matched app"
      </li>
      <li>
        There are some edge cases where links would incorrectly open cross cookie container, this would
        cause an undefined behaviour (i.e. tabs would appear to reload, or reset to their homepage). Capture
        this edge case and handle it more uniformly
      </li>
    </ul>
  </li>
  <li>Add a prompt before merging two groups</li>
  <li>Add an option to name your app when using the "Boost this tab" wizard</li>
  <li>When boosting a tab, if the app supports it, give the option to use the url from the tab as the base url</li>
  <li>When right-clicking on a link in a page, add an option to create a new link open rule</li>
  <li>Add keyboard shortcuts to toggle between just the tabs as opposed to the apps in the main window.</li>
  <li>Make the history and saved items in the tooltips open as a new tab when holding the shift key</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 102.0.5005.115</li>
  <li>Update dependencies</li>
  <li>Tidy up the keyboard shortcut settings where there are shortcuts that map from 1-9</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>
    Split screen fixes
    <ul>
      <li>Changing the mode via the in page right-click menu, would revert the change shortly after. Fix this</li>
      <li>Add the unsplit option to context menus for the secondary split tab</li>
      <li>Fix the incorrect split mode sometimes being reported in right-click menus</li>
    </ul>
  </li>
  <li>Re-opening a tab via Ctrl/Cmd+Shift+T was failing to keep the tab in the main Wavebox window. Fix this</li>
  <li>Sometimes when dragging apps in the sidebar (depending on the direction of drag), they would land in the wrong position, fix this</li>
  <li>Fix the text color in the titlebar for Windows</li>
  <li>When setting the new tab url, this was only taking into account when pressing the home button. Change it so the homepage actually changes 👍</li>
  <li>Fix widgets sometimes failing to popout</li>
  <li>Fix an issue on Windows where PowerToys and FancyZones could resize popup windows such as the quick switch</li>
  <li>Fix not being able to enter color codes in the group & app context menus</li>
  <li>Fix not being able to remove an ignored password site in settings</li>
  <li>Groups with no apps, would sometimes place the tab toolbar in it's own toolbar, with an empty one above it. Fix this</li>
  <li>Stability fixes</li>
  <li>Usability fixes</li>
</ul>


**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.102.21.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.102.21.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.102.21.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.102.21.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.102.21-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.102.21-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.102.21-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.102.12 <span class="date">25/5/2022</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>Add the password manager into the main Wavebox settings</li>
  <li>Add DNS over HTTPS settings into the main Wavebox settings</li>
  <li>Add dark mode support to some of the Wavebox dialogs</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 102.0.5005.61</li>
  <li>Update dependencies</li>
  <li>Stability & performance fixes</li>
  <li>UI Tweaks</li>
  <li>Move Wavebox update settings into the about section</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix opening external links in new tabs, heading out to a new window in some configurations</li>
  <li>Fix the keyring deprecation warning on Ubuntu 22</li>
  <li>Fix Smart notes not adding highlighted text correctly</li>
</ul>

**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.102.12.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.102.12.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.102.12.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.102.12.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.102.12-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.102.12-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.102.12-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.101.21 <span class="date">12/5/2022</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>Add an option to exclude pinned tabs from the open tab counts. This can be changed under Settings > Tabs & Windows</li>
  <li>Add support for picking search results with the tab key in the quick switch</li>
  <li>Add a keyboard shortcut to toggle between pre-set split screen sizes. This can be configured under Settings > Keyboard Shortcuts</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Upgrade to Chromium 101.0.4951.64</li>
  <li>Improve icon quality in the sidebar</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix an issue with split screen, where one of the tabs could fail to resize and display under the other</li>
  <li>Fix an issue on macOS where desktop web apps would fail to launch</li>
  <li>Fix an issue where Wavebox could start minimized and then it was difficult to get the main window opened</li>
  <li>Fix styling issue when using certain themes and getting the signed out dialog</li>
  <li>Fix an issue where switching Slack workspaces would fail and you'd essentiall get stuck in a single workspace</li>
  <li>Fix an issue when adding multiple ClickUp or Feedly apps to the same cookie container</li>
  <li>Fix an issue where new tab pages could be blank</li>
  <li>Data integrity fixes</li>
  <li>Performance fixes</li>
</ul>


**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.101.21.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.101.21.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.101.21.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.101.21.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.101.21-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.101.21-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.101.21-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.101.16 <span class="date">4/5/2022</span></h3>
<p>
  This version contains important updates and fixes for Wavebox
</p>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 101.0.4951.54</li>
  <li>Update dependencies</li>
  <li>Add boost tab into right-click context menu</li>
  <li>Add "Focus the main Wavebox window" option to the main burger menu</li>
  <li>When using the switcher, if you just hit enter after searching, auto-select the first item in the list</li>
  <li>In settings, make weblink accounts include their resolved display name</li>
  <li>Tweaks to the omnibox behaviour when typing urls on the new group/tab sleeping ui</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixes for tab boosting</li>
  <li>Fix some Slack accounts no longer receiving updated badges & notifications</li>
  <li>Fix an issue where collapsed groups would still show the unread badge when it was disabled in settings</li>
  <li>UI fixes</li>
  <li>Stability fixes</li>
</ul>

**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.101.16.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.101.16.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.101.16.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.101.16.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.101.16-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.101.16-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.101.16-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.101.9 <span class="date">27/4/2022</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    Tab boosting! Although it was previously possible to convert a tab into an
    app, it only turned the tab into a weblink app. This meant that you often
    missed out on customizations and integrations specific for that app. Tab
    boosting fixes this, by boosting the tab into its fully blown tab counterpart.
    Also when you boost a tab it has a cool animation 😎.
  </li>
  <li>We successfully moved over to Stripe for subscription billing, so you can edit your payment details via the Stripe Portal 👍</li>
  <li>macOS, add View > Unsplit all apps & tabs to the main menu</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 101.0.4951.41</li>
  <li>Updates to the Gmail integration</li>
  <li>When launching an app from the webdock popup, don't auto expand this in the explorer webdock</li>
  <li>Improve the drop indicator when moving an item into a group</li>
  <li>Startup performance improvements</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Do not disturb/focus mode detection was siliently failing on some macOS configurations & versions, fix for this</li>
  <li>Fix the update checker running too frequently</li>
  <li>Fix a bunch of glitches with right-click menus</li>
  <li>Moving tabs from secondary windows back to the primary one didn't work. Fix this</li>
  <li>Fix the explorer webdock sometimes failing to render on first switch</li>
  <li>When removing an app we used to remove all it's child tabs. Now reparent them to the group</li>
  <li>Some favicons failed to show customized icons served by pages and instead showed the default favicon icon for the domain, fix this</li>
  <li>UI fixes</li>
</ul>


**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.101.9.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.101.9.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.101.9.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.101.9.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.101.9-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.101.9-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.101.9-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.100.12 <span class="date">19/4/2022</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>Add an option to set a different proxy config on each cookie container</li>
  <li>Add an option to ignore certain url patterns when sleeping tabs</li>
  <li>The option to change the new tab page had vanished, bring it back</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 100.0.4896.127</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fullscreen fix on macOS when moving from a fullscreen window, to a fullscreen video</li>
  <li>Fix tab titles sometimes not updating</li>
  <li>Cookie container fixes</li>
  <li>Fix for Outlook where it would fail to update when the machine comes back online.</li>
  <li>Opening links from the new tab page, would sometimes incorrectly eject the link into a new window. Fix this.</li>
  <li>On macOS, if "Always show toolbar in fullscreen" was disabled, the webview would overflow into the toolbars in fullscreen mode. Fix this.</li>
  <li>Other less important bugfixes and stability fixes</li>
</ul>


**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.100.12.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.100.12.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.100.12.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.100.12.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.100.12-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.100.12-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.100.12-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.100.7 <span class="date">10/4/2022</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>Add an option to Groups to set the default homepage when opening new tabs in that group</li>
  <li>Add the option to change the text size in the sidebar</li>
  <li>Add a cookie container picker when sharing a website using the share menu in the addressbar</li>
  <li>Add a keyboard shortcut to toggle the webdock modes (this can be configured under settings)</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update Chromium to 100.0.4896.75</li>
  <li>Update dependencies</li>
  <li>Performance improvements, including up to 25% faster launching of some Wavebox pages</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Temporarily disable floating webviews when devtools are open</li>
  <li>Adding Wavebox smart notes, connect or workspaces as a desktop web app would fail silently, fix this.</li>
  <li>Fix a compatability issue with the Norton Password Manager extension</li>
  <li>Tabs held in the top level group would fail to convert to apps as they assumed they'd have a parent app. 🤦 Fix this</li>
  <li>The active app & tab indicator was incredibly washed out when using dark themes. Make it brighter</li>
  <li>Stability fixes</li>
  <li>UI fixes</li>
</ul>

**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.100.7.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.100.7.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.100.7.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.100.7.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.100.7-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.100.7-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.100.7-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.99.50 <span class="date">30/3/2022</span></h3>
<p>
  Thanks to everyone who reported bugs in the release with the new UI earlier
  this week, this version contains a number of fixes.
</p>
<p>
  In case you missed version 10.99.46, it brings a brand new UI for
  Wavebox which is slicker and smoother so you can work faster and be more
  productive than ever when working on the web. The results include a mix
  of awesome design and usability improvements and time-saving new features.
  You can find out more information on our blog!
</p>

<p>Here's what's new in this version...</p>
<ul>
  <li>Add "New window" to the link opener engines</li>
  <li>Fix an issue, when in fullscreen the sidebar would be cut-off (macOS)</li>
  <li>Fix a style issue when rounded webviews is disabled</li>
  <li>Fix an issue where the the sidebar would cut off some styles at more than 80 pixels wide</li>
  <li>
    After the new UI update, right clicking on a group with just 1 app wouldn't
    show the "Open current page in new window" option. Fix this.
  </li>
  <li>
    Disable the "Send to workspace" option in the group context menu, when
    there's nothing in the group to send
  </li>
  <li>
    Fix an issue on macOS where the CMD+W behaviour was inconsistent in some configurations
  </li>
  <li>Stability fixes around locking & unlocking Wavebox</li>
  <li>Fix a CPU spike when opening the profile switcher</li>
  <li>Fix some notifications not showing the correct icons in Wavebox mini</li>
  <li>Style fixes</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
  <li>Update integrations</li>
</ul>


**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.99.50.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.99.50.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.99.50.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.99.50.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.99.50-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.99.50-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.99.50-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.99.46 <span class="date">28/3/2022</span></h3>
<h4>🆕 Our brand new UI for 2022</h4>
<p>
  The team at Wavebox HQ have been busy working on a brand new UI for
  Wavebox which is slicker and smoother so you can work faster and be more
  productive than ever when working on the web. The results include a mix
  of awesome design and usability improvements and time-saving new features.
  Here's a run-down of what's new!
</p>
<ul>
  <li>
    A brand new UI, which includes a unified tab strip & title bar, floating
    webviews with subtle rounded corners and shadows to make everything you're
    working on just pop
  </li>
  <li>
    Rebuilt from the ground up, a new drag & drop experience that among other things
    lets you drag tabs from toolbar straight into the webdock
  </li>
  <li>
    A brand new webdock rebuilt from the ground up...
    <ul>
      <li>
        The webdock now has two modes, the list webdock (just your icons) and the
        explorer webdock showing all your groups, apps and tabs on the left.
      </li>
      <li>
        Seamlessly toggle between the list webdock and explorer webdock anytime by using the
        button in the toolbar.
      </li>
      <li>
        Got lots of tabs to organize? No problem, easily create folders in the
        explorer webdock to keep all your stuff exactly where you need it.
      </li>
      <li>
        You're no longer bound by the regular, compact & tiny webdock sizes, just use the drag
        bar for as much (or as little) webdock as you like.
      </li>
      <li>
        Wish you could create a new group without an app? Just hit the new group button and
        start adding tabs.
      </li>
    </ul>
  </li>
  <li>
    Need the action buttons in the title bar, or prefer the extra space? You can now choose
    which icons you want and which you don't.
  </li>
  <li>
    Always hitting compose, or creating new documents? Just hover over your favorite apps
    and check out the fast actions (try it on Google Drive, or Gmail)!
  </li>
  <li>
    Quickly get to what's new just by hovering over your apps. We've added your unreads,
    notifications and more into the popovers to make them more useful.
  </li>
  <li>
    Customize your groups and apps directly from the right-click menus without ever needing
    to touch settings (try clicking on the name or color).
  </li>
  <li>
    Check out the new tab navigator. Cool little graphs and lists of what you've got running!
  </li>
  <li>
    Add Wavebox Smart Notes as an app.
  </li>
  <li>
    The dev team & ux team tell us that there are nearly a million other tweaks but we don't
    quite believe them. Or maybe we do. You decide!
  </li>
</ul>

<h4>And there's more...</h4>
<ul>
  <li>Update to Chromium 99.0.4844.84</li>
  <li>Update a bunch of other dependencies</li>
  <li>
    Some big performance improvements from the new UI update, especially for machines
    that have integrated graphics
  </li>
  <li>Add keyboard shortcuts for split/unsplit (this can be configured under settings)</li>
  <li>Opening wavebox://downloads in the main window could cause it to reload on startup, fix this</li>
  <li>Fix a crash in the main window</li>
  <li>Fix opening app settings not always scrolling the settings window to the correct location</li>
  <li>When opening external links, Wavebox wouldn't offer the last cookie container when it was the default. Fix this</li>
  <li>Tab counts would not show on groups with a single app, fix this</li>
  <li>Capture a case where a partial update could cause the app to stop launching</li>
</ul>


**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.99.46.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.99.46.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.99.46.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.99.46.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.99.46-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.99.46-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.99.46-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.99.14 <span class="date">7/3/2022</span></h3>
<ul>
  <li>
    In some configurations, Slack & Gmail could present duplicate
    notifications. Fix this.
  </li>
  <li>
    When using split-screen, it was not possible to change between screen
    positions, without exiting split screen. Fix this.
  </li>
  <li>
    Opening a tab in a new cookie container would result in it reverting
    back to the original container. Fix this.
  </li>
  <li>
    When an app fell asleep, clicking on the app in the webdock/toolbars
    wouldn't wake it up. We like it when things fall asleep because it saves
    resources, but we also like it when they wake up when they're needed. So
    we added some new coffee brewing code that wakes it up ☕
  </li>
  <li>Patch an issue with the extensions api</li>
  <li>Performance & stability fixes</li>
  <li>Update dependencies</li>
</ul>

**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.99.14.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.99.14.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.99.14.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.99.14.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.99.14-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.99.14-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.99.14-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---
[More versions](https://wavebox.io/changelog/stable/)