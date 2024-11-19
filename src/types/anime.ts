export interface AnimeBasic {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  score: number;
  genres: Array<{ mal_id: number; name: string }>;
  year: number;
  season: string;
  studios: Array<{ mal_id: number; name: string }>;
  uniqueId: string;
}

export interface VoiceActor {
  person: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  character: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
}

export interface AnimeDetailed extends AnimeBasic {
  synopsis: string;
  rating: string;
  status: string;
  episodes: number;
  duration: string;
  aired: {
    from: string;
    to: string;
  };
  voiceActors: VoiceActor[];
}