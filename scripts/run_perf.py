
import json
import pathlib
import sys

def get_arg(flag: str) -> str:
    try:
        return sys.argv[sys.argv.index(flag) + 1]
    except ValueError:
        print(f"Missing flag {flag}")
        sys.exit(2)

budget = float(get_arg("--budget"))
out = pathlib.Path(get_arg("--report"))
out.parent.mkdir(parents=True, exist_ok=True)

# Simulate a measured regression percentage; replace with real measurement logic later.
result = {"regression_pct": 0.05, "budget": budget}

out.write_text(json.dumps(result, indent=2), encoding="utf-8")
print("Perf report written to", out)
