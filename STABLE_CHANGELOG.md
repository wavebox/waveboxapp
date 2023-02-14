<h3>Version 10.110.18 <span class="date">14/2/2023</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>Add support for Ctrl/Shift/Alt+clicking "Move tab into a new window" to duplicate the tab rather than pop it out</li>
  <li>Add "Wake all tabs in window" to the tab context menu in secondary windows</li>
  <li>Add support for Alt+Clicking on tabs and apps to place them in split screen mode</li>
  <li>Add a new link open modifier (Ctrl/Shift/Alt+click) that allows links to be opened in split screen</li>
  <li>Add a button to Settings > Advanced to restart the Wavebox masterclass</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update Chromium to 110.0.5481.97</li>
  <li>UI fixes and helpers</li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix widget pop out urls not being clickable</li>
  <li>Fix an issue where popping out a tab that's in deep sleep would fail</li>
  <li>Fix opening external links across profiles not working</li>
  <li>Fix some emojis on Windows being offset</li>
  <li>Fix an issue where popped out apps could fall asleep too readily</li>
  <li>
    Fix an issue on macOS where dragging images when filename extensions are
    sometimes hidden in finder would result in a sites detecting binary file/invalid
    file format instead of an image
  </li>
</ul>


[Downloads](https://wavebox.io/download/release/10.110.18.2)

---

<h3>Version 10.110.12 <span class="date">8/2/2023</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>Add support for macOS Touch ID and Windows Hello as options when using the Wavebox privacy lock. If you already have the lock enabled, you'll need to change your lock settings to use biometrics</li>
  <li>It's now possible to move apps into new windows and then bring them back again, this is really helpful if you have multiple monitors! To split the app into a new window, either use the right-click menu or Ctrl+click on the app</li>
  <li>A brand new faster app store that makes it easier to find your apps and create your own custom ones</li>
  <li>Tweaks to the controls at the bottom of the sidebar, including a new settings pop-out with a bunch of useful things!</li>
  <li>New Admin Portal that makes it easier to manage your Wavebox subscription, profiles, templates, and teams</li>
  <li>Add Masterclass tour to help new Wavebox users get started after downloading Wavebox (Pro tip, if you want to take a look, hover over the settings icon 👍)</li>
  <li>Add 'Send to group' to the right-click menu, when right-clicking on a link</li>
  <li>Generate a 'URL link' for each widget so you can open them from another app. You can find this under the settings cog</li>
  <li>Add support for middle mouse clicking a group, this sleeps all apps and tabs within the group</li>
  <li>Add support for Shift/Ctrl/Cmd+clicking links in Smart Notes</li>
  <li>Add an option to disable sleep on a specific tab via the right-click menu</li>
  <li>Add support for using the left/right arrow keys in the app switcher</li>
  <li>Add a keyboard shortcut to open a tab in the active group rather than the default (which is active service). This shortcut is unmapped by default but can be set under Settings > Keyboard Shortcuts > Opening apps & tabs</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 110.0.5481.77</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix an issue where the sidebar could sometimes become hidden behind the tab</li>
  <li>Stability fixes</li>
  <li>In certain locales, focus mode wouldn't display AM/PM in the time until, fix this</li>
<li>Fix an issue with sync where it could become stuck</li>
<li>Fix clicking on app settings only taking you as far as the group</li>
<li>Fix an issue on macOS where CMD+W wouldn't always close the tab when search was open</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.110.12.2)

---

<h3>Version 10.109.14 <span class="date">26/1/2023</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>Add a dialog prompt when creating a cookie container</li>
  <li>Add an embedded iframe widget to workspaces</li>
  <li>Add support for Ctrl/Cmd+clicking links in workspaces and opening those links in background tabs</li>
  <li>
    Add support for opening urls in identities and apps from the command line. You can find
    information about this by enabling Settings > Advanced > Command line hints and checking
    the settings of an app or cookie container.
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 109.0.5414.119</li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
  <li>UI fixes</li>
  <li>Improve icon refetching when Wavebox starts in an offline state, or is unable to load icons</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix the tooltip delay not being changeable</li>
  <li>Fixes for Gmail icon fetching</li>
  <li>Fix an issue where clicking a notification from a sleeping app, would launch the app in a new window</li>
  <li>Fix the app color ring setting as it's state wasn't always respected</li>
  <li>Fix apps being unable to set their sound back to the default</li>
  <li>Under certain configurations the tabstrip would fall into its own toolbar unnecessarily, fix this</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.109.14.2)

---

<h3>Version 10.109.8 <span class="date">11/1/2023</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>
    Brand new settings UI
    <ul>
      <li>
        Settings diagrams. These replace the sea of toggle switches
        and give in-situ feedback and visual cues as to what each
        setting does
      </li>
      <li>Overhauled search, making it faster, clearer and more reliable</li>
      <li>Faster loading</li>
      <li>Loads of other fixes and tweaks to make settings feel less daunting</li>
      <li>An option to bulk apply sleep settings to all apps</li>
      <li>
        Add a color picker to the appearance options so you can pick a Wavebox color
        quickly change the look and feel of Wavebox
      </li>
    </ul>
  </li>
  <li>
    Updates to focus mode
    <ul>
      <li>Add an option to display which groups & apps are in the active focus mode</li>
      <li>Add an option to sleep groups when entering focus mode</li>
    </ul>
  </li>
  <li>New Google Calendar widget for workspaces</li>
  <li>Add wake all apps to the group right-click menu</li>
  <li>Add "last app" as an option to the "choose what to pick after closing a tab" flag</li>
  <li>Add an option to show/hide the border on individual apps as well as groups</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 109.0.5414.87</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix an issue where discord could keep logging you out</li>
  <li>Stability fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.109.8.2)

