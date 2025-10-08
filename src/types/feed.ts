export interface FeedRow {
  id: string;
  title: string;
  price: string;
  condition: string;
  availability: string;
  channel: string;
  feed_label: string;
  language: string;
  additional_image_link: string;
  adult: string;
  all_clicks: string;
  brand: string;
  custom_label_0: string;
  custom_label_1: string;
  description: string;
  google_product_category: string;
  image_link: string;
  item_group_id: string;
  link: string;
  mpn: string;
  product_type: string;
  rating_average: string;
  rating_count: string;
  shipping_country: string;
  [key: string]: string;
}

export interface OptimisationSettings {
  selectedAttributes: string[];
  includeInTitle: boolean;
  includeInDescription: boolean;
}

export interface FeedState {
  rows: FeedRow[];
  headers: string[];
  isLoading: boolean;
  optimisingRows: Set<string>;
  selectedRows: Set<string>;
}