#!/usr/bin/env python3
"""Run Gradle with Java proxy properties derived from the managed environment.
No credentials are copied or logged. For an ordinary machine, use ./gradlew.
"""
import os
from pathlib import Path
import sys
from urllib.parse import urlsplit
root = Path(__file__).resolve().parent.parent
env = os.environ.copy()
env.setdefault('GRADLE_USER_HOME', '/workspace/.cache/gradle')
env.setdefault('npm_config_cache', '/workspace/.cache/npm')
properties = []
for protocol in ('http', 'https'):
    proxy = env.get(protocol.upper() + '_PROXY') or env.get(protocol + '_proxy')
    if proxy:
        parsed = urlsplit(proxy)
        if parsed.username or parsed.password:
            sys.exit('Authenticated proxy URLs require a supported Java credential integration')
        properties.extend([f'-D{protocol}.proxyHost={parsed.hostname}', f'-D{protocol}.proxyPort={parsed.port or 80}'])
properties.append('-Dhttp.nonProxyHosts=localhost|127.*|[::1]')
os.chdir(root)
os.execvpe('bash', ['bash', str(root / 'gradlew'), *properties, *sys.argv[1:]], env)
