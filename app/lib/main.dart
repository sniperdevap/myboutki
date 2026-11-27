// myboutiki app — shows the live myboutiki.com app, so the website and the
// phone apps are always the same and every update appears everywhere at once.
// Native parts: splash, icon, back button, photo picker, sharing, WhatsApp /
// phone / email links, offline screen, and native Google / Apple sign-in
// (Google does not allow its sign-in page inside an embedded web view).
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:share_plus/share_plus.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';

const String kHome = 'https://myboutiki.com/';
// Hosts that stay inside the app. Everything else opens outside (WhatsApp, maps, etc).
const List<String> kInside = [
  'myboutiki.com',
  'www.myboutiki.com',
  'portal.myfatoorah.com',
  'demo.myfatoorah.com',
  'myboutki.firebaseapp.com',
];
// Google web client of the myboutiki Firebase project (set at build time).
// Links to these always open in their own app
const List<String> kExternal = ['wa.me', 'whatsapp.com', 'instagram.com', 'tiktok.com', 'snapchat.com', 'x.com', 'twitter.com', 'facebook.com', 'youtube.com', 'maps.google.com', 'maps.apple.com', 'apps.apple.com', 'play.google.com'];

const String kGoogleServerClientId = String.fromEnvironment('GOOGLE_WEB_CLIENT_ID');

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyBoutkiApp());
}

class MyBoutkiApp extends StatelessWidget {
  const MyBoutkiApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MyBoutiki',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: const Color(0xFFDD2A7B), brightness: Brightness.light),
      darkTheme: ThemeData(useMaterial3: true, colorSchemeSeed: const Color(0xFFDD2A7B), brightness: Brightness.dark),
      home: const Shell(),
    );
  }
}

class Shell extends StatefulWidget {
  const Shell({super.key});
  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  DateTime? _payAt;
  late final WebViewController _web;
  int _progress = 0;
  bool _offline = false;
  bool _firstLoad = true;

  @override
  void initState() {
    super.initState();
    final PlatformWebViewControllerCreationParams params = WebViewPlatform.instance is WebKitWebViewPlatform
        ? WebKitWebViewControllerCreationParams(allowsInlineMediaPlayback: true, mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{})
        : const PlatformWebViewControllerCreationParams();
    _web = WebViewController.fromPlatformCreationParams(params, onPermissionRequest: (req) async {
      // microphone for voice messages in Inbox
      if (Platform.isAndroid && req.types.contains(WebViewPermissionResourceType.microphone)) {
        final st = await Permission.microphone.request();
        if (!st.isGranted) { await req.deny(); return; }
      }
      await req.grant();
    });
    _setup();
  }

  Future<void> _setup() async {
    final ua = await _web.getUserAgent() ?? '';
    await _web.setUserAgent('$ua myboutkiApp/1.0 (${Platform.isIOS ? 'ios' : 'android'})');
    await _web.setJavaScriptMode(JavaScriptMode.unrestricted);
    await _web.setBackgroundColor(Colors.transparent);
    await _web.addJavaScriptChannel('MBApp', onMessageReceived: (m) => _onMessage(m.message));
    await _web.setNavigationDelegate(NavigationDelegate(
      onProgress: (p) => mounted ? setState(() => _progress = p) : null,
      onPageFinished: (_) {
        if (mounted) setState(() { _firstLoad = false; _progress = 100; });
      },
      onWebResourceError: (e) {
        if (e.isForMainFrame ?? true) {
          if (mounted) setState(() => _offline = true);
        }
      },
      onNavigationRequest: (r) async {
        final uri = Uri.tryParse(r.url);
        if (uri == null) return NavigationDecision.prevent;
        final isWeb = uri.scheme == 'http' || uri.scheme == 'https';
        if (isWeb && (uri.host.contains('myfatoorah') || uri.path.startsWith('/pay'))) _payAt = DateTime.now();
        if (isWeb && (kInside.contains(uri.host) || uri.host.endsWith('.myfatoorah.com') || !r.isMainFrame)) {
          return NavigationDecision.navigate;
        }
        // During a payment the bank's 3-D Secure / KNET pages must stay inside the app
        final paying = _payAt != null && DateTime.now().difference(_payAt!).inMinutes < 20;
        if (isWeb && paying && uri.scheme == 'https' && !kExternal.any((h) => uri.host == h || uri.host.endsWith('.$h'))) {
          return NavigationDecision.navigate;
        }
        // WhatsApp, phone, email, maps, other websites, app stores → open outside the app
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        return NavigationDecision.prevent;
      },
    ));
    final platform = _web.platform;
    if (platform is AndroidWebViewController) {
      await platform.setMediaPlaybackRequiresUserGesture(false);
      await platform.setOnShowFileSelector(_pickFiles);
    }
    if (platform is WebKitWebViewController) {
      await platform.setAllowsBackForwardNavigationGestures(true);
    }
    await _web.loadRequest(Uri.parse(kHome));
  }

  // Android photo picker for <input type="file"> (iOS uses its own built-in picker)
  Future<List<String>> _pickFiles(FileSelectorParams p) async {
    final r = await FilePicker.platform.pickFiles(
      allowMultiple: p.mode == FileSelectorMode.openMultiple,
      type: FileType.image,
    );
    if (r == null) return [];
    return r.files.where((f) => f.path != null).map((f) => Uri.file(f.path!).toString()).toList();
  }

