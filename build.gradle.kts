plugins {
    base
    id("io.ia.sdk.modl") version "0.1.1"
}
allprojects {
    group = "io.github.salmandandekar.echarts"
    version = "0.1.0-dev.1"
}
subprojects {
    apply(plugin = "java-library")
    tasks.withType<JavaCompile>().configureEach {
        options.release.set(17)
        options.encoding = "UTF-8"
    }
    tasks.withType<AbstractArchiveTask>().configureEach {
        isPreserveFileTimestamps = false
        isReproducibleFileOrder = true
    }
}
ignitionModule {
    fileName.set("IgnitionECharts-${project.version}")
    name.set("Ignition ECharts")
    id.set("io.github.salmandandekar.echarts")
    moduleVersion.set(project.version.toString())
    moduleDescription.set("Independent community Apache ECharts component for Perspective")
    requiredIgnitionVersion.set("8.3.0")
    requiredFrameworkVersion.set("8")
    freeModule.set(true)
    license.set("license.html")
    moduleDependencies.put("com.inductiveautomation.perspective", "GD")
    projectScopes.putAll(mapOf(":common" to "GD", ":gateway" to "G", ":designer" to "D"))
    hooks.putAll(mapOf(
        "io.github.salmandandekar.echarts.gateway.EChartsGatewayHook" to "G",
        "io.github.salmandandekar.echarts.designer.EChartsDesignerHook" to "D"
    ))
    // Development artifact only. Public release requires separately reviewed signing.
    skipModlSigning.set(true)
}
