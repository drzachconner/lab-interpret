# 🎯 BiohackLabs.ai - Quick Reference Card
**Print this and keep it handy!**

---

## 🚀 Starting Claude Code
```bash
cd ~/Projects/biohacklabs.ai
claude
```

---

## ⌨️ Essential Commands

### Inside Claude Code:
```
/help                    # Show all commands
/mcp                     # List MCP servers
/code-review             # Review before commit
/debug                   # Systematic debugging
/refactor                # Refactor code
/add-tests               # Generate tests
/explain                 # Explain code
/document                # Generate docs
/security-audit          # Security check
```

### In Terminal:
```bash
claude --version         # Check version
claude doctor           # Diagnose issues
claude mcp list         # Show MCPs
think                   # Thinking prompt
analyze-labs            # Lab analysis
```

---

## 💡 BiohackLabs Prompts

### Medical Analysis:
```
"Analyze this lab report for:
 - Marker interactions
 - Clinical significance
 - Evidence-based recommendations"
```

### Code Review:
```
"Review following BiohackLabs standards:
 - TypeScript strict mode
 - HIPAA compliance
 - Next.js 14 best practices"
```

### API Integration:
```
"Test all API integrations:
 - Supabase connection
 - OpenAI prompts
 - Fullscript recommendations"
```

---

## 🎓 Power User Tricks

### Use Context7:
```
"use context7 - [your question]"
```
Gets latest docs for Next.js, APIs, medical guidelines

### Think Harder:
```
"think harder about [complex problem]"
```
Activates sequential thinking for complex logic

### Multi-Step Workflow:
```
1. "Read CLAUDE.md"
2. "Analyze current structure"
3. "use context7 - best practices for X"
4. "Implement with those practices"
5. "/add-tests"
```

---

## 🔐 Security Reminders

```
"Ensure:
 - No hardcoded API keys
 - Environment variables only
 - HIPAA-compliant logging
 - No PHI in logs"
```

---

## 🆘 Quick Fixes

**MCP not connecting:**
```bash
claude mcp list
claude doctor
```

**Need to restart:**
```
Press Ctrl+C or Esc
Type 'claude' again
```

**Can't find files:**
```
"Read the package.json file"
"Show me the project structure"
```

---

## 📊 BiohackLabs Features

### Current Sprint:
- Lab PDF parsing
- OpenAI interpretation
- Fullscript integration
- User dashboard

### Common Tasks:
- Add new lab test type
- Optimize AI prompts
- Debug API issues
- Generate supplement recommendations

---

## 🎯 Best Practices

1. ✅ Always `/code-review` before commit
2. ✅ Use `context7` for latest docs
3. ✅ `think harder` for medical logic
4. ✅ `/add-tests` for new features
5. ✅ Keep CLAUDE.md updated
6. ✅ Check HIPAA compliance
7. ✅ Cite medical sources

---

## 📁 Key Files

```
CLAUDE.md              # Project context
package.json           # Dependencies
.env.local            # API keys (never commit!)
/lib/openai.ts        # AI prompts
/lib/fullscript.ts    # Supplement API
/types/*.ts           # TypeScript types
```

---

## 🔗 Quick Links

**GitHub Token:**
https://github.com/settings/tokens

**Fullscript API Docs:**
[Keep in /docs folder]

**Medical References:**
Use `brave-search` in Claude Code

---

## 💪 Slash Command Combos

**Before Shipping:**
```
/code-review
/security-audit
/add-tests
```

**Debugging:**
```
/debug
Read error logs
Search for error message
```

**New Feature:**
```
Read CLAUDE.md
use context7 - best practices
Implement
/add-tests
/code-review
```

---

## 🎉 Success Checklist

Daily:
- [ ] Start with `claude` in project dir
- [ ] Read CLAUDE.md for context
- [ ] Use `/code-review` before commits
- [ ] Keep medical accuracy first
- [ ] Document complex logic

Weekly:
- [ ] Run `/security-audit`
- [ ] Update CLAUDE.md
- [ ] Optimize AI prompts
- [ ] Review API performance

---

## 📞 Get Help

**In Claude Code:**
```
/help
/bug (to report issues)
```

**Docs on Desktop:**
- BIOHACKLABS_COMPLETE_SETUP.md
- INSTALLATION_CHECKLIST.md
- GITHUB_TOKEN_SETUP.md

---

**🧬 Built for BiohackLabs.ai**
**Ship faster. Ship better. Stay HIPAA compliant.**

---

*Version 1.0 - October 2025*
