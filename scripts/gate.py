
import json
import sys

def load(flag: str):
    return json.load(open(sys.argv[sys.argv.index(flag) + 1], encoding="utf-8"))

cov = load("--coverage")
e2e = load("--e2e")
perf = load("--perf")
sec  = load("--security")
pol  = load("--policy")

ok = True
reasons = []

if cov["overall"] < pol["coverage_min"]:
    ok = False; reasons.append("coverage")

if pol.get("require_critical_suite_pass", True) and e2e["critical_failures"] > 0:
    ok = False; reasons.append("e2e")

if perf["regression_pct"] > pol["perf_regression_max_pct"]:
    ok = False; reasons.append("perf")

severity_order = ["Low", "Medium", "High", "Critical"]
if severity_order.index(sec["max_severity"]) > severity_order.index(pol["security_max_severity"]):
    ok = False; reasons.append("security")

if not ok:
    print("Gate REJECTED:", reasons)
    sys.exit(1)

print("Gate PASSED")
