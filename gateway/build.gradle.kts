plugins { `java-library` }
val ignition = "8.3.7"
dependencies {
    implementation(project(":common"))
    compileOnly("com.inductiveautomation.ignitionsdk:ignition-common:$ignition")
    compileOnly("com.inductiveautomation.ignitionsdk:gateway-api:$ignition")
    compileOnly("com.inductiveautomation.ignitionsdk:perspective-common:$ignition")
    compileOnly("com.inductiveautomation.ignitionsdk:perspective-gateway:$ignition")
}
val webDirectory = rootProject.layout.projectDirectory.dir("web")
val npmInstall by tasks.registering(Exec::class) {
    workingDir(webDirectory)
    commandLine("npm", "ci", "--no-fund")
    inputs.files(webDirectory.file("package.json"), webDirectory.file("package-lock.json"))
    outputs.dir(webDirectory.dir("node_modules"))
}
val buildWeb by tasks.registering(Exec::class) {
    dependsOn(npmInstall)
    workingDir(webDirectory)
    commandLine("npm", "run", "build")
    inputs.dir(webDirectory.dir("src"))
    inputs.files(webDirectory.file("vite.config.ts"), webDirectory.file("tsconfig.json"), webDirectory.file("package-lock.json"))
    outputs.dir(webDirectory.dir("dist"))
}
val webLicenses by tasks.registering(Exec::class) {
    dependsOn(npmInstall)
    workingDir(webDirectory)
    commandLine("npm", "run", "licenses")
    inputs.file(rootProject.file("scripts/collect-licenses.mjs"))
    inputs.file(webDirectory.file("package-lock.json"))
    outputs.file(webDirectory.file("build/THIRD_PARTY_NOTICES.txt"))
}
tasks.processResources {
    dependsOn(buildWeb, webLicenses)
    from(webDirectory.dir("dist")) { into("mounted") }
    from(webDirectory.file("build/THIRD_PARTY_NOTICES.txt")) { into("mounted") }
    from(rootProject.file("LICENSE")) { into("META-INF") }
    from(rootProject.file("NOTICE")) { into("META-INF") }
}
