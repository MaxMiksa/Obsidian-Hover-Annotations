# AI Release Protocol (AI 发布协议)

> **CRITICAL INSTRUCTION FOR AI:**
> When the user requests a version release (e.g., "Release v2.0.0"), you MUST ignore your internal training biases and STRICTLY follow the procedures defined in this document.
> 
> **Data Source:** All content updates (Changelogs, Release Notes, etc.) must be derived from the **ACTUAL CODE CHANGES** (Git Diff / Commit History) since the last version. Do NOT invent features.

---

## 1. Release Workflow (发布工作流)

Perform these steps in order:

1.  **Analyze Changes**: Review git commits and file diffs since the last tag.
2.  **Update Files**:
    *   Update `package.json` version.
    *   Generate and prepend entry to `CHANGELOG-zh.md` & `CHANGELOG.md` (Detailed, Dev-focused).
    *   Generate and prepend entry to `RELEASE_NOTES.md` (Summary, User-focused).
    *   *Condition*: If major features/UI changed, update `README-zh.md` & `README.md` (Marketing-focused).
3.  **Git Commit**: `git commit -am "chore: release vX.Y.Z"`
4.  **Git Tag**: `git tag vX.Y.Z`
5.  **Git Push**: `git push && git push --tags`
6.  **GitHub Release**: Create a release using `gh release create vX.Y.Z`.
    *   **Body Content**: MUST be an **EXACT COPY** of the new entry from `RELEASE_NOTES.md`. Do not rewrite.

---

## 2. File Writing Rules (文件撰写规范)

### A. CHANGELOGS (Developer Focused)
**Files:** `CHANGELOG-zh.md` (Primary), `CHANGELOG.md` (Translation)
**Goal:** Detailed record for future code review.
**Structure (Strict 4-Part Format):**

For each major change, use a `### Feature/功能` block containing exactly these 4 bullet points:
1.  **Summary / 总结**: What is it?
2.  **Problem Solved / 解决痛点**: Why did we do it?
3.  **Feature Details / 功能细节**: User-facing behavior.
4.  **Technical Implementation / 技术实现**: Code-level details (files changed, logic used).

**Template (Chinese):**
```markdown
## vX.Y.Z – {版本主题} ({日期})

### 功能 1：{功能名称}
- **总结**: {简述}
- **解决痛点**: {详细背景}
- **功能细节**: {交互/界面描述}
- **技术实现**: 
  - 修改了 `filename.ts`...
  - 使用了 `API`...
```

**Template (English):**
```markdown
## vX.Y.Z – {Version Theme} ({Date})

### Feature 1: {Feature Name}
- **Summary**: ...
- **Problem Solved**: ...
- **Feature Details**: ...
- **Technical Implementation**: ...
```

---

### B. RELEASE NOTES (User/Publication Focused)
**File:** `RELEASE_NOTES.md`
**Goal:** Clean, high-level summary for the GitHub Releases page.
**Structure:**
*   Bilingual (Chinese top, English bottom).
*   Use Emoji `✨` for headers.
*   Use a **Table** for details.

**Template:**
```markdown
## vX.Y.Z – {English Title} / {中文标题} ({Date})

## ✨ {中文亮点标题}

**{一句加粗的中文营销描述}**

| 类别 | 详细内容 |
| :--- | :--- |
| **{特性名}** | {简短描述} |
| **{特性名}** | {简短描述} |

## ✨ {English Highlight Title}

**{Bold marketing description in English}**

| Category | Details |
| :--- | :--- |
| **{Feature Name}** | {Short description} |
| **{Feature Name}** | {Short description} |
```

---

### C. READMES (Creation & Structure)
**Files:** `README.md` (Default/English), `README-zh.md` (Chinese)
**Philosophy:** User-centric, Visual-first, Clutter-free.
**Constraint:** When creating from scratch, strict adherence to this structure is required.

#### 1. Header & Navigation
*   **Title**: `# Project Name | [Link to Other Language]`
*   **Badges**: Place immediately below title. Use SVG badges (Shields.io style) for:
    *   License
    *   Key Tech Stack (React, Python, etc.)
    *   Status/Version

#### 2. The "Hook" (Highlights)
*   **Format**: 3-4 bullet points.
*   **Content**: Short, punchy value propositions (e.g., "No Install", "Privacy First", "Fast").

