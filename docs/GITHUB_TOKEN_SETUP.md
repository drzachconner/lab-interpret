# GitHub Token Setup for Claude Code MCP

## 🔑 Creating Your Token (In the open Chrome tab)

### Step-by-Step:

1. **Note:** Give it a descriptive name
   - Example: `Claude Code MCP - BiohackLabs`

2. **Expiration:** Choose expiration
   - Recommended: `90 days` or `No expiration` (for personal projects)

3. **Select Scopes:** Check these boxes:
   - ✅ **repo** (Full control of private repositories)
     - ✅ repo:status
     - ✅ repo_deployment
     - ✅ public_repo
     - ✅ repo:invite
     - ✅ security_events
   - ✅ **workflow** (Update GitHub Action workflows)
   - ✅ **read:org** (Read org and team membership)
   - ✅ **read:user** (Read user profile data)
   - ✅ **user:email** (Access user email addresses)

4. **Generate Token:**
   - Click the green **"Generate token"** button at the bottom

5. **IMPORTANT - Copy Your Token:**
   - GitHub shows it ONCE
   - Copy it immediately
   - Store it safely (we'll use it in Terminal next)

---

## 📋 Once You Have The Token:

**Come back to this chat and paste it**, or we'll add it directly in Terminal with:

```bash
claude mcp add github -s user -e GITHUB_TOKEN=your_token_here -- npx -y @modelcontextprotocol/server-github
```

---

## 🎯 What This Unlocks in Claude Code:

Once connected, you can:
- ✅ Create and manage Pull Requests
- ✅ List and filter issues
- ✅ View commit history
- ✅ Create branches
- ✅ Search repositories
- ✅ Manage GitHub Actions
- ✅ Review code changes
- ✅ Update repository files

**Example commands in Claude Code:**
```
"Create a PR for the current branch"
"List all open issues labeled 'bug'"
"Show me commits from the last week"
"Create an issue for this bug"
```

---

## 🔒 Security Notes:

- Store tokens in environment variables, never in code
- Limit scopes to what you actually need
- Rotate tokens periodically
- Revoke unused tokens at: https://github.com/settings/tokens

---

## ✅ Next Steps After Token Creation:

1. Copy the token
2. Return to Terminal
3. We'll add it to Claude Code
4. Test the GitHub MCP connection
5. Start using it in your projects!
