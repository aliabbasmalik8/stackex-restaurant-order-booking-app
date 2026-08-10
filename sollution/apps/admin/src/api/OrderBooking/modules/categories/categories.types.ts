export type CategoryDto = {
  id: string;
  slug: string;
  label: string;
  label_arabic: string;
  sortOrder: number;
};

export type UpsertCategoryDto = {
  slug?: string;
  label: string;
  label_arabic: string;
  sortOrder?: number;
};
