# BiohackLabs.ai - Complete Claude Code Setup

## 🎯 Project Overview
**BiohackLabs.ai** - Functional medicine lab interpretation platform with AI-powered analysis and Fullscript integration.

**Based on:** Interpret-Labs simplified version
**Stack:** Next.js 14, TypeScript, Supabase, OpenAI API, Fullscript Links (NOT full e-commerce)

---

## ⚠️ IMPORTANT: Fullscript Integration Clarification

**We are NOT building an e-commerce system!**

### **What We DO:**
- ✅ AI analyzes labs and recommends supplements
- ✅ Generate links to specific products in Fullscript dispensary
- ✅ User clicks link → Opens Fullscript
- ✅ **Fullscript handles cart, checkout, payment, shipping**

### **What We DON'T Do:**
- ❌ Product catalog in our app
- ❌ Shopping cart functionality
- ❌ Checkout flow
- ❌ Payment processing
- ❌ Inventory management

**Simple link integration only!** See `docs/FULLSCRIPT_INTEGRATION_SIMPLIFIED.md` for details.

---

## 📁 Project Structure
```
lab-interpret/
├── app/              # Next.js 14 app directory
├── components/       # React components
├── lib/             # Utilities & API clients
│   ├── supabase.ts
│   ├── openai.ts
│   └── fullscript.ts  # Simple link generation only!
├── types/           # TypeScript definitions
├── public/          # Static assets
├── docs/            # Documentation
└── CLAUDE.md        # ← This file guides Claude Code
```

---

## 🔧 Claude Code Configuration

### Custom Commands for BiohackLabs

Add these to your `~/.clauderc`:

```bash
# BiohackLabs-specific commands
alias analyze-labs='echo "Analyze this lab report and provide interpretation with supplement recommendations"'
alias test-api='echo "Test all API integrations (Supabase, OpenAI, Fullscript)"'
alias check-types='echo "Review TypeScript types for lab data structures"'
alias optimize-prompts='echo "Optimize the AI prompts for better lab interpretations"'
```

### Recommended MCP Servers for This Project

**Already Configured:**
- ✅ **filesystem** - Read/write code files
- ✅ **sequential-thinking** - Complex medical logic
- ✅ **context7** - Latest Next.js & medical API docs
- ✅ **brave-search** - Research medical info
- ✅ **github** - Version control

---

## 💡 How to Use Claude Code for BiohackLabs

### Starting a Coding Session
```bash
cd ~/Projects/lab-interpret
claude
```

Then in Claude Code:
```
1. "Read the CLAUDE.md file"
2. "Show me the current project structure"
3. "What features should we build first?"
```

### Common Workflows

#### **1. Adding New Lab Test Type**
```
You: "I need to add support for Thyroid Panel interpretation"

Claude: "Let me think through the steps..."
[Uses sequential-thinking]

You: "use context7 - what are the standard Thyroid Panel markers?"
[Gets latest medical reference data]

You: "Create the TypeScript types and API integration"
[Creates files with proper types]
```

#### **2. Creating Supplement Recommendations**
```
You: "Generate supplement recommendations based on low Vitamin D"

Claude: "I'll create recommendations with Fullscript links"
[Creates recommendation with link to Fullscript product]

REMEMBER: Just generate the LINK - Fullscript handles the rest!
```

#### **3. Debugging API Issues**
```
You: "The OpenAI interpretation is returning errors"

Claude: "Let me read the error logs"
[Uses filesystem to check logs]

You: "Search for OpenAI API best practices"
[Uses brave-search MCP]
```

#### **4. Optimizing AI Prompts**
```
You: "The lab interpretations are too generic"

You: "Think harder about how to make these more personalized"
[Uses sequential-thinking MCP]

Claude: "Here's an optimized prompt structure with context awareness..."
```

---

## 🎯 Project-Specific Prompts

### For Medical Accuracy
```
"Review this lab interpretation for medical accuracy. Consider:
- Reference ranges for different demographics
- Interactions between markers
- Clinical significance
- Evidence-based supplement recommendations"
```

### For Code Quality
```
"Review this code following BiohackLabs standards:
- TypeScript strict mode compliance
- Proper error handling for API calls
- HIPAA-compliant data handling
- Next.js 14 best practices"
```

### For Fullscript Integration
```
"Generate Fullscript product links for these recommendations.
Remember: We only generate LINKS, not a cart or checkout.
User clicks link → Fullscript handles everything."
```

### For Testing
```
"Generate comprehensive tests for this lab interpretation logic:
- Unit tests for marker calculations
- Integration tests for API calls
- Edge cases for unusual lab values
- Mock data for different scenarios"
```

---

