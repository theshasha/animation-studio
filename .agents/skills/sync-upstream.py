"""从固定上游提交补齐缺失技能文件；不校验、覆盖已有文件或更新已有清单。"""

import concurrent.futures
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
SOURCES = [
    ("remotion-dev/skills", "32b241b97f4e0e4ab61fe9a41b05e6e64503f8c5", ["skills/remotion-best-practices/"]),
    ("greensock/gsap-skills", "aed9cfd3277740755f6bfc1155c7aa645403b760", ["skills/gsap-core/", "skills/gsap-timeline/", "skills/gsap-react/"]),
]


def fetch(url):
    with urlopen(Request(url, headers={"User-Agent": "animation-studio-skill-import"}), timeout=60) as response:
        return response.read()


def main():
    records = []
    jobs = []
    for repo, revision, prefixes in SOURCES:
        tree = json.loads(fetch(f"https://api.github.com/repos/{repo}/git/trees/{revision}?recursive=1"))
        for item in tree["tree"]:
            path = item["path"]
            if item["type"] == "blob" and any(path.startswith(prefix) for prefix in prefixes):
                jobs.append((repo, revision, path, path.removeprefix("skills/")))
        if repo == "greensock/gsap-skills":
            for prefix in prefixes:
                jobs.append((repo, revision, "LICENSE", prefix.removeprefix("skills/") + "LICENSE"))

    def download(job):
        repo, revision, source, destination = job
        data = fetch(f"https://raw.githubusercontent.com/{repo}/{revision}/{source}")
        target = ROOT / destination
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            target.write_bytes(data)
        return {"repository": repo, "revision": revision, "source": source, "local": destination, "upstream_sha256": hashlib.sha256(data).hexdigest()}

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        records = list(pool.map(download, jobs))
    manifest = ROOT / "upstream-lock.json"
    if not manifest.exists():
        manifest.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"已获取 {len(records)} 个上游文件；已有本地文件未覆盖。")


if __name__ == "__main__":
    main()
