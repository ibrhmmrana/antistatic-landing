export interface Prediction {
  place_id: string;
  primary_text: string;
  secondary_text: string;
  scope?: "local" | "global"; // Added for country-preferred results
}

export interface AutocompleteResponse {
  predictions: Prediction[];
}

export interface SelectedPlace {
  place_id: string;
  primary_text: string;
  secondary_text: string;
}


