<h3>Version 152.2.173 <span class="date">1/9/2026</span></h3>
<p></p>
<h4>🆕 New!</h4>
<ul>
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
  <li>Optional Spaces and Groups headings in the webdock, switched on from the webdock right-click menu</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 152.0.7977.65</li>
  <li>Auto-reload now waits until apps are idle, protecting calls and active work</li>
  <li>Apps now stay awake when Wavebox cannot safely confirm their visibility</li>
  <li>Connect panel sizes are now remembered separately for each window</li>
  <li>Space icons are clearer and expand on hover for easier identification</li>
  <li>Various Webdock menu wording, ordering and icon improvements</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix a browser crash when splitting a tab that was already part of a split</li>
  <li>Fixed a crash when extensions move tabs out of split view</li>
  <li>Privacy Lock now reliably restores every window after unlocking</li>
  <li>Fix a stray error when renaming a tab that is closed or dragged while the rename is landing</li>
  <li>Fixed white backgrounds appearing in the Webdock and top strip on macOS</li>
  <li>Translation fixes and clearer wording across several languages</li>
  <li>Several stability and navigation fixes for tabs across multiple Webdock windows</li>
  <li>Various webdock polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/152.2.173.2)

---

<h3>Version 151.2.154 <span class="date">12/8/2026</span></h3>
<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 151.0.7922.138</li>
  <li>Existing users are now invited to try the grammar checker from the settings menu, with a short preview of it at work</li>
  <li>The navigator now always opens in its own window, including from the webdock button, and defaults to list view</li>
  <li>Deleting an empty group that's the last one in its space now offers to delete the space, and is disabled when that space can't be deleted</li>
  <li>Brainbox updates and fixes</li>
  <li>Various build and code-quality improvements behind the scenes</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a crash that could take down the whole browser when theme colours were requested in the background</li>
  <li>Fixed a browser crash when extensions listed tabs belonging to partitioned apps</li>
  <li>Fixed crashes when using native menus on Mac and Windows</li>
  <li>Fixed a crash when dragging a tab over the split-view drop area as it was closing</li>
  <li>Fixed removing a group, app or space icon breaking cloud sync, which stopped icons saving and kept sending the webdock back to the first group</li>
  <li>Fixed removing the last group from a space leaving that space stuck in the webdock and impossible to open</li>
  <li>Clicking a Slack notification now opens the right channel again, switching in place without a full reload</li>
  <li>Fixed the mini window not reopening from its shortcut once the previous one had gone stale, along with several related window and tab errors</li>
  <li>The grammar suggestion popover no longer opens on its own while you type, and the cursor now lands at the end of the corrected word</li>
  <li>Fixed the Outlook unread badge sticking at an old count when the window is narrow</li>
  <li>Fixed the Linux menubar icon rendering as a blank, unclickable gap</li>
  <li>Fixed the Windows IME candidate window staying in the corner instead of following the cursor after a drag and drop</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.154.2)

---

<h3>Version 151.2.148 <span class="date">5/8/2026</span></h3>
<ul>
  <li>Update to Chromium 151.0.7922.76</li>
  <li>Linux AppImage builds can now update themselves in place, downloading only the parts that changed</li>
  <li>Grammar suggestions are now switched on by default for new users</li>
  <li>Fixed tabs sometimes failing to close while another tab is being dragged</li>
  <li>Fixed an error that could be reported when closing a tab that had already closed</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.148.2)

---

