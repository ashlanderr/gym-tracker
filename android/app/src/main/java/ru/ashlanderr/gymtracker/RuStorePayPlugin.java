package ru.ashlanderr.gymtracker;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import ru.rustore.sdk.pay.RuStorePayClient;
import ru.rustore.sdk.pay.model.AppUserId;
import ru.rustore.sdk.pay.model.MainPeriod;
import ru.rustore.sdk.pay.model.PreferredPurchaseType;
import ru.rustore.sdk.pay.model.Product;
import ru.rustore.sdk.pay.model.ProductId;
import ru.rustore.sdk.pay.model.ProductPurchaseParams;
import ru.rustore.sdk.pay.model.ProductPurchaseResult;
import ru.rustore.sdk.pay.model.ProductType;
import ru.rustore.sdk.pay.model.Purchase;
import ru.rustore.sdk.pay.model.PurchaseAvailabilityResult;
import ru.rustore.sdk.pay.model.RuStorePaymentException;
import ru.rustore.sdk.pay.model.SdkTheme;
import ru.rustore.sdk.pay.model.SubscriptionPeriod;
import ru.rustore.sdk.pay.model.SubscriptionPurchase;
import ru.rustore.sdk.pay.model.TrialPeriod;

@CapacitorPlugin(name = "RuStorePay")
public class RuStorePayPlugin extends Plugin {

    public static final SdkTheme THEME = SdkTheme.DARK;

    private static RuStorePayClient client() {
        return RuStorePayClient.Companion.getInstance();
    }

    @PluginMethod
    public void checkAvailability(PluginCall call) {
        client().getPurchaseInteractor().getPurchaseAvailability()
            .addOnSuccessListener(result -> {
                JSObject ret = new JSObject();
                ret.put("available", result instanceof PurchaseAvailabilityResult.Available);
                if (result instanceof PurchaseAvailabilityResult.Unavailable unavailable) {
                    ret.put("reason", String.valueOf(unavailable.getCause()));
                }
                call.resolve(ret);
            })
            .addOnFailureListener(error -> reject(call, error));
    }

    @PluginMethod
    public void getProducts(PluginCall call) {
        List<ProductId> ids = new ArrayList<>();
        try {
            for (String id : call.getArray("ids").<String>toList()) {
                ids.add(new ProductId(id));
            }
        } catch (Exception e) {
            call.reject("ids must be a list of strings", "invalid_argument", e);
            return;
        }

        client().getProductInteractor().getProducts(ids)
            .addOnSuccessListener(products -> {
                JSArray list = new JSArray();
                for (Product product : products) {
                    list.put(toJs(product));
                }
                JSObject ret = new JSObject();
                ret.put("products", list);
                call.resolve(ret);
            })
            .addOnFailureListener(error -> reject(call, error));
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        if (productId == null) {
            call.reject("productId is required", "invalid_argument");
            return;
        }
        String appUserId = call.getString("appUserId");

        ProductPurchaseParams params = new ProductPurchaseParams(
            new ProductId(productId),
            null,
            null,
            null,
            appUserId == null ? null : new AppUserId(appUserId),
            null
        );

        client().getPurchaseInteractor()
            .purchase(params, PreferredPurchaseType.ONE_STEP, THEME, null)
            .addOnSuccessListener(result -> call.resolve(toJs(result)))
            .addOnFailureListener(error -> reject(call, error));
    }

    @PluginMethod
    public void getSubscriptions(PluginCall call) {
        client().getPurchaseInteractor().getPurchases(ProductType.SUBSCRIPTION, null, null)
            .addOnSuccessListener(purchases -> {
                JSArray list = new JSArray();
                for (Purchase purchase : purchases) {
                    if (purchase instanceof SubscriptionPurchase subscription) {
                        list.put(toJs(subscription));
                    }
                }
                JSObject ret = new JSObject();
                ret.put("subscriptions", list);
                call.resolve(ret);
            })
            .addOnFailureListener(error -> reject(call, error));
    }

    private static void reject(PluginCall call, Throwable error) {
        String code = error instanceof RuStorePaymentException.ProductPurchaseCancelled
            ? "cancelled"
            : error.getClass().getSimpleName();
        call.reject(String.valueOf(error.getMessage()), code, error instanceof Exception e ? e : null);
    }

    private static JSObject toJs(Product product) {
        JSObject ret = new JSObject();
        ret.put("productId", product.getProductId().getValue());
        ret.put("type", product.getType().name());
        ret.put("title", product.getTitle().getValue());
        ret.put("description", product.getDescription() == null ? null : product.getDescription().getValue());
        ret.put("amountLabel", product.getAmountLabel().getValue());
        ret.put("price", product.getPrice() == null ? null : product.getPrice().getValue());
        ret.put("currency", product.getCurrency().getValue());

        if (product.getSubscriptionInfo() != null) {
            for (SubscriptionPeriod period : product.getSubscriptionInfo().getPeriods()) {
                if (period instanceof TrialPeriod trial) {
                    ret.put("trialPeriod", trial.getDuration());
                } else if (period instanceof MainPeriod main) {
                    ret.put("period", main.getDuration());
                }
            }
        }
        return ret;
    }

    private static JSObject toJs(ProductPurchaseResult result) {
        JSObject ret = new JSObject();
        ret.put("purchaseId", result.getPurchaseId().getValue());
        ret.put("invoiceId", result.getInvoiceId().getValue());
        ret.put("productId", result.getProductId().getValue());
        ret.put("sandbox", result.getSandbox());
        return ret;
    }

    private static JSObject toJs(SubscriptionPurchase subscription) {
        JSObject ret = new JSObject();
        ret.put("purchaseId", subscription.getPurchaseId().getValue());
        ret.put("invoiceId", subscription.getInvoiceId().getValue());
        ret.put("productId", subscription.getProductId().getValue());
        ret.put("status", subscription.getStatus().name());
        ret.put("expiresAt", time(subscription.getExpirationDate()));
        ret.put("gracePeriodEnabled", subscription.getGracePeriodEnabled());
        ret.put("sandbox", subscription.getSandbox());
        return ret;
    }

    private static Long time(Date date) {
        return date == null ? null : date.getTime();
    }
}