  // Messages from the website: share sheet, native sign-in
  Future<void> _onMessage(String raw) async {
    Map<String, dynamic> m;
    try { m = jsonDecode(raw) as Map<String, dynamic>; } catch (_) { return; }
    switch (m['type']) {
      case 'share':
        await Share.share([m['text'], m['url']].where((s) => s != null && '$s'.isNotEmpty).join('\n'));
        break;
      case 'google':
        await _googleSignIn();
        break;
      case 'apple':
        await _appleSignIn();
        break;
      case 'signout':
        try { await _gsi.signOut(); } catch (_) {}
        break;
      case 'shareimg':
        try {
          final bytes = base64Decode('${m['data'] ?? ''}');
          await Share.shareXFiles([XFile.fromData(bytes, mimeType: 'image/jpeg', name: '${m['name'] ?? 'myboutiki.jpg'}')], text: '${m['text'] ?? ''}');
        } catch (_) {}
        break;
      case 'open':
        final u = Uri.tryParse('${m['url'] ?? ''}');
        if (u != null && (u.scheme == 'https' || u.scheme == 'http')) await launchUrl(u, mode: LaunchMode.externalApplication);
        break;
    }
  }

  Future<void> _send(String fn, Map<String, dynamic> data) =>
      _web.runJavaScript('window.$fn && window.$fn(${jsonEncode(data)})');

  // One shared client: creating it again and signing out before every
  // sign-in added a network round trip before the account sheet appeared.
  static final GoogleSignIn _gsi = GoogleSignIn(scopes: const ['email', 'profile'], serverClientId: kGoogleServerClientId.isEmpty ? null : kGoogleServerClientId);

  Future<void> _googleSignIn() async {
    try {
      final acc = await _gsi.signIn();
      if (acc == null) return _send('mbNativeAuth', {'cancel': true});
      final auth = await acc.authentication;
      await _send('mbNativeAuth', {'provider': 'google', 'idToken': auth.idToken, 'accessToken': auth.accessToken});
    } catch (e) {
      await _send('mbNativeAuth', {'error': '$e'});
    }
  }

  Future<void> _appleSignIn() async {
    try {
      final raw = _nonce();
      final cred = await SignInWithApple.getAppleIDCredential(
        scopes: [AppleIDAuthorizationScopes.email, AppleIDAuthorizationScopes.fullName],
        nonce: sha256.convert(utf8.encode(raw)).toString(),
      );
      await _send('mbNativeAuth', {
        'provider': 'apple',
        'idToken': cred.identityToken,
        'rawNonce': raw,
        'name': [cred.givenName, cred.familyName].where((s) => s != null && s.isNotEmpty).join(' '),
      });
    } on SignInWithAppleAuthorizationException catch (e) {
      if (e.code == AuthorizationErrorCode.canceled) return _send('mbNativeAuth', {'cancel': true});
      await _send('mbNativeAuth', {'error': e.message});
    } catch (e) {
      await _send('mbNativeAuth', {'error': '$e'});
    }
  }

  String _nonce([int n = 32]) {
    const cs = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    final r = Random.secure();
    return List.generate(n, (_) => cs[r.nextInt(cs.length)]).join();
  }

  Future<void> _retry() async {
    setState(() { _offline = false; _firstLoad = true; });
    await _web.reload();
  }

  @override
  Widget build(BuildContext context) {
    final dark = MediaQuery.platformBrightnessOf(context) == Brightness.dark;
    final bg = dark ? const Color(0xFF17212B) : Colors.white;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: dark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, _) async {
          if (didPop) return;
          if (await _web.canGoBack()) {
            await _web.goBack();
          } else {
            await SystemNavigator.pop();
          }
        },
        child: Scaffold(
          backgroundColor: bg,
          body: Stack(children: [
            SafeArea(
              bottom: false,
              child: Stack(children: [
                WebViewWidget(controller: _web),
                if (_progress < 100 && !_firstLoad)
                  const Positioned(top: 0, left: 0, right: 0, child: LinearProgressIndicator(minHeight: 2, color: Color(0xFFDD2A7B), backgroundColor: Colors.transparent)),
                if (_offline) Positioned.fill(child: _OfflineView(bg: bg, onRetry: _retry)),
              ]),
            ),
            // Same logo, size and position as the native launch screen, so the
            // hand-over from the system splash is seamless (no second splash).
            if (_firstLoad && !_offline)
              Positioned.fill(child: Container(color: bg, alignment: Alignment.center,
                  child: Image.asset(dark ? 'assets/splash_dark.png' : 'assets/splash_light.png', width: 90))),
          ]),
        ),
      ),
    );
  }
}

class _OfflineView extends StatelessWidget {
  const _OfflineView({required this.bg, required this.onRetry});
  final Color bg;
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) {
    return Container(
      color: bg,
      padding: const EdgeInsets.all(32),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.wifi_off_rounded, size: 56),
        const SizedBox(height: 14),
        const Text('No internet connection', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        const Text('لا يوجد اتصال بالإنترنت', style: TextStyle(fontSize: 16)),
        const SizedBox(height: 22),
        FilledButton(onPressed: onRetry, child: const Text('Try again · حاول مجدداً')),
      ]),
    );
  }
}
