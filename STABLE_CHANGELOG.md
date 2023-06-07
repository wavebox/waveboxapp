<h3>Version 10.114.17 <span class="date">7/6/2023</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
      <strong>UI Enhancements!</strong>
    <ul>
      <li>Update to address bar icons top-right. New extension and side panel icons.</li>
      <li>Update to address bar icons top-left. Irrelevant icons are now hidden e.g. no forward button when there is nowhere to go.</li>
      <li>Split-screen icon moved to the address bar (within the omnibox, on the right) to sit alongside the existing sleep, share, and bookmark icons.</li>
      <li>Clearer tab strip, even when tabs are squished together, ensuring you never lose sight of your open tabs.</li>
      <li>Dark mode support for Linux, to match the look and feel of your operating system.</li>
    </ul>
  </li>
  <li>
    <strong> Introducing Side Panel Support</strong>
    <ul>
      <li>
        Thanks to the all-new side panel APIs, extensions now have the power to create immersive experiences within the side of any window. Enjoy seamless compatibility with Chromium extension APIs, ensuring your installed extensions work flawlessly.
      </li>
      <li>Brainbox, now available in the new side panel, giving access to AI functionality across any window without any popups.</li>
      <li>Discover what's new in Wavebox from within the new side panel.</li>
    </ul>
  </li>
  <li>
    <strong>Brainbox Powerup</strong>
    <ul>
      <li>Unlock the full potential of Brainbox with side panel and popout support for any window.</li>
      <li>Add an action chip to Brainbox that offers to open links in a new window when there are multiple links in a reply.</li>
      <li>Add an option to delete Brainbox chats.</li>
      <li>Ensure the Brainbox text field is focused when opening the panel.</li>
    </ul>
  </li>
  <li>Customize the homepage of any app (not just custom ones) directly from the settings.</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>
    Update to Chromium 114.0.5735.110. Chromium 114 includes many new web features, and Wavebox allows sites to leverage these as in other browsers. This version of Chromium also includes a new JavaScript compiler, Maglev, which reduces memory and CPU usage while improving performance simultaneously.
  </li>
  <li>Update dependencies.</li>
  <li>Ensure new profiles are set up correctly with the default settings.</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Another speculative fix for parts of the UI going blank after exiting fullscreen.</li>
  <li>Resolved an issue where opening multiple tabs from a collection widget could sometimes result in a different order, bringing consistency to your workflow.</li>
  <li>Fix a rendering glitch in settings where the UI would constantly flash.</li>
  <li>Fix a crash in settings.</li>
  <li>Fixes for Smart Notes.</li>
  <li>Stability fixes.</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.114.17.2)

---

<h3>Version 10.113.19 <span class="date">11/5/2023</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>Make the Brainbox panel resizable in the main window</li>
  <li>Add support for customizing and showing unread counts and activity badges in custom apps</li>
  <li>Add right-click > open link in group > new group menu option</li>
  <li>Add an option to collection widgets to customize grid icon alignment</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 113.0.5672.92</li>
  <li>UI updates</li>
  <li>Update dependencies</li>
  <li>Support passing the Brainbox engine to custom skills</li>
  <li>Updates for new users</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix for the HubSpot extension failing to sign in</li>
  <li>Fix macOS TouchID not working</li>
  <li>Stability fixes with extension APIs</li>
  <li>Fix the proxy settings not taking effect in the default cookie container</li>
  <li>Fix an unexpected behavior when adding apps that was dependent on the network speed</li>
  <li>Fix a store sync error</li>
  <li>Fix cases where Wavebox tries to update a tab, but that tab has already been destroyed</li>
  <li>Stability fixes for password sync</li>
  <li>Fixes for the Linux update popup being unresponsive</li>
  <li>Fix an issue with Brainbox chat, where a missing chat name would cause the panel to crash</li>
  <li>Fix an issue with the Brainbox popup sometimes failing to load depending on machine speed</li>
  <li>Fix an issue that made split-screen un-draggable in some instances</li>
  <li>Speculative fix for parts of the Wavebox UI failing to render</li>
  <li>Speculative fix for rendering problems with some Mesa drivers</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.113.19.2)

---

<h3>Version 10.113.11 <span class="date">3/5/2023</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    Brainbox improvements
    <ul>
      <li>
        Brainbox now remembers your conversations so you can drop back in to one at anytime
      </li>
      <li>
        Conversation flow is now better preserved so you can ask more follow-up questions
        and get better contextual replies
      </li>
      <li>
        More actions to help when chatting with Brainbox such as, stopping the reply, retrying
        the question, switching to a suggested app & more!
      </li>
      <li>
        Brainbox is now more date & time aware so you can, for example what the time in a different
        timezone is.
      </li>
      <li>
        You can now switch Brainbox engines from within the chat. By default Brainbox uses GPT-3.5,
        but if you have your own OpenAI API key, you can switch to GPT-4.
      </li>
      <li>
        Styling fixes
      </li>
    </ul>
  </li>
  <li>
    Add new configuration options for sleep. It's now possible to configure tabs
    to sleep after a set amount of time and also when a certain amount of memory
    has been used. Wavebox can now be placed into a lower resource usage mode, either
    manually or when the machine is on battery
  </li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 113.0.5672.63</li>
  <li>Update dependencies</li>
  <li>Auto-retry some network requests that have been failing</li>
  <li>Try to restore tabs after the machine is hard powered off</li>
  <li>UI updates</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix some silent crashes</li>
  <li>Apps in deep-sleep were not displayed in search. Fix this</li>
  <li>Stability fixes</li>
  <li>Fix a crash in settings</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.113.11.2)

---

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
[More versions](https://wavebox.io/changelog/stable/)