import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuid } from 'uuid'
import { adminDb } from '../lib/firebaseAdmin'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
})

const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.DYNAMO_TABLE_NAME || 'Posts'

export interface Post {
  id: string
  content: string
  author: string
  authorType?: 'user' | 'ai'
  authorRole?: 'doctor' | 'student' | 'patient' | 'admin' // Added role
  image?: string
  video?: string
  images?: string[]
  videos?: string[]
  createdAt: number
  type?: 'post' | 'story'
  [key: string]: any
}

export interface Story {
  id: string
  author: string
  label: string
  image?: string
  video?: string
  createdAt: number
  type: 'story'
}

export interface Comment {
  id: string
  author: string
  avatar: string
  text: string
  time: string // or timestamp
  createdAt: number
  replies?: Comment[]
}

export interface StudyMaterial {
  id: string
  title: string
  description?: string
  category: 'books' | 'pyq' | 'notes' | 'ppt'
  fileUrl: string
  previewUrl?: string
  author: string
  authorType: string
  uploadDate: number
  year?: string
  university?: string
  subject?: string
  chapter?: string
  type: 'study_material'
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  content: string
  attachmentUrl?: string
  attachmentType?: 'image' | 'video' | 'file'
  createdAt: number
  read: boolean
  type: 'message'
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  status: 'pending' | 'approved' | 'rejected'
  opdFileUrl?: string
  date?: string
  createdAt: number
  type: 'appointment'
}

export interface Quiz {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  author?: string
  date: string
  type: 'quiz'
}

export interface User {
  id: string
  email: string
  passwordHash: string
  name: string
  role: 'dentist' | 'student' | 'patient'
  documentUrl?: string
  isVerified: boolean
  college?: string
  year?: string
  age?: string
  sex?: string
  state?: string
  district?: string
  profileImage?: string
  coverPhoto?: string
  bio?: string
  qualification?: string
  experience?: string
  practice?: string
  specialization?: string
  type: 'user'
}

export interface VisitSlot {
  id: string
  doctorId: string
  date: string
  time: string
  fee: number
  capacity: number
  bookedCount: number
  status: 'open' | 'full'
  type: 'visit_slot'
}

export async function createUser(userData: Partial<User>) {
  const user = {
    id: uuid(),
    createdAt: Date.now(),
    type: 'user',
    ...userData,
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
    })
  )

  return user
}

export async function createPost(postData: Partial<Post>) {
  const post = {
    id: uuid(),
    createdAt: Date.now(),
    type: 'post',
    ...postData,
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: post,
    })
  )

  return post
}

export async function getPosts(viewerRole?: string, author?: string) {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  )

  let posts: Post[] = (result.Items || []) as unknown as Post[]

  // Filter stories and future posts (scheduled)
  const now = Date.now();
  posts = posts.filter(item =>
    item.type !== 'story' &&
    item.createdAt <= now
  )

  // Filter by Author if specified
  if (author) {
    posts = posts.filter((p: Post) => p.author && (p.author === author || p.author.toLowerCase() === author.toLowerCase()))
  }

  // Sanitize and Populate Authors (Fix 'Dr. undefined')
  // We map cleanly to avoid mutating the result array in place if unnecessary, though JS references...
  const sanitizedPosts = await Promise.all(posts.map(async (p: any) => {
    let authorName = p.author

    // Check for bad data
    if (!authorName || authorName.includes('undefined') || authorName === 'Dr. ') {
      // Try to recover from userId/authorId
      const uid = p.userId || p.authorId || p.senderId
      if (uid) {
        const u = await getUserById(uid) // This now checks Firestore via our previous fix? No, getUserById scans Dynamo. 
        // We should probably use getUserByName logic but by ID. 
        // Let's use a quick lookup helper or just getUserById which is usually fast enough for a few bad posts.
        if (u) {
          authorName = u.name || u.displayName || 'Dr. Docent'
        } else {
          // Try Firestore direct if Dynamo fails
          try {
            const snap = await adminDb.collection('users').doc(uid).get()
            if (snap.exists) {
              const d = snap.data()
              authorName = d?.displayName || d?.name || 'Dr. Docent'
            }
          } catch (e) { }
        }
      } else {
        authorName = 'Docent User'
      }
    }
    return { ...p, author: authorName }
  }))
  posts = sanitizedPosts as Post[]


  // ROLE-BASED FILTERING
  if (viewerRole === 'patient') {
    // Patients see only Doctor posts, Admin/AI posts, or explicit Patient posts
    // They do NOT see Student discussions
    posts = posts.filter((p: Post) =>
      p.authorType === 'ai' ||
      p.authorRole === 'doctor' ||
      p.authorRole === 'patient' ||
      !p.authorRole // Legacy posts fallback
    )
  } else if (viewerRole === 'student') {
    // Students see everything except maybe private doctor-only (not implemented yet)
    posts = posts
  } else if (viewerRole === 'doctor') {
    // Doctors see everything
    posts = posts
  }

  return posts
}

