(function attachCdlaCartStore() {
  const CART_KEY = "cdla_cart";
  const SELECTED_ITEM_KEY = "cdla_selected_cart_item_id";

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
    return Array.isArray(cart) ? cart : [];
  }

  function writeCart(items) {
    const normalizedItems = Array.isArray(items) ? items : [];
    localStorage.setItem(CART_KEY, JSON.stringify(normalizedItems));
    return normalizedItems;
  }

  function createItemId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function addItem(item) {
    const cart = readCart();
    const normalized = {
      ...item,
      id: String(item?.id || createItemId()),
      createdAt: item?.createdAt || new Date().toISOString(),
      quantity: Number(item?.quantity || 1)
    };

    cart.push(normalized);
    writeCart(cart);
    return normalized;
  }

  function removeItem(itemId) {
    const normalizedId = String(itemId || "");
    const nextCart = readCart().filter(item => String(item.id) !== normalizedId);
    writeCart(nextCart);

    if (getSelectedItemId() === normalizedId) {
      clearSelectedItem();
    }

    return nextCart;
  }

  function clearCart() {
    writeCart([]);
    clearSelectedItem();
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
    clearSelectedItem
  };
})();
