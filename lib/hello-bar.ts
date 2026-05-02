/**
 * Hello Bar parsing and Sales Page URL building
 */

// Hardcoded constant as requested
export const SALES_PAGE_URL = 'https://bonniefahy.com/asc-ai-twin';

export interface HelloBarData {
  line1: string;
  line2: string;
  pill: string;
  ctaLabel: string;
}

export function parseHelloBar(message: string): HelloBarData {
  const input = message.trim();
  if (!input) throw new Error('Hello bar message is empty');

  // Detect if this is a full HTML block by checking for common tags
  const isHtml = input.startsWith('<') || input.includes('class="');

  if (isHtml) {
    // Advanced Extraction for HTML blocks - looks for content inside specific classes
    const extract = (className: string, tagName: string = 'div|a|span') => {
      // Match the opening tag with the class, then capture everything until the CLOSING tag of that type
      const regex = new RegExp(`<(${tagName})[^>]*class=["'](?:[^"']*?\\s+)?${className}(?:\\s+[^"']*?)?["'][^>]*>([\\s\\S]*?)<\\/\\1>`, 'i');
      const match = input.match(regex);
      return match ? match[2].trim() : null;
    };

    let l1 = extract('hello-line1');
    let l2 = extract('hello-line2');
    let p = extract('price-pill', 'span|div|b');
    let c = extract('hello-cta', 'a|div|span');

    // CRITICAL: Clean up content
    const cleanContent = (text: string | null) => {
      if (!text) return null;
      return text
        .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
        .trim();
    };

    l1 = cleanContent(l1);
    l2 = cleanContent(l2);
    p = cleanContent(p);
    c = cleanContent(c);

    // If l2 contains the price-pill HTML or text, we MUST strip it 
    // because the reception script re-injects it as a pill.
    if (l2 && p) {
      // Remove any tags that contain the price
      const priceRegex = new RegExp(`<[^>]*class=["']price-pill["'][^>]*>[\\s\\S]*?<\\/[^>]*>`, 'gi');
      l2 = l2.replace(priceRegex, "");
      // Also remove naked price string if it was somehow left behind
      l2 = l2.replace(p, "");
      l2 = l2.trim();
    }

    if (l1 || l2 || p || c) {
      return {
        line1: (l1 || "Special Offer.").replace(/<!--[\s\S]*?-->/g, "").trim(),
        line2: (l2 || "Exclusive access granted.").replace(/<!--[\s\S]*?-->/g, "").trim(),
        pill: (p || "$22").replace(/<!--[\s\S]*?-->/g, "").trim(),
        ctaLabel: (c || "Get Started →").replace(/<!--[\s\S]*?-->/g, "").trim()
      };
    }
  }

  // Fallback to Intelligent Text Parsing for plain text messages
  const clean = input.replace(/<!--[\s\S]*?-->/g, "").trim();
  
  // Find price ($ followed by digits)
  const priceMatch = clean.match(/\$(\d+)/);
  const price = priceMatch ? priceMatch[0] : "$24";

  // Find CTA: look for text containing → or > (avoiding html tags)
  const ctaMatch = clean.match(/([^.\n]*?[→]|[^.\n<]*?>[^.\n<]*?)$/);
  const cta = ctaMatch ? ctaMatch[0].trim() : "Get Started →";

  // Strip price and cta to get the main message parts
  let text = clean.replace(cta, "").replace(price, "").trim();

  // Split into line1 and line2 based on common separators
  let parts = text.split(/ — |— | —|—|\. /).map(s => s.trim()).filter(Boolean);
  
  if (parts.length < 2) {
    parts = text.split('.').map(s => s.trim()).filter(Boolean);
  }

  const line1 = parts[0] ? parts[0] + (parts[0].endsWith('.') ? '' : '.') : "Special Offer.";
  const line2 = parts.slice(1).join(". ") ? parts.slice(1).join(". ") + (parts.slice(1).join(". ").endsWith('.') ? '' : '.') : "Exclusive access granted.";

  return {
    line1,
    line2,
    pill: price,
    ctaLabel: cta
  };
}

export function buildSalesPageUrl(data: HelloBarData, baseUrl?: string): string {
  const json = JSON.stringify({
    l1: data.line1,
    l2: data.line2,
    p: data.pill,
    c: data.ctaLabel
  });
  
  // Base64url encode
  const b64 = Buffer.from(json).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
    
  const finalBaseUrl = baseUrl || SALES_PAGE_URL;
  const separator = finalBaseUrl.includes('?') ? '&' : '?';
  return `${finalBaseUrl}${separator}hb=${b64}`;
}