<h3>Version 151.2.141 <span class="date">3/8/2026</span></h3>
<p></p>
<h4>🆕 New!</h4>
<ul>
  <li>You can now pick a space when creating a new Webdock group in the List and Explorer layouts</li>
  <li>A group dashboard can now be set to a chrome-extension:// address</li>
  <li>Added a dark grey sticky note colour for darker backgrounds</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 151.0.7922.72</li>
  <li>Browser import now shows browsers that macOS is blocking, with step-by-step guidance and a button that opens the right System Settings pane</li>
  <li>The assistant can now tell which group, app, tab and space you are actually looking at, so it acts on the right one</li>
  <li>Asking the assistant to remove a group or a space now opens the usual confirmation dialog instead of deleting it straight away</li>
  <li>Made account setup more resilient to brief network drops so onboarding no longer fails after a momentary connection loss</li>
  <li>Space, group and app default icons now follow the light and dark theme instead of showing a white tile in dark mode</li>
  <li>The grammar checker no longer runs on devtools pages</li>
  <li>Improved translations across several languages</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a crash on launch on macOS Golden Gate during startup</li>
  <li>Fixed crashes during session restore involving saved tab groups and split tabs</li>
  <li>Fixed a crash loop in on-device AI so a failing GPU reliably falls back to CPU, along with a related Linux crash in the AI text sampler</li>
  <li>Fixed a crash in Smartnotes when a note was updated from another device while open</li>
  <li>Fixed a macOS crash when dismissing notifications and another in the app menu</li>
  <li>Fixed a crash when clearing a Space's colour and when opening the account setup dialog</li>
  <li>Grammar suggestions no longer delete your quotation marks or brackets, and no longer offer wording taken from a different line</li>
  <li>Fixed background errors that could interrupt tab reordering, cloud sync setup during onboarding restore, and app URL changes</li>
  <li>Various stability fixes across tabs, workspaces, app updates and syncing</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/151.2.141.2)

---

<h3>Version 150.2.131 <span class="date">15/7/2026</span></h3>
<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 150.0.7871.125</li>
  <li>Grammar checking no longer gives up on long text — a full blog post or long message is now proofread sentence by sentence as you write</li>
  <li>The spelling suggestion popover can now add words straight to your dictionary, and repositions itself so it's no longer clipped near the bottom of the screen</li>
  <li>Check spelling and grammar in the right-click menu now walks you through the suggestions one by one, and now sits with the other language and spelling options</li>
  <li>The grammar status badge now follows your cursor as you move between writing areas, and hides itself where grammar isn't checked</li>
  <li>Hovering a tab that belongs to another space now shows a tooltip naming that space and explaining why the tab is marked</li>
  <li>Add custom App dialog now uses floating labels on the URL and name fields so they stay visible once you start typing</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed the app occasionally getting stuck on the 'Wavebox is starting' splash screen when the background was restarted or updated</li>
  <li>Fixed several crashes and background errors, including tabs closing or being dragged during a sync and using a docked tab's menu while the tabs changed underneath it</li>
  <li>Fixed a startup crash on macOS that could be triggered by apps opening tabs while Wavebox was launching</li>
  <li>Fixed a startup crash when restoring a session that contained a docked tab</li>
  <li>Fixed a crash when opening an incognito window after Wavebox had restarted following a crash</li>
  <li>Fixed crashes when opening a saved tab group from a menu, or when a group had been created with invalid links</li>
  <li>Fixed a crash when choosing one of the Wavebox profile pictures in settings</li>
  <li>Fixed a crash on macOS when a window was changed from being the main Wavebox window</li>
  <li>Fixed a crash in grammar checking while editing text</li>
  <li>Sleeping and waking docked and split tabs is now more reliable, and sleeping one no longer leaves a blank pane behind</li>
  <li>Fixed on-device AI being reported as unavailable inside Brainbox</li>
  <li>Unread badges on a space now only count unread from apps in that space, so an emptied space no longer keeps a stale count</li>
  <li>Fixed the Smartnote panel sometimes opening blank</li>
  <li>Fixed the guided grammar review quietly stopping after you accepted the second suggestion</li>
  <li>Fixed an error when quickly clicking the audio, video or screen-share buttons twice during a chat call</li>
  <li>Fixed an error when opening options for an app whose profile had already been deleted</li>
  <li>Fixed an error when using the Brainbox right-click menu on a tab that had already closed</li>
  <li>Fixed a transient error that could occur while dragging tabs</li>
  <li>The space icon picker now shows six distinct icons instead of repeating the same few</li>
  <li>Several stability fixes for side panels, the tab strip, cloud sync and the app setup dialog</li>
  <li>Several further stability fixes for split tabs, docked tabs and profile creation</li>
  <li>Various UI copy and polish fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.131.2)

