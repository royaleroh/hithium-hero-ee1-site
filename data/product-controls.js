// Commercial controls are authoritative. Invalid entries cannot be sold.
export function applyProductControls(products, controls) {
  const errors = [];
  const validMap = controls && typeof controls === 'object' && !Array.isArray(controls);
  const merged = products.map(product => {
    const entry = validMap ? controls[product.slug] : null;
    const valid = entry && typeof entry.name === 'string' && entry.name.trim() &&
      (entry.price === null || (Number.isFinite(entry.price) && entry.price > 0)) &&
      typeof entry.available === 'boolean';
    if (!valid) {
      errors.push(`products.json: invalid or missing entry for ${product.slug}`);
      return { ...product, price: null, available: false };
    }
    return { ...product, name: entry.name.trim(), price: entry.price, available: entry.available };
  });
  if (validMap) {
    for (const slug of Object.keys(controls)) {
      if (!products.some(p => p.slug === slug)) errors.push(`products.json: unknown slug ${slug}`);
    }
  }
  return { products: merged, errors };
}

export async function loadProductControls() {
  const url = new URL('../products.json', import.meta.url);
  try {
    if (typeof window === 'undefined') {
      const { readFile } = await import('node:fs/promises');
      return { controls: JSON.parse(await readFile(url, 'utf8')), error: null };
    }
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { controls: await response.json(), error: null };
  } catch (error) {
    return { controls: null, error: `products.json could not load: ${error.message}` };
  }
}
