# Data binding and formatting

`props.option` is ordinary bindable JSON. Keep database/tag/historian access in
Perspective bindings and transforms; this browser renderer does not query a
Gateway database or receive database credentials.

Static examples: paste any `examples/*.json` object into `props.option`.
For named queries/SQL datasets, bind the **whole option** and add a script transform:

```python
# value is the binding's Dataset. Column names must match your query.
rows = system.dataset.toPyDataSet(value)
source = [[str(row['label']), float(row['value'])] for row in rows]
return {
    'dataset': {'source': source},
    'xAxis': {'type': 'category'}, 'yAxis': {'type': 'value'},
    'series': [{'id': 'production', 'type': 'bar',
                'encode': {'x': 0, 'y': 1}}]
}
```

For tag history, request a bounded history window in the normal Perspective tag
history binding, then transform its timestamp and value columns:

```python
rows = system.dataset.toPyDataSet(value)
# Replace t_stamp and Temperature with the actual binding column names.
points = [[system.date.toMillis(row['t_stamp']), float(row['Temperature'])]
          for row in rows if row['Temperature'] is not None]
return {
    'animation': False,
    'xAxis': {'type': 'time'}, 'yAxis': {'type': 'value'},
    'dataZoom': [{'type': 'inside'}, {'type': 'slider'}],
    'series': [{'id': 'temperature', 'type': 'line', 'showSymbol': False,
                'sampling': 'lttb', 'data': points}]
}
```

For a single numeric tag bind `option.series[0].data[0].value` on a gauge, or use a
transform returning the complete gauge option. Use ordinary Perspective quality
handling and `loading`; decide in the project how to represent bad quality or
missing values. Do not convert missing industrial readings into misleading zeros.
Array/JSON query results can be mapped to `{dataset: {source: rows}}` instead of a
Dataset transform. Sanitize nonfinite values and use epoch milliseconds for time
axes. Examples above are documentation, not executed Gateway script tests.

For larger histories, aggregate/downsample upstream and keep a bounded window.
LTTB reduces rendering detail but raw values still use network/browser memory.
A new full option snapshot with updateMode=replace recovers deterministically
after a binding reconnect. There is no module streaming buffer or appendData API.

String templates such as `tooltip.formatter: '{b}: {c}'` and
`yAxis.axisLabel.formatter: '{value} °C'` are safe configuration alternatives to
functions. No eval or callback reconstruction exists. HTML tooltip rendering,
toolbox DataView, external images and navigation links are rejected or overridden.
Use a Perspective Table bound to the same data for accessible equivalent values.
Format a separate data field upstream when a complex localized formatter is
needed. Event payloads are bounded projections, not a second copy of the dataset.
