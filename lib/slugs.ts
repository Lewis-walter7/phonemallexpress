export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-')     // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
}

export function getCanonicalCategorySlug(category: any): string {
    if (!category) return 'all';

    if (typeof category === 'string') {
        return slugify(category);
    }

    if (category.slug) {
        return category.slug;
    }

    if (category.name) {
        return slugify(category.name);
    }

    return 'all';
}

export function getProductCanonicalPath(product: any, category?: any): string {
    const catSlug = getCanonicalCategorySlug(category || product.category);
    const prodSlug = product.slug || `${slugify(product.name)}-${product._id}`;

    return `/products/${catSlug}/${prodSlug}`;
}
