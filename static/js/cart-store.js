(function attachCdlaCartStore() {
  const CART_KEY = "cdla_cart";
  const SELECTED_ITEM_KEY = "cdla_selected_cart_item_id";
  const LEGACY_CHECKOUT_FORMS_KEY = "cdla_checkout_forms_by_item";

  function safeParse(rawValue, fallback) {
    try {
      const parsed = JSON.parse(rawValue);
      return parsed ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readCart() {
    const cart = safeParse(localStorage.getItem(CART_KEY), []);
    if (!Array.isArray(cart)) return [];

    const normalizedCart = cart.map(normalizeCartItem);
    if (JSON.stringify(normalizedCart) !== JSON.stringify(cart)) {
      writeCart(normalizedCart);
    }

    return normalizedCart;
  }

  function writeCart(items) {
    const normalizedItems = Array.isArray(items) ? items.map(normalizeCartItem) : [];
    localStorage.setItem(CART_KEY, JSON.stringify(normalizedItems));
    return normalizedItems;
  }

  function normalizeCheckoutState(checkoutState) {
    if (!checkoutState || typeof checkoutState !== "object") return null;

    return {
      customer: checkoutState.customer && typeof checkoutState.customer === "object"
        ? {
            fullName: String(checkoutState.customer.fullName || ""),
            email: String(checkoutState.customer.email || ""),
            phone: String(checkoutState.customer.phone || "")
          }
        : {
            fullName: "",
            email: "",
            phone: ""
          },
      shipping: checkoutState.shipping && typeof checkoutState.shipping === "object"
        ? {
            fullName: String(checkoutState.shipping.fullName || ""),
            address1: String(checkoutState.shipping.address1 || ""),
            address2: String(checkoutState.shipping.address2 || ""),
            city: String(checkoutState.shipping.city || ""),
            state: String(checkoutState.shipping.state || ""),
            zip: String(checkoutState.shipping.zip || ""),
            country: String(checkoutState.shipping.country || "")
          }
        : {
            fullName: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zip: "",
            country: ""
          },
      paymentOption: checkoutState.paymentOption === "deposit" ? "deposit" : "full",
      confirmationAccepted: Boolean(checkoutState.confirmationAccepted),
      shippingMetadata:
        checkoutState.shippingMetadata && typeof checkoutState.shippingMetadata === "object"
          ? { ...checkoutState.shippingMetadata }
          : {
              weight: "",
              packageLength: "",
              packageWidth: "",
              packageHeight: ""
            },
      createdAt: checkoutState.createdAt || new Date().toISOString(),
      updatedAt: checkoutState.updatedAt || new Date().toISOString()
    };
  }

  function normalizeCartItem(item) {
    return {
      ...item,
      id: String(item?.id || createItemId()),
      createdAt: item?.createdAt || new Date().toISOString(),
      quantity: Number(item?.quantity || 1),
      checkoutState: normalizeCheckoutState(item?.checkoutState)
    };
  }

  function removeLegacyCheckoutForm(itemId) {
    const normalizedId = String(itemId || "");
    const raw = localStorage.getItem(LEGACY_CHECKOUT_FORMS_KEY);
    if (!raw) return;

    const formsByItem = safeParse(raw, {});
    if (!formsByItem || typeof formsByItem !== "object") return;
    if (!Object.prototype.hasOwnProperty.call(formsByItem, normalizedId)) return;

    delete formsByItem[normalizedId];
    localStorage.setItem(LEGACY_CHECKOUT_FORMS_KEY, JSON.stringify(formsByItem));
  }

  function createItemId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function addItem(item) {
    const cart = readCart();
    const normalized = normalizeCartItem(item);

    cart.push(normalized);
    writeCart(cart);
    return normalized;
  }

  function removeItem(itemId) {
    const normalizedId = String(itemId || "");
    const nextCart = readCart().filter(item => String(item.id) !== normalizedId);
    writeCart(nextCart);
    removeLegacyCheckoutForm(normalizedId);

    if (getSelectedItemId() === normalizedId) {
      clearSelectedItem();
    }

    return nextCart;
  }

  function clearCart() {
    writeCart([]);
    clearSelectedItem();
    localStorage.removeItem(LEGACY_CHECKOUT_FORMS_KEY);
  }

  function getItemById(itemId) {
    const normalizedId = String(itemId || "");
    return readCart().find(item => String(item.id) === normalizedId) || null;
  }

  function selectItem(itemId) {
    const normalizedId = String(itemId || "");
    localStorage.setItem(SELECTED_ITEM_KEY, normalizedId);
    return normalizedId;
  }

  function getSelectedItemId() {
    const value = localStorage.getItem(SELECTED_ITEM_KEY);
    return value ? String(value) : "";
  }

  function getSelectedItem() {
    const selectedId = getSelectedItemId();
    if (!selectedId) return null;
    return getItemById(selectedId);
  }

  function clearSelectedItem() {
    localStorage.removeItem(SELECTED_ITEM_KEY);
  }

  function updateItem(itemId, updateFn) {
    const normalizedId = String(itemId || "");
    if (!normalizedId || typeof updateFn !== "function") return null;

    const cart = readCart();
    const itemIndex = cart.findIndex(item => String(item.id) === normalizedId);
    if (itemIndex < 0) return null;

    const currentItem = normalizeCartItem(cart[itemIndex]);
    const nextItem = updateFn(currentItem);
    if (!nextItem || typeof nextItem !== "object") return null;

    cart[itemIndex] = normalizeCartItem(nextItem);
    writeCart(cart);
    return cart[itemIndex];
  }

  function setItemCheckoutState(itemId, checkoutState) {
    return updateItem(itemId, item => ({
      ...item,
      checkoutState: normalizeCheckoutState({
        ...checkoutState,
        createdAt: item.checkoutState?.createdAt || checkoutState?.createdAt,
        updatedAt: new Date().toISOString()
      })
    }));
  }

  function getItemCheckoutState(itemId) {
    const item = getItemById(itemId);
    return item?.checkoutState ? normalizeCheckoutState(item.checkoutState) : null;
  }

  window.CdlaCartStore = {
    CART_KEY,
    SELECTED_ITEM_KEY,
    loadCart: readCart,
    saveCart: writeCart,
    addItem,
    removeItem,
    clearCart,
    getItemById,
    createItemId,
    selectItem,
    getSelectedItemId,
    getSelectedItem,
    clearSelectedItem,
    updateItem,
    setItemCheckoutState,
    getItemCheckoutState
  };
})();
