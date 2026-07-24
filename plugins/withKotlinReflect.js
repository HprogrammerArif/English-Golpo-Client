/**
 * withKotlinReflect.js — Expo Config Plugin
 *
 * Permanently adds `kotlin-reflect` to the Android app's build.gradle dependencies.
 * This prevents the `LazyKType ClassNotFoundException` crash in expo-modules-core,
 * which occurs because expo-modules uses Kotlin reflection internally but the
 * kotlin-reflect library is not always automatically included in the APK's DEX.
 *
 * This plugin runs on every `npx expo prebuild`, so the fix survives `--clean` rebuilds.
 */

const { withAppBuildGradle } = require('@expo/config-plugins');

const withKotlinReflect = (config) => {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    // Avoid duplicate insertions
    if (contents.includes('kotlin-reflect')) {
      return config;
    }

    // Insert the kotlin-reflect dependency just before the closing brace of dependencies {}
    config.modResults.contents = contents.replace(
      /(\s*if \(hermesEnabled\.toBoolean\(\)\)[\s\S]*?}\s*\n)(})/,
      (match, hermesBlock, closingBrace) => {
        return (
          hermesBlock +
          '\n    // Fix: ensure kotlin-reflect is bundled to prevent LazyKType ClassNotFoundException\n' +
          '    // expo-modules-core uses Kotlin reflection internally\n' +
          '    implementation "org.jetbrains.kotlin:kotlin-reflect"\n' +
          closingBrace
        );
      }
    );

    return config;
  });
};

module.exports = withKotlinReflect;
