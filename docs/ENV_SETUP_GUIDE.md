# 🔐 Environment Variables & Secrets - BiohackLabs.ai

## 📍 Where Things Go

### ❌ **NOT in Project .env Files:**
- GitHub personal access tokens (for Claude Code)
- Your personal credentials
- Global development tools tokens

### ✅ **IN Project .env.local Files:**
- API keys your app needs to run
- Database connection strings
- Service-specific credentials

---

## 🎯 Claude Code GitHub Token

**This is NOT a project environment variable!**

### How to Add (One Time Setup):
```bash
# After Claude Code is installed, run:
claude mcp add github -s user -e GITHUB_TOKEN=ghp_your_token_here -- npx -y @modelcontextprotocol/server-github
```

### Where It's Stored:
- In Claude Code's global config
- NOT in your project
- Applies to all projects when using Claude Code

### What It's For:
- Claude Code can create PRs
- Claude Code can manage issues
- Claude Code can read/write repo
- Works across ALL your projects

---

## 🏗️ BiohackLabs Project Environment Variables

### File: `.env.local` (in project root)

```bash
# OpenAI API (for lab interpretation)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview

# Supabase (database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Fullscript API (supplement recommendations)
FULLSCRIPT_API_KEY=your_fullscript_key
FULLSCRIPT_PRACTITIONER_ID=your_practitioner_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: Analytics, Monitoring, etc.
# NEXT_PUBLIC_GOOGLE_ANALYTICS=UA-...
# SENTRY_DSN=https://...
```

---

## 📋 Setup Checklist

### 1. Create .env.local in Project Root
```bash
cd ~/Projects/biohacklabs.ai
touch .env.local
```

### 2. Open in Editor
```bash
code .env.local
# or
nano .env.local
```

### 3. Add Your Keys
Copy the template above and fill in your actual values

### 4. Verify .gitignore
Make sure `.env.local` is ignored:
```bash
# Should already be in .gitignore
cat .gitignore | grep env
```

Should show:
```
.env*.local
.env
```

---

## 🔍 How to See Hidden Files

### Method 1: Finder Keyboard Shortcut
**Press: `Cmd + Shift + .` (period)**
- Toggles hidden files on/off
- Works in any Finder window
- Most convenient method!

### Method 2: Terminal
```bash
# List all files including hidden
ls -la

# List hidden files in current directory
ls -a

# Open Finder to current directory showing hidden files
open .
# Then press Cmd+Shift+. in Finder
```

### Method 3: Set Finder to Always Show
```bash
# Show hidden files by default
defaults write com.apple.finder AppleShowAllFiles -bool true
killall Finder

# Hide them again later
defaults write com.apple.finder AppleShowAllFiles -bool false
killall Finder
```

---

## 🚨 Security Best Practices

### Never Commit:
❌ `.env.local`
❌ `.env`
❌ Any file with API keys
❌ Personal access tokens

### Always:
✅ Use `.env.local` for local development
✅ Use `.env.example` for templates (no real keys)
✅ Store production keys in hosting platform (Vercel, etc.)
✅ Rotate keys if accidentally committed
✅ Use different keys for dev/staging/prod

### Example .env.example (safe to commit):
```bash
# OpenAI API
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4-turbo-preview

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Fullscript
FULLSCRIPT_API_KEY=your_fullscript_key
FULLSCRIPT_PRACTITIONER_ID=your_practitioner_id
```

---

## 🎯 Quick Reference

### Check If .env.local Exists:
```bash
cd ~/Projects/biohacklabs.ai
ls -la | grep env
```

### Create If Missing:
```bash
touch .env.local
open .env.local
# Add your keys
```

### Verify Git Ignores It:
```bash
git status
# Should NOT show .env.local
```

### Load in Next.js:
```typescript
// Automatically loaded by Next.js
const apiKey = process.env.OPENAI_API_KEY;
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

---

## 🔧 Troubleshooting

### Can't See .env.local in Finder?
- Press `Cmd + Shift + .` to show hidden files
- File should appear with dimmed icon

### .env.local Not Loading?
- Restart Next.js dev server
- Check file name (no typos)
- Check file is in project root
- Not in `/app` or `/src`

### Claude Code Can't Access GitHub?
- Verify token is added to MCP
- Run: `claude mcp list` (should show github)
- Check token has correct scopes
- Token not expired

---

## 📚 Related Files

### Your Project:
```
biohacklabs.ai/
├── .env.local          # Your secrets (never commit!)
├── .env.example        # Template (safe to commit)
├── .gitignore          # Should include .env.local
└── package.json
```

### Claude Code Config:
```
~/.config/claude/       # Claude Code settings
  └── config.json       # GitHub token stored here (securely)
```

---

## ✅ Final Checklist

Project Environment Variables:
- [ ] Created `.env.local` in project root
- [ ] Added OpenAI API key
- [ ] Added Supabase credentials
- [ ] Added Fullscript API key
- [ ] Verified `.gitignore` includes `.env*.local`
- [ ] Created `.env.example` template
- [ ] Tested app loads environment variables

Claude Code:
- [ ] Added GitHub token to MCP (not in .env!)
- [ ] Verified with `claude mcp list`
- [ ] Token has correct scopes
- [ ] Can test with Claude Code commands

---

## 💡 Pro Tips

1. **Use Cmd+Shift+.** - Master this shortcut! You'll use it constantly

2. **Keep .env.example Updated** - When you add new variables, update the example

3. **Different Keys for Different Environments**:
   - Dev: `.env.local`
   - Production: Vercel environment variables
   - Never use same keys for both!

4. **Check Before Committing**:
   ```bash
   git status
   # Make sure .env.local is NOT listed!
   ```

5. **Rotate Compromised Keys Immediately**:
   - If you accidentally commit a key
   - Regenerate it ASAP
   - Update in all places

---

**Remember:**
- 🔑 GitHub Token → Claude Code MCP (global)
- 🏗️ API Keys → Project `.env.local` (local)
- 👁️ Hidden Files → Cmd+Shift+. (Finder)

---

*Last updated: October 2025*
