# 🔄 Your Complete Sync Workflow

## ✅ Current Setup:

**Local Project:**
- Location: `~/Projects/lab-interpret` (symlink)
- Actual: `/Users/drzachconner/Library/Mobile Documents/com~apple~CloudDocs/Documents/Cursor/lab-interpret`

**GitHub Repo:**
- URL: https://github.com/drzachconner/lab-interpret
- Branch: main
- Status: ✅ Connected and syncing

**iCloud:**
- ✅ Auto-syncs across your 3 Macs
- Happens in background

---

## 🎯 How Syncing Works:

### **iCloud Sync (Automatic)**
```
Mac #1 → saves file → iCloud → Mac #2 & Mac #3
```
- ✅ Happens automatically
- ✅ No commands needed
- ✅ Real-time sync
- ⚠️ No version history
- ⚠️ Can't handle merge conflicts

### **Git Sync (Manual)**
```
Mac #1 → git push → GitHub → Mac #2 git pull
```
- ⚠️ Manual commands required
- ✅ Full version history
- ✅ Handles merge conflicts
- ✅ Can collaborate with others
- ✅ Can rollback changes

---

## 📋 Daily Workflow:

### **Starting Work (Any Mac):**
```bash
lab              # Jump to project
git pull         # Get latest from GitHub
claude           # Start Claude Code
```

### **During Work:**
- ✅ iCloud syncs automatically in background
- ✅ Files available on all Macs instantly
- ⚠️ Still need to `git pull` on other Macs to get Git changes

### **Ending Work:**
```bash
git add .
git commit -m "Descriptive message about what you did"
git push
```

Or use the quick alias:
```bash
labpush          # Does all of the above!
```

---

## ⚡ Quick Commands:

```bash
lab              # cd ~/Projects/lab-interpret
labcode          # cd + start Claude Code
labstatus        # git status
labpush          # git add + commit + push
labopen          # Open in VS Code/Cursor
```

---

## 🎯 Best Practices:

### **Do This:**
✅ `git pull` before starting work
✅ Commit frequently (every feature/fix)
✅ Write descriptive commit messages
✅ Push at end of work session
✅ Use `labpush` for quick saves

### **Avoid This:**
❌ Editing same file on 2 Macs simultaneously
❌ Forgetting to push before switching Macs
❌ Relying only on iCloud (use Git!)
❌ Committing without descriptive messages

---

## 🔧 Common Scenarios:

### **Scenario 1: Working on Mac #1**
```bash
# Start
lab && git pull && claude

# Work...

# End
git add .
git commit -m "Added lab PDF parser"
git push
```

### **Scenario 2: Switch to Mac #2**
```bash
# iCloud already synced files
lab

# But need Git updates
git pull

# Now start working
claude
```

### **Scenario 3: Quick Fix**
```bash
lab
# Make quick change
labpush    # Quick commit + push
```

### **Scenario 4: Check Status**
```bash
labstatus  # See what changed
```

---

## 🆘 If Things Get Out of Sync:

### **iCloud + Git Conflicts:**
```bash
cd ~/Projects/lab-interpret
git status

# If conflicts, resolve them:
# 1. Edit the conflicted files
# 2. git add .
# 3. git commit -m "Resolved conflicts"
# 4. git push
```

### **Can't Push:**
```bash
# Someone else pushed changes
git pull          # Get their changes
# Resolve any conflicts if needed
git push          # Now push yours
```

### **Accidentally Edited on 2 Macs:**
```bash
# On Mac with latest changes:
git push

# On Mac with older changes:
git pull          # Will merge automatically (usually)
# If conflicts, resolve them
git push
```

---

## 📊 Visual Workflow:

```
┌─────────────┐
│   Mac #1    │ ← You make changes
└──────┬──────┘
       │
       ├─► iCloud ───► Mac #2 & #3 (auto)
       │
       └─► git push ──► GitHub
                           │
                           ▼
                    Mac #2 does: git pull
```

---

## 💡 Pro Tips:

1. **Always `git pull` first** - Prevents conflicts
2. **Commit often** - Small, focused commits
3. **Push before switching Macs** - Keeps everyone in sync
4. **Use `labpush` for quick saves** - One command does it all
5. **Trust Git over iCloud** - Git is your source of truth

---

## 🎯 Your Setup Summary:

| Feature | How It Works | When |
|---------|--------------|------|
| **iCloud** | Automatic | Always |
| **Git** | Manual (push/pull) | When you command |
| **Symlink** | Always works | All 3 Macs |
| **Aliases** | Shortcut commands | After setup on each Mac |

---

## ✅ What Just Happened:

1. ✅ Committed: CLAUDE.md and docs/ folder
2. ✅ Pushed to: https://github.com/drzachconner/lab-interpret
3. ✅ Now synced: All your documentation is on GitHub
4. ✅ iCloud syncing: Available on all 3 Macs

---

## 🚀 You're All Set!

**To start building:**
```bash
labcode
```

**To save your work:**
```bash
labpush
```

**To sync on another Mac:**
```bash
lab && git pull
```

---

**Remember: iCloud = automatic, Git = manual!**
