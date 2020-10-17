package com.pulsartronic.webviewusb;

import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.felhr.usbserial.UsbSerialDevice;
import com.felhr.usbserial.UsbSerialInterface;
import com.pulsartronic.lorausb.R;

import android.util.Base64;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

// credits:
// https://github.com/felHR85/UsbSerial
public class USBRFMApp extends AppCompatActivity {
    public final String ACTION_USB_PERMISSION = "com.pulsartronic.webviewusb.USB_PERMISSION";
    static String defaultConfiguration = "{\"baudrate\":9600,\"config\":3}";

    WebView webView;
    UsbManager usbManager;
    UsbDevice device;
    UsbSerialDevice serialPort;
    UsbDeviceConnection connection;

    UsbSerialInterface.UsbReadCallback usbReadCallback = new UsbSerialInterface.UsbReadCallback() { //Defining a Callback which triggers whenever data is read.
        @Override
        public void onReceivedData(byte[] bytes) {
            byte[] encoded = Base64.encode(bytes, Base64.DEFAULT);
            String b64 = new String(encoded);
            webView.post(() -> webView.loadUrl("javascript:AndroidSerial_ondata('" + b64 + "')"));
        }
    };

    private final BroadcastReceiver broadcastReceiver = new BroadcastReceiver() { //Broadcast Receiver to automatically start and stop the Serial connection.
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getAction().equals(ACTION_USB_PERMISSION)) {
                boolean granted = intent.getExtras().getBoolean(UsbManager.EXTRA_PERMISSION_GRANTED);
                if (granted) {
                    createDevice();
                } else {
                    webView.post(() -> webView.loadUrl("javascript:AndroidSerial_log(`USB Permission not granted ...`)"));
                }
            } else if (intent.getAction().equals(UsbManager.ACTION_USB_DEVICE_ATTACHED)) {
                createDevice();
            } else if (intent.getAction().equals(UsbManager.ACTION_USB_DEVICE_DETACHED)) {
                webView.post(() -> webView.loadUrl("javascript:AndroidSerial_log(`USB detached ...`)"));
                close();
            }
        }
    };

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        this.usbManager = (UsbManager) getSystemService(USBRFMApp.USB_SERVICE);
        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_USB_PERMISSION);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
        registerReceiver(broadcastReceiver, filter);

        this.webView = (WebView) findViewById(R.id.webview);
        WebSettings webSettings = this.webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAppCacheEnabled(false);
        webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        this.webView.addJavascriptInterface(this, "AndroidSerial");
        this.webView.loadUrl("file:///android_asset/index.html");
    }

    public void createDevice() {
        connection = usbManager.openDevice(device);
        serialPort = UsbSerialDevice.createUsbSerialDevice(device, connection);
        if (serialPort != null) {
            if (serialPort.open()) {
                configure(defaultConfiguration);
                serialPort.setFlowControl(UsbSerialInterface.FLOW_CONTROL_OFF);
                serialPort.read(usbReadCallback);
                this.webView.post(() -> webView.loadUrl("javascript:AndroidSerial_onopen()"));
            } else {
                webView.post(() -> webView.loadUrl("javascript:AndroidSerial_log(`Can't open port ...`)"));
            }
        } else {
            webView.post(() -> webView.loadUrl("javascript:AndroidSerial_log(`Can't use port, it is NULL ...`)"));
        }
    }

    @JavascriptInterface
    public void configure(String configurationSTR) {
        try {
            JSONObject configuration = new JSONObject(configurationSTR);

            boolean hasBaudrate = configuration.has("baudrate");
            if (hasBaudrate) {
                int baudrate = configuration.getInt("baudrate");
                this.serialPort.setBaudRate(baudrate);
            }

            boolean hasConfig = configuration.has("config");
            if (hasConfig) {
                int config = configuration.getInt("config");
                switch(config) {
                    case 0:  case 1:  case 2:  case 3: case 8:  case 9:  case 10: case 11: case 16: case 17: case 18: case 19:
                        this.serialPort.setStopBits(UsbSerialInterface.STOP_BITS_1);
                        break;
                    case 4:  case 5:  case 6:  case 7: case 12:  case 13:  case 14: case 15: case 20: case 21: case 22: case 23:
                        this.serialPort.setStopBits(UsbSerialInterface.STOP_BITS_2);
                        break;
                }

                switch(config) {
                    case 0:  case 1:  case 2:  case 3: case 4:  case 5:  case 6: case 7:
                        this.serialPort.setParity(UsbSerialInterface.PARITY_NONE);
                        break;
                    case 8:  case 9:  case 10:  case 11: case 12:  case 13:  case 14: case 15:
                        this.serialPort.setParity(UsbSerialInterface.PARITY_EVEN);
                        break;
                    case 16:  case 17:  case 18:  case 19: case 20:  case 21:  case 22: case 23:
                        this.serialPort.setParity(UsbSerialInterface.PARITY_ODD);
                        break;
                }

                switch(config) {
                    case 0:  case 4:  case 8:  case 12: case 16:  case 20:
                        this.serialPort.setDataBits(UsbSerialInterface.DATA_BITS_5);
                        break;
                    case 1:  case 5:  case 9:  case 13: case 17:  case 21:
                        this.serialPort.setDataBits(UsbSerialInterface.DATA_BITS_6);
                        break;
                    case 2:  case 6:  case 10:  case 14: case 18:  case 22:
                        this.serialPort.setDataBits(UsbSerialInterface.DATA_BITS_7);
                        break;
                    case 3:  case 7:  case 11:  case 15: case 19:  case 23:
                        this.serialPort.setDataBits(UsbSerialInterface.DATA_BITS_8);
                        break;
                }
            }


        } catch(Exception e) {
            webView.post(() -> webView.loadUrl("javascript:AndroidSerial_log(`Can't open port:" + e.toString() + " `)"));
        }
    }

    @JavascriptInterface
    public void connect(String configurationSTR) {
        defaultConfiguration = configurationSTR;
        boolean found = false;
        if (null == this.serialPort || !this.serialPort.isOpen()) {
            HashMap<String, UsbDevice> usbDevices = usbManager.getDeviceList();
            if (!usbDevices.isEmpty()) {
                for (Map.Entry<String, UsbDevice> entry : usbDevices.entrySet()) {
                    device = entry.getValue();
                    int deviceVID = device.getVendorId();
                    if (deviceVID == 0x1B4F || deviceVID == 0x1A86 || deviceVID == 0x0403) {
                        PendingIntent pendingIntent = PendingIntent.getBroadcast(this, 0, new Intent(ACTION_USB_PERMISSION), 0);
                        usbManager.requestPermission(device, pendingIntent);
                        found = true;
                    } else {
                        connection = null;
                        device = null;
                    }
                    if (found)
                        break;
                }
            }
        } else {
            found = true;
        }

        if (!found) {
            this.webView.post(() -> webView.loadUrl("javascript:AndroidSerial_log(`No compatible USB device found ...`)"));
        }
    }

    @JavascriptInterface
    public void send(byte[] bytes) {
        try {
            this.serialPort.write(bytes);
        } catch(Exception e) {
            this.webView.post(() -> webView.loadUrl("javascript:AndroidSerial_log(`" + e.toString() + "`)"));
        }
    }

    @JavascriptInterface
    public void close() {
        try {
            if (null != this.serialPort) {
                this.serialPort.close();
            }
        } catch(Exception e) {
            this.webView.post(() -> webView.loadUrl("javascript:AndroidSerial_log(`" + e.toString() + "`)"));
        }
        this.webView.post(() -> webView.loadUrl("javascript:AndroidSerial_onclose()"));
    }
}