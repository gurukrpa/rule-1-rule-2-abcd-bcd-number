#!/bin/bash

# VS Code Hands-Free Configuration Verification Script
# Tests Claude Agent auto-approval settings and workspace configuration

echo "🔧 VS Code Hands-Free Configuration Verification"
echo "================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to check file exists and has content
check_file() {
    local file=$1
    local description=$2
    
    if [[ -f "$file" ]]; then
        if [[ -s "$file" ]]; then
            echo -e "${GREEN}✓${NC} $description exists and has content"
            ((TESTS_PASSED++))
            return 0
        else
            echo -e "${RED}✗${NC} $description exists but is empty"
            ((TESTS_FAILED++))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} $description does not exist"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to check JSON syntax
check_json_syntax() {
    local file=$1
    local description=$2
    
    if command -v jq &> /dev/null; then
        if jq empty "$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $description has valid JSON syntax"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}✗${NC} $description has invalid JSON syntax"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} jq not installed, skipping JSON syntax check for $description"
    fi
}

# Function to check VS Code setting
check_vscode_setting() {
    local setting=$1
    local expected_value=$2
    local file=".vscode/settings.json"
    
    if [[ -f "$file" ]]; then
        if grep -q "\"$setting\"" "$file"; then
            echo -e "${GREEN}✓${NC} VS Code setting '$setting' is configured"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}✗${NC} VS Code setting '$setting' is missing"
            ((TESTS_FAILED++))
        fi
    fi
}

echo -e "\n${BLUE}🔍 Checking VS Code Configuration Files${NC}"
echo "----------------------------------------"

# Check .vscode directory
if [[ -d ".vscode" ]]; then
    echo -e "${GREEN}✓${NC} .vscode directory exists"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} .vscode directory missing"
    ((TESTS_FAILED++))
    exit 1
fi

# Check configuration files
check_file ".vscode/settings.json" "VS Code settings.json"
check_file ".vscode/tasks.json" "VS Code tasks.json"
check_file ".vscode/keybindings.json" "VS Code keybindings.json"
check_file ".vscode/launch.json" "VS Code launch.json"
check_file ".vscode/extensions.json" "VS Code extensions.json"
check_file ".vscode/claude-agent.env" "Claude Agent configuration"

echo -e "\n${BLUE}🔍 Checking JSON Syntax${NC}"
echo "------------------------"

# Check JSON syntax
check_json_syntax ".vscode/settings.json" "settings.json"
check_json_syntax ".vscode/tasks.json" "tasks.json"
check_json_syntax ".vscode/keybindings.json" "keybindings.json"
check_json_syntax ".vscode/launch.json" "launch.json"
check_json_syntax ".vscode/extensions.json" "extensions.json"

echo -e "\n${BLUE}🔍 Checking Claude Agent Auto-Approval Settings${NC}"
echo "-------------------------------------------------"

# Check key Claude Agent settings
check_vscode_setting "claude.autoApprove.enabled" "true"
check_vscode_setting "claude.autoApprove.fileEdits" "true"
check_vscode_setting "claude.autoApprove.terminalCommands" "true"
check_vscode_setting "claude.handsFree.mode" "true"
check_vscode_setting "claude.handsFree.confirmations" "false"

echo -e "\n${BLUE}🔍 Checking VS Code Integration Settings${NC}"
echo "-----------------------------------------"

# Check VS Code integration settings
check_vscode_setting "files.autoSave" "onFocusChange"
check_vscode_setting "task.autoDetect" "on"
check_vscode_setting "task.confirmBeforeRun" "never"
check_vscode_setting "terminal.integrated.confirmOnExit" "never"
check_vscode_setting "git.confirmSync" "false"

echo -e "\n${BLUE}🔍 Checking Task Configuration${NC}"
echo "-------------------------------"

# Check if important tasks are configured
if [[ -f ".vscode/tasks.json" ]]; then
    if grep -q "dev-server" ".vscode/tasks.json"; then
        echo -e "${GREEN}✓${NC} Development server task configured"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} Development server task missing"
        ((TESTS_FAILED++))
    fi
    
    if grep -q "launch-autopilot" ".vscode/tasks.json"; then
        echo -e "${GREEN}✓${NC} Autopilot launch task configured"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} Autopilot launch task missing"
        ((TESTS_FAILED++))
    fi
fi

echo -e "\n${BLUE}🔍 Checking Agent Environment Configuration${NC}"
echo "--------------------------------------------"

# Check Claude Agent environment file
if [[ -f ".vscode/claude-agent.env" ]]; then
    if grep -q "CLAUDE_AUTO_APPROVE=true" ".vscode/claude-agent.env"; then
        echo -e "${GREEN}✓${NC} Claude auto-approval enabled"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} Claude auto-approval not enabled"
        ((TESTS_FAILED++))
    fi
    
    if grep -q "CLAUDE_HANDS_FREE_MODE=true" ".vscode/claude-agent.env"; then
        echo -e "${GREEN}✓${NC} Claude hands-free mode enabled"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} Claude hands-free mode not enabled"
        ((TESTS_FAILED++))
    fi
fi

echo -e "\n${BLUE}🔍 Checking Performance Optimization Integration${NC}"
echo "------------------------------------------------"

# Check if performance optimization files exist
check_file "src/components/Rule1Page_Optimized.jsx" "Optimized Rule1 component"
check_file "src/hooks/usePerformanceMonitor.js" "Performance monitor hook"
check_file "scripts/performance-test.js" "Performance test script"

echo -e "\n${BLUE}📊 Test Results Summary${NC}"
echo "========================"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo -e "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 All tests passed! VS Code is configured for hands-free operation.${NC}"
    echo -e "\n${BLUE}📋 Next Steps:${NC}"
    echo "1. Restart VS Code to apply all settings"
    echo "2. Install recommended extensions when prompted"
    echo "3. Use Cmd+Shift+Enter for hands-free Claude Agent execution"
    echo "4. Use Cmd+Shift+D to start the development server"
    echo "5. Use Cmd+Shift+O to setup optimized components"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please review the configuration.${NC}"
    echo -e "\n${BLUE}📋 Troubleshooting:${NC}"
    echo "1. Check JSON syntax in failed files"
    echo "2. Ensure all required settings are present"
    echo "3. Verify file permissions"
    echo "4. Restart VS Code after fixing issues"
    exit 1
fi
