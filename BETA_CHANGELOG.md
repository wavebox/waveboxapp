<h3>Version 10.112.15 beta <span class="date">20/4/2023</span></h3>
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
  <li>Update to Chromium 112.0.5615.137</li>
  <li>Fix some silent crashes</li>
  <li>Auto-retry some network requests that have been failing</li>
  <li>Apps in deep-sleep were not displayed in search. Fix this</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.112.15.3)

---

<h3>Version 10.112.11 beta <span class="date">17/4/2023</span></h3>
<ul>
  <li>Update to Chromium 112.0.5615.121</li>
  <li>
    Save yourself a click or two with Wavebox site search. Type "Reddit" in the omnibox then
    tab to start searching reddit 👍
    <ul>
      <li>Search Reddit, Wikipedia, Twitter, Figma, Github, Amazon, Google Drive, Google Docs, Google Calendar & Gmail</li>
      <li>Add new site search rules under Settings > Search > Manage</li>
    </ul>
  </li>
</ul>

[Downloads](https://wavebox.io/download/release/10.112.11.3)

---

<h3>Version 10.112.10 beta <span class="date">14/4/2023</span></h3>
<ul>
  <li>Update to Chromium 112.0.5615.87</li>
  <li>
    Add an option to the link engine to allow opening links with the "New tab" or "New window"
    behavior to also set their cookie container.
  </li>
  <li>
    Add a flag to change what happens to unlinked tabs (usually opened by extensions). By
    default they're moved into a new window, but they can now be moved into the active group.
  </li>
  <li>
    Fix an issue where a detached app could get confused about it's split screen status
  </li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.112.10.3)

---

<h3>Version 10.112.8 beta <span class="date">5/4/2023</span></h3>
<ul>
  <li>Themes were failing to sync for some users. Fix this</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.112.8.3)

---

<h3>Version 10.112.7 beta <span class="date">4/4/2023</span></h3>
<ul>
  <li>Fix a silent crash in the network stack that would occur on launch</li>
  <li>
    Fix an issue where in some configurations a workspace would fail to connect
    to the stores, making it appear readonly
  </li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.112.7.3)

---

<h3>Version 10.112.6 beta <span class="date">3/4/2023</span></h3>
<ul>
  <li>
    Add a shortcut to expand/collapse all dividers by shift+clicking
    the webdock mode button in the titlebar
  </li>
  <li>Improve Brainbox text extraction to better support iframes</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.112.6.3)

---

<h3>Version 10.112.5 beta <span class="date">31/3/2023</span></h3>
<ul>
  <li>Update to Chromium 112.0.5615.49</li>
  <li>Fix the "tabs from other devices" menu not being clickable when used with the explorer webdock</li>
  <li>Fix an issue where external link open rules were not synced correctly</li>
  <li>Fix an issue where apps could fail to load when switching to them</li>
  <li>Fixes for extension sync</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.112.5.3)

---

<h3>Version 10.111.47 beta <span class="date">28/3/2023</span></h3>
<ul>
  <li>Update to Chromium 111.0.5563.147</li>
  <li>Update dependencies</li>
  <li>Remove flow extensions from Wavebox when deleting them</li>
  <li>Stability fixes</li>
  <li>Fix being unable to set tab titles when the tabs are in deep sleep</li>
  <li>Fix a focus issue with some keyboard shortcuts</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.111.47.3)

---

<h3>Version 10.111.36 beta <span class="date">22/3/2023</span></h3>
<ul>
  <li>Update to Chromium 111.0.5563.110</li>
  <li>
    Introducing Wavebox flow, a builder that helps you create extensions for Wavebox.
    You can get started via the plus button or by launching flow.wavebox.io in a new tab.
  </li>
  <li>Add a new chrome.waveboxApps extension API</li>
  <li>Add a new chrome.brainbox extension API</li>
  <li>Add more info to Brainbox settings</li>
  <li>Add a keyboard shortcut to open/toggle Brainbox</li>
  <li>Fix non-pinned tabs sometimes appearing within the pinned tabs</li>
  <li>Fix an issue where broken widgets could not be removed from a workspace</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.111.36.3)

---

<h3>Version 10.111.32 beta <span class="date">16/3/2023</span></h3>
<ul>
  <li>Add Brainbox as a workspace widget</li>
  <li>Add a button to send a Brainbox conversation to a Smart note</li>
  <li>Add a text size setting to Brainbox</li>
  <li>Add a button to complete/restart the new user masterclass under Settings, Advanced</li>
  <li>Add more icons that can be used to customize your Wavebox profile avatar</li>
  <li>Fix some notifications (i.e. Telegram) not appearing in the notification widgets & Mini</li>
  <li>Fix some reliability issues with the Wavebox socket connection</li>
  <li>Fix an issue where right-clicking & removing a notification in Mini/Workspaces would remove the wrong one</li>
  <li>Fix a crash in the socket which could leave you unable to communicate with Brainbox</li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
  <li>UI fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.111.32.3)

---
[More versions](https://wavebox.io/changelog/beta/)