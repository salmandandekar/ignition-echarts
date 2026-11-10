package io.github.salmandandekar.echarts.designer;

import com.inductiveautomation.ignition.common.licensing.LicenseState;
import com.inductiveautomation.ignition.designer.model.AbstractDesignerModuleHook;
import com.inductiveautomation.ignition.designer.model.DesignerContext;
import com.inductiveautomation.perspective.designer.DesignerComponentRegistry;
import com.inductiveautomation.perspective.designer.api.PerspectiveDesignerInterface;
import io.github.salmandandekar.echarts.common.EChartsComponent;

public final class EChartsDesignerHook extends AbstractDesignerModuleHook {
    private DesignerComponentRegistry registry;
    @Override public void startup(DesignerContext context, LicenseState state) {
        registry = PerspectiveDesignerInterface.get(context).getDesignerComponentRegistry();
        registry.registerComponent(EChartsComponent.DESCRIPTOR);
    }
    @Override public void shutdown() {
        if (registry != null) { registry.removeComponent(EChartsComponent.COMPONENT_ID); registry = null; }
    }
}
