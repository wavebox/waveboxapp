<h3>Version 152.2.168 beta <span class="date">26/8/2026</span></h3>
<ul>
  <li>Update to Chromium 152.0.7977.65</li>
  <li>
    New: Additional Webdock windows!
    <ul>
      <li>Open additional Webdock windows from the app menu or any Webdock context menu</li>
      <li>Move a group into its own window from the sidebar right-click menu</li>
      <li>Move individual apps, tabs or entire groups between Webdock windows</li>
      <li>Apps stay in the window you place them in, and &amp;ldquo;Bring it here&amp;rdquo; summons an app into the window you're working in</li>
      <li>Windows keep their identity across closing, reopening and restarting, so apps land back where you left them</li>
      <li>Additional Webdock windows now restore their tabs and active app after restarts or reopening</li>
      <li>Each window remembers its active app and collapsed sidebar dividers, including across restarts</li>
      <li>Search, the Tab Manager and keyboard shortcuts now jump to the window that owns an app</li>
      <li>Links, search results and keyboard commands now stay with their originating Webdock</li>
      <li>Sign-in prompts and Space controls now open in the Webdock where they are needed</li>
      <li>Connect now opens its side panel in the Webdock window you're using</li>
    </ul>
  </li>
  <li>Privacy Lock now reliably restores every window after unlocking</li>
  <li>Fixed a crash when extensions move tabs out of split view</li>
  <li>Several stability and navigation fixes for tabs across multiple Webdock windows</li>
  <li>Space icons are clearer and expand on hover for easier identification</li>
</ul>


[Downloads](https://wavebox.io/download/release/152.2.168.3)

---

<h3>Version 152.2.159 beta <span class="date">13/8/2026</span></h3>
<ul>
  <li>Update to Chromium 152.0.7977.42</li>
  <li>Optional Spaces and Groups headings in the webdock, switched on from the webdock right-click menu</li>
  <li>Fix a browser crash when splitting a tab that was already part of a split</li>
  <li>Fix a stray error when renaming a tab that is closed or dragged while the rename is landing</li>
  <li>Translation fixes and clearer wording across several languages</li>
  <li>Various webdock polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/152.2.159.3)

---

<h3>Version 151.2.154 beta <span class="date">12/8/2026</span></h3>
<ul>
  <li>Update to Chromium 151.0.7922.138</li>
  <li>Existing users are now invited to try the grammar checker from the settings menu, with a short preview of it at work</li>
  <li>The navigator now always opens in its own window, including from the webdock button, and defaults to list view</li>
  <li>Fixed a crash that could take down the whole browser when theme colours were requested in the background</li>
  <li>Fixed a browser crash when extensions listed tabs belonging to partitioned apps</li>
  <li>Fixed crashes when using native menus on Mac and Windows</li>
  <li>Fixed a crash when dragging a tab over the split-view drop area as it was closing</li>
  <li>Fixed removing a group, app or space icon breaking cloud sync, which stopped icons saving and kept sending the webdock back to the first group</li>
  <li>Fixed removing the last group from a space leaving that space stuck in the webdock and impossible to open</li>
  <li>Deleting an empty group that's the last one in its space now offers to delete the space, and is disabled when that space can't be deleted</li>
  <li>Clicking a Slack notification now opens the right channel again, switching in place without a full reload</li>
  <li>Fixed the Outlook unread badge sticking at an old count when the window is narrow</li>
  <li>Fixed the Linux menubar icon rendering as a blank, unclickable gap</li>
  <li>The grammar suggestion popover no longer opens on its own while you type, and the cursor now lands at the end of the corrected word</li>
  <li>Fixed the Windows IME candidate window staying in the corner instead of following the cursor after a drag and drop</li>
  <li>Fixed the mini window not reopening from its shortcut once the previous one had gone stale, along with several related window and tab errors</li>
  <li>Brainbox updates and fixes</li>
  <li>Various UI polish and visual fixes</li>
  <li>Various build and code-quality improvements behind the scenes</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.154.3)

---

<h3>Version 151.2.148 beta <span class="date">5/8/2026</span></h3>
<ul>
  <li>Update to Chromium 151.0.7922.76</li>
  <li>Linux AppImage builds can now update themselves in place, downloading only the parts that changed</li>
  <li>Grammar suggestions are now switched on by default for new users</li>
  <li>Fixed tabs sometimes failing to close while another tab is being dragged</li>
  <li>Fixed an error that could be reported when closing a tab that had already closed</li>
  <li>Release test</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.148.3)

---

<h3>Version 151.2.141 beta <span class="date">3/8/2026</span></h3>
<ul>
  <li>You can now pick a space when creating a new Webdock group in the List and Explorer layouts</li>
  <li>The assistant can now tell which group, app, tab and space you are actually looking at, so it acts on the right one</li>
  <li>Asking the assistant to remove a group or a space now opens the usual confirmation dialog instead of deleting it straight away</li>
  <li>Grammar suggestions no longer delete your quotation marks or brackets, and no longer offer wording taken from a different line</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.141.3)

---

<h3>Version 151.2.140 beta <span class="date">31/7/2026</span></h3>
<ul>
  <li>Update to Chromium 151.0.7922.72</li>
  <li>Made account setup more resilient to brief network drops so onboarding no longer fails after a momentary connection loss</li>
  <li>Fixed a crash loop in on-device AI so a failing GPU reliably falls back to CPU, along with a related Linux crash in the AI text sampler</li>
  <li>Fixed crashes during session restore involving saved tab groups and split tabs</li>
  <li>Fixed a macOS crash when dismissing notifications and another in the app menu</li>
  <li>Fixed a crash in Smartnotes when a note was updated from another device while open</li>
  <li>Fixed a crash when clearing a Space's colour and when opening the account setup dialog</li>
  <li>Various stability fixes across tabs, workspaces, app updates and syncing</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.140.3)

---

<h3>Version 151.2.135 beta <span class="date">17/7/2026</span></h3>
<ul>
  <li>Update to Chromium 151.0.7922.34</li>
  <li>Browser import now shows browsers that macOS is blocking, with step-by-step guidance and a button that opens the right System Settings pane</li>
  <li>Fixed a crash on launch on macOS Golden Gate during startup</li>
  <li>Space, group and app default icons now follow the light and dark theme instead of showing a white tile in dark mode</li>
  <li>A group dashboard can now be set to a chrome-extension:// address</li>
  <li>Added a dark grey sticky note colour for darker backgrounds</li>
  <li>Fixed background errors that could interrupt tab reordering, cloud sync setup during onboarding restore, and app URL changes</li>
  <li>The grammar checker no longer runs on devtools pages</li>
  <li>Improved translations across several languages</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.135.3)

---

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
[More versions](https://wavebox.io/changelog/beta/)