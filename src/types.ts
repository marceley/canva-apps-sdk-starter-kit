export interface Box {
  id: string;
  label: string;
  templateId: string;
}

export interface MethodStep {
  header?: string;
  text: string;
}

export interface Recipe {
  id: string;
  day: number;
  title: string;
  ingredients: string[];
  method: MethodStep[];
}

export interface BoxData {
  frontpage: {
    title: string;
    ingredients: string[];
  };
  recipes: Recipe[];
}

export interface WeekOption {
  value: string;
  label: string;
}
