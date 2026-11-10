#!/usr/bin/env python3
"""Validate an actual built module; absent artifacts are failures."""
import io
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import zipfile

path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('build/IgnitionECharts-0.1.0-dev.1.unsigned.modl')
assert path.is_file(), f'Missing module: {path}'
with zipfile.ZipFile(path) as mod:
    xml = mod.read('module.xml')
    root = ET.fromstring(xml)
    module = root if root.tag == 'module' else root.find('module')
    assert module is not None, 'Missing module declaration'
    assert module.findtext('id') == 'io.github.salmandandekar.echarts'
    assert module.findtext('requiredIgnitionVersion') == '8.3.0'
    assert 'com.inductiveautomation.perspective' in xml.decode()
    jars = {name: zipfile.ZipFile(io.BytesIO(mod.read(name))) for name in mod.namelist() if name.endswith('.jar')}
    names = [n for jar in jars.values() for n in jar.namelist()]
    for required in ['EChartsGatewayHook.class', 'EChartsDesignerHook.class', 'EChartsComponent.class',
                     'echarts.props.json', 'mounted/IgnitionECharts.js', 'mounted/IgnitionECharts.css', 'mounted/THIRD_PARTY_NOTICES.txt']:
        assert any(n.endswith(required) for n in names), f'Missing {required}'
    assert not any('com/inductiveautomation/ignition/' in n for n in names), 'Platform classes must not be bundled'
    js = next(j.read('mounted/IgnitionECharts.js') for j in jars.values() if 'mounted/IgnitionECharts.js' in j.namelist())
    assert len(js) > 100_000, 'Unexpectedly small ECharts bundle'
    assert b'community.echarts.chart' in js
print(f'Validated module structure: {path}')