**Sample:**
✅ No Installation (Click-to-use) | No Data Upload | Bilingual (CN/EN) | Fast & Free
✅ Video Merging | Audio Merging | Audio & Video Muxing
✅ .M4S | .MP4 | .MP3

**Visual Demo**
*   **Action**: Embed a high-quality GIF or Image from the `Presentation/` folder.
*   **Style**: Center aligned, reasonable width (e.g., 600px-800px).

#### 3. Features Table
*   **Format**: Markdown Table.
*   **Columns**: `Feature (Emoji + Name)` | `Description`.

#### 4. Usage Guide (The "Happy Path")
*   **Principle**: Show ONLY the recommended/easiest way to use.
*   **Structure**: Numbered list (1. Download, 2. Run, 3. Enjoy).
*   **Alternatives**: Any manual/advanced installation methods MUST be wrapped in `<details>`.

#### 5. The "Attic" (Collapsed Sections)
All secondary information MUST be folded to keep the README clean. Use:
```html
<details>
   <summary>Title</summary>
   Content...
</details>
```
**Mandatory Folded Sections:**
*   **Requirements & Limits** (Environment, Hardware).
*   **Developer Guide** (How to build/run locally).
*   **Development Stack**
```
1. Packages & Frameworks
2. Interfaces & Services
3. Languages
```
*   **License** (Brief mention).
*   **FAQ / Troubleshooting**.

#### 6. Contribution & Contact (Hardcoded Template)
**MUST** be copied exactly as follows:

```markdown
## Contribution & Contact

Welcome to submit Issues and Pull Requests!
Any questions or suggestions? Please contact Max Kong (Carnegie Mellon University, Pittsburgh, PA).

Max Kong: kongzheyuan@outlook.com | zheyuank@andrew.cmu.edu
```

---

## 3. Reference Examples (示例库)

### Example: Changelog Entry (v2.0.0)
```markdown
### 功能 1：智能流复制技术，速度提升 10 倍
- **总结**: 核心混流引擎升级，默认优先使用“全流复制”模式 (`-c copy`)。
- **解决痛点**: 旧版强制重编码导致速度慢。
- **功能细节**: 混流尝试 Copy 模式，失败则自动回退。
- **技术实现**:
  - `ffmpegService.ts` 引入 `try-catch`。
  - 实现 Fast Mode -> Fallback Mode 两阶段策略。
```

### Example: Release Note Entry (v2.0.0)
```markdown
## v2.0.0 – Performance & Reliability Update / 性能与可靠性升级 (2025年12月6日)

## ✨ 智能极速混流，速度提升 10 倍

**本次更新引入了智能流复制技术，极大地提升了混流速度，同时保证了最大兼容性。**

| 类别 | 详细内容 |
| :--- | :--- |
| **极速性能** | 默认优先尝试“全流复制”模式，速度提升 10 倍以上。 |
```

---

## 4. README Best Practices & Creativity (专家建议)

### 布局与层级 (Layout & Hierarchy)
*   **F型阅读模式**：将最重要的信息（Hook、Demo、下载链接）放在顶部。
*   **视觉锚点**：选择性使用 Emoji 或图标作为段落的视觉锚点，但不要滥用（仅限于二级标题）。
*   **表格优势**：对比文本段落，表格更适合展示“特性列表”或“版本对比”，因为它们更易扫描。

### 内容策略 (Content Strategy)
*   **用户视角**：不要写“我们使用了 React 19”，要写“极速响应的现代化界面（基于 React 19）”。技术是支撑，体验是卖点。
*   **Show, Don't Tell**：如果一个功能可以用 GIF 展示，就不要写长篇大论的文字。
*   **折叠艺术**：90% 的用户只关心“怎么用”。将“怎么编译”、“依赖关系”等开发者关心的内容折叠，既体现专业性，又不吓跑普通用户。

### 创意点子 (Creative Sparks) （写给AI：请你先判断，如果你认为以下部分有适合于本项目的，请你立即反馈给用户-本项目的开发者）
*   **状态徽章**：如果项目有 CI/CD，加入 Build Passing 徽章会增加可信度。
*   **一键部署**：如果是 Web 项目，提供 "Deploy to Vercel/Netlify" 按钮。
*   **交互式 Demo**：如果有能力，提供 CodeSandbox 或在线演示链接，让用户 0 门槛体验。
