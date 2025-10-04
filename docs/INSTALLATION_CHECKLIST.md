# 🚀 Complete Installation Checklist - BiohackLabs.ai Dev Environment

## ✅ What We're Installing Today:

### 1️⃣ Foundation (In Terminal NOW)
- [ ] **Homebrew** (Package manager for Mac) - Currently installing!
- [ ] **Node.js** (JavaScript runtime) - Next
- [ ] **npm** (Node package manager) - Comes with Node

### 2️⃣ Claude Code Setup
- [ ] **@anthropic-ai/claude-code** - The main tool
- [ ] **12 MCP Servers** - Your superpowers
- [ ] **Custom Configuration** - Aliases & shortcuts
- [ ] **GitHub Integration** - Using token you're getting now

### 3️⃣ BiohackLabs Optimization
- [x] **BIOHACKLABS_COMPLETE_SETUP.md** - Done! ✅
- [ ] **Copy to project directory** - After install
- [ ] **Configure project-specific MCPs** - After install
- [ ] **Test with actual BiohackLabs code** - After install

### 4️⃣ Testing & Validation
- [ ] **Verify all MCPs connect** - `claude mcp list`
- [ ] **Test slash commands** - `/help`, `/code-review`, etc.
- [ ] **Run sample project** - Make sure it all works
- [ ] **GitHub MCP test** - After token added

---

## 📍 Current Status:

**Right Now:**
1. ⏳ **Homebrew is installing** in Terminal (enter password if prompted)
2. 🌐 **GitHub token page is open** in Chrome (create token there)
3. 📄 **Documentation created** on Desktop:
   - BIOHACKLABS_COMPLETE_SETUP.md
   - GITHUB_TOKEN_SETUP.md
   - This checklist!

---

## ⏱️ Estimated Timeline:

| Task | Time | Status |
|------|------|--------|
| Homebrew install | 3-5 min | ⏳ IN PROGRESS |
| Node.js install | 2 min | ⬜ Waiting |
| Claude Code install | 1 min | ⬜ Waiting |
| MCP servers setup | 2 min | ⬜ Waiting |
| GitHub token | 2 min | 🌐 Do this now! |
| Testing | 3 min | ⬜ Waiting |
| **TOTAL** | **~15 min** | |

---

## 🎯 What To Do Right Now:

### In Terminal:
- Wait for Homebrew to finish
- Enter your password if prompted
- Look for "Installation successful!"

### In Chrome:
- Fill out the GitHub token form (open now)
- Copy the token when generated
- Come back here with it

### Once Homebrew Finishes:
We'll run these commands automatically:
```bash
brew install node
npm install -g @anthropic-ai/claude-code
claude --version
claude doctor
```

---

## 📋 Commands Reference (For Later):

### Basic Claude Code:
```bash
claude                    # Start Claude Code
claude --version         # Check version
claude doctor           # Diagnose issues
claude mcp list         # Show all MCPs
```

### Custom Commands (Already configured):
```bash
think                   # Simple thinking prompt
ultrathink             # Deep analysis
project-context        # Project overview
mcp-status            # Check MCPs
```

### BiohackLabs Specific:
```bash
analyze-labs          # Lab interpretation
test-api             # API integration tests
check-types          # TypeScript review
optimize-prompts     # AI prompt optimization
```

---

## 🆘 If Something Goes Wrong:

### Homebrew Issues:
```bash
# Check if it installed
brew --version

# If not, run manually:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Node Issues:
```bash
# Verify installation
node --version
npm --version

# If missing, install:
brew install node
```

### Claude Code Issues:
```bash
# Reinstall if needed
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code
```

---

## 🎉 Success Indicators:

You'll know everything worked when:
1. ✅ `brew --version` shows version number
2. ✅ `node --version` shows v18+ 
3. ✅ `claude --version` shows version
4. ✅ `claude doctor` shows all green checks
5. ✅ `claude mcp list` shows 12+ servers
6. ✅ You can run `claude` and it starts!

---

## 🚀 After Everything Installs:

We'll do:
1. **Navigate to BiohackLabs project**
2. **Copy CLAUDE.md to project root**
3. **Start Claude Code** and test it
4. **Add GitHub token** to MCP
5. **Run a test feature** to verify everything
6. **Celebrate!** 🎊

---

## 💡 Pro Tips:

- Keep Terminal open during installation
- Don't close Chrome until you have the token
- Save the token somewhere safe (password manager)
- Read the docs on Desktop when you have time

---

**Current Wait Time:** ~5 more minutes for Homebrew

**What to do:** Create that GitHub token while waiting! 🔑