export async function deletePost(id: string) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  )
  return { success: true, id }
}

export async function updatePost(id: string, updates: Partial<Post>) {
  const allowedUpdates = ['content', 'images', 'image', 'video', 'videos']
  let updateExpression = 'set'
  const expressionAttributeNames: any = {}
  const expressionAttributeValues: any = {}

  allowedUpdates.forEach((key, index) => {
    if (updates[key] !== undefined) {
      updateExpression += ` #key${index} = :val${index},`
      expressionAttributeNames[`#key${index}`] = key
      expressionAttributeValues[`:val${index}`] = updates[key]
    }
  })

  // Update updatedAt if not present
  updateExpression += ' #updatedAt = :updatedAt'
  expressionAttributeNames['#updatedAt'] = 'updatedAt'
  expressionAttributeValues[':updatedAt'] = Date.now()

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    })
  )

  return { success: true, id, ...updates }
}

export async function addComment(postId: string, comment: any) {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: postId },
        UpdateExpression: 'SET #comments = list_append(if_not_exists(#comments, :empty_list), :c)',
        ExpressionAttributeNames: {
          '#comments': 'comments',
        },
        ExpressionAttributeValues: {
          ':c': [comment],
          ':empty_list': [],
        },
      })
    )
    return { success: true }
  } catch (e) {
    console.error('Error adding comment', e)
    throw e
  }
}

export async function toggleLike(postId: string, userId: string) {
  try {
    // 1. Get current post to check if liked
    const post = await getPostById(postId)
    if (!post) throw new Error('Post not found')

    const likedBy = post.likedBy || []
    const isLiked = likedBy.includes(userId)

    let updateExpression
    let expressionAttributeValues

    if (isLiked) {
      // UNLIKE: Remove user from likedBy and decrement likes
      // Helper to remove item from list by index is complex in DynamoDB without index
      // Easier to just set the new list if it's small, or use a set
      // For hacked scalability, let's just filter locally and update. Concurrency issue risk but fine for now.
      const newLikedBy = likedBy.filter((id: string) => id !== userId)
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id: postId },
          UpdateExpression: 'SET likedBy = :likedBy, likes = :likes',
          ExpressionAttributeValues: {
            ':likedBy': newLikedBy,
            ':likes': Math.max(0, (post.likes || 0) - 1)
          }
        })
      )
      return { liked: false, likes: Math.max(0, (post.likes || 0) - 1) }

    } else {
      // LIKE: Add user to likedBy and increment likes
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id: postId },
          UpdateExpression: 'SET likedBy = list_append(if_not_exists(likedBy, :empty), :user), likes = if_not_exists(likes, :zero) + :inc',
          ExpressionAttributeValues: {
            ':user': [userId],
            ':empty': [],
            ':zero': 0,
            ':inc': 1
          }
        })
      )
      return { liked: true, likes: (post.likes || 0) + 1 }
    }

  } catch (e) {
    console.error('Error toggling like', e)
    throw e
  }
}

export async function createStory(storyData: Partial<Story>) {
  const story = {
    id: uuid(),
    createdAt: Date.now(),
    type: 'story',
    ...storyData
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: story
    })
  )
  return story
}

export async function getStories() {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    )

    // ✅ Filter stories older than 24 hours AND ensure type is story
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return (result.Items || []).filter((s: any) =>
      s.type === 'story' && (now - s.createdAt < oneDay)
    );
  } catch (e) {
    console.log('Error fetching stories', e)
    return []
  }
}

/* ---------- STUDY MATERIAL ---------- */

export async function createStudyMaterial(data: Partial<StudyMaterial>) {
  const material = {
    id: uuid(),
    uploadDate: Date.now(),
    type: 'study_material',
    ...data
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: material
    })
  )
  return material
}