## 🔐 Security Considerations

**Always remind Claude Code:**
```
"This is healthcare data - ensure:
- All API calls use environment variables
- No hardcoded API keys
- Proper input sanitization
- HIPAA-compliant logging (no PHI in logs)"
```

---

## 📊 Key Features to Develop

### Phase 1: Core Functionality (Start Here!)
- [ ] Lab PDF upload & parsing
- [ ] OpenAI interpretation engine
- [ ] Simple Fullscript link generation (NOT full e-commerce!)
- [ ] User dashboard to view results

### Phase 2: Enhanced Features
- [ ] Multi-lab comparison
- [ ] Trend analysis over time
- [ ] More sophisticated supplement recommendations
- [ ] Provider portal

### Phase 3: Advanced
- [ ] AI-powered health coaching
- [ ] Integration with wearables
- [ ] Automated follow-up recommendations
- [ ] Practitioner marketplace

---

## 🚀 Quick Start Commands

**Create a new feature:**
```
/code-review
"Create a lab PDF parser that extracts marker data"
```

**Debug an issue:**
```
/debug
"The Supabase connection is timing out"
```

**Optimize code:**
```
/refactor
"This lab parsing function is too slow"
```

**Add tests:**
```
/add-tests
"Generate tests for the lab interpretation module"
```

---

## 🎓 Best Practices

### 1. Always Use Context7 for Latest Info
```
"use context7 - what are the latest Next.js 14 best practices?"
"use context7 - OpenAI GPT-4 prompt engineering techniques"
```

### 2. Think Through Complex Medical Logic
```
"think harder about the interactions between these lab markers"
```

### 3. Validate Medical Claims
```
"Search for peer-reviewed studies supporting this supplement recommendation"
[Uses brave-search MCP]
```

### 4. Keep Code Type-Safe
```
"Ensure all lab data structures have proper TypeScript types with validation"
```

### 5. Test Everything
```
"Generate tests for this medical interpretation logic before we ship it"
```

### 6. Remember Fullscript Simplicity
```
"For Fullscript: Just generate product links. No cart, no checkout, no complexity."
```

---

## 🔗 Fullscript Integration - Key Points

**Read this before working on Fullscript features:**

```typescript
// ✅ DO THIS - Simple link generation
const fullscriptUrl = `${DISPENSARY_URL}/products/${productSlug}`;

// ❌ DON'T DO THIS - Building cart/checkout
// We don't need any of this:
const cart = [];
const checkout = {};
const paymentProcessor = {};
```

**For full details:** See `docs/FULLSCRIPT_INTEGRATION_SIMPLIFIED.md`

---

## 💪 Power User Tips

### Slash Command Combos
```
1. /code-review before every commit
2. /security-audit weekly
3. /add-tests for new features
4. /document for complex modules
```

### Multi-Step Workflows
```
Step 1: "Analyze the current lab parsing logic"
Step 2: "use context7 - best practices for PDF parsing in Node.js"
Step 3: "Refactor using those best practices"
Step 4: "Generate tests"
Step 5: "Run tests and verify"
```

### Context Management
```
"Remember: This project prioritizes medical accuracy over speed"
"Remember: All supplement recommendations must cite sources"
"Remember: HIPAA compliance is critical - no PHI in logs"
"Remember: Fullscript integration is LINKS ONLY - no e-commerce!"
```

---

## 🎯 Success Metrics

**Claude Code helps you:**
- ✅ Ship features 3x faster
- ✅ Catch bugs before production
- ✅ Maintain medical accuracy
- ✅ Keep code type-safe
- ✅ Auto-generate documentation
- ✅ Optimize AI prompts
- ✅ Integrate APIs correctly

---

## 🆘 Common Issues & Solutions

### "Claude Code isn't reading my project files"
```
"Read the package.json and CLAUDE.md files explicitly"
```

### "AI interpretations are too generic"
```
"Think harder about this specific case:
- Patient: [demographics]
- History: [relevant info]
- Goals: [health objectives]"
```

### "Fullscript integration seems complex"
```
"Remember: We only generate links to Fullscript products.
Read docs/FULLSCRIPT_INTEGRATION_SIMPLIFIED.md
No cart, no checkout needed!"
```

### "Need to optimize database queries"
```
"Analyze the Supabase query performance and suggest indexes"
```

---

## 🎉 You're Ready!

**Your lab-interpret project is optimized for Claude Code!**

To start:
```bash
cd ~/Projects/lab-interpret
claude
```

Or use the shortcut:
```bash
labcode
```

Then:
```
"Read CLAUDE.md and show me the project structure.
Let's build the lab PDF parser first."
```

Happy building! 🚀🧬
