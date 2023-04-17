<h3>Version 10.112.11 <span class="date">17/4/2023</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    Save yourself a click or two with Wavebox site search. Type "Reddit" in the omnibox then
    tab to start searching reddit 👍
    <ul>
      <li>Search Reddit, Wikipedia, Twitter, Figma, Github, Amazon, Google Drive, Google Docs, Google Calendar & Gmail</li>
      <li>Add new site search rules under Settings > Search > Manage</li>
    </ul>
  </li>
  <li>
    Add an option to the link engine to allow opening links with the "New tab" or "New window"
    behavior to also set their cookie container.
  </li>
  <li>
    Add a flag to change what happens to unlinked tabs (usually opened by extensions). By
    default they're moved into a new window, but they can now be moved into the active group.
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 112.0.5615.121</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix an issue where a detached app could get confused about it's split screen status</li>
  <li>Themes were failing to sync for some users. Fix this</li>
  <li>Fix a silent crash in the network stack that would occur on launch</li>
  <li>
    Fix an issue where in some configurations a shared workspace would fail to connect
    to the stores, making it appear readonly
  </li>
  <li>Stability fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.112.11.2)

---

<h3>Version 10.112.6 <span class="date">3/4/2023</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>
    Add a shortcut to expand/collapse all dividers by shift+clicking
    the webdock mode button in the titlebar
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 112.0.5615.49</li>
  <li>Update dependencies</li>
  <li>Remove flow extensions from Wavebox when deleting them</li>
  <li>Improve Brainbox text extraction to better support iframes</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix being unable to set tab titles when the tabs are in deep sleep</li>
  <li>Fix a focus issue with some keyboard shortcuts</li>
  <li>Fix the "tabs from other devices" menu not being clickable when used with the explorer webdock</li>
  <li>Fix an issue where external link open rules were not synced correctly</li>
  <li>Fix an issue where apps could fail to load when switching to them</li>
  <li>Fixes for extension sync</li>
  <li>Stability fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.112.6.2)

---

<h3>Version 10.111.36 <span class="date">22/3/2023</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>
    Introducing Wavebox flow, a builder that helps you create extensions for Wavebox.
    You can get started via the plus button or by launching flow.wavebox.io in a new tab.
  </li>
  <li>Add a new chrome.waveboxApps extension API</li>
  <li>Add a new chrome.brainbox extension API</li>
  <li>Add more info to Brainbox settings</li>
  <li>Add a keyboard shortcut to open/toggle Brainbox</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 111.0.5563.110</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix non-pinned tabs sometimes appearing within the pinned tabs</li>
  <li>Fix an issue where broken widgets could not be removed from a workspace</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.111.36.2)

---

<h3>Version 10.111.32 <span class="date">16/3/2023</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>Give Brainbox more context about the current page that's open and the selected text</li>
  <li>Add table support for Brainbox</li>
  <li>Add Brainbox as a workspace widget</li>
  <li>Add a button to send a Brainbox conversation to a Smart note</li>
  <li>Add a text size setting to Brainbox</li>
  <li>Add a button to complete/restart the new user masterclass under Settings, Advanced</li>
  <li>Add more icons that can be used to customize your Wavebox profile avatar</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
  <li>UI fixes</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix a crash shortly after startup</li>
  <li>Fix a crash when trying to use Brainbox</li>
  <li>Fix some notifications (i.e. Telegram) not appearing in the notification widgets & Mini</li>
  <li>Fix some reliability issues with the Wavebox socket connection</li>
  <li>Fix an issue where right-clicking & removing a notification in Mini/Workspaces would remove the wrong one</li>
  <li>Fix a crash in the socket which could leave you unable to communicate with Brainbox</li>
  <li>Other fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.111.32.2)

---

<h3>Version 10.111.15 <span class="date">8/3/2023</span></h3>
<p>
  This version also includes a fix for a crash reported in version 10.111.14
