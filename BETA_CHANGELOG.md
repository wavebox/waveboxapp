<h3>Version 151.2.131 beta <span class="date">15/7/2026</span></h3>
<ul>
  <li>Grammar checking no longer gives up on long text — a full blog post or long message is now proofread sentence by sentence as you write</li>
  <li>Check spelling and grammar in the right-click menu now walks you through the suggestions one by one, and now sits with the other language and spelling options</li>
  <li>The grammar status badge now follows your cursor as you move between writing areas, and hides itself where grammar isn't checked</li>
  <li>Fixed the guided grammar review quietly stopping after you accepted the second suggestion</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.131.3)

---

<h3>Version 151.2.129 beta <span class="date">14/7/2026</span></h3>
<ul>
  <li>Guided grammar review now wraps around and waits for the checker to finish, so suggestions that appear while you're part-way through a review are no longer skipped</li>
  <li>Hovering a tab that belongs to another space now shows a tooltip naming that space and explaining why the tab is marked</li>
  <li>Fixed a crash when choosing one of the Wavebox profile pictures in settings</li>
  <li>Fixed a startup crash when restoring a session that contained a docked tab</li>
  <li>Fixed crashes when opening a saved tab group from a menu, or when a group had been created with invalid links</li>
  <li>Fixed a crash on macOS when a window was changed from being the main Wavebox window</li>
  <li>Sleeping and waking docked and split tabs is now more reliable, and sleeping one no longer leaves a blank pane behind</li>
  <li>Restoring a session now docks the tab you actually had docked instead of a different one</li>
  <li>The space icon picker now shows six distinct icons instead of repeating the same few</li>
  <li>Several further stability fixes for split tabs, docked tabs and profile creation</li>
  <li>Various UI copy and polish fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.129.3)

---

<h3>Version 151.2.128 beta <span class="date">13/7/2026</span></h3>
<ul>
  <li>Update to Chromium 151.0.7922.19</li>
  <li>The spelling suggestion popover can now add words straight to your dictionary, and repositions itself so it's no longer clipped near the bottom of the screen</li>
  <li>Add custom App dialog now uses floating labels on the URL and name fields so they stay visible once you start typing</li>
  <li>Fixed a startup crash on macOS that could be triggered by apps opening tabs while Wavebox was launching</li>
  <li>Fixed a crash when opening an incognito window after Wavebox had restarted following a crash</li>
  <li>Fixed a crash in grammar checking while editing text</li>
  <li>Unread badges on a space now only count unread from apps in that space, so an emptied space no longer keeps a stale count</li>
  <li>Fixed the Smartnote panel sometimes opening blank</li>
  <li>Fixed a transient error that could occur while dragging tabs</li>
  <li>Fixed an error when quickly clicking the audio, video or screen-share buttons twice during a chat call</li>
  <li>Fixed an error when opening options for an app whose profile had already been deleted</li>
  <li>Fixed an error when using the Brainbox right-click menu on a tab that had already closed</li>
  <li>Several stability fixes for side panels, the tab strip, cloud sync and the app setup dialog</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.128.3)

---

<h3>Version 150.2.123 beta <span class="date">10/7/2026</span></h3>
<ul>
  <li>Update to Chromium 150.0.7871.115</li>
  <li>Fixed the app occasionally getting stuck on the 'Wavebox is starting' splash screen when the background was restarted or updated</li>
  <li>Fixed several crashes and background errors, including tabs closing or being dragged during a sync and using a docked tab's menu while the tabs changed underneath it</li>
  <li>Fixed on-device AI being reported as unavailable inside Brainbox</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.123.3)

---

<h3>Version 150.2.121 beta <span class="date">8/7/2026</span></h3>
<ul>
  <li>Update to Chromium 150.0.7871.101</li>
  <li>Fixed a crash that could occur when clicking a word with spelling suggestions in a text field</li>
  <li>Fixed a crash affecting some Linux users</li>
  <li>Fixed an issue where an external link could fail to open if its target window closed at the same moment, it now opens in a new window instead</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.121.3)

---

<h3>Version 150.2.119 beta <span class="date">7/7/2026</span></h3>
<ul>
  <li>Set a file:// address as your new tab page</li>
  <li>Report a poor spelling or grammar suggestion right from the suggestion popup or the indicator badge menu with the new Help us improve feedback option</li>
  <li>Spelling and grammar checking is now more responsive</li>
  <li>Fixed legacy Manifest V2 extensions being automatically disabled</li>
  <li>Fixed moving a widget to another dashboard leaving it behind on the original as well</li>
  <li>Fixed misspelled words being underlined and counted twice by the spelling and grammar checker, and stale issue counts on emptied fields</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.119.3)