---

<h3>Version 10.108.19 <span class="date">20/12/2022</span></h3>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 108.0.5359.124</li>
  <li>Update dependencies</li>
  <li>
    Make the collapsed titlebar a little taller on Windows when Wavebox is
    maximized. This gives enough drag area to drag Wavebox out of maximized state
  </li>
  <li>Make the audio playing/muted icon on tabs clickable</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix a rouge blank toolbar on some Linux configurations where all titlebar buttons are hidden and the system titlebar is used</li>
  <li>Fix the omnibox being mispositioned on macOS when the titlebar is collapsed</li>
  <li>Stability fixes</li>
  <li>Stability fixes for password sync</li>
  <li>When editing a tab name, the edit field would sometimes fail to populate. Fix this</li>
  <li>
    Fix an issue on macOS, when in fullscreen the titlebars could become
    hidden whilst existing the privacy lock
  </li>
  <li>
    Desktop web apps that displayed unread activity and unread counts would
    favor showing the activity over the count. This was the wrong way around.
  </li>
</ul>

[Downloads](https://wavebox.io/download/release/10.108.19.2)

---

<h3>Version 10.108.14 <span class="date">5/12/2022</span></h3>
<ul>
  <li>
    A more compact titlebar & address bar. You can try it out by disabling
    Settings &gt; UI &gt; Full-height titlebar
  </li>
  <li>Upgrade to Chromium 108.0.5359.94</li>
  <li>Stability fixes</li>
  <li>Fix an issue with Discord signing out under certain configurations</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.108.14.2)

---

<h3>Version 10.107.18 <span class="date">28/11/2022</span></h3>
<ul>
  <li>Update to Chromium 107.0.5304.122</li>
  <li>UI updates</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>`
</ul>

[Downloads](https://wavebox.io/download/release/10.107.18.2)

---

<h3>Version 10.107.16 <span class="date">21/11/2022</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    New split-screen controls
    <ul>
      <li>
        New split-screen button in the titlebar of Wavebox windows, providing faster access to
        split-screen controls and status
      </li>
      <li>
        You can now split an app across groups as well as just within groups, so now if you have
        one app you want to always keep on screen you can do this
      </li>
      <li>Fix the split-screen dragger disappearing when splitting right and bottom</li>
      <li>Simplify the split-screen behaviour by removing the apps & tabs mode</li>
      <li>Ensure there are always two apps/tabs open when entering split mode</li>
      <li>Add keyboard shortcuts for changing split screen across the window (as opposed to just groups)</li>
    </ul>
  </li>
  <li>New Redesigned icon picker</li>
  <li>Add support for moving sleeping tabs to other groups</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update the Chromium 107.0.5304.110</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
  <li>Update the base url for Outlook to remove the white bar in the desktop web app</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Cookie containers didn't sync custom icons, fix this</li>
  <li>Under certain configurations the tooltips failed to stay open in the explorer webdock, fix this</li>
  <li>Fix an issue where the main window could be closed on macOS and it was difficult to get it back</li>
  <li>Fix being unable to remove tabs in certain circumstances</li>
  <li>Fix a crash on workspaces</li>
  <li>Fix a crash when removing yourself from a team</li>
  <li>UI fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.107.16.2)

---

<h3>Version 10.107.10 <span class="date">2/11/2022</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    New Ctrl+Tab switcher. Hold Ctrl+Tab to switch between your most recently used
    apps & tabs.
  </li>
  <li>New styling and helpers for the global search</li>
  <li>
    On Windows add a button to create a shortcut for a Wavebox profile so it can be launched
    directly from the desktop
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 107.0.5304.87</li>
  <li>Update dependencies</li>
  <li>
    When using the explorer webdock it was pretty hard to keep group popovers
    open as you'd hover over the + button to move your mouse to them. Fix this.
  </li>
  <li>
    Disable webdock hiding when rounded webviews are disabled. This wasn't a supported
    configuration and you could quite easily end up with a hidden webdock and no way
    to get to it.
  </li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix the stats widget and downloads always showing file sizes as 0</li>
  <li>Integrity fix for extension sync</li>
  <li>Fix password sync failing to update password</li>
  <li>Fix the maximized window state sometimes not being remembered on restart</li>
  <li>Fix parts of the UI becoming unresponsive when dragging saved items outside of a tooltip</li>
  <li>Fix a crash in the keyboard shortcut settings UI</li>
  <li>UI fixes</li>
  <li>Stability fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.107.10.2)

---

<h3>Version 10.106.8 <span class="date">12/10/2022</span></h3>
<ul>
  <li>Update to Chromium 106.0.5249.119</li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
  <li>When creating a collection widget from a window, tab ordering was not respected. Fix this.</li>
  <li>UI Tweaks</li>
  <li>Add "Open in Cookie Container" to context menus</li>
  <li>Fix an issue where tabs could be left in the stores with no parent</li>
  <li>Speculative fix for the main window not restoring after a restart</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.106.8.2)

---
[More versions](https://wavebox.io/changelog/stable/)