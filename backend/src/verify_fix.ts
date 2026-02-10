
async function runTest() {
    const BASE = 'http://localhost:4000';

    console.log('--- STARTING VERIFICATION ---');

    // 1. Create a Post
    console.log('Creating Post...');
    const postRes = await fetch(`${BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Test Post Content', author: 'TestUser' })
    });
    const post = await postRes.json();
    console.log('Created Post:', post.id, post.type || '(no type)');

    // 2. Create a Story
    console.log('Creating Story...');
    const storyRes = await fetch(`${BASE}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: 'Test Story', author: 'TestUser' })
    });
    const story = await storyRes.json();
    console.log('Created Story:', story.id, story.type || '(no type)');

    // 3. Get Posts (Should NOT have story)
    console.log('Fetching Posts...');
    const posts = await (await fetch(`${BASE}/posts`)).json();
    const foundStoryInPosts = posts.find((p: any) => p.id === story.id);
    const foundPostInPosts = posts.find((p: any) => p.id === post.id);

    if (foundStoryInPosts) console.error('FAIL: Story found in Posts feed!');
    else console.log('PASS: Story NOT found in Posts feed.');

    if (foundPostInPosts) console.log('PASS: Post found in Posts feed.');
    else console.error('FAIL: Post NOT found in Posts feed.');

    // 4. Get Stories (Should have story)
    console.log('Fetching Stories...');
    const stories = await (await fetch(`${BASE}/stories`)).json();
    const foundStoryInStories = stories.find((s: any) => s.id === story.id);

    if (foundStoryInStories) console.log('PASS: Story found in Stories feed.');
    else console.error('FAIL: Story NOT found in Stories feed.');

    // 5. Delete Post
    console.log('Deleting Post...');
    const delRes = await fetch(`${BASE}/posts/${post.id}`, { method: 'DELETE' });
    if (delRes.ok) console.log('PASS: Post deleted via API.');
    else console.error('FAIL: Could not delete post.');

    console.log('--- TEST COMPLETE ---');
}

runTest();
