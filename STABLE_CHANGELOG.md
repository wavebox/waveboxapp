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

<h3>Version 10.99.11 <span class="date">2/3/2022</span></h3>
<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 99.0.4844.51</li>
  <li>Update dependencies</li>
  <li>
    Add the option to open links using the opener engine. This can be
    done with Ctrl/Shift/Alt/Cmd+Click and can be configured under
    settings -> Link Opening
  </li>
  <li>Add support for split-screen calls for extensions</li>
  <li>Add enable/disable all extensions to the extensions page</li>
  <li>Stability fixes</li>
  <li>Performance improvements</li>
  <li>UI tweaks</li>
  <li>Better error handling</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix the cookie container indicator not always updating</li>
  <li>Fix an issue with pinned workspaces not remembering the last workspace</li>
  <li>
    Desktop web apps would take the theme color from the hosted page when set,
    rather than from the color set in settings. Fix this so it always takes the
    expected color.
  </li>
  <li>
    When moving an app to a new group, it would lose its cookie container and only
    partially switch to the moved tab. Fix both of these.
  </li>
  <li>
    Fix an issue where under some configurations Wavebox would incorrectly
    change to touch UI mode
  </li>
  <li>
    Fix an issue where sometimes changing the tab title would fail to update
    until after a restart
  </li>
  <li>Fix Wavebox failing to take focus when clicking the menu bar icon on macOS</li>
  <li>Fix for the telegram unread count</li>
  <li>The Gmail inbox type was not being picked up automatically after adding the Gmail app. Fix this</li>
</ul>

**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.99.11.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.99.11.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.99.11.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.99.11.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.99.11-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.99.11-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.99.11-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.98.34 <span class="date">21/2/2022</span></h3>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 98.0.4758.102</li>
  <li>Update dependencies</li>
  <li>Performance improvements from our internal fuzzing</li>
  <li>Compatibility improvements for extensions that connect to native applications</li>
  <li>Add a floating drawer icon to workspaces that have a hidden titlebar</li>
  <li>Add some additional info to diagnostics to help us diagnose split screen issues</li>
  <li>Add a keyboard shortcut (Ctrl/Cmd+Shift+C) to copy the current url</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Split screen would sometimes not respect the setting after a reboot, fix this</li>
  <li>Under some circumstances, the resize handle for split screen would not work after opening a tab, fix this</li>
  <li>Fixes for the Clickup integration</li>
  <li>Fix an issue where Wavebox would sometimes pick a random app after restarting</li>
  <li>Stability improvements</li>
  <li>Fix a crash when fetching the last used tab</li>
  <li>Better error handling</li>
  <li>Fix some sites being unable to open links in the default browser</li>
  <li>Fix Skype being unable to open links in the default browser, when the default browser setting is only set on the Skype app</li>
  <li>Fix an issue where some tab icons would appear broken</li>
  <li>Fix a crash when editing an installer in the collection widget</li>
  <li>Fix some issues around closing windows via a keyboard shortcut</li>
  <li>Stability improvements</li>
  <li>Fix sorting for cloud profiles</li>
</ul>

**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.98.34.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.98.34.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.98.34.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.98.34.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.98.34-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.98.34-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.98.34-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---

<h3>Version 10.98.9 <span class="date">7/2/2022</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>Add Feedly as an integrated app 🎉</li>
  <li>Add an option to hide the titlebar in workspaces</li>
  <li>Add a button to app settings to the set the icon to be the current page icon (Weblink apps only)</li>
  <li>Add support for AppImage on Linux</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update Chromium to 98.0.4758.80</li>
  <li>Update dependencies</li>
  <li>
    If you've enabled Wavebox UI2 under Settings, Advanced, Flags then...
    <ul>
      <li>UI2 new drag-drop interface</li>
      <li>UI2 fix the signed out panel bleeding over the tabstrip</li>
      <li>UI2 the sidebar could be resized when locked, fix this</li>
      <li>UI2 deleting an empty group would leave you in an undefined state, fix this</li>
    </ul>
  </li>
  <li>
    Promote the following settings from flags
    <ul>
      <li>Use glass effect for some user interface elements</li>
      <li>Connect micro sidebar</li>
      <li>Prompt before closing multiple tabs</li>
    </ul>
  </li>
  <li>Add a timestamp to notifications in Wavebox mini & workspaces</li>
  <li>
    The unified unread widget would only report unread items that were specifically
    reported by integrations, meaning some unread counts and activities would go
    unreported in the widget. It now also includes counts and activities where
    the app doesn't explicitly report unread items.
  </li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>
    WhatsApp was sometimes reporting messages were sent 52 years ago. Although it's
    impressive that people in 1970 were able to use WhatsApp it wasn't right, so we fixed it.
  </li>
  <li>When opening external links in Wavebox, and picking the last used window, also inherit the cookie container</li>
  <li>Split screen would not work on macOS in fullscreen mode, fix this</li>
  <li>Split screen would not focus the tab on click on macOS, fix this</li>
  <li>Fix an issue where notifications would not open the correct window and app</li>
  <li>Fix an issue where notifications would open in the wrong cookie container</li>
  <li>Fix right clicking on a tab only working once</li>
  <li>Fix the icon picker on Cookie Containers</li>
  <li>Fix an issue where using keyboard shortcuts to change app would not bring keyboard focus back properly</li>
  <li>Fix style issue on workspaces</li>
  <li>Fixes for the Linux update process</li>
  <li>Fix an issue that could see you unable to start Wavebox</li>
  <li>Fix adding suggested apps from the Desktop Web Apps page</li>
</ul>

**Downloads**

* [macOS (Universal)](https://download.wavebox.app/stable/macuniversal/Install%20Wavebox%2010.98.9.2.dmg)
* [macOS (Intel)](https://download.wavebox.app/stable/mac/Install%20Wavebox%2010.98.9.2.dmg)
* [macOS (Apple Silicon)](https://download.wavebox.app/stable/macarm64/Install%20Wavebox%2010.98.9.2.dmg)
* [Windows](https://download.wavebox.app/stable/win/Install%20Wavebox%2010.98.9.2.exe)
* [Linux (DEB)](https://download.wavebox.app/stable/linux/deb/amd64/wavebox_10.98.9-2_amd64.deb)
* [Linux (RPM)](https://wavebox.io/download?platform=linux)
* [Linux (TAR)](https://download.wavebox.app/stable/linux/tar/Wavebox_10.98.9-2.tar.gz)
* [Linux (AppImage)](https://download.wavebox.app/stable/linux/appimage/Wavebox_10.98.9-2_x86_64.AppImage)
* [Linux (AUR)](https://aur.archlinux.org/packages/wavebox)

---
[More versions](https://wavebox.io/changelog/stable/)