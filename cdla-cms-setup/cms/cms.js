import CMS from "netlify-cms-app";
import RingPreview from "./preview-templates/RingPreview";

CMS.registerPreviewTemplate("rings", RingPreview);

// Make the pricing function global so preview can use it
import { calculateRingPrice } from "../storefront/ring-pricing.js";
window.calculateRingPrice = calculateRingPrice;
