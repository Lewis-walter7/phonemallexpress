export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
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
    const prodSlug = product.slug || slugify(product.name);

    return `/products/${catSlug}/${prodSlug}`;
}