---

<h3>Version 150.2.121 <span class="date">8/7/2026</span></h3>
<p></p>
<h4>🆕 New!</h4>
<ul>
  <li>Set a file:// address as your new tab page</li>
  <li>Report a poor spelling or grammar suggestion right from the suggestion popup or the indicator badge menu with the new Help us improve feedback option</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 150.0.7871.101</li>
  <li>Spelling and grammar checking is now more responsive</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a crash that could occur when clicking a word with spelling suggestions in a text field</li>
  <li>Fixed a crash affecting some Linux users</li>
  <li>Fixed legacy Manifest V2 extensions being automatically disabled</li>
  <li>Fixed an issue where an external link could fail to open if its target window closed at the same moment, it now opens in a new window instead</li>
  <li>Fixed moving a widget to another dashboard leaving it behind on the original as well</li>
  <li>Fixed misspelled words being underlined and counted twice by the spelling and grammar checker, and stale issue counts on emptied fields</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.121.2)

---

<h3>Version 150.2.118 <span class="date">6/7/2026</span></h3>
<p>This patchfix includes a fix for manifest 2 extensions. Here's everything else that's new...</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    New on-device grammar assistant that checks your writing as you type, with inline
    underlines, a click-to-fix popover, a status indicator, and a Check grammar
    option in the right-click menu. This is turned off by default but can be enabled
    under Settings > Language.
  </li>
  <li>
    New on-device AI in Wavebox that runs language models locally on your computer,
    for websites that request it. This brings Wavebox into spec with other browsers
    for these new capabilities.
  </li>
  <li>Connect your own AI models from Ollama, OpenAI or Anthropic to power Wavebox's web AI features</li>
  <li>
    New option on a group's menu to move all of its apps out into their own window
    as pinned tabs with their app icons, with a one-click way to bring them all back.
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 150.0.7871.47</li>
  <li>The Brainbox assistant has been rebuilt to help you with your Wavebox setup, so you can ask it things like "Move my tabs into a new group"</li>
  <li>Added search and keyboard navigation to the "Open in app or webdock group" picker, so you can filter by app or group name and choose with the arrow keys</li>
  <li>New advanced settings to reduce GPU memory usage on some setups</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed several crashes, including disabling an extension with an open side panel, applying themes, and omnibox and network-request edge cases</li>
  <li>Fixed a crash that could occur when dragging a group in the webdock</li>
  <li>Fixed crashes that could occur while profile sync was applying changes from another device</li>
  <li>Fixed detached apps collapsing back into the main window after quitting and relaunching Wavebox</li>
  <li>Fixed a range of background errors caused by closing tabs, windows and dialogs while they were still updating</li>
  <li>The delete-space dialog no longer shows an empty bordered box when nothing is using the space</li>
  <li>Fixes and UI improvements for the new grammar checker</li>
  <li>Various stability improvements, UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.118.2)

---

