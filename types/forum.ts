export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: string;
  topic: string;
  createdAt: Date;
  updatedAt: Date;
  likes: string[]; // Array of user IDs who liked the post
  likeCount: number;
  replyCount: number;
}

export interface Reply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  likes: string[]; // Array of user IDs who liked the reply
  likeCount: number;
}

export type Category = 'Fertilizers' | 'Pest Control' | 'Soil Health' | 'Crop Management' | 'Seeds' | 'Weather';
export type Topic = 'Tomatoes' | 'Organic Farming' | 'Testing' | 'Planning' | 'Irrigation' | 'Harvesting';
