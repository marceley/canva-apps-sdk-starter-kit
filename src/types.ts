export interface Box {
  id: string;
  label: string;
}

export interface BoxData {
  frontpage: {
    title: string;
    ingredients: string[];
  };
  recipes: {
    id: string;
    name: string;
    ingredients: string[];
  }[];
}

export interface WeekOption {
  value: string;
  label: string;
}
