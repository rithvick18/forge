import os
import subprocess

def main():
    try:
        with open('requirements.txt', 'r') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Could not read requirements.txt: {e}")
        return

    groups = []
    current_name = "Core"
    current_reqs = []

    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.startswith('#'):
            if current_reqs:
                groups.append((current_name, current_reqs))
                current_reqs = []
            current_name = line.lstrip('#').strip()
        else:
            current_reqs.append(line)

    if current_reqs:
        groups.append((current_name, current_reqs))

    total = len(groups)
    print(f"Found {total} intelligent groups to install individually.")
    
    pip_path = os.path.join('venv', 'bin', 'pip')
    if not os.path.exists(pip_path):
        import shutil
        if shutil.which("pip"):
            pip_path = "pip"
        else:
            print(f"Error: {pip_path} not found. Ensure you are in the directory with the venv, or pip is in PATH.")
            return

    for i, (name, reqs) in enumerate(groups, 1):
        print("\n" + "="*60)
        print(f"[{i}/{total}] Installing Group: {name}")
        print(f"Packages: {', '.join(reqs)}")
        print("="*60)
        
        # Write temporary requirements to avoid pip path/escaping issues
        tmp_file = f".temp_{name.replace(' ', '_').replace('/', '_')}.txt"
        with open(tmp_file, 'w') as f:
            f.write("\n".join(reqs) + "\n")
            
        try:
            # Added --no-cache-dir to free up space, but cache is fine if it speeds up future retries. We will keep cache.
            # Upgrading pip first might also be nice, but not strictly needed.
            subprocess.run([pip_path, "install", "-r", tmp_file], check=True)
            print(f"Successfully installed group: {name}")
        except subprocess.CalledProcessError:
            print(f"Error installing group {name}. Trying to continue with other groups...")
        finally:
            if os.path.exists(tmp_file):
                os.remove(tmp_file)

    print("\nIntelligent group installation complete.")

if __name__ == "__main__":
    main()
