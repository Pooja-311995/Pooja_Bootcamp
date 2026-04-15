#!/bin/bash

echo "╔═══════════════════════════════════════════════════════╗"
echo "║     GRABO EMAIL WEBHOOK DIRECT TEST                   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Webhook URL
WEBHOOK_URL="https://app.contentstack.com/automations-api/run/e4b5b323da00490bb572847a94b7ee06"

# Test parameters
TO="pooja.mandwale@contentstack.com"
SUBJECT="Direct Test Email from Grabo - $(date '+%Y-%m-%d %H:%M:%S')"
BODY="Hi,

This is a DIRECT test email sent via curl to verify the Contentstack automation webhook.

Test Details:
• Sent at: $(date)
• Test ID: TEST-$(date +%s)
• Method: Direct curl command

If you're seeing this email, the webhook is working correctly and the issue is with the React app's fetch call.

If you're NOT seeing this email:
1. The webhook URL might be incorrect
2. The Contentstack automation might not be configured
3. The email service in Contentstack might not be set up
4. There might be a problem with the webhook itself

Please check your Contentstack automation settings.

Warmly,
Team Grabo"

echo -e "${BLUE}📋 Test Configuration:${NC}"
echo "  • Webhook URL: $WEBHOOK_URL"
echo "  • Recipient: $TO"
echo "  • Subject: $SUBJECT"
echo ""

echo -e "${YELLOW}⏳ Sending test email via curl...${NC}"
echo ""

# URL encode the parameters
TO_ENCODED=$(echo -n "$TO" | jq -sRr @uri)
SUBJECT_ENCODED=$(echo -n "$SUBJECT" | jq -sRr @uri)
BODY_ENCODED=$(echo -n "$BODY" | jq -sRr @uri)

# Build the full URL
FULL_URL="${WEBHOOK_URL}?To=${TO_ENCODED}&Subject=${SUBJECT_ENCODED}&Body=${BODY_ENCODED}"

echo -e "${BLUE}🔗 Full URL length: ${#FULL_URL} characters${NC}"
echo ""

# Send the request and capture response
echo -e "${BLUE}📡 Sending GET request...${NC}"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$FULL_URL" \
  -H "Content-Type: application/json")

# Split response body and status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📨 Response Details:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ HTTP Status: $HTTP_STATUS OK${NC}"
    echo ""
    echo -e "${GREEN}✅ SUCCESS: Email sent successfully!${NC}"
    echo ""
    echo -e "${BLUE}📧 Response Body:${NC}"
    echo "$HTTP_BODY"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✨ TEST PASSED${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${YELLOW}📬 Next Steps:${NC}"
    echo "  1. Check your email inbox: $TO"
    echo "  2. Check spam/junk folder"
    echo "  3. Wait 1-5 minutes for delivery"
    echo "  4. If no email received, check Contentstack automation logs"
    echo ""
    echo -e "${YELLOW}💡 Note:${NC}"
    echo "  If this webhook test succeeds but the React app doesn't send emails,"
    echo "  the issue is with the React app's fetch call (likely CORS or network issue)."
    echo ""
else
    echo -e "${RED}❌ HTTP Status: $HTTP_STATUS${NC}"
    echo ""
    echo -e "${RED}❌ FAILURE: Email sending failed${NC}"
    echo ""
    echo -e "${BLUE}📧 Response Body:${NC}"
    echo "$HTTP_BODY"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${RED}✨ TEST FAILED${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
    
    if [ "$HTTP_STATUS" -eq 400 ]; then
        echo "  • Status 400: Bad Request"
        echo "  • Possible cause: Invalid parameters or encoding"
        echo "  • Action: Check webhook URL and parameter format"
    elif [ "$HTTP_STATUS" -eq 401 ]; then
        echo "  • Status 401: Unauthorized"
        echo "  • Possible cause: Webhook URL is incorrect or expired"
        echo "  • Action: Verify webhook ID in Contentstack"
    elif [ "$HTTP_STATUS" -eq 404 ]; then
        echo "  • Status 404: Not Found"
        echo "  • Possible cause: Webhook doesn't exist"
        echo "  • Action: Check automation is published in Contentstack"
    elif [ "$HTTP_STATUS" -eq 500 ]; then
        echo "  • Status 500: Server Error"
        echo "  • Possible cause: Contentstack automation error"
        echo "  • Action: Check Contentstack automation logs"
    else
        echo "  • Unexpected status code: $HTTP_STATUS"
        echo "  • Action: Check Contentstack automation settings"
    fi
    echo ""
    echo -e "${YELLOW}📋 What to Check in Contentstack:${NC}"
    echo "  1. Go to: Settings → Automations"
    echo "  2. Find your email automation"
    echo "  3. Verify status is 'Active' or 'Enabled'"
    echo "  4. Check email service is configured"
    echo "  5. Verify webhook URL matches: $WEBHOOK_URL"
    echo "  6. Test the automation directly in Contentstack UI"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