</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    🧠 Brainbox is back, and it's bigger and better than ever, bringing the power of
    ChatGPT to every app and tab in Wavebox. In this first release of Brainbox V2,
    our powerful right-click writing skills are back—translate, summarize, draft a
    reply—plus there's a shiny-new sidebar UI. You can also manage, edit and create new
    skills via the new Admin Portal.
  </li>
  <li>Add a shortcut to cycle between apps that have unread notifications</li>
  <li>You can now easily add Wavebox apps directly from the omnibox</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 111.0.5563.64</li>
  <li>Update dependencies</li>
  <li>Add some helper info when sharing workspaces</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix more sidebar drag issues</li>
  <li>Stability fixes</li>
  <li>Fix an issue where opening a page as a desktop web app would close and fail</li>
  <li>Fix the custom tab name not being searchable in search</li>
  <li>Fix a styling issue with the active group indicator when the webdock was hidden</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.111.15.2)

---

<h3>Version 10.111.14 <span class="date">8/3/2023</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    🧠 Brainbox is back, and it's bigger and better than ever, bringing the power of
    ChatGPT to every app and tab in Wavebox. In this first release of Brainbox V2,
    our powerful right-click writing skills are back—translate, summarize, draft a
    reply—plus there's a shiny-new sidebar UI. You can also manage, edit and create new
    skills via the new Admin Portal.
  </li>
  <li>Add a shortcut to cycle between apps that have unread notifications</li>
  <li>You can now easily add Wavebox apps directly from the omnibox</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 111.0.5563.64</li>
  <li>Update dependencies</li>
  <li>Add some helper info when sharing workspaces</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix more sidebar drag issues</li>
  <li>Stability fixes</li>
  <li>Fix an issue where opening a page as a desktop web app would close and fail</li>
  <li>Fix the custom tab name not being searchable in search</li>
  <li>Fix a styling issue with the active group indicator when the webdock was hidden</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.111.14.2)

---

<h3>Version 10.110.26 <span class="date">22/2/2023</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    A new tab navigator experience that makes it easier to switch between all your
    tabs using the mouse or the keyboard. Try it by clicking the navigator button in the
    sidebar or through the main burger menu!
  </li>
  <li>New color styling for the tab navigator with customizable backgrounds</li>
  <li>New background gradients for workspaces</li>
  <li>Add new keyboard shortcut to cycle the active tab around the open windows</li>
  <li>Add "Move tab to new window" keyboard shortcut</li>
  <li>When sharing tabs to a workspace, make it possible to change the tabs before sending</li>
  <li>Add support for dragging links into empty collection widgets</li>
  <li>Make the tab strip only drop into its own toolbar when you have more than 4 apps</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 110.0.5481.100</li>
  <li>Improve YouTube url support for the embedded iframe widget</li>
  <li>Be less strict when accepting links for collection widgets</li>
  <li>Better compatibility for username/password proxy authentication</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix an issue where a site briefly opening a new tab to initiate a download would return to the incorrect tab</li>
  <li>Speculative fix for modifier+click actions not working immediately after Wavebox starts</li>
  <li>Fix an issue where settings would sometimes fail to scroll to the correct section</li>
  <li>When hitting Alt+Enter in the omnibox, the cookie container would not be carried through. Fix this.</li>
  <li>Fix the mute/unmute right-click menu item not reflecting current state on a group</li>
  <li>Fix windows not reappearing after unlocking the privacy lock</li>
  <li>Fix keyboard focus not being in the omnibox when a new tab page is set</li>
  <li>A bunch of fixes for dragging & dropping stuff in the toolbars</li>
  <li>Fixes for the context menus</li>
  <li>Fix Connect and Smartnote extensions failing to load</li>
  <li>Fix missing icons in Connect</li>
  <li>UI tweaks</li>
  <li>Stability fixes</li>
  <li>First run fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.110.26.2)

---

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
[More versions](https://wavebox.io/changelog/stable/)