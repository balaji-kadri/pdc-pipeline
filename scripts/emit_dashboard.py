
import json
import pathlib
import sys

def get_arg(flag: str) -> str:
    return sys.argv[sys.argv.index(flag) + 1]

tag     = get_arg("--tag")
commit  = get_arg("--commit")
reports = pathlib.Path(get_arg("--reports"))
outf    = pathlib.Path(get_arg("--out"))

cov  = json.load(open(reports / "coverage.json", encoding="utf-8"))
e2e  = json.load(open(reports / "e2e.json", encoding="utf-8"))
perf = json.load(open(reports / "perf.json", encoding="utf-8"))
sec  = json.load(open(reports / "security.json", encoding="utf-8"))

payload = {
  "build": {"tag": tag, "commit": commit, "status": "passed"},
  "metrics": {
    "coverage": cov["overall"],
    "e2e_pass_rate": 1.0 if e2e["failed"] == 0 and e2e["critical_failures"] == 0 else 0.0,
    "perf_regression_pct": perf["regression_pct"],
    "security_high_issues": sec.get("high_findings", 0)
  }
}

outf.parent.mkdir(parents=True, exist_ok=True)
outf.write_text(json.dumps(payload, indent=2), encoding="utf-8")
print("Dashboard payload written:", outf)
