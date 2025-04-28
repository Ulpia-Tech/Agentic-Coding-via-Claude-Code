Execute the "tree -aF -I '.git|node_modules|venv|uploads|__pycache__/' --prune > directory-listing.txt" command.
Then remove the last non-empty line of that file.