#!/usr/bin/env python3
import os
import subprocess
import sys

def get_all_files(directory):
    """Get all files in a directory recursively."""
    file_paths = []
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and venv directories
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if 'venv' in dirs:
            dirs.remove('venv')
            
        for file in files:
            file_path = os.path.join(root, file)
            file_paths.append(file_path)
    return file_paths

def run_claude_on_files(files, prompt):
    """Run claude on each file with the given prompt."""
    for file in files:
        print(f"Processing: {file}")
        cmd = f'claude -p "{prompt}" {file} --dangerously-skip-permissions'
        try:
            subprocess.run(cmd, shell=True, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error processing {file}: {e}")

def main():
    print("Select which part of the codebase to process:")
    print("(1) Frontend")
    print("(2) Backend")
    
    choice = input("Enter your choice (1 or 2): ")
    
    # Base directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    if choice == "1":
        directory = os.path.join(base_dir, "frontend")
        prompt = input("Enter prompt for frontend files: ")
    elif choice == "2":
        directory = os.path.join(base_dir, "backend")
        prompt = input("Enter prompt for backend files: ")
    else:
        print("Invalid choice. Please enter 1 or 2.")
        sys.exit(1)
    
    # Get all files in the selected directory
    files = get_all_files(directory)
    
    # Confirm with the user
    print(f"Found {len(files)} files in {directory}")
    confirm = input("Do you want to process all these files? (y/n): ")
    
    if confirm.lower() != "y":
        print("Operation cancelled.")
        sys.exit(0)
    
    # Run claude on each file
    run_claude_on_files(files, prompt)
    
    print("Processing completed.")

if __name__ == "__main__":
    main()