plugins { `java-library` }
val ignition = "8.3.7"
dependencies {
    compileOnly("com.inductiveautomation.ignitionsdk:ignition-common:$ignition")
    compileOnly("com.inductiveautomation.ignitionsdk:perspective-common:$ignition")
}
