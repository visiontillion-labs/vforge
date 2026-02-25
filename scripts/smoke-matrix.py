#!/usr/bin/env python3
import argparse
import io
import json
import sys
import urllib.request
import zipfile
from typing import Dict, List, Tuple


def http_generate(base_url: str, payload: Dict) -> bytes:
    url = f"{base_url.rstrip('/')}/api/generate"
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status}")
        return response.read()


def has_files(file_names: set[str], *paths: str) -> bool:
    return all(path in file_names for path in paths)


def run_matrix(base_url: str) -> List[Tuple[str, str]]:
    base_payload: Dict = {
        "projectName": "smoke-matrix",
        "router": "app",
        "language": "ts",
        "linter": "eslint",
        "srcDir": True,
        "importAlias": "@/*",
        "features": {
            "tailwind": True,
            "shadcn": True,
            "reactCompiler": False,
            "docker": False,
            "git": True,
            "storybook": False,
        },
        "auth": "none",
        "database": "none",
        "api": "none",
        "state": "none",
        "payment": "none",
        "ai": "none",
        "monitoring": "none",
        "i18n": "none",
        "i18nRouting": "prefix",
        "languages": "en, ar",
        "seo": False,
        "testing": False,
        "theme": {
            "radius": 0.5,
            "baseColor": "neutral",
            "primaryColor": "default",
            "font": "geist",
            "components": ["button", "card"],
        },
    }

    cases: List[Tuple[str, Dict]] = [("baseline", {})]
    for value in ["authjs", "next-auth", "clerk", "supabase", "firebase", "better-auth"]:
        cases.append((f"auth:{value}", {"auth": value}))
    for value in ["prisma", "drizzle", "mongoose", "firebase"]:
        cases.append((f"db:{value}", {"database": value}))
    for value in ["trpc", "graphql"]:
        cases.append((f"api:{value}", {"api": value}))
    for value in ["zustand", "redux", "jotai"]:
        cases.append((f"state:{value}", {"state": value}))
    for value in ["stripe", "lemonsqueezy", "paddle", "dodo", "polar"]:
        cases.append((f"payment:{value}", {"payment": value}))
    for value in ["sentry", "posthog", "logrocket", "google-analytics", "vercel-analytics"]:
        cases.append((f"monitoring:{value}", {"monitoring": value}))
    for value in ["next-intl", "react-i18next"]:
        cases.append((f"i18n:{value}", {"i18n": value}))

    cases.extend(
        [
            ("i18n+clerk", {"i18n": "next-intl", "auth": "clerk"}),
            ("i18n+supabase", {"i18n": "next-intl", "auth": "supabase"}),
            ("i18n-no-prefix", {"i18n": "next-intl", "i18nRouting": "no-prefix"}),
            ("pages+i18n", {"router": "pages", "i18n": "next-intl"}),
            (
                "full-ish",
                {
                    "auth": "authjs",
                    "database": "prisma",
                    "api": "trpc",
                    "state": "redux",
                    "payment": "stripe",
                    "ai": "vercel-ai-sdk",
                    "monitoring": "vercel-analytics",
                    "i18n": "next-intl",
                    "seo": True,
                    "testing": True,
                },
            ),
        ]
    )

    failures: List[Tuple[str, str]] = []

    for name, override in cases:
        payload = dict(base_payload)
        payload.update(override)
        payload["projectName"] = "smoke-" + (
            name.replace(":", "-").replace("+", "-").replace(" ", "-")
        )

        try:
            blob = http_generate(base_url, payload)
            archive = zipfile.ZipFile(io.BytesIO(blob))
            file_names = set(archive.namelist())

            if "package.json" not in file_names:
                failures.append((name, "missing package.json"))
                continue

            package_json = json.loads(archive.read("package.json").decode("utf-8"))
            dependencies = {
                **package_json.get("dependencies", {}),
                **package_json.get("devDependencies", {}),
            }

            auth = payload["auth"]
            if auth == "authjs":
                if "next-auth" not in dependencies:
                    failures.append((name, "missing dependency next-auth"))
                if not has_files(
                    file_names,
                    "auth.ts",
                    "auth.config.ts",
                    "src/app/api/auth/[...nextauth]/route.ts",
                ):
                    failures.append((name, "missing Auth.js files"))

            if auth == "better-auth":
                if "better-auth" not in dependencies:
                    failures.append((name, "missing dependency better-auth"))
                if not has_files(
                    file_names,
                    "src/lib/auth.ts",
                    "src/lib/auth-client.ts",
                    "src/app/api/auth/[...all]/route.ts",
                ):
                    failures.append((name, "missing Better Auth files"))

            if payload["api"] == "graphql" and "graphql-yoga" not in dependencies:
                failures.append((name, "missing dependency graphql-yoga"))

            if payload["api"] == "trpc" and "@trpc/server" not in dependencies:
                failures.append((name, "missing dependency @trpc/server"))

            if payload["monitoring"] == "vercel-analytics":
                for dependency in ["@vercel/analytics", "@vercel/speed-insights"]:
                    if dependency not in dependencies:
                        failures.append((name, f"missing dependency {dependency}"))

            if payload["i18n"] == "next-intl":
                if "next-intl" not in dependencies:
                    failures.append((name, "missing dependency next-intl"))

                if "middleware.ts" not in file_names:
                    failures.append((name, "missing middleware.ts for next-intl"))
                else:
                    middleware_content = archive.read("middleware.ts").decode("utf-8")

                    if payload.get("auth") == "clerk" and "@clerk/nextjs/server" not in middleware_content:
                        failures.append((name, "next-intl + clerk middleware not composed"))

                    if payload.get("auth") == "supabase" and "@supabase/ssr" not in middleware_content:
                        failures.append((name, "next-intl + supabase middleware not composed"))

                    if (
                        payload.get("i18nRouting") == "no-prefix"
                        and "localePrefix: 'never'" not in middleware_content
                    ):
                        failures.append((name, "next-intl no-prefix not applied"))
        except Exception as error:
            failures.append((name, f"exception: {error}"))

    print(f"TOTAL_CASES={len(cases)}")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Smoke-test package combinations for the Forge generator API"
    )
    parser.add_argument(
        "--base-url",
        default="http://127.0.0.1:3000",
        help="Base URL where the Next.js app is running",
    )
    args = parser.parse_args()

    failures = run_matrix(args.base_url)
    if not failures:
        print("ALL_PASS")
        return 0

    print(f"FAIL_COUNT={len(failures)}")
    for case_name, message in failures:
        print(f"- {case_name}: {message}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
