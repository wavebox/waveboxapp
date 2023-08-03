<h3>Version 10.115.27 <span class="date">3/8/2023</span></h3>
<p>

</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    Add a feature to the collection widget, so changes you make when all links are opened in a window
    can be sent back to the workspace. To use this, click the cog icon in the collection widget and
    select 'Open & track shortcuts in a new window'.
  </li>
  <li>Add menu item in Wavebox Mini to clear notifications older than</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 115.0.5790.171</li>
  <li>Update dependencies</li>
  <li>Improve sync for workspaces so workspace apps also sync the reference to the workspace that's open</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fixes for notifications that originate from ServiceWorkers</li>
  <li>Fixes for clicking on notifications in Wavebox Mini</li>
  <li>Fix an issue sending a single tab to a workspace</li>
  <li>Fixes to the extension tabs API</li>
  <li>Fix an issue with sync when importing bookmarks</li>
  <li>Fix editing collections in workspaces</li>
  <li>UI tweaks to the tab navigator</li>
  <li>UI fixes</li>
  <li>Sync fixes</li>
  <li>Fix for opening tabs from a collection widget</li>
  <li>Fixes for the collection widgets</li>
  <li>Fix the sticky notes widgets not being draggable</li>
  <li>Fixes for new users</li>
  <li>Fix a data integrity issue with sync</li>
  <li>Fix some apps failing to remember the url that's configured during the add wizard</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.115.27.2)

---

<h3>Version 10.115.15 <span class="date">19/7/2023</span></h3>
<p>
  The previous release broke creating new profiles, this release fixes that.
  Here's everything that's new...
</p>
<h4>🆕 New!</h4>
<ul>
  <li>
    Add more options to the custom web app settings to allow for more control over
    generating unread counts and activity. You can now create inline functions to
    generate these values that run inside the apps tab.
  </li>
  <li>Add sorting for Smart Notes</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 115.0.5790.98</li>
  <li>Update dependencies</li>
  <li>Tab styling was different between the primary and secondary windows. Fix this.</li>
  <li>Updates to the network code so it's more resilient and makes sync more responsive</li>
  <li>Compatibility improvements for the embedded iframe widget in workspaces</li>
  <li>Add the bookmarks manager back into the app menu</li>
  <li>Ensure notification sounds are not played when macOS is in focus mode</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>
    Fix an issue on Windows where dragging the sticky notes widget could make the
    window resize unexpectedly
  </li>
  <li>Fix cookie container proxy settings not being configurable</li>
  <li>Fix clearing the default cookie container on exit not being configurable</li>
  <li>Fix text overflowing in workspaces</li>
  <li>Fixes for the cookie container popup</li>
  <li>Fix the Brainbox toggle shortcut not closing side panels</li>
  <li>Stability fixes</li>
  <li>UI fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.115.15.2)

---

<h3>Version 10.115.14 <span class="date">19/7/2023</span></h3>

<h4>🆕 New!</h4>
<ul>
  <li>
    Add more options to the custom web app settings to allow for more control over
    generating unread counts and activity. You can now create inline functions to
    generate these values that run inside the apps tab.
  </li>
  <li>Add sorting for Smart Notes</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 115.0.5790.98</li>
  <li>Update dependencies</li>
  <li>Tab styling was different between the primary and secondary windows. Fix this.</li>
  <li>Updates to the network code so it's more resilient and makes sync more responsive</li>
  <li>Compatibility improvements for the embedded iframe widget in workspaces</li>
  <li>Add the bookmarks manager back into the app menu</li>
  <li>Ensure notification sounds are not played when macOS is in focus mode</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>
    Fix an issue on Windows where dragging the sticky notes widget could make the
    window resize unexpectedly
  </li>
  <li>Fix cookie container proxy settings not being configurable</li>
  <li>Fix clearing the default cookie container on exit not being configurable</li>
  <li>Fix text overflowing in workspaces</li>
  <li>Fixes for the cookie container popup</li>
  <li>Fix the Brainbox toggle shortcut not closing side panels</li>
  <li>Stability fixes</li>
  <li>UI fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.115.14.2)

---

<h3>Version 10.114.32 <span class="date">27/6/2023</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    Add experimental support for running multiple copies of the same extension, a different
    one for each cookie container. You can enable this by opening wavebox://extensions in a new
    tab and opening the extensions settings.
  </li>
  <li>
    Add support for Firefox contextual identity extension APIs, allowing extensions to
    interact with cookie containers.
  </li>
  <li>UI updates to the extensions screens.</li>
  <li>New cookie container popover when clicking the cookie container button in the toolbar.</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 114.0.5735.199.</li>
  <li>Expose more Chromium settings to the main Wavebox settings.</li>
  <li>UI tweaks.</li>
  <li>Stability fixes.</li>
  <li>Update dependencies.</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>Fix Smart Notes not being scrollable with the on-screen scroll handle.</li>
  <li>Fix the tab close button incorrectly showing on unfocused tabs when the tab strip is compressed.</li>
  <li>Fix the connect button doing nothing when the side panel is disabled.</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.114.32.2)

---

<h3>Version 10.114.26 <span class="date">15/6/2023</span></h3>
<ul>
  <li>Update to Chromium 114.0.5735.134</li>
  <li>Add Smart notes to the side panel</li>
  <li>Add Wavebox Mini to the side panel</li>
  <li>Add an option to cookie containers to clear cookies on exit</li>
  <li>Add a menu item to clear all cookies in a single cookie container</li>
  <li>Add an advanced flag to turn off what's new badges</li>
  <li>Add "Wake all in group" to the tab right-click menu</li>
  <li>Update dependencies</li>
  <li>Fix tab thumbnails not generating</li>
  <li>Fixes for new users</li>
  <li>Fixes for settings</li>
  <li>Fix bookmarks opened from the toolbar creating a new tab</li>
  <li>Stability fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.114.26.2)

---

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
[More versions](https://wavebox.io/changelog/stable/)