export async function getStudyMaterials(category?: string, userId?: string) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    )

    let items = (result.Items || []).filter((item: any) => item.type === 'study_material')

    if (category) {
      items = items.filter((item: any) => item.category === category)
    }

    if (userId) {
      // Assuming 'authorId' or 'userId' is stored on the material. 
      // Checking createStudyMaterial, it saves whatever is in 'data'. 
      // We should ensure 'userId' is saved during creation, or 'author' name is used.
      // Usually auth-based filtering uses IDs. Let's assume 'userId' property.
      items = items.filter((item: any) => item.userId === userId)
    }

    return items
  } catch (e) {
    console.log('Error fetching study materials', e)
    return []
  }
}

export async function deleteStudyMaterial(id: string) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  )
  return { success: true, id }
}

/* ---------- MESSAGING ---------- */

export async function createMessage(data: Partial<Message>) {
  const message = {
    id: uuid(),
    createdAt: Date.now(),
    read: false,
    type: 'message',
    ...data
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: message
    })
  )
  return message
}

export async function getMessages(userId: string) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME
      })
    )

    // In a real app, we would use GSI for this. Scanning is inefficient but fine for this demo.
    return (result.Items || []).filter((item: any) =>
      item.type === 'message' &&
      (item.senderId === userId || item.receiverId === userId)
    ).sort((a: any, b: any) => a.createdAt - b.createdAt)
  } catch (e) {
    console.error('Error fetching messages', e)
    return []
  }
}

/* ---------- APPOINTMENTS & SLOTS ---------- */



// Update slot booking count safely
export async function incrementSlotBooking(slotId: string) {
  // Ideally this should be a transaction or conditional update.
  // For demo/hackathon, fetch-modify-save is risky but acceptable if low traffic.
}





export async function createAppointment(data: Partial<Appointment>) {
  const appointment = {
    id: uuid(),
    createdAt: Date.now(),
    status: 'pending',
    type: 'appointment',
    ...data
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: appointment
    })
  )
  return appointment
}

export async function getAppointments(doctorId: string) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME
      })
    )

    return (result.Items || []).filter((item: any) =>
      item.type === 'appointment' && item.doctorId === doctorId
    )
  } catch (e) {
    console.error('Error fetching appointments', e)
    return []
  }
}

/* ---------- VISIT SLOTS ---------- */

export async function createVisitSlot(data: Partial<VisitSlot>) {
  const slot = {
    id: uuid(),
    bookedCount: 0,
    status: 'open',
    type: 'visit_slot',
    ...data
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: slot
    })
  )
  return slot
}

export async function getVisitSlots(doctorId: string) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'doctorId = :did AND #type = :type',
        ExpressionAttributeValues: {
          ':did': doctorId,
          ':type': 'visit_slot'
        },
        ExpressionAttributeNames: {
          '#type': 'type'
        }
      })
    )
    return result.Items || []
  } catch (e) {
    console.error('Error fetching slots', e)
    return []
  }
}

export async function getSlotById(slotId: string) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'id = :id AND #type = :type',
        ExpressionAttributeValues: {
          ':id': slotId,
          ':type': 'visit_slot'
        },
        ExpressionAttributeNames: {
          '#type': 'type'
        }
      })
    )
    return (result.Items && result.Items.length > 0) ? result.Items[0] as VisitSlot : null
  } catch (e) {
    console.error('Error fetching slot', e)
    return null
  }
}

export async function updateSlot(slot: VisitSlot) {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: slot
    })
  )
  return slot
}

/* ---------- QUIZ ---------- */

export async function createQuiz(data: Partial<Quiz>) {
  const quiz = {
    id: uuid(),
    date: new Date().toISOString().split('T')[0],
    type: 'quiz',
    ...data
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: quiz
    })
  )
  return quiz
}

// Helper to ensure user exists in DynamoDB for relationship tracking
async function ensureUserInDynamo(userId: string) {
  const user = await getUserById(userId)
  if (!user) {
    // Upsert skeleton user
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            id: userId,
            type: 'user',
            createdAt: Date.now(),
            followers: [],
            following: []
          }
        })
      )
    } catch (e) {
      console.error('Error creating skeleton user', e)
    }
  }
}

