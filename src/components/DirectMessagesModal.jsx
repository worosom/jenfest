import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, MessageCircle, Loader2, FileText, Calendar } from "lucide-react";
import {
  collection,
  query,
  where,
  or,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { useUsers } from "../hooks/useUsers";
import ProfilePicture from "./ProfilePicture";
import ConversationModal from "./ConversationModal";
import PostRepliesModal from "./PostRepliesModal";

const DirectMessagesModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users } = useUsers();
  const [items, setItems] = useState([]); // Combined list of messages and post replies
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    setLoading(true);

    let unsubscribeLastViewed = null;

    // Listen to direct messages
    const messagesRef = collection(db, "messages");
    const messagesQuery = query(
      messagesRef,
      or(
        where("senderId", "==", user.uid),
        where("recipientId", "==", user.uid),
      ),
    );

    // Listen to replies on user's posts
    const repliesRef = collection(db, "replies");
    const repliesQuery = query(repliesRef);

    // Listen to last viewed timestamps
    const postLastViewedRef = collection(db, "postLastViewed");
    const postLastViewedQuery = query(
      postLastViewedRef,
      where("userId", "==", user.uid),
    );

    const processData = async (messagesSnapshot, lastViewedSnapshot = null) => {
      const messagesData = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get all posts
      const postsRef = collection(db, "posts");
      const postsSnapshot = await getDocs(postsRef);
      const postsMap = new Map();
      postsSnapshot.docs.forEach((doc) => {
        const postData = { id: doc.id, ...doc.data() };
        // Only include published posts
        if (postData.published === false) {
          return;
        }
        postsMap.set(doc.id, postData);
      });

      // Get all replies
      const repliesSnapshot = await getDocs(repliesQuery);
      const repliesData = repliesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get last viewed timestamps for posts
      let lastViewedMap = new Map();
      if (lastViewedSnapshot) {
        // Use provided snapshot from listener
        lastViewedSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          lastViewedMap.set(data.postId, data.lastViewedAt);
        });
      } else {
        // Fallback: fetch once
        const postLastViewedSnapshot = await getDocs(postLastViewedQuery);
        postLastViewedSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          lastViewedMap.set(data.postId, data.lastViewedAt);
        });
      }

      // Group messages by conversation partner
      const conversationMap = new Map();

      messagesData.forEach((message) => {
        const otherUserId =
          message.senderId === user.uid
            ? message.recipientId
            : message.senderId;

        const existingConvo = conversationMap.get(`dm-${otherUserId}`);

        if (
          !existingConvo ||
          (message.createdAt &&
            existingConvo.lastActivity &&
            message.createdAt.toMillis() >
              existingConvo.lastActivity.toMillis())
        ) {
          conversationMap.set(`dm-${otherUserId}`, {
            type: "message",
            userId: otherUserId,
            lastActivity: message.createdAt,
            lastMessage: message,
            isUnread: message.recipientId === user.uid && !message.read,
          });
        }
      });

      // Group replies by post - build a map of all posts with replies
      const postRepliesMap = new Map();

      // First pass: identify all posts the user is involved with
      const userInvolvedPosts = new Set();
      repliesData.forEach((reply) => {
        const post = postsMap.get(reply.postId);
        if (!post) return;

        const userOwnsPost = post.authorId === user.uid;
        const userReplied = reply.authorId === user.uid;

        if (userOwnsPost || userReplied) {
          userInvolvedPosts.add(reply.postId);
        }
      });

      // Second pass: for each involved post, find the most recent reply
      userInvolvedPosts.forEach((postId) => {
        const post = postsMap.get(postId);
        if (!post) return;

        const postReplies = repliesData.filter((r) => r.postId === postId);
        if (postReplies.length === 0) return;

        // Find most recent reply
        const sortedReplies = postReplies.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });

        const mostRecentReply = sortedReplies[0];
        const userOwnsPost = post.authorId === user.uid;
        const userHasReplied = postReplies.some((r) => r.authorId === user.uid);

        postRepliesMap.set(`post-${postId}`, {
          type: "post-reply",
          postId: postId,
          post: post,
          lastActivity: mostRecentReply.createdAt,
          lastReply: mostRecentReply,
          userOwnsPost,
          userReplied: userHasReplied,
        });
      });

      // Check for unread replies and add unread indicators
      const filteredPostReplies = [];
      postRepliesMap.forEach((postReply) => {
        const lastViewed = lastViewedMap.get(postReply.postId);
        const postReplies = repliesData.filter(
          (r) => r.postId === postReply.postId,
        );

        // Check if there are replies newer than lastViewed (or if never viewed)
        const hasNewReplies = postReplies.some((r) => {
          // Skip user's own replies
          if (r.authorId === user.uid) return false;
          // If never viewed, all non-user replies are new
          if (!lastViewed) return true;
          // Check if reply is newer than last viewed
          return r.createdAt && r.createdAt.toMillis() > lastViewed.toMillis();
        });

        // Only show unread indicator if user owns the post AND there are new replies
        postReply.hasUnread = hasNewReplies && postReply.userOwnsPost;

        // Show all post conversations (for authors and participants)
        // But filter out author's posts with no new activity ONLY if they haven't replied themselves
        if (
          postReply.userOwnsPost &&
          !hasNewReplies &&
          !postReply.userReplied
        ) {
          // Skip - author's post with no new activity and author hasn't participated
          return;
        }

        filteredPostReplies.push(postReply);
      });

      // Combine and sort all items by most recent activity
      const allItems = [
        ...Array.from(conversationMap.values()),
        ...filteredPostReplies,
      ].sort((a, b) => {
        if (!a.lastActivity) return 1;
        if (!b.lastActivity) return -1;
        return b.lastActivity.toMillis() - a.lastActivity.toMillis();
      });

      setItems(allItems);
      setLoading(false);
    };

    // Set up listeners
    const unsubscribeMessages = onSnapshot(
      messagesQuery,
      async (messagesSnapshot) => {
        await processData(messagesSnapshot);
      },
    );

    unsubscribeLastViewed = onSnapshot(
      postLastViewedQuery,
      async (lastViewedSnapshot) => {
        // Get current messages to reprocess
        const messagesSnapshot = await getDocs(messagesQuery);
        await processData(messagesSnapshot, lastViewedSnapshot);
      },
    );

    return () => {
      unsubscribeMessages();
      if (unsubscribeLastViewed) {
        unsubscribeLastViewed();
      }
    };
  }, [isOpen, user?.uid]);

  const handleItemClick = (item) => {
    if (item.type === "message") {
      setSelectedUserId(item.userId);
    } else if (item.type === "post-reply") {
      // Open post replies modal
      setSelectedPost(item.post);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-warm-gray-300)] bg-[var(--color-sand-light)]">
            <div className="flex items-center gap-2">
              <MessageCircle size={24} className="text-[var(--color-clay)]" />
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                Messages
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-warm-gray-200)] rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2
                  size={32}
                  className="text-[var(--color-clay)] animate-spin mb-2"
                />
                <p className="text-[var(--color-text-light)]">
                  Loading conversations...
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <MessageCircle
                  size={48}
                  className="text-[var(--color-warm-gray-300)] mb-3"
                />
                <p className="text-[var(--color-text-light)] text-center">
                  No messages yet
                </p>
                <p className="text-[var(--color-text-light)] text-sm text-center mt-1">
                  Start a conversation or reply to a post
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-warm-gray-200)]">
                {items.map((item, index) => {
                  if (item.type === "message") {
                    const otherUser = users[item.userId];
                    const isUnread = item.isUnread;
                    const messagePreview =
                      item.lastMessage.content.length > 50
                        ? item.lastMessage.content.substring(0, 50) + "..."
                        : item.lastMessage.content;
                    const isSentByMe = item.lastMessage.senderId === user.uid;

                    return (
                      <button
                        key={`dm-${item.userId}`}
                        onClick={() => handleItemClick(item)}
                        className="w-full p-4 pl-5 hover:bg-[var(--color-sand-light)] transition-colors text-left flex items-start gap-3"
                      >
                        <ProfilePicture
                          src={otherUser?.photoURL}
                          alt={otherUser?.displayName || "User"}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between mb-1">
                            <h3
                              className={`font-semibold truncate ${
                                isUnread
                                  ? "text-[var(--color-text-primary)]"
                                  : "text-[var(--color-text-secondary)]"
                              }`}
                            >
                              {otherUser?.displayName || "Anonymous"}
                            </h3>
                            {item.lastActivity && (
                              <span className="text-xs text-[var(--color-text-light)] ml-2 flex-shrink-0">
                                {new Date(
                                  item.lastActivity.toMillis(),
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm truncate ${
                              isUnread
                                ? "text-[var(--color-text-secondary)] font-medium"
                                : "text-[var(--color-text-light)]"
                            }`}
                          >
                            {isSentByMe && (
                              <span className="text-[var(--color-text-light)]">
                                You:{" "}
                              </span>
                            )}
                            {messagePreview}
                          </p>
                        </div>
                        {isUnread && (
                          <div className="w-2 h-2 bg-[var(--color-clay)] rounded-full mt-2 flex-shrink-0"></div>
                        )}
                      </button>
                    );
                  } else if (item.type === "post-reply") {
                    const postTitle =
                      item.post.title || item.post.content.substring(0, 60);
                    const hasImage =
                      item.post.media && item.post.media.length > 0;
                    const hasUnread = item.hasUnread;

                    return (
                      <button
                        key={`post-${item.postId}`}
                        onClick={() => handleItemClick(item)}
                        className="w-full p-4 hover:bg-[var(--color-sand-light)] transition-colors text-left flex items-start gap-3"
                      >
                        {/* Post image or icon */}
                        {hasImage ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.post.media[0].url}
                              alt="Post"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[var(--color-warm-gray-200)] flex items-center justify-center flex-shrink-0">
                            {item.post.isActivity ? (
                              <Calendar
                                size={24}
                                className="text-[var(--color-clay)]"
                              />
                            ) : (
                              <FileText
                                size={24}
                                className="text-[var(--color-clay)]"
                              />
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0 self-center">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`font-semibold truncate self-center ${
                                hasUnread
                                  ? "text-[var(--color-text-primary)]"
                                  : "text-[var(--color-text-secondary)]"
                              }`}
                            >
                              {postTitle}
                            </h3>
                            {item.lastActivity && (
                              <span className="text-xs text-[var(--color-text-light)] ml-2 flex-shrink-0 flex flex-row">
                                {hasUnread && (
                                  <div className="w-2 h-2 bg-[var(--color-clay)] rounded-full flex-shrink-0 self-center mr-2"></div>
                                )}
                                {new Date(
                                  item.lastActivity.toMillis(),
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Modal */}
      {selectedUserId && (
        <ConversationModal
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          recipientId={selectedUserId}
          onViewUserProfile={(userId) => {
            setSelectedUserId(null);
            onClose();
            navigate(`/user/${userId}`);
          }}
        />
      )}

      {/* Post Replies Modal */}
      {selectedPost && (
        <PostRepliesModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          onViewUserProfile={(userId) => {
            setSelectedPost(null);
            onClose();
            navigate(`/user/${userId}`);
          }}
        />
      )}
    </>
  );
};

export default DirectMessagesModal;

