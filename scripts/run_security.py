
import json
import pathlib
import sys

def get_arg(flag: str) -> str:
    try:
        return sys.argv[sys.argv.index(flag) + 1]
    except ValueError:
        print(f"Missing flag {flag}")
        sys.exit(2)

out = pathlib.Path(get_arg("--report"))
out.parent.mkdir(parents=True, exist_ok=True)

# Simulated security scan result; swap with real scanner later.
result = {"max_severity": "Medium", "high_findings": 0}

out.write_text(json.dumps(result, indent=2), encoding="utf-8")
print("Security report written to", out)