import { Router } from 'express'
import multer from 'multer'
import { s3Client } from '../aws'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuid } from 'uuid'
import { createPost, getPosts, deletePost, updatePost, addComment, getPostById, createNotification, getUserByName, toggleLike, getPostLikes, incrementShare } from '../services/dynamo.service'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!

/* ---------- GET POSTS ---------- */
router.get('/', async (req, res) => {
  try {
    const role = req.query.role as string | undefined
    const author = req.query.author as string | undefined
    const posts = await getPosts(role, author)
    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

/* ---------- CREATE POST ---------- */
router.post('/', upload.array('files'), async (req, res) => {
  try {
    const { content, author, authorType, authorRole, image, video } = req.body

    // ✅ Handle Multiple Files (Legacy / Direct Upload)
    const files = req.files as Express.Multer.File[] | undefined
    const images: string[] = []
    const videos: string[] = []

    if (image) images.push(image)
    if (video) videos.push(video)

    if (files && files.length > 0) {
      for (const file of files) {
        const key = `posts/${uuid()}-${file.originalname}`

        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        )

        const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`

        if (file.mimetype.startsWith('image')) images.push(url)
        if (file.mimetype.startsWith('video')) videos.push(url)
      }
    }

    const post = await createPost({
      content,
      author: author || 'You',
      authorType: authorType || 'user',
      authorRole: authorRole || 'patient', // Default to patient if not provided for safety
      images,
      videos,
      // Backwards Compatibility
      image: images[0] || '',
      video: videos[0] || '',
    })

    res.json(post)
  } catch (err) {
    console.error('Save Error:', err)
    res.status(500).json({ error: 'Failed to save post' })
  }
})

/* ---------- DELETE POST ---------- */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deletePost(id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

/* ---------- UPDATE POST ---------- */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { content, images, image, video, videos } = req.body

    const updated = await updatePost(id, {
      content,
      images,
      image,
      video,
      videos
    })

    res.json(updated)
  } catch (err) {
    console.error('Update Error:', err)
    res.status(500).json({ error: 'Failed to update post' })
  }
})

/* ---------- ADD COMMENT ---------- */
router.post('/:id/comment', async (req, res) => {
  try {
    const { id } = req.params
    const { author, avatar, text } = req.body

    const comment = {
      id: uuid(),
      author: author || 'Guest',
      avatar: avatar || 'https://ui-avatars.com/api/?background=random',
      text,
      time: 'Just now', // Simple for UI, could use date
      createdAt: Date.now(),
      replies: []
    }

    await addComment(id, comment)

    // Notify Post Author
    try {
      const post = await getPostById(id)
      if (post && post.author !== author) { // Don't notify self
        // Lookup user by name (assuming author field is name)
        const postAuthorUser = await getUserByName(post.author);

        if (postAuthorUser) {
          await createNotification({
            userId: postAuthorUser.id,
            type: 'comment',
            message: `${author} commented on your post`,
            referenceId: id,
            senderId: author, // or look up current user ID if available
            senderName: author,
            senderAvatar: avatar,
            read: false
          })
        }
      }
    } catch (notifErr) {
      console.error('Notification Error:', notifErr) // Non-blocking
    }

    res.json(comment)
  } catch (err) {
    console.error('Comment Error:', err)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

/* ---------- TOGGLE LIKE ---------- */
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' })
    }

    const result = await toggleLike(id, userId)

    // Notify Post Author if Liked
    if (result.liked) {
      try {
        const post = await getPostById(id)
        if (post && post.author) {
          // We need to resolve author to ID. For now assuming we can notify by name lookup or similar.
          // Simplified notification logic:
          const postAuthorUser = await getUserByName(post.author);
          if (postAuthorUser && postAuthorUser.id !== userId) {
            await createNotification({
              userId: postAuthorUser.id,
              type: 'like',
              message: 'Someone liked your post',
              referenceId: id,
              senderId: userId,
              read: false
            })
          }
        }
      } catch (e) {
        console.error('Notification error', e)
      }
    }

    res.json(result)
  } catch (err) {
    console.error('Like Error:', err)
    res.status(500).json({ error: 'Failed to toggle like' })
  }
})

/* ---------- GET LIKES ---------- */
router.get('/:id/likes', async (req, res) => {
  try {
    const { id } = req.params
    const likes = await getPostLikes(id)
    res.json(likes)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch likes' })
  }
})

/* ---------- SHARE POST ---------- */
router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params
    const { userId, senderName } = req.body

    await incrementShare(id)

    // Notify Post Author
    try {
      const post = await getPostById(id)
      if (post && post.author) {
        const postAuthorUser = await getUserByName(post.author);
        if (postAuthorUser && postAuthorUser.id !== userId) {
          await createNotification({
            userId: postAuthorUser.id,
            type: 'share', // Frontend handles unknown types with Bell icon
            message: `${senderName || 'Someone'} shared your post`,
            referenceId: id,
            senderId: userId,
            read: false,
            createdAt: Date.now()
          })
        }
      }
    } catch (e) {
      console.error('Notification error', e)
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Share Error:', err)
    res.status(500).json({ error: 'Failed to share post' })
  }
})

export default router
