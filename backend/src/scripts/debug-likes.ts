
import { config } from 'dotenv'
import path from 'path'
import { getPosts, getPostLikes, getUserById } from '../services/dynamo.service'

// Load env vars
config({ path: path.join(__dirname, '../../.env') })

async function run() {
    try {
        console.log('--- STARTING DEBUG ---')
        console.log('Table Name:', process.env.DYNAMO_TABLE_NAME)

        // 1. Get all posts
        const posts = await getPosts()
        console.log(`Found ${posts.length} posts`)

        // 2. Find posts with likes
        const postsWithLikes = posts.filter(p => p.likedBy && p.likedBy.length > 0)
        console.log(`Found ${postsWithLikes.length} posts with likes`)

        for (const post of postsWithLikes) {
            console.log(`\nPost ID: ${post.id}`)
            console.log(`LikedBy: ${JSON.stringify(post.likedBy)}`)

            // 3. Try to fetch users for this post
            console.log('Fetching likes details...')
            const users = await getPostLikes(post.id)
            console.log(`Resolved Users: ${JSON.stringify(users, null, 2)}`)

            // 4. Manually check first user ID
            if (post.likedBy && post.likedBy.length > 0) {
                const firstId = post.likedBy[0]
                console.log(`Manual check for User ID: ${firstId}`)
                const user = await getUserById(firstId)
                console.log('User found manually:', user ? 'YES' : 'NO')
                if (user) {
                    console.log('User Type:', user.type)
                    console.log('User Name:', user.name)
                }
            }
        }

    } catch (e) {
        console.error('Debug script failed', e)
    }
}

run()
