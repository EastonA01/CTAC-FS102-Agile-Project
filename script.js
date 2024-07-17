document.addEventListener('DOMContentLoaded', (event) => {
    // Select key elements from the DOM
    const newPostModal = document.querySelector('#newPostModal');
    const submitPostButton = document.querySelector('#submitPostButton');
    const postContainer = document.querySelector('#post-container');
    const searchButton = document.querySelector('#search-button');
    const searchBar = document.querySelector('#search-bar');
    const mostLikedContainer = document.querySelector('.most-liked-card .card-body');
    const loadPostsButton = document.querySelector('#load-posts-button');

    // Load posts from localStorage when the page is loaded
    loadPosts();

    // Event listener to create a new post when the submit button is clicked
    if (submitPostButton) {
        submitPostButton.addEventListener('click', () => {
            const postAuthor = document.querySelector('#postAuthor').value.trim();
            const postTags = document.querySelector('#postTags').value.trim().split(',').map(tag => tag.trim());
            const postContent = document.querySelector('#postContent').value.trim();

            if (postAuthor && postContent) {
                createPost(postAuthor, postTags, postContent);
                // Clear the form inputs
                document.querySelector('#postAuthor').value = '';
                document.querySelector('#postTags').value = '';
                document.querySelector('#postContent').value = '';
                // Hide the modal after submitting
                $(newPostModal).modal('hide');
            } else {
                alert('Author and content cannot be empty.');
            }
        });
    }

    // Event listener to reload all posts when the load posts button is clicked
    if (loadPostsButton) {
        loadPostsButton.addEventListener('click', () => {
            postContainer.innerHTML = ''; // Clear existing posts
            loadPosts(); // Load posts from localStorage
        });
    }

    // Function to create a new post object and render it
    function createPost(author, tags, content) {
        const postId = Date.now(); // Unique ID based on current timestamp
        const postDate = new Date().toLocaleString(); // Human-readable date

        const post = {
            id: postId,
            author,
            tags: tags || [], // Ensure tags is an array
            content,
            date: postDate,
            likes: 0, // Initialize likes to 0
        };

        console.log('Creating post:', post); // Log post details

        savePost(post); // Save post to localStorage
        renderPost(post); // Render post on the page
        updateMostLikedTags(); // Update trending tags section
    }

    // Function to save a post to localStorage
    function savePost(post) {
        const posts = getPosts(); // Retrieve existing posts
        posts.push(post); // Add new post to the list
        localStorage.setItem('posts', JSON.stringify(posts)); // Save updated list to localStorage
    }

    // Function to load posts from localStorage
    function loadPosts() {
        const posts = getPosts(); // Retrieve posts from localStorage
        posts.forEach(post => {
            console.log('Loading post:', post); // Log post details
            renderPost(post); // Render each post on the page
        });
        updateMostLikedTags(); // Update trending tags section
    }

    // Function to get posts from localStorage
    function getPosts() {
        const posts = JSON.parse(localStorage.getItem('posts'));
        return Array.isArray(posts) ? posts : [];
    }

    // Function to render a post on the page
    function renderPost(post) {
        const postCard = document.createElement('div');
        postCard.className = 'card post-card';
        postCard.dataset.id = post.id;
        postCard.innerHTML = `
            <div class="card-body position-relative">
                <div class="d-flex justify-content-between">
                    <span class="post-username">${post.author}</span>
                    <span class="post-date">${post.date}</span>
                    <button type="button" class="close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="text-center post-tags">${Array.isArray(post.tags) ? post.tags.map(tag => `#${tag}`).join(', ') : ''}</div>
                <p class="card-text mt-2">${post.content}</p>
                <div class="d-flex justify-content-between mt-3">
                    <div>
                        <span class="like-counter">Likes: ${post.likes}</span>
                        <button type="button" class="btn btn-secondary btn-sm comments-button" data-toggle="collapse" data-target="#comments-section-${post.id}" aria-expanded="false" aria-controls="comments-section-${post.id}">Comments</button>
                    </div>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-secondary btn-sm edit-button">Edit</button>
                        <button type="button" class="btn btn-secondary btn-sm comment-button">Comment</button>
                        <button type="button" class="btn btn-secondary btn-sm like-button">Like</button>
                    </div>
                </div>
                <div class="collapse mt-3" id="comments-section-${post.id}">
                    <div class="card card-body">
                        <p class="card-text">No comments yet.</p>
                    </div>
                </div>
            </div>
        `;

        // Insert the new post card immediately after the welcome card
        const welcomeCard = postContainer.querySelector('.welcome-card');
        if (welcomeCard) {
            welcomeCard.insertAdjacentElement('afterend', postCard);
        } else {
            postContainer.prepend(postCard);
        }

        // Add event listeners for the new post buttons
        postCard.querySelector('.close').addEventListener('click', () => deletePost(post.id));
        postCard.querySelector('.edit-button').addEventListener('click', () => editPost(post.id));
        postCard.querySelector('.comment-button').addEventListener('click', () => addComment(post.id));
        postCard.querySelector('.like-button').addEventListener('click', () => likePost(post.id));
    }

    // Function to delete a post from the view and update the tags
    function deletePost(id) {
        document.querySelector(`[data-id="${id}"]`).remove(); // Remove post from the DOM
        updateMostLikedTags(); // Update trending tags section
    }

    // Function to edit a post (placeholder for actual functionality)
    function editPost(id) {
        alert('Section coming soon.');
    }

    // Function to add a comment (placeholder for actual functionality)
    function addComment(id) {
        alert('Section coming soon.');
    }

    // Function to like a post
    function likePost(id) {
        let posts = getPosts(); // Retrieve posts from localStorage
        const post = posts.find(post => post.id === id); // Find the post by ID
        post.likes += 1; // Increment likes
        localStorage.setItem('posts', JSON.stringify(posts)); // Save updated posts to localStorage
        document.querySelector(`[data-id="${id}"] .like-counter`).innerText = `Likes: ${post.likes}`; // Update like counter in the DOM
        updateMostLikedTags(); // Update trending tags section
    }

    // Function to update the "Most Liked" tags section
    function updateMostLikedTags() {
        const posts = getPosts(); // Retrieve posts from localStorage
        const tagLikes = {}; // Initialize an object to store tag likes

        // Calculate total likes for each tag
        if (Array.isArray(posts)) {
            posts.forEach(post => {
                if (Array.isArray(post.tags)) {
                    post.tags.forEach(tag => {
                        if (!tagLikes[tag]) {
                            tagLikes[tag] = 0;
                        }
                        tagLikes[tag] += post.likes;
                    });
                }
            });
        }

        // Sort tags by total likes
        const sortedTags = Object.entries(tagLikes).sort((a, b) => b[1] - a[1]);

        // Update the trending tags section in the DOM
        mostLikedContainer.innerHTML = '<span style = "font-weight: bold">Trending Tags</span>';
        sortedTags.forEach(([tag, likes]) => {
            const tagElement = document.createElement('div');
            tagElement.innerHTML = `<span style="font-weight: bold">#${tag}:</span> ${likes} likes`;
            mostLikedContainer.appendChild(tagElement);
        });
    }

    // Event listener for the search button
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchBar.value.toLowerCase();
            const posts = getPosts(); // Retrieve posts from localStorage
            postContainer.innerHTML = ''; // Clear existing posts
            posts
                .filter(post => post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) || post.content.toLowerCase().includes(searchTerm))
                .forEach(post => renderPost(post)); // Render filtered posts
        });
    }

    // Event listener for pressing "Enter" key in the search bar
    if (searchBar) {
        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchButton.click(); // Trigger search button click
            }
        });
    }
});
