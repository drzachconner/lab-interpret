# 🖥️ Multi-Mac Workflow Guide - BiohackLabs.ai

## 🎯 Your Setup:
- **3 Macs** accessing same project
- **iCloud** for auto-sync
- **GitHub** for version control  
- **Claude Code** for AI development
- **Easy aliases** for quick access

---

## ✅ What Just Happened:

1. **✅ Moved all docs** from Desktop to project
2. **✅ Created symlink** at `~/Projects/lab-interpret`
3. **✅ Added shell aliases** for quick access
4. **✅ Files now in iCloud** and will sync across Macs

---

## 🚀 Your New Commands (Use These!)

```bash
lab           # Jump to lab-interpret instantly
labcode       # Start Claude Code in project
labopen       # Open in VS Code/Cursor
labstatus     # Git status
labpush       # Quick commit & push
```

**Restart your terminal** or run: `source ~/.zshrc`

---

## 🖥️ Setting Up Other 2 Macs (Copy/Paste This)

```bash
# Create symlink
mkdir -p ~/Projects
ln -sf "/Users/drzachconner/Library/Mobile Documents/com~apple~CloudDocs/Documents/Cursor/lab-interpret" ~/Projects/lab-interpret

# Add aliases  
cat >> ~/.zshrc << 'EOF'
alias lab='cd ~/Projects/lab-interpret'
alias labcode='cd ~/Projects/lab-interpret && claude'
alias labopen='cd ~/Projects/lab-interpret && code .'
alias labstatus='cd ~/Projects/lab-interpret && git status'
alias labpush='cd ~/Projects/lab-interpret && git add . && git commit -m "update" && git push'
EOF

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Add GitHub token (use your actual token)
claude mcp add github -s user -e GITHUB_TOKEN=your_token -- npx -y @modelcontextprotocol/server-github

# Reload
source ~/.zshrc

# Test
lab && claude
```

---

## 📊 How Sync Works

### **GitHub = Source of Truth**
- Manual control (git push/pull)
- Version history
- Conflict resolution
- Collaboration ready

### **iCloud = Background Sync**
- Automatic
- Safety net
- Quick access across Macs
- No version control

### **Use Both!**
- Commit to GitHub intentionally
- Let iCloud sync in background

---

## 🎯 Daily Workflow

### **Start Work (Any Mac):**
```bash
lab              # Jump to project
git pull         # Get latest
labcode          # Start coding with AI
```

### **End Work:**
```bash
labpush          # Quick save to GitHub
# iCloud syncs automatically
```

---

## 🔐 Environment Variables (.env)

**IMPORTANT:** API keys don't sync!

### **On Each Mac:**
```bash
cd ~/Projects/lab-interpret
cp .env.example .env.local
# Edit .env.local with real keys
```

### **.gitignore Should Have:**
```
.env*.local
.env
```

---

## 🆘 Quick Fixes

### **Symlink broken?**
```bash
ln -sf "/Users/drzachconner/Library/Mobile Documents/com~apple~CloudDocs/Documents/Cursor/lab-interpret" ~/Projects/lab-interpret
```

### **iCloud not syncing?**
Wait 30 seconds, then check:
```bash
cd ~/Projects/lab-interpret
ls -la
```

### **Git conflicts?**
```bash
git status
# Resolve conflicts in files
git add .
git commit
git push
```

---

## ✅ Test It Now!

```bash
# Restart terminal first
source ~/.zshrc

# Test the alias
lab

# See your files
ls -la

# Start Claude Code
claude
```

---

**Perfect! Now you can work seamlessly across all 3 Macs! 🎉**
