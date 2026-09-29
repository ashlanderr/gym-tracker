package ru.ashlanderr.gymtracker;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import ru.rustore.sdk.pay.RuStorePayClient;

public class MainActivity extends BridgeActivity {

    private boolean restoring;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(RuStorePayPlugin.class);
        // BridgeActivity replays the launch intent through onNewIntent on every
        // create, while Pay SDK must not see it again when the activity is
        // merely recreated.
        restoring = savedInstanceState != null;
        super.onCreate(savedInstanceState);
        restoring = false;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (!restoring && intent != null) {
            RuStorePayClient.Companion.getInstance()
                .getIntentInteractor()
                .proceedIntent(intent, RuStorePayPlugin.THEME);
        }
    }
}
