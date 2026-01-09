
import json
import pathlib
import sys

def get_arg(flag: str) -> str:
    try:
        return sys.argv[sys.argv.index(flag) + 1]
    except ValueError:
        print(f"Missing flag {flag}")
        sys.exit(2)

lab_path = pathlib.Path(get_arg("--lab"))
service_path = pathlib.Path(get_arg("--service"))
os_path = pathlib.Path(get_arg("--os"))

lab = json.loads(lab_path.read_text(encoding="utf-8"))
service = json.loads(service_path.read_text(encoding="utf-8"))
osjson = json.loads(os_path.read_text(encoding="utf-8"))

pdc = {
    "component": "pdc",
    "inputs": {
        "lab": lab.get("version"),
        "service": service.get("version"),
        "os": osjson.get("version")
    },
    "data": {"summary": "composed ok"}
}

out = pathlib.Path("dist")
out.mkdir(exist_ok=True)
(out / "pdc.json").write_text(json.dumps(pdc, indent=2), encoding="utf-8")
print("Composed dist/pdc.json")
