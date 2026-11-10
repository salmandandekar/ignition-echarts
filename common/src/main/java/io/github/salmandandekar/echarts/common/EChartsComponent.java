package io.github.salmandandekar.echarts.common;

import java.util.List;
import java.util.Set;
import com.inductiveautomation.ignition.common.jsonschema.JsonSchema;
import com.inductiveautomation.perspective.common.api.BrowserResource;
import com.inductiveautomation.perspective.common.api.ComponentDescriptor;
import com.inductiveautomation.perspective.common.api.ComponentDescriptorImpl;
import com.inductiveautomation.perspective.common.api.ComponentEventDescriptor;

/** Schema version 1. Keep these identifiers stable across project upgrades. */
public final class EChartsComponent {
    public static final String MODULE_ID = "io.github.salmandandekar.echarts";
    public static final String COMPONENT_ID = "community.echarts.chart";
    public static final String URL_ALIAS = "ignition-echarts";
    private static JsonSchema schema(String path) {
        return JsonSchema.parse(EChartsComponent.class.getResourceAsStream(path));
    }
    public static final ComponentDescriptor DESCRIPTOR = ComponentDescriptorImpl.ComponentBuilder.newBuilder()
        .setId(COMPONENT_ID)
        .setModuleId(MODULE_ID)
        .setName("ECharts")
        .setDefaultMetaName("echarts")
        .setPaletteCategory("Charts")
        .addPaletteEntry("", "ECharts", "Interactive Apache ECharts chart", null, null)
        .setSchema(schema("/echarts.props.json"))
        .setEvents(List.of(
            new ComponentEventDescriptor("onChartClick", "Chart data click", schema("/events/click.json")),
            new ComponentEventDescriptor("onDataZoom", "User zoom, limited to 10 events/second", schema("/events/zoom.json")),
            new ComponentEventDescriptor("onLegendSelectChanged", "Legend selection changed", schema("/events/legend.json"))
        ))
        .setResources(Set.of(
            new BrowserResource("ignition-echarts-js", "/res/" + URL_ALIAS + "/IgnitionECharts.js", BrowserResource.ResourceType.JS),
            new BrowserResource("ignition-echarts-css", "/res/" + URL_ALIAS + "/IgnitionECharts.css", BrowserResource.ResourceType.CSS)
        ))
        .build();
    private EChartsComponent() {}
}
