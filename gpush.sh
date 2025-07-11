#!/bin/bash

# Git auto-push script
# Usage: ./gpush.sh "Your commit message"

if [ -z "$1" ]; then
    echo "Usage: ./gpush.sh \"Your commit message\""
    exit 1
fi

echo "🚀 Auto-pushing changes..."

# Add all changes
git add -A

# Commit with message
git commit -m "$1

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to origin main
git push origin main

echo "✅ Done!"