#!/usr/bin/env bash
# Creates the Android/iOS project folders and applies myboutiki settings.
# Run from anywhere: bash app/tool/prepare.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d android ] || [ ! -d ios ]; then
  flutter create --org com.myboutki --project-name myboutki --platforms android,ios --no-pub .
  rm -f test/widget_test.dart
fi

# ---------- Android ----------
G=android/app/build.gradle.kts; [ -f "$G" ] || G=android/app/build.gradle
sed -i.bak -E 's/applicationId *=? *"[^"]+"/applicationId = "com.myboutki.app"/' "$G"
sed -i.bak -E 's/minSdk *=? *flutter\.minSdkVersion/minSdk = 23/' "$G"
M=android/app/src/main/AndroidManifest.xml
sed -i.bak -E 's/android:label="[^"]*"/android:label="myboutiki"/' "$M"
grep -q 'android.permission.INTERNET' "$M" || sed -i.bak 's#<application#<uses-permission android:name="android.permission.INTERNET"/>\n    <application#' "$M"
grep -q 'RECORD_AUDIO' "$M" || sed -i.bak 's#<application#<uses-permission android:name="android.permission.RECORD_AUDIO"/>\n    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>\n    <application#' "$M"

# Release signing with the Play upload key (only when the key is provided as CI secrets)
if [ -n "${ANDROID_KEYSTORE_B64:-}" ]; then
  echo "$ANDROID_KEYSTORE_B64" | base64 -d > android/app/upload.jks
  cat > android/key.properties <<EOF
storePassword=${ANDROID_KEYSTORE_PASSWORD}
keyPassword=${ANDROID_KEY_PASSWORD:-$ANDROID_KEYSTORE_PASSWORD}
keyAlias=${ANDROID_KEY_ALIAS:-upload}
storeFile=upload.jks
EOF
  python3 - "$G" <<'PY'
import sys,re
p=sys.argv[1];s=open(p).read()
if 'upload.jks' in s or 'keystoreProperties' in s: sys.exit()
if p.endswith('.kts'):
    s=s.replace('android {','''val keystoreProperties = java.util.Properties().apply { val f = rootProject.file("key.properties"); if (f.exists()) load(java.io.FileInputStream(f)) }
android {''',1)
    s=s.replace('buildTypes {','''signingConfigs { create("release") { keyAlias = keystoreProperties["keyAlias"] as String?; keyPassword = keystoreProperties["keyPassword"] as String?; storeFile = (keystoreProperties["storeFile"] as String?)?.let { file(it) }; storePassword = keystoreProperties["storePassword"] as String? } }
    buildTypes {''',1)
    s=re.sub(r'signingConfig = signingConfigs.getByName\("debug"\)','signingConfig = signingConfigs.getByName("release")',s)
else:
    s=s.replace('android {','''def keystoreProperties = new Properties(); def kf = rootProject.file('key.properties'); if (kf.exists()) { keystoreProperties.load(new FileInputStream(kf)) }
android {''',1)
    s=s.replace('buildTypes {','''signingConfigs { release { keyAlias keystoreProperties['keyAlias']; keyPassword keystoreProperties['keyPassword']; storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null; storePassword keystoreProperties['storePassword'] } }
    buildTypes {''',1)
    s=s.replace('signingConfig signingConfigs.debug','signingConfig signingConfigs.release')
open(p,'w').write(s)
PY
fi

# ---------- iOS ----------
P=ios/Runner.xcodeproj/project.pbxproj
sed -i.bak -E 's/PRODUCT_BUNDLE_IDENTIFIER = com\.myboutki\.myboutki;/PRODUCT_BUNDLE_IDENTIFIER = com.myboutki.app;/g' "$P"
sed -i.bak -E 's/IPHONEOS_DEPLOYMENT_TARGET = [0-9.]+;/IPHONEOS_DEPLOYMENT_TARGET = 13.0;/g' "$P"
PL=ios/Runner/Info.plist
python3 - "$PL" <<'PY'
import sys,plistlib
p=sys.argv[1];d=plistlib.load(open(p,'rb'))
d['CFBundleDisplayName']='myboutiki'; d['CFBundleName']='myboutiki'
d['NSPhotoLibraryUsageDescription']='myboutiki uses your photos so you can add pictures of the items you sell.'
d['NSCameraUsageDescription']='myboutiki uses the camera so you can take photos of the items you sell.'
d['NSMicrophoneUsageDescription']='myboutiki uses the microphone so you can send voice messages in Inbox.'
d['LSApplicationQueriesSchemes']=['whatsapp','tel','mailto','instagram','https']
d['ITSAppUsesNonExemptEncryption']=False
d['CFBundleLocalizations']=['en','ar']
import os
rev=os.environ.get('GOOGLE_IOS_REVERSED_CLIENT_ID','')
if rev: d['CFBundleURLTypes']=[{'CFBundleURLSchemes':[rev]}]
gid=os.environ.get('GOOGLE_IOS_CLIENT_ID','')
if gid: d['GIDClientID']=gid
plistlib.dump(d,open(p,'wb'))
PY
find . -name '*.bak' -delete

flutter pub get
dart run flutter_launcher_icons
dart run flutter_native_splash:create
echo "prepared"
