import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import Button from './Button';
import { theme } from '@/app/theme';

interface HouseViewerProps {
  modelUri: string;
  isLocalFile?: boolean;
}

const HouseViewer: React.FC<HouseViewerProps> = ({ modelUri, isLocalFile = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden; 
            width: 100%; 
            height: 100vh;
            font-family: Poppins, sans-serif;
          }
          .container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .error-message {
            color: #721c24;
            background-color: #f8d7da;
            padding: 15px;
            border-radius: 10px;
            max-width: 80%;
            text-align: center;
          }
          progress {
            width: 70%;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div id="container" class="container">
          <script type="module">
            // Log all errors to aid debugging
            window.onerror = function(message, source, lineno, colno, error) {
              window.ReactNativeWebView.postMessage('JS_ERROR: ' + message);
              return true;
            };

            // Function to log details to React Native
            function logToApp(message) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('LOG: ' + message);
              }
            }

            // Try fetching the model directly first to check if it's accessible
            logToApp('Trying to fetch model from: ${modelUri}');
            
            fetch('${modelUri}', {
              mode: 'cors',
              headers: {
                'ngrok-skip-browser-warning': '1',
                'User-Agent': 'ReactNativeApp'
              }
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
              }
              logToApp('Model fetch successful with status: ' + response.status);
              return response;
            })
            .catch(error => {
              logToApp('Error fetching model: ' + error.message);
            });

            try {
              // Import the model-viewer component
              logToApp('Importing model-viewer');
              
              // Override fetch to add ngrok headers
              const originalFetch = window.fetch;
              window.fetch = function(url, options = {}) {
                logToApp('Fetch called for: ' + url);
                const newOptions = { ...options };
                if (!newOptions.headers) {
                  newOptions.headers = {};
                }
                newOptions.headers = {
                  ...newOptions.headers,
                  'ngrok-skip-browser-warning': '1',
                  'User-Agent': 'ReactNativeApp'
                };
                return originalFetch(url, newOptions);
              };
              
              // Import with dynamic import to better handle errors
              import('https://cdnjs.cloudflare.com/ajax/libs/model-viewer/3.1.1/model-viewer.min.js')
                .then(() => {
                  logToApp('model-viewer imported successfully');
                  
                  // Create model-viewer element
                  const modelViewer = document.createElement('model-viewer');
                  
                  // Set attributes
                  modelViewer.setAttribute('id', 'model-viewer');
                  modelViewer.setAttribute('camera-controls', '');
                  modelViewer.setAttribute('auto-rotate', '');
                  modelViewer.setAttribute('shadow-intensity', '1');
                  modelViewer.setAttribute('environment-image', 'neutral');
                  modelViewer.setAttribute('style', 'width: 100%; height: 100%');
                  modelViewer.setAttribute('loading', 'eager');
                  modelViewer.setAttribute('reveal', 'auto');
                  
                  // Add progress bar for loading
                  const progressContainer = document.createElement('div');
                  const progressBar = document.createElement('progress');
                  progressBar.id = 'progress';
                  progressBar.max = '100';
                  progressBar.value = '0';
                  progressContainer.appendChild(progressBar);
                  document.getElementById('container').appendChild(progressContainer);
                  
                  modelViewer.addEventListener('progress', (event) => {
                    const progress = document.getElementById('progress');
                    if (progress) {
                      progress.value = (event.detail.totalProgress * 100);
                    }
                    logToApp('Loading progress: ' + (event.detail.totalProgress * 100).toFixed(2) + '%');
                  });
                  
                  // Use the model URL
                  modelViewer.setAttribute('src', '${isLocalFile ? 'file://' + modelUri : modelUri}');
                  
                  // Listen for load events
                  modelViewer.addEventListener('load', () => {
                    logToApp('Model loaded successfully!');
                    window.ReactNativeWebView.postMessage('MODEL_LOADED');
                    progressContainer.style.display = 'none';
                  });
                  
                  modelViewer.addEventListener('error', (error) => {
                    logToApp('Model error event triggered');
                    if (error.detail) {
                      window.ReactNativeWebView.postMessage('MODEL_ERROR: ' + JSON.stringify(error.detail));
                    } else {
                      window.ReactNativeWebView.postMessage('MODEL_ERROR: Unknown error');
                    }
                  });
                  
                  // Append to container
                  document.getElementById('container').appendChild(modelViewer);
                })
                .catch(error => {
                  logToApp('Error importing model-viewer: ' + error.message);
                  window.ReactNativeWebView.postMessage('IMPORT_ERROR: ' + error.message);
                });
              
            } catch (error) {
              logToApp('Caught error in script: ' + error.message);
              window.ReactNativeWebView.postMessage('SCRIPT_ERROR: ' + error.message);
            }
          </script>
        </div>
      </body>
    </html>
  `;

  interface WebViewMessageEvent {
    nativeEvent: {
        data: string;
    };
  }

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;    
    if (message === 'MODEL_LOADED') {
        console.log('Model loaded successfully!');
        if (isLoading) setIsLoading(false);
        setError(null);
    } else if (message.startsWith('MODEL_ERROR')) {
        console.log('Error loading model:', message);
        setIsLoading(false);
        if (!error) setError('Error loading 3D model. Please check if the model format is supported and the URL is accessible.');
        console.error('Model loading error:', message);
    } else if (message.startsWith('LOG:')) {
        // console.log('WebView log:', message.substring(4));
    } else if (message.startsWith('JS_ERROR:') || 
               message.startsWith('IMPORT_ERROR:') || 
               message.startsWith('SCRIPT_ERROR:')) {
        console.error('WebView error:', message);
        setIsLoading(false);
        setError('Error in 3D viewer: ' + message.split(': ')[1]);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onLoadStart={() => {
          setIsLoading(true);
          setError(null);
        }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        mixedContentMode="always"
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setError(`WebView error: ${nativeEvent.description}`);
          setIsLoading(false);
        }}
        headers={{
          'ngrok-skip-browser-warning': '1',
          'User-Agent': 'ReactNativeApp'
        }}
        // Add this to support CORS
        androidHardwareAccelerationDisabled={false}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.customGreen[200]} />
          <Text style={[styles.loadingText, theme.typography.body1]}>Loading 3D model...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.customGreen[200],
  },
});

export default HouseViewer;