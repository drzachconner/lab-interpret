#!/bin/bash

# 🚀 BiohackLabs.ai - Complete Auto-Install Script
# Run this after Homebrew finishes installing

echo "═══════════════════════════════════════════════════"
echo "🚀 BiohackLabs.ai Dev Environment Setup"
echo "═══════════════════════════════════════════════════"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Verify Homebrew
print_status "Checking Homebrew installation..."
if command -v brew &> /dev/null; then
    print_success "Homebrew is installed: $(brew --version | head -n1)"
else
    print_error "Homebrew not found. Please install Homebrew first:"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo ""
print_status "Adding Homebrew to PATH..."
if [[ $(uname -m) == 'arm64' ]]; then
    # Apple Silicon
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
    # Intel
    eval "$(/usr/local/bin/brew shellenv)"
fi

# Step 2: Install Node.js
echo ""
print_status "Installing Node.js..."
if command -v node &> /dev/null; then
    print_warning "Node.js already installed: $(node --version)"
else
    brew install node
    if [ $? -eq 0 ]; then
        print_success "Node.js installed: $(node --version)"
    else
        print_error "Failed to install Node.js"
        exit 1
    fi
fi

# Verify npm
if command -v npm &> /dev/null; then
    print_success "npm is available: $(npm --version)"
else
    print_error "npm not found after Node.js installation"
    exit 1
fi

# Step 3: Install Claude Code
echo ""
print_status "Installing Claude Code..."
npm install -g @anthropic-ai/claude-code

if [ $? -eq 0 ]; then
    print_success "Claude Code installed successfully"
else
    print_error "Failed to install Claude Code"
    exit 1
fi

# Verify installation
if command -v claude &> /dev/null; then
    print_success "Claude Code is ready: $(claude --version)"
else
    print_error "Claude Code command not found"
    echo ""
    print_warning "Try adding to PATH manually:"
    echo "  export PATH=\"\$HOME/.npm-global/bin:\$PATH\""
    exit 1
fi

# Step 4: Run diagnostics
echo ""
print_status "Running Claude Code diagnostics..."
claude doctor

# Step 5: Setup configuration
echo ""
print_status "Setting up configuration files..."

# Create .clauderc if it doesn't exist
if [ ! -f ~/.clauderc ]; then
    cat > ~/.clauderc << 'EOF'
# Claude Code Configuration - BiohackLabs.ai

# Default behavior
export CLAUDE_DEFAULT_MODE="auto"

# BiohackLabs-specific commands
alias analyze-labs='echo "Analyze this lab report and provide interpretation with supplement recommendations"'
alias test-api='echo "Test all API integrations (Supabase, OpenAI, Fullscript)"'
alias check-types='echo "Review TypeScript types for lab data structures"'
alias optimize-prompts='echo "Optimize the AI prompts for better lab interpretations"'

# General commands
alias think='echo "Please think through this step by step"'
alias ultrathink='echo "Please think harder about this complex problem"'
alias project-context='echo "Analyze this entire project structure and give me a comprehensive overview"'
alias mcp-status='claude mcp list'

echo "💡 Tip: Use 'think' for complex problems, 'context7' for library questions"
EOF
    print_success "Created ~/.clauderc configuration"
else
    print_warning "~/.clauderc already exists - skipping"
fi

# Step 6: List MCP servers
echo ""
print_status "Checking MCP servers..."
claude mcp list

# Step 7: Summary
echo ""
echo "═══════════════════════════════════════════════════"
print_success "Installation Complete! 🎉"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📋 What was installed:"
echo "  ✅ Homebrew $(brew --version | head -n1)"
echo "  ✅ Node.js $(node --version)"
echo "  ✅ npm $(npm --version)"
echo "  ✅ Claude Code $(claude --version)"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1️⃣  Add GitHub Token:"
echo "   claude mcp add github -s user -e GITHUB_TOKEN=your_token -- npx -y @modelcontextprotocol/server-github"
echo ""
echo "2️⃣  Navigate to your BiohackLabs project:"
echo "   cd ~/Projects/biohacklabs.ai"
echo ""
echo "3️⃣  Copy the setup guide:"
echo "   cp ~/Desktop/BIOHACKLABS_COMPLETE_SETUP.md ./CLAUDE.md"
echo ""
echo "4️⃣  Start Claude Code:"
echo "   claude"
echo ""
echo "5️⃣  Inside Claude Code, try:"
echo "   /help"
echo "   /mcp"
echo "   Read the CLAUDE.md file"
echo ""
echo "📚 Documentation on your Desktop:"
echo "   • INSTALLATION_CHECKLIST.md"
echo "   • BIOHACKLABS_COMPLETE_SETUP.md"
echo "   • GITHUB_TOKEN_SETUP.md"
echo ""
echo "═══════════════════════════════════════════════════"
echo "Happy Building! 🚀🧬"
echo "═══════════════════════════════════════════════════"
