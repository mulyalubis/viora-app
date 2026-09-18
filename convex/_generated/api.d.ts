/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as address from "../address.js";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as dashboard from "../dashboard.js";
import type * as http from "../http.js";
import type * as lib_push from "../lib/push.js";
import type * as midtrans from "../midtrans.js";
import type * as notification from "../notification.js";
import type * as orderItems from "../orderItems.js";
import type * as orders from "../orders.js";
import type * as product from "../product.js";
import type * as promos from "../promos.js";
import type * as review from "../review.js";
import type * as stock from "../stock.js";
import type * as users from "../users.js";
import type * as wishlist from "../wishlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  address: typeof address;
  auth: typeof auth;
  cart: typeof cart;
  dashboard: typeof dashboard;
  http: typeof http;
  "lib/push": typeof lib_push;
  midtrans: typeof midtrans;
  notification: typeof notification;
  orderItems: typeof orderItems;
  orders: typeof orders;
  product: typeof product;
  promos: typeof promos;
  review: typeof review;
  stock: typeof stock;
  users: typeof users;
  wishlist: typeof wishlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
