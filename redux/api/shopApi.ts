import { baseApi } from "./baseApi";

export interface ShopItem {
  itemType: "STREAK_FREEZE" | "EXTRA_LIFE" | "AVATAR_OUTFIT" | "BONUS_LESSON";
  price: number;
  currency: string;
}

export const shopApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getShopItems: builder.query<ShopItem[], void>({
      query: () => "/shop",
      providesTags: ["User"],
    }),
    buyShopItem: builder.mutation<{ purchased: string; gemsSpent: number }, { itemType: string; itemId?: string }>({
      query: (body) => ({
        url: "/shop/buy",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    refillLivesWithAd: builder.mutation<{ lives: number; message: string }, { adToken: string }>({
      query: (body) => ({
        url: "/shop/refill-lives",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetShopItemsQuery,
  useBuyShopItemMutation,
  useRefillLivesWithAdMutation,
} = shopApi;
