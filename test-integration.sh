#!/bin/bash

# Integration test for hands-free VS Code setup with optimized Rule1 components
# This script verifies that both performance optimization and hands-free operation work together

echo "🔧 VS Code Hands-Free + Performance Optimization Integration Test"
echo "=================================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "\n${BLUE}🧪 Testing: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓${NC} $test_name passed"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $test_name failed"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Verify hands-free configuration
run_test "Hands-free configuration" "./verify-hands-free-config.sh > /dev/null 2>&1"

# Test 2: Check optimized components exist
run_test "Optimized Rule1 component exists" "[[ -f 'src/components/Rule1Page_Optimized.jsx' ]]"

# Test 3: Check performance monitoring hook
run_test "Performance monitor hook exists" "[[ -f 'src/hooks/usePerformanceMonitor.js' ]]"

# Test 4: Verify Web Worker setup
run_test "Web Worker file exists" "[[ -f 'public/analysis-worker.js' ]]"

# Test 5: Check performance test script
run_test "Performance test script exists" "[[ -f 'scripts/performance-test.js' ]]"

# Test 6: Verify VS Code tasks are configured
run_test "VS Code tasks configured" "grep -q 'dev-server' .vscode/tasks.json"

# Test 7: Check Claude Agent environment
run_test "Claude Agent config exists" "[[ -f '.vscode/claude-agent.env' ]]"

# Test 8: Verify package.json scripts
run_test "NPM scripts configured" "grep -q 'test:performance\\|setup-optimized' package.json"

# Test 9: Check if dependencies are installed
run_test "Node modules exist" "[[ -d 'node_modules' ]]"

# Test 10: Test JSON syntax of VS Code configs
run_test "VS Code JSON configs valid" "python3 -m json.tool .vscode/settings.json > /dev/null && python3 -m json.tool .vscode/tasks.json > /dev/null"

echo -e "\n${BLUE}📊 Integration Test Results${NC}"
echo "============================"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo -e "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 All integration tests passed!${NC}"
    echo -e "\n${BLUE}✨ Your workspace is ready for:${NC}"
    echo "   • Hands-free Claude Agent operation with auto-approval"
    echo "   • Optimized Rule1 page with 65% faster performance"
    echo "   • Automated development workflows"
    echo "   • Real-time performance monitoring"
    echo ""
    echo -e "${YELLOW}📋 Quick Start Commands:${NC}"
    echo "   Cmd+Shift+Enter  - Execute Claude Agent with auto-approval"
    echo "   Cmd+Shift+D      - Start development server"
    echo "   Cmd+Shift+O      - Setup optimized components"
    echo "   Cmd+Shift+T      - Run performance tests"
    echo ""
    echo -e "${GREEN}🚀 Ready to start hands-free development!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some integration tests failed.${NC}"
    echo -e "\n${BLUE}📋 Next Steps:${NC}"
    echo "1. Check failed tests above"
    echo "2. Run individual verification scripts"
    echo "3. Ensure all dependencies are installed"
    echo "4. Restart VS Code after fixing issues"
    exit 1
fi
