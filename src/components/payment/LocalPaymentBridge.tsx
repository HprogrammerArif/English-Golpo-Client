import React, { useRef } from 'react';
import { View, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

interface LocalPaymentBridgeProps {
  checkoutUrl: string;
  onSuccess: (transactionId: string) => void;
  onFailure: (errorMessage: string) => void;
}

export const LocalPaymentBridge: React.FC<LocalPaymentBridgeProps> = ({
  checkoutUrl,
  onSuccess,
  onFailure,
}) => {
  const webViewRef = useRef<any>(null);
  const WebViewComponent = WebView as any;

  const handleNavigationChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    // Check redirect URLs configured on the backend
    if (url.includes('/api/payment/success')) {
      // Extract payment/transaction ID from redirect parameters
      const match = url.match(/[?&]transactionId=([^&]+)/);
      const transactionId = match ? match[1] : 'unknown';
      onSuccess(transactionId);
    } else if (url.includes('/api/payment/fail') || url.includes('/api/payment/cancel')) {
      const match = url.match(/[?&]reason=([^&]+)/);
      const reason = match ? decodeURIComponent(match[1]) : 'Payment failed or was cancelled.';
      onFailure(reason);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <WebViewComponent
        ref={webViewRef}
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleNavigationChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        )}
      />
    </SafeAreaView>
  );
};
