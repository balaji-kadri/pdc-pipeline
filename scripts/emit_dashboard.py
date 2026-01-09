
import json
import pathlib
import sys

def get_arg(flag: str) -> str:
    return sys.argv[sys.argv.index(flag) + 1]

tag     = get_arg("--tag")
commit  = get_arg("--commit")
reports = pathlib.Path(get_arg("--reports"))
outf    = pathlib.Path(get_arg("--out"))

def load_json(path: pathlib.Path, default: dict, name: str):
    if not path.exists():
        print(f"⚠️  {name} report not found at {path}. Using defaults: {default}")
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"⚠️  Failed to read {name} from {path}: {e}. Using defaults: {default}")
        return default

cov  = load_json(reports / "coverage.json", {"overall": 0.0}, "coverage")
e2e  = load_json(reports / "e2e.json",      {"failed": 1, "critical_failures": 1}, "e2e")
perf = load_json(reports / "perf.json",     {"regression_pct": 1.0}, "perf")
sec  = load_json(reports / "security.json", {"high_findings": 99, "max_severity": "Critical"}, "security")

payload = {
  "build": {"tag": tag, "commit": commit, "status": "passed"},
  "metrics": {
    "coverage": cov.get("overall", 0.0),
    "e2e_pass_rate": 1.0 if e2e.get("failed", 1) == 0 and e2e.get("critical_failures", 1) == 0 else 0.0,
    "perf_regression_pct": perf.get("regression_pct", 1.0),
    "security_high_issues": sec.get("high_findings", 99)
  }
}

outf.parent.mkdir(parents=True, exist_ok=True)
outf.write_text(json.dumps(payload, indent=2), encoding="utf-8")
print("✅ Dashboard payload written:", outf)
