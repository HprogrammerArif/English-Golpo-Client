import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
} from "react-native-purchases";

// ─────────────────────────────────────────────────────────────────────────────
// Result Types
// ─────────────────────────────────────────────────────────────────────────────

type PurchaseResult =
  | { success: true; data: CustomerInfo; userCancelled?: false }
  | { success: false; error: string; userCancelled: boolean };

type RestoreResult =
  | { success: true; data: CustomerInfo }
  | { success: false; error: string };

// ─────────────────────────────────────────────────────────────────────────────
// Service Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch available subscription offerings from RevenueCat.
 * Returns null if the SDK is not configured or an error occurs.
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.warn("[RevenueCat] getOfferings error (Normal on emulators without Play Store):", error);
    return null;
  }
}

/**
 * Purchase a specific package from RevenueCat.
 * Returns a typed result — never throws.
 *
 * @param pkg - The PurchasesPackage to purchase (from offerings)
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<PurchaseResult> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    if (__DEV__) console.log("[RevenueCat] Purchase successful:", {
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
    });
    return { success: true, data: customerInfo };
  } catch (error: any) {
    // RevenueCat sets userCancelled: true when the user dismisses the sheet
    const userCancelled = error?.userCancelled === true;
    if (!userCancelled) {
      console.warn("[RevenueCat] Purchase error:", error);
    } else {
      if (__DEV__) console.log("[RevenueCat] Purchase cancelled by user.");
    }
    return {
      success: false,
      error: error?.message ?? "Purchase failed. Please try again.",
      userCancelled,
    };
  }
}

/**
 * Restore previous purchases for the current user.
 * Required by Google Play and App Store policies.
 * Returns a typed result — never throws.
 */
export async function restorePurchases(): Promise<RestoreResult> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    if (__DEV__) console.log("[RevenueCat] Restore successful:", {
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
    });
    return { success: true, data: customerInfo };
  } catch (error: any) {
    console.warn("[RevenueCat] Restore error:", error);
    return {
      success: false,
      error: error?.message ?? "Restore failed. Please try again.",
    };
  }
}