(function attachCdlaOrderRecordStore() {
  const ORDER_RECORDS_KEY = "cdla_order_records";
  const PREVIEW_DRAFT_KEY = "cdla_preview_request_draft";
  const LEGACY_WISHLIST_KEY = "cdla_wishlist";
  const MIGRATION_FLAG_KEY = "cdla_saved_previews_migrated_v1";
  const PENDING_EMAIL_QUEUE_KEY = "cdla_pending_order_code_emails";

  const ORDER_STATUSES = [
    "Saved",
    "Preview in Progress",
    "Preview Sent",
    "Changes Requested",
    "Approved",
    "Ready for Order",
    "Paid",
    "Ring Sizer Sent",
    "Awaiting Final Size",
    "Final Size Confirmed",
    "In Production",
    "Shipped",
    "Completed"
  ];

  function safeParse(rawValue, fallback) {
    try {
      const parsed = JSON.parse(rawValue);
      return parsed ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function normalizeStatus(status) {
    return ORDER_STATUSES.includes(status) ? status : "Saved";
  }

  function createId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function generateOrderCode() {
    const randomSix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `CDLA-${randomSix}`;
  }

  function buildUniqueOrderCode(existingRecords) {
    const existingCodes = new Set(existingRecords.map(record => String(record.orderCode || "").toUpperCase()));
    let attempts = 0;

    while (attempts < 20) {
      const code = generateOrderCode();
      if (!existingCodes.has(code)) {
        return code;
      }
      attempts += 1;
    }

    return `CDLA-${Date.now().toString().slice(-6)}`;
  }

  function normalizeRecord(record) {
    const createdAt = record?.createdAt || new Date().toISOString();
    const updatedAt = record?.updatedAt || createdAt;

    return {
      id: String(record?.id || createId("record")),
      requestId: String(record?.requestId || createId("request")),
      orderCode: String(record?.orderCode || "").toUpperCase(),
      recordType: record?.recordType === "order" ? "order" : "preview",
      status: normalizeStatus(record?.status),
      productTitle: String(record?.productTitle || "Custom Ring"),
      sku: String(record?.sku || ""),
      collection: String(record?.collection || ""),
      ringSize: String(record?.ringSize || ""),
      engraving: {
        inside: String(record?.engraving?.inside || ""),
        outside: String(record?.engraving?.outside || "")
      },
      symbols: Array.isArray(record?.symbols) ? record.symbols : [],
      customRequestFlags: {
        customSymbolDesignRequestSelected: Boolean(record?.customRequestFlags?.customSymbolDesignRequestSelected),
        customSymbolDesignDescription: String(record?.customRequestFlags?.customSymbolDesignDescription || ""),
        customSymbolUploadFileName: String(record?.customRequestFlags?.customSymbolUploadFileName || "")
      },
      notes: String(record?.notes || ""),
      customer: {
        fullName: String(record?.customer?.fullName || ""),
        email: String(record?.customer?.email || ""),
        phone: String(record?.customer?.phone || "")
      },
      metadata: {
        sourceUrl: String(record?.metadata?.sourceUrl || ""),
        image: String(record?.metadata?.image || ""),
        baseRingPrice: Number(record?.metadata?.baseRingPrice || 0),
        totalPrice: Number(record?.metadata?.totalPrice || 0),
        priceBreakdown: Array.isArray(record?.metadata?.priceBreakdown) ? record.metadata.priceBreakdown : []
      },
      renderAssets: Array.isArray(record?.renderAssets) ? record.renderAssets : [],
      internalMessages: Array.isArray(record?.internalMessages) ? record.internalMessages : [],
      customerMessages: Array.isArray(record?.customerMessages) ? record.customerMessages : [],
      ringSizeConfirmation: record?.ringSizeConfirmation && typeof record.ringSizeConfirmation === "object"
        ? {
            sizerSentAt: record.ringSizeConfirmation.sizerSentAt || null,
            finalSize: record.ringSizeConfirmation.finalSize || "",
            finalSizeConfirmedAt: record.ringSizeConfirmation.finalSizeConfirmedAt || null
          }
        : {
            sizerSentAt: null,
            finalSize: "",
            finalSizeConfirmedAt: null
          },
      createdAt,
      updatedAt
    };
  }

  function readRecords() {
    const parsed = safeParse(localStorage.getItem(ORDER_RECORDS_KEY), []);
    if (!Array.isArray(parsed)) return [];

    const normalized = parsed.map(normalizeRecord);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      writeRecords(normalized);
    }

    return normalized;
  }

  function writeRecords(records) {
    const normalized = Array.isArray(records) ? records.map(normalizeRecord) : [];
    localStorage.setItem(ORDER_RECORDS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function migrateLegacyWishlistToSavedPreviews() {
    if (localStorage.getItem(MIGRATION_FLAG_KEY) === "done") return;

    const legacyWishlist = safeParse(localStorage.getItem(LEGACY_WISHLIST_KEY), []);
    if (!Array.isArray(legacyWishlist) || !legacyWishlist.length) {
      localStorage.setItem(MIGRATION_FLAG_KEY, "done");
      return;
    }

    const existingRecords = readRecords();
    const nextRecords = [...existingRecords];

    legacyWishlist.forEach(item => {
      const orderCode = buildUniqueOrderCode(nextRecords);
      nextRecords.push(normalizeRecord({
        id: createId("preview"),
        requestId: createId("preview-request"),
        orderCode,
        recordType: "preview",
        status: "Saved",
        productTitle: item?.productName || "Saved Ring Preview",
        sku: item?.sku || "",
        collection: "",
        ringSize: "",
        engraving: { inside: "", outside: "" },
        symbols: [],
        customRequestFlags: {
          customSymbolDesignRequestSelected: false,
          customSymbolDesignDescription: "",
          customSymbolUploadFileName: ""
        },
        notes: "Migrated from legacy wishlist data.",
        customer: { fullName: "", email: "", phone: "" },
        metadata: {
          sourceUrl: item?.sourceUrl || "/ring-builder/",
          image: item?.image || "",
          baseRingPrice: 0,
          totalPrice: 0,
          priceBreakdown: []
        }
      }));
    });

    writeRecords(nextRecords);
    localStorage.removeItem(LEGACY_WISHLIST_KEY);
    localStorage.setItem(MIGRATION_FLAG_KEY, "done");
  }

  function createPreviewRecord(payload) {
    const records = readRecords();
    const orderCode = buildUniqueOrderCode(records);

    const record = normalizeRecord({
      ...payload,
      id: createId("preview"),
      requestId: createId("preview-request"),
      orderCode,
      recordType: "preview",
      status: "Saved",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    writeRecords([record, ...records]);
    return record;
  }

  function loadSavedPreviews() {
    return readRecords().filter(record => record.recordType === "preview");
  }

  function removeSavedPreview(recordId) {
    const normalizedId = String(recordId || "");
    const next = readRecords().filter(record => !(record.recordType === "preview" && record.id === normalizedId));
    writeRecords(next);
    return next;
  }

  function clearSavedPreviews() {
    const next = readRecords().filter(record => record.recordType !== "preview");
    writeRecords(next);
    return next;
  }

  function findRecordByEmailAndCode(email, orderCode) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedCode = String(orderCode || "").trim().toUpperCase();
    if (!normalizedEmail || !normalizedCode) return null;

    return readRecords().find(record => (
      String(record.customer.email || "").trim().toLowerCase() === normalizedEmail &&
      String(record.orderCode || "").trim().toUpperCase() === normalizedCode
    )) || null;
  }

  function queueOrderCodeEmail(payload) {
    const queue = safeParse(localStorage.getItem(PENDING_EMAIL_QUEUE_KEY), []);
    const normalizedQueue = Array.isArray(queue) ? queue : [];

    normalizedQueue.push({
      id: createId("email"),
      to: String(payload?.to || ""),
      orderCode: String(payload?.orderCode || ""),
      template: "preview-order-code",
      status: "pending",
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(PENDING_EMAIL_QUEUE_KEY, JSON.stringify(normalizedQueue));
    return normalizedQueue;
  }

  function setPreviewDraft(draft) {
    localStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify(draft || {}));
  }

  function getPreviewDraft() {
    return safeParse(localStorage.getItem(PREVIEW_DRAFT_KEY), null);
  }

  function clearPreviewDraft() {
    localStorage.removeItem(PREVIEW_DRAFT_KEY);
  }

  migrateLegacyWishlistToSavedPreviews();

  window.CdlaOrderRecordStore = {
    ORDER_STATUSES,
    ORDER_RECORDS_KEY,
    createPreviewRecord,
    loadSavedPreviews,
    removeSavedPreview,
    clearSavedPreviews,
    findRecordByEmailAndCode,
    queueOrderCodeEmail,
    readRecords,
    writeRecords,
    setPreviewDraft,
    getPreviewDraft,
    clearPreviewDraft,
    migrateLegacyWishlistToSavedPreviews
  };
})();