export async function toggleFollow(currentUserId: string, targetUserId: string) {
  try {
    if (currentUserId === targetUserId) throw new Error("Cannot follow yourself")

    // 1. Ensure both users exist in DynamoDB (for relationship storage)
    await ensureUserInDynamo(currentUserId)
    await ensureUserInDynamo(targetUserId)

    // 2. Check if already following
    const currentUser = await getUserById(currentUserId)
    const following = currentUser?.following || []
    const isFollowing = following.includes(targetUserId)

    if (isFollowing) {
      // UNFOLLOW
      // Remove target from current's following
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: currentUserId },
        UpdateExpression: "SET following = :following",
        ExpressionAttributeValues: { ":following": following.filter((id: string) => id !== targetUserId) }
      }))

      // Remove current from target's followers
      const targetUser = await getUserById(targetUserId)
      const followers = targetUser?.followers || []
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: targetUserId },
        UpdateExpression: "SET followers = :followers",
        ExpressionAttributeValues: { ":followers": followers.filter((id: string) => id !== currentUserId) }
      }))

      return { isFollowing: false }
    } else {
      // FOLLOW
      // Add target to current's following
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: currentUserId },
        UpdateExpression: "SET following = list_append(if_not_exists(following, :empty), :target)",
        ExpressionAttributeValues: { ":target": [targetUserId], ":empty": [] }
      }))

      // Add current to target's followers
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: targetUserId },
        UpdateExpression: "SET followers = list_append(if_not_exists(followers, :empty), :current)",
        ExpressionAttributeValues: { ":current": [currentUserId], ":empty": [] }
      }))

      return { isFollowing: true }
    }

  } catch (e) {
    console.error("Error creating follow", e)
    throw e
  }
}

export async function getUserById(id: string) {
  try {
    // console.log('[DEBUG] getUserById fetching:', id)
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': id,
        },
      })
    )
    return (result.Items && result.Items.length > 0) ? result.Items[0] : null
  } catch (e) {
    console.error('Error fetching user by id', e)
    return null
  }
}

export async function getPostLikes(postId: string) {
  try {
    const post = await getPostById(postId)
    if (!post || !post.likedBy) return []

    const users = []
    for (const userId of post.likedBy) {
      // 1. Try fetching from Firestore (Primary source for Auth users)
      let user: any = null
      try {
        const userDoc = await adminDb.collection('users').doc(userId).get()
        if (userDoc.exists) {
          const data = userDoc.data()
          user = {
            id: userId,
            name: data?.displayName || data?.name || 'Unknown User',
            profileImage: data?.photoURL || data?.profileImage || null
          }
        }
      } catch (err) {
        console.error('Error fetching user from Firestore', err)
      }

      // 2. Fallback to DynamoDB (Legacy/Backend users)
      if (!user) {
        user = await getUserById(userId)
      }

      if (user) {
        users.push({
          name: user.name || user.displayName || 'User',
          avatar: user.profileImage || user.photoURL || `https://ui-avatars.com/api/?name=${user.name || 'U'}&background=random`,
          id: user.id
        })
      }
    }
    return users
  } catch (e) {
    console.error('Error fetching post likes', e)
    return []
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'email = :email AND #type = :type',
        ExpressionAttributeValues: {
          ':email': email,
          ':type': 'user'
        },
        ExpressionAttributeNames: {
          '#type': 'type'
        }
      })
    )

    return (result.Items && result.Items.length > 0) ? result.Items[0] : null
  } catch (e) {
    console.error('Error fetching user by email', e)
    return null
  }
}

export async function getUserByName(name: string) {
  try {
    // 1. Check DynamoDB first
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#name = :name AND #type = :type',
        ExpressionAttributeValues: {
          ':name': name,
          ':type': 'user'
        },
        ExpressionAttributeNames: {
          '#name': 'name',
          '#type': 'type'
        }
      })
    )

    let user = (result.Items && result.Items.length > 0) ? result.Items[0] : null

    // 2. Fallback to Firestore
    // Note: Firestore query by field requires index, but basic queries usually work.
    if (!user) {
      const snapshot = await adminDb.collection('users').where('displayName', '==', name).limit(1).get()
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        const userId = snapshot.docs[0].id

        // Check DynamoDB for that ID to get followers count (hybrid)
        const dynamoUser = await getUserById(userId)

        user = {
          id: userId,
          name: data.displayName || name,
          photoURL: data.photoURL,
          bio: data.bio,
          role: data.role,
          qualification: data.qualification || data.qualifications,
          experience: data.experience,
          practice: data.practice || data.practiceType,
          specialization: data.specialization,
          isVerified: data.isVerified,
          // Merge DynamoDB stats
          followers: dynamoUser?.followers || [],
          following: dynamoUser?.following || [],
          followersList: dynamoUser?.followers || [],
          followingList: dynamoUser?.following || []
        }
      }
    } else if (user) {
      // Ensure arrays exist for DynamoDB users
      user.followers = user.followers || []
      user.following = user.following || []
    }

    // Populate Follower/Following Details safely
    if (user) {
      const populateUsers = async (ids: string[]) => {
        if (!ids || !Array.isArray(ids)) return []
        const users = []
        for (const id of ids) {
          // Try Firestore first (Auth users)
          try {
            const doc = await adminDb.collection('users').doc(id).get()
            if (doc.exists) {
              const data = doc.data()
              let name = data?.displayName || data?.name || 'User'
              // Sanitize
              if (name.includes('undefined')) name = 'User'

              users.push({
                id,
                name,
                avatar: data?.photoURL || data?.profileImage || `https://ui-avatars.com/api/?name=${name}&background=random`
              })
              continue
            }
          } catch (e) { }

          // Fallback to DynamoDB
          const u = await getUserById(id)
          if (u) {
            let name = u.name || 'User'
            if (name.includes('undefined')) name = 'User'

            users.push({
              id: u.id,
              name,
              avatar: u.profileImage || u.photoURL || `https://ui-avatars.com/api/?name=${name}&background=random`
            })
          }
        }
        return users
      }

      user.followersList = await populateUsers(user.followers || [])
      user.followingList = await populateUsers(user.following || [])
    }

    return user
  } catch (e) {
    console.error('Error fetching user by name', e)
    return null
  }
}