<h3>Version 150.2.117 <span class="date">6/7/2026</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    New on-device grammar assistant that checks your writing as you type, with inline
    underlines, a click-to-fix popover, a status indicator, and a Check grammar
    option in the right-click menu. This is turned off by default but can be enabled
    under Settings > Language.
  </li>
  <li>
    New on-device AI in Wavebox that runs language models locally on your computer,
    for websites that request it. This brings Wavebox into spec with other browsers
    for these new capabilities.
  </li>
  <li>Connect your own AI models from Ollama, OpenAI or Anthropic to power Wavebox's web AI features</li>
  <li>
    New option on a group's menu to move all of its apps out into their own window
    as pinned tabs with their app icons, with a one-click way to bring them all back.
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 150.0.7871.47</li>
  <li>The Brainbox assistant has been rebuilt to help you with your Wavebox setup, so you can ask it things like "Move my tabs into a new group"</li>
  <li>Added search and keyboard navigation to the "Open in app or webdock group" picker, so you can filter by app or group name and choose with the arrow keys</li>
  <li>New advanced settings to reduce GPU memory usage on some setups</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed several crashes, including disabling an extension with an open side panel, applying themes, and omnibox and network-request edge cases</li>
  <li>Fixed a crash that could occur when dragging a group in the webdock</li>
  <li>Fixed crashes that could occur while profile sync was applying changes from another device</li>
  <li>Fixed detached apps collapsing back into the main window after quitting and relaunching Wavebox</li>
  <li>Fixed a range of background errors caused by closing tabs, windows and dialogs while they were still updating</li>
  <li>The delete-space dialog no longer shows an empty bordered box when nothing is using the space</li>
  <li>Fixes and UI improvements for the new grammar checker</li>
  <li>Various stability improvements, UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/150.2.117.2)

---

<h3>Version 149.2.103 <span class="date">24/6/2026</span></h3>


<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 149.0.7827.197</li>
  <li>Detached apps now stay detached after a restart</li>
  <li>More reliable syncing of tabs across devices when the network is briefly unresponsive</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a batch of background crashes affecting tab reloading, account authentication, RSS widgets, importing data, and integrations like Freshdesk</li>
  <li>Fixed a crash during password import that could occur with invalid saved logins</li>
  <li>Fixed two browser crashes involving the address bar and saved tab groups</li>
  <li>Fixed a browser crash in split screen when dragging a tab</li>
  <li>Fixed a crash when dragging text or other non-link content onto your tabs</li>
  <li>Fixed a crash on Windows when using speech recognition more than once in a session</li>
  <li>Fixed a crash that could occur when entering fullscreen on macOS</li>
  <li>Fixed a crash in the extension menu</li>
  <li>Fixed an issue that could cause excessive re-rendering across the main panel, webdock, tabs and workspaces</li>
  <li>Language settings now correctly prompt for a restart when needed</li>
  <li>Various UI polish and visual fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.103.2)

---

<h3>Version 149.2.96 <span class="date">17/6/2026</span></h3>
<p></p>
<h4>🆕 New!</h4>
<ul>
  <li>Manage your preferred languages directly in settings, with add, remove and reorder, per-language translate offers, and (on Windows) a browser interface language picker</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 149.0.7827.156</li>
  <li>Per-space proxy now supports PAC file URLs alongside fixed-server addresses</li>
  <li>More reliable window restoring when a saved window or dragged tab lands off-screen or on a disconnected display</li>
  <li>More resilient cross-device tab restore when the sync connection drops</li>
  <li>Connect now remembers your last active team across restarts, so you no longer appear online in the wrong team after launch</li>
  <li>Update fixes on macOS to make app restarts and updates more reliable</li>
  <li>Web search suggestions now fail gracefully when offline or behind a captive portal</li>
  <li>Restored windows on macOS now appear in the Finder window picker</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixed a crash during session restore when saved tab groups got out of sync, now self-healing without losing tabs</li>
  <li>Fixed a crash in the built-in AI features that could occur when a background worker shut down</li>
  <li>Fixed a crash that could happen when dragging and dropping items in the webdock</li>
  <li>Fixed sync getting stuck retrying when an app had a corrupt or empty asset reference</li>
  <li>Fixed re-authenticating Outlook accounts wiping their sign-in tokens</li>
  <li>Setting a default search engine now works reliably instead of failing with an error</li>
  <li>Fixed picture-in-picture and fullscreen glitches when sharing video in Wavebox Connect</li>
  <li>Fixed a rare error when closing a window while its theme gradient was updating</li>
  <li>Fixed the titlebar arrow anchor in appearance settings for secondary windows</li>
  <li>Various UI polish and visual fixes</li>
  <li>Various UI polish, visual fixes and stability and performance fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/149.2.96.2)

---
[More versions](https://wavebox.io/changelog/stable/)