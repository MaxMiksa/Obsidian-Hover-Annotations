# Obsidian-Simple-HTML-Annotation | [中文](README_zh.md)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![Language: TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg) ![Obsidian API](https://img.shields.io/badge/Obsidian-API-4B3CFA.svg) ![Build: esbuild](https://img.shields.io/badge/build-esbuild-FFCF00.svg)

The plugin is called **Simple HTML Annotation**: It allows you to **automatically hide annotation content after insertion and instantly display it upon mouse hover within Obsidian**. At the same time, it maintains the plain text compatibility and secure local storage of Markdown files.

***
### ✨ Feature Overview

![插件使用说明 v1 1 0 gif](https://github.com/user-attachments/assets/0e3bd7f0-c70a-48db-b2d7-f6a814c9a396)

***

### 📝 Key Features & User Manual

*   **Select and Annotate**: Select any text and quickly add an annotation or note using a command.
*   **Hover to View**: When the mouse hovers over the annotated text, a black tooltip bubble automatically appears displaying the annotation content.
*   **Immersive Editing (Live Preview)**:
    *   In **Editing Mode (Live Preview)**, the plugin automatically hides the lengthy HTML tags (`<span...>`), only applying an orange underline to the text to keep the writing interface clean.
    *   The source code only expands automatically when the cursor moves inside the annotated text, allowing for easy modification.
*   **Reading Mode Support**: Hover display is also supported in **Reading View**.
*   **Data Security**: All annotations are stored in the document using standard HTML `<span>` tags. Even if you uninstall the plugin, the annotation content remains safely within the document source code and will not be lost.

<img width="600" height="250" alt="image" src="https://github.com/user-attachments/assets/db8f682d-3e7f-45b8-bcd2-5ff41665edbc" />

*Example 1 - Inserting an Annotation (Recommended shortcut: `Alt+c`)*  

<img width="600" height="300" alt="image" src="https://github.com/user-attachments/assets/a4b9e833-7430-4160-b287-1424aa46a3a5" />

*Example 2 - The corresponding text is automatically highlighted after insertion*  

<img width="600" height="250" alt="image" src="https://github.com/user-attachments/assets/22a82896-4349-427f-9ded-341caf2607f8" />

*Example 3 - Displaying Annotation Content (Content pops up automatically upon mouse hover)*  

<img width="600" height="250" alt="image" src="https://github.com/user-attachments/assets/82bd523b-1a2e-46dd-b8aa-52acb08190b9" />

*Example 4 - Annotations are permanently and securely stored in the document as HTML (Annotations remain even after the plugin is uninstalled)*  

***

### How to Use

**Step 1: Adding an Annotation**
1.  Select a piece of text in your note (e.g., "Quantum Mechanics"). Use the shortcut `Alt+c` (you must set this shortcut yourself first).
2.  Write your annotation in the pop-up input box (e.g., "Need further verification on this material"), then press Enter or click "OK."

Alternatively, if you prefer not to use a shortcut:
1.  Select the text, then open the Command Palette (usually `Ctrl/Cmd + P`).
2.  Search for `HTML` or `Annotation` and select the command **“Simple HTML Annotation: Add Annotation (HTML)”** and press Enter.
3.  Write your annotation and confirm.

**Step 2: Viewing Annotations**
*   You will notice the selected text (e.g., "Quantum Mechanics") has an **orange underline** and a light background.
*   Hover your mouse over the text to see the annotation content you just entered.

**Step 3: Modifying/Deleting Annotations**
*   **Modify**: Click the highlighted text (the annotated text), right-click to bring up the context menu, click "Edit Annotation," modify the content, and confirm.
*   **Delete**: Click the highlighted text, right-click, click "Delete Annotation." The annotation content will be removed (and the corresponding text highlighting will be cleared).

***

### 🚀 Future Roadmap

- [x]  1. UI/UX Improvement (Completed 2025-11-20)
*   **Context Menu Integration**: Right-click on selected text to quickly add an annotation via `EditorMenu`.

- [x] 2. Interaction & Safety (Completed 2025-12-09)
*   **Multi-line Annotations**: Cross-line selections stay hidden/highlighted correctly and support hover/edit/delete.
*   **Input Flow**: Enter submits the annotation; Shift+Enter inserts a newline.
*   **Tooltip Behavior**: Tooltip auto-hides on mouse click or any key press.

- [ ] 3. Sidebar View
*   Develop a sidebar panel that lists **all annotations** in the current document.
*   Clicking an annotation in the sidebar automatically scrolls the editor to the corresponding location (similar to the Review pane in Word).

- [ ] 4. Multi-Color Annotations
*   Allow users to select different annotation colors (e.g., Red for questions, Green for ideas, Yellow for tasks).
*   Implementation: Add different classes to the HTML, such as `class="ob-comment red"`.

- [ ] 5. Icon Mode
*   Add a setting switch: choose between "Underline Mode" or "End-of-Text Icon Mode."
*   In Icon Mode, use CSS `::after` pseudo-element to place a symbol like `📝` after the text; the annotation content displays when hovering over the icon.

- [ ] 6. Export and Summary (On Hold)
*   **Annotation Summary**: Add a function to extract all annotations from the current document at once, generating a new Markdown list (including: Original Text, Annotation Content, Location Link). This is highly useful for reading notes.

***

### Contact Information

Any questions or suggestions? Please contact Max Kong (Carnegie Mellon University, Pittsburgh, PA).

Max Kong: kongzheyuan@outlook.com | zheyuank@andrew.cmu.edu
