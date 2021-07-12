export type EconAction = { link: string; name: string };

export type EconTag = {
  	name?: string;
  	category: string;
  	internal_name: string;
  	localized_category_name?: string;
  	localized_tag_name?: string;
	color?: string;
};

export type EconDescription = {
  value: string;
  color?: string;
  app_data?: { def_index: number };
};

export type EconItem = {
  assetid: string;
  descriptions: EconDescription[];
  tradable: number;
  name: string;
  type: string;
  market_name: string;
  market_hash_name: string;
  commodity: number;
  marketable: number;
  tags: EconTag[];
  app_data?: { def_index: number };

  id: string;
  appid: number;
  contextid: string;
  instanceid: string;
  classid: string;

  fraudwarnings?: string[];
  pos: number;

  icon_url?: string;
  icon_url_large?: string;
  amount?: string;
  currency?: number;
  actions?: EconAction[];
  market_actions?: EconAction[];
  background_color?: string;
  name_color?: string;
  market_tradable_restriction?: number;
  market_marketable_restriction?: number;
  cache_expiration?: string;
};

export type Asset = {
  id: string;
  classid: string;
  instanceid: string;
  amount: string;
  hide_in_china: number;
  pos: number;
};

export type Description = Omit<EconItem, "amount" | "pos" | "hide_in_china">;
