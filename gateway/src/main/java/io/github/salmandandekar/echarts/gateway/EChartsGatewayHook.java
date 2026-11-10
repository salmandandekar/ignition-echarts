package io.github.salmandandekar.echarts.gateway;

import java.util.Optional;
import com.inductiveautomation.ignition.common.licensing.LicenseState;
import com.inductiveautomation.ignition.gateway.model.AbstractGatewayModuleHook;
import com.inductiveautomation.ignition.gateway.model.GatewayContext;
import com.inductiveautomation.perspective.common.api.ComponentRegistry;
import com.inductiveautomation.perspective.gateway.api.PerspectiveContext;
import io.github.salmandandekar.echarts.common.EChartsComponent;

public final class EChartsGatewayHook extends AbstractGatewayModuleHook {
    private GatewayContext context;
    private ComponentRegistry registry;
    @Override public void setup(GatewayContext context) { this.context = context; }
    @Override public void startup(LicenseState licenseState) {
        registry = PerspectiveContext.get(context).getComponentRegistry();
        if (registry == null) throw new IllegalStateException("Perspective component registry unavailable");
        registry.registerComponent(EChartsComponent.DESCRIPTOR);
    }
    @Override public void shutdown() {
        if (registry != null) { registry.removeComponent(EChartsComponent.COMPONENT_ID); registry = null; }
        context = null;
    }
    @Override public Optional<String> getMountedResourceFolder() { return Optional.of("mounted"); }
    @Override public Optional<String> getMountPathAlias() { return Optional.of(EChartsComponent.URL_ALIAS); }
    @Override public boolean isFreeModule() { return true; }
}
