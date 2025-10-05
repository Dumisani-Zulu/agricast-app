import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Post, Reply } from '../types/forum';

// Collection names
const POSTS_COLLECTION = 'posts';
const REPLIES_COLLECTION = 'replies';

// Helper function to convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date();
};

/**
 * Posts Service
 */

// Create a new post
export const createPost = async (
  title: string,
  content: string,
  category: string,
  topic: string,
  authorId: string,
  authorName: string
): Promise<string> => {
  try {
    const postData = {
      title,
      content,
      category,
      topic,
      authorId,
      authorName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: [],
      likeCount: 0,
      replyCount: 0
    };

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData);
    console.log('✅ Post created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating post:', error);
    throw error;
  }
};

// Get all posts with optional filters
export const getPosts = async (
  category?: string,
  topic?: string,
  searchQuery?: string,
  limitCount: number = 50
): Promise<Post[]> => {
  try {
    const postsRef = collection(db, POSTS_COLLECTION);
    const constraints: QueryConstraint[] = [];

    if (category && category !== 'All') {
      constraints.push(where('category', '==', category));
    }

    if (topic && topic !== 'All') {
      constraints.push(where('topic', '==', topic));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(limitCount));

    const q = query(postsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    let posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToDate(doc.data().createdAt),
      updatedAt: timestampToDate(doc.data().updatedAt)
    })) as Post[];

    // Client-side search filtering if searchQuery is provided
    if (searchQuery && searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery)
      );
    }

    return posts;
  } catch (error) {
    console.error('❌ Error getting posts:', error);
    throw error;
  }
};

// Get a single post by ID
export const getPost = async (postId: string): Promise<Post | null> => {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: timestampToDate(docSnap.data().createdAt),
        updatedAt: timestampToDate(docSnap.data().updatedAt)
      } as Post;
    }

    return null;
  } catch (error) {
    console.error('❌ Error getting post:', error);
    throw error;
  }
};

// Subscribe to posts with real-time updates
export const subscribeToPost = (
  postId: string,
  callback: (post: Post | null) => void
): (() => void) => {
  const docRef = doc(db, POSTS_COLLECTION, postId);
  
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const post = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: timestampToDate(docSnap.data().createdAt),
        updatedAt: timestampToDate(docSnap.data().updatedAt)
      } as Post;
      callback(post);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('❌ Error in post subscription:', error);
  });

  return unsubscribe;
};

// Subscribe to posts list with real-time updates
export const subscribeToPosts = (
  callback: (posts: Post[]) => void,
  category?: string,
  topic?: string,
  limitCount: number = 50
): (() => void) => {
  const postsRef = collection(db, POSTS_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (category && category !== 'All') {
    constraints.push(where('category', '==', category));
  }

  if (topic && topic !== 'All') {
    constraints.push(where('topic', '==', topic));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(limitCount));

  const q = query(postsRef, ...constraints);

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToDate(doc.data().createdAt),
      updatedAt: timestampToDate(doc.data().updatedAt)
    })) as Post[];
    callback(posts);
  }, (error) => {
    console.error('❌ Error in posts subscription:', error);
  });

  return unsubscribe;
};

// Toggle like on a post
export const togglePostLike = async (
  postId: string,
  userId: string
): Promise<void> => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }

    const post = postSnap.data();
    const likes = post.likes || [];
    const isLiked = likes.includes(userId);

    if (isLiked) {
      // Unlike
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
        likeCount: increment(-1),
        updatedAt: serverTimestamp()
      });
    } else {
      // Like
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
        likeCount: increment(1),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('❌ Error toggling post like:', error);
    throw error;
  }
};

// Delete a post (admin/author only - implement auth checks in your app)
export const deletePost = async (postId: string): Promise<void> => {
  try {
    // First, delete all replies associated with this post
    const repliesRef = collection(db, REPLIES_COLLECTION);
    const q = query(repliesRef, where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Then delete the post itself
    await deleteDoc(doc(db, POSTS_COLLECTION, postId));
    console.log('✅ Post and associated replies deleted');
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    throw error;
  }
};

/**
 * Replies Service
 */

// Create a new reply
export const createReply = async (
  postId: string,
  content: string,
  authorId: string,
  authorName: string
): Promise<string> => {
  try {
    const replyData = {
      postId,
      content,
      authorId,
      authorName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: [],
      likeCount: 0
    };

    const docRef = await addDoc(collection(db, REPLIES_COLLECTION), replyData);

    // Increment reply count on the post
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      replyCount: increment(1),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Reply created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating reply:', error);
    throw error;
  }
};

// Get all replies for a post
export const getReplies = async (postId: string): Promise<Reply[]> => {
  try {
    const repliesRef = collection(db, REPLIES_COLLECTION);
    const q = query(
      repliesRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const replies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToDate(doc.data().createdAt),
      updatedAt: timestampToDate(doc.data().updatedAt)
    })) as Reply[];

    return replies;
  } catch (error) {
    console.error('❌ Error getting replies:', error);
    throw error;
  }
};

// Subscribe to replies with real-time updates
export const subscribeToReplies = (
  postId: string,
  callback: (replies: Reply[]) => void
): (() => void) => {
  const repliesRef = collection(db, REPLIES_COLLECTION);
  const q = query(
    repliesRef,
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const replies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToDate(doc.data().createdAt),
      updatedAt: timestampToDate(doc.data().updatedAt)
    })) as Reply[];
    callback(replies);
  }, (error) => {
    console.error('❌ Error in replies subscription:', error);
  });

  return unsubscribe;
};

// Toggle like on a reply
export const toggleReplyLike = async (
  replyId: string,
  userId: string
): Promise<void> => {
  try {
    const replyRef = doc(db, REPLIES_COLLECTION, replyId);
    const replySnap = await getDoc(replyRef);

    if (!replySnap.exists()) {
      throw new Error('Reply not found');
    }

    const reply = replySnap.data();
    const likes = reply.likes || [];
    const isLiked = likes.includes(userId);

    if (isLiked) {
      // Unlike
      await updateDoc(replyRef, {
        likes: arrayRemove(userId),
        likeCount: increment(-1),
        updatedAt: serverTimestamp()
      });
    } else {
      // Like
      await updateDoc(replyRef, {
        likes: arrayUnion(userId),
        likeCount: increment(1),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('❌ Error toggling reply like:', error);
    throw error;
  }
};

// Delete a reply (admin/author only - implement auth checks in your app)
export const deleteReply = async (replyId: string, postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, REPLIES_COLLECTION, replyId));

    // Decrement reply count on the post
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      replyCount: increment(-1),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Reply deleted');
  } catch (error) {
    console.error('❌ Error deleting reply:', error);
    throw error;
  }
};
