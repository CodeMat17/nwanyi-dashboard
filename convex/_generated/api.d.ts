/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as about from "../about.js";
import type * as carousel from "../carousel.js";
import type * as gallery from "../gallery.js";
import type * as interviews from "../interviews.js";
import type * as news from "../news.js";
import type * as partners from "../partners.js";
import type * as schedule from "../schedule.js";
import type * as speakers from "../speakers.js";
import type * as storage from "../storage.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  about: typeof about;
  carousel: typeof carousel;
  gallery: typeof gallery;
  interviews: typeof interviews;
  news: typeof news;
  partners: typeof partners;
  schedule: typeof schedule;
  speakers: typeof speakers;
  storage: typeof storage;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
