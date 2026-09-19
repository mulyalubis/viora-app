import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProducts = query({
    args: { brand: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.brand || args.brand === "all") {
            return await ctx.db.query("products").collect();
        }

        return await ctx.db
            .query("products")
            .filter((q) => q.eq(q.field("brand"), args.brand))
            .collect();
    },
});

export const getDataProducts = query({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db
            .query("products")
            .order("desc")
            .collect();

        const now = Date.now();

        return await Promise.all(
            products.map(async (product) => {
                const reviews = await ctx.db
                    .query("reviews")
                    .withIndex("by_product", (q) =>
                        q.eq("productId", product._id)
                    )
                    .collect();

                const rating =
                    reviews.length > 0
                        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                        reviews.length
                        : 0;

                const isNew =
                    now - product._creationTime <
                    7 * 24 * 60 * 60 * 1000;

                return {
                    ...product,
                    rating: Number(rating.toFixed(1)),
                    totalReviews: reviews.length,
                    status: isNew ? "New" : "Old",
                };
            })
        );
    },
});

export const getProductById = query({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getProductsByBrand = query({
    args: { brand: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("products")
            .withIndex("by_brand", (q) => q.eq("brand", args.brand))
            .collect();
    },
});

export const getBrands = query({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db
            .query("products")
            .collect();

        const brands = [
            ...new Set(
                products.map((product) => product.brand)
            ),
        ];

        return brands;
    },
});

export const getStockById = query({
    args: {
        productId: v.id("products"),
    },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.productId);
        if (!product) {
            throw new Error("Product not found");
        }
        return product.stock;
    },
});

export const createProduct = mutation({
    args: {
        name: v.string(),
        price: v.number(),
        image: v.string(),
        detailImage: v.string(),
        description: v.string(),
        brand: v.string(),
        stock: v.number(),
        sold: v.number(),
    },

    handler: async (ctx, args) => {

        console.log({
            name: args.name,
            brand: args.brand,
            description: args.description,
            price: args.price,
            stock: args.stock,
            sold: args.sold,
            image: args.image,
            detailImage: args.detailImage,
        });

        return await ctx.db.insert("products", args);
    },
});

export const updateProduct = mutation({
    args: {
        id: v.id("products"),
        name: v.string(),
        brand: v.string(),
        price: v.number(),
        description: v.string(),
        image: v.string(),
        detailImage: v.string(),
    },

    handler: async (ctx, args) => {

        const { id, ...data } = args;

        await ctx.db.patch(id, data);

    },
});

export const deleteProduct = mutation({
    args: {
        id: v.id("products"),
    },

    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const getRandomProducts = query({
    args: {},
    handler: async (ctx) => {
        const count = (await ctx.db.query("products").collect()).length;

        if (count <= 3) {
            return await ctx.db.query("products").collect();
        }

        const start = Math.floor(Math.random() * (count - 3));

        return (await ctx.db.query("products").collect()).slice(start, start + 3);
    },
});

export const reduceStock = mutation({
    args: {
        items: v.array(
            v.object({
                productId: v.id("products"),
                quantity: v.number(),
            })
        ),
    },

    handler: async (ctx, args) => {
        for (const item of args.items) {
            const product = await ctx.db.get(item.productId);

            if (!product) continue;

            const newStock = product.stock - item.quantity;

            console.log("==========");
            console.log("Produk :", product.name);
            console.log("Stock lama :", product.stock);
            console.log("Qty beli :", item.quantity);
            console.log("Stock baru :", newStock);

            await ctx.db.patch(product._id, {
                stock: newStock,
                sold: (product.sold ?? 0) + item.quantity,
            });

            const carts = await ctx.db.query("cart").collect();

            console.log(
                "Jumlah cart produk ini :",
                carts.filter(c => c.productId === item.productId).length
            );

            if (newStock <= 0) {
                console.log("Menghapus cart...");

                for (const cart of carts) {
                    if (cart.productId === item.productId) {
                        console.log("Delete :", cart._id);
                        await ctx.db.delete(cart._id);
                    }
                }
            }
        }
    },
});

export const getBrandProductCount = query({
    args: {},

    handler: async (ctx) => {

        const products = await ctx.db
            .query("products")
            .collect();

        const brandMap = new Map<string, number>();

        for (const product of products) {

            brandMap.set(
                product.brand,
                (brandMap.get(product.brand) ?? 0) + 1
            );

        }

        return Array.from(brandMap.entries()).map(
            ([brand, totalProducts]) => ({
                brand,
                totalProducts,
            })
        );
    },
});