---

<h3>Version 150.2.117 beta <span class="date">3/7/2026</span></h3>
<ul>
  <li>New option on a group's menu to move all of its apps out into their own window as pinned tabs with their app icons, with a one-click way to bring them all back</li>
  <li>The Brainbox assistant has been rebuilt to help you with your Wavebox setup, so you can ask it things like "Move my tabs into a new group"</li>
  <li>The grammar assistant now matches a model to your device language and steps up to a stronger model on capable machines</li>
  <li>On-device grammar checking now uses less than half the memory it did, with a new setting to control how quickly idle models are unloaded</li>
  <li>Added search and keyboard navigation to the "Open in app or webdock group" picker, so you can filter by app or group name and choose with the arrow keys</li>
  <li>Right-click a spelling or grammar underline to open its suggestions popover directly</li>
  <li>New advanced settings to reduce GPU memory usage on some setups</li>
  <li>Fixed a crash that could occur when dragging a group in the webdock</li>
  <li>Fixed crashes that could occur while profile sync was applying changes from another device</li>
  <li>Fixed the grammar status badge spinner freezing or getting stuck showing busy, and it now shows a pointer cursor on hover</li>
  <li>The delete-space dialog no longer shows an empty bordered box when nothing is using the space</li>
  <li>Fixes and UI improvements for the new grammar checker</li>
  <li>Various UI polish and visual fixes on Windows</li>
  <li>Various stability improvements and minor UI fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.117.3)

---

<h3>Version 150.2.112 beta <span class="date">1/7/2026</span></h3>
<ul>
  <li>Update to Chromium 150.0.7871.47</li>
  <li>New on-device AI in Wavebox that runs language models locally on your computer, powering grammar help and the browser's built-in AI features without sending your text to the cloud</li>
  <li>New on-device grammar assistant that checks your writing as you type, with inline underlines, a click-to-fix popover, a status indicator, and a Check grammar option in the right-click menu, plus a new Spelling &amp; grammar settings section to turn checking on or off per site (experimental, off by default)</li>
  <li>Connect your own AI models from Ollama, OpenAI or Anthropic to power Wavebox's web AI features</li>
  <li>Fixed several crashes, including disabling an extension with an open side panel, applying themes, and omnibox and network-request edge cases</li>
  <li>Fixed detached apps collapsing back into the main window after quitting and relaunching Wavebox</li>
  <li>Fixed a range of background errors caused by closing tabs, windows and dialogs while they were still updating</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.112.3)

---

<h3>Version 150.2.103 beta <span class="date">25/6/2026</span></h3>
<ul>
  <li>Detached apps now stay detached after a restart instead of collapsing back into the main window</li>
  <li>Fixed several browser crashes including dragging tabs in split-screen view, dropping non-link content onto the tab strip, the address bar during shutdown, and saved tab group changes</li>
  <li>Fixed a crash in the extension menu while it closes</li>
  <li>The always-on scrollbar in the webdock stays grabbable next to the resize handle</li>
  <li>Improved text alignment within tabs</li>
  <li>Numerous stability and crash-reporting fixes across syncing, backup and restore, and integrated apps</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.103.3)

---

<h3>Version 150.2.100 beta <span class="date">18/6/2026</span></h3>
<ul>
  <li>Fixed a crash that could occur when entering fullscreen on macOS</li>
  <li>Update to Chromium 150.0.7871.25</li>
  <li>Fixed a batch of background crashes affecting tab reloading, account authentication, RSS widgets, importing data, and integrations like Freshdesk</li>
  <li>Fixed a crash during password import that could occur with invalid saved logins</li>
  <li>Resolved a crash on Linux that could happen when closing browser windows</li>
  <li>Fixed a crash on Windows when using speech recognition more than once in a session</li>
  <li>More reliable syncing of tabs across devices when the network is briefly unresponsive</li>
  <li>Fixed an issue that could cause excessive re-rendering across the main panel, webdock, tabs and workspaces</li>
  <li>Language settings now correctly prompt for a restart when needed</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.100.3)

---
[More versions](https://wavebox.io/changelog/beta/)