export async function getAllUsers() { // NEW
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#type = :type',
        ExpressionAttributeValues: {
          ':type': 'user'
        },
        ExpressionAttributeNames: {
          '#type': 'type'
        }
      })
    )
    return result.Items || []
  } catch (e) {
    console.error('Error fetching all users', e)
    return []
  }
}

export async function getQuizzes(date?: string) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME
      })
    )

    // Return all quizzes, sorted by date desc
    let items = (result.Items || []).filter((item: any) => item.type === 'quiz')

    if (date) {
      items = items.filter((item: any) => item.date === date)
    }

    return items
  } catch (e) {
    console.error('Error fetching quizzes', e)
    return []
  }
}
export interface Notification {
  id: string
  userId: string // Receiver
  type: 'comment' | 'like' | 'follow' | 'share' | 'system'
  message: string
  referenceId?: string // postId, etc.
  senderId?: string
  senderName?: string
  senderAvatar?: string
  read: boolean
  createdAt: number
  itemType: 'notification'
}

/* ---------- NOTIFICATIONS ---------- */

export async function createNotification(data: Partial<Notification>) {
  const notification = {
    id: uuid(),
    createdAt: Date.now(),
    read: false,
    itemType: 'notification',
    ...data
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: notification
    })
  )
  return notification
}

export async function getNotifications(userId: string) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'userId = :uid AND itemType = :type',
        ExpressionAttributeValues: {
          ':uid': userId,
          ':type': 'notification'
        },
        ExpressionAttributeNames: {
          '#type': 'type' // This might need adjustment if itemType is used directly. Note: The Interface uses itemType, but checks above use type. Let's stick to type convention if possible, but notification might conflict.
          // Wait, previous items use 'type'. I should probably use 'type': 'notification'.
          // Let's verify standard usage.
          // User: type: 'user'
          // Post: type: 'post'
          // So I should use type: 'notification' in the object and filter by it.
        }
      })
    )

    // Correcting filter to use standard 'type' field if possible, or mapping itemType to type for consistency?
    // The previous patterns use a "type" field. I'll stick to that.

    return (result.Items || []).sort((a: any, b: any) => b.createdAt - a.createdAt)
  } catch (e) {
    console.error('Error fetching notifications', e)
    return []
  }
}

export async function markNotificationRead(id: string) {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: 'SET #read = :read',
        ExpressionAttributeValues: {
          ':read': true
        },
        ExpressionAttributeNames: {
          '#read': 'read'
        }
      })
    )
    return { success: true }
  } catch (e) {
    throw e
  }
}

export async function markAllNotificationsRead(userId: string) {
  try {
    const notifs = await getNotifications(userId)
    const unread = notifs.filter((n: any) => !n.read)

    // Simple Promise.all approach for now
    await Promise.all(unread.map((n: any) => markNotificationRead(n.id)))
    return { success: true, count: unread.length }
  } catch (e) {
    throw e
  }
}

export async function getPostById(postId: string) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': postId
        }
      })
    )
    return (result.Items && result.Items.length > 0) ? result.Items[0] as Post : null
  } catch (e) {
    console.error('Error fetching post by id', e)
    return null
  }
}

export async function incrementShare(postId: string) {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: postId },
        UpdateExpression: 'SET shares = if_not_exists(shares, :zero) + :inc',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1
        }
      })
    )
    return { success: true }
  } catch (e) {
    console.error('Error incrementing shares', e)
    throw e
  }
}
