import os
import winreg

git_cmd = r"C:\Users\ASUS\AppData\Local\Programs\Git\cmd"
key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment", 0, winreg.KEY_ALL_ACCESS)
current_path, _ = winreg.QueryValueEx(key, "Path")
parts = [p for p in current_path.split(";") if p and "git" not in p.lower()]
parts.append(git_cmd)
new_path = ";".join(parts)
winreg.SetValueEx(key, "Path", 0, winreg.REG_EXPAND_SZ, new_path)
winreg.CloseKey(key)
print("Updated User PATH:", new_path)

# Also create a wrapper in .local\bin and WindowsApps
local_bin = r"C:\Users\ASUS\.local\bin"
if os.path.exists(local_bin):
    bat_path = os.path.join(local_bin, "git.cmd")
    with open(bat_path, "w") as f:
        f.write('@"C:\\Users\\ASUS\\AppData\\Local\\Programs\\Git\\cmd\\git.exe" %*\n')
    print("Created shim in:", bat_path)
