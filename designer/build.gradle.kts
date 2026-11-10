plugins { `java-library` }
val ignition = "8.3.7"
dependencies {
    implementation(project(":common"))
    compileOnly("com.inductiveautomation.ignitionsdk:ignition-common:$ignition")
    compileOnly("com.inductiveautomation.ignitionsdk:designer-api:$ignition")
    compileOnly("com.inductiveautomation.ignitionsdk:perspective-common:$ignition")
    compileOnly("com.inductiveautomation.ignitionsdk:perspective-designer:$ignition")
}
