document.addEventListener('DOMContentLoaded', (event) => {
    const newPostModal = document.querySelector('#newPostModal');
    const submitPostButton = document.querySelector('#submitPostButton');
    const postContainer = document.querySelector('#post-container');
    const searchButton = document.querySelector('#search-button');
    const searchBar = document.querySelector('#search-bar');
    const mostLikedContainer = document.querySelector('.most-liked-card .card-body');
    const loadPostsButton = document.querySelector('#load-posts-button');

    // Load posts from localStorage
    loadPosts();

    // Event listener to create a new post
    if (submitPostButton) {
        submitPostButton.addEventListener('click', () => {
            const postAuthor = document.querySelector('#postAuthor').value.trim();
            const postTags = document.querySelector('#postTags').value.trim().split(',').map(tag => tag.trim());
            const postContent = document.querySelector('#postContent').value.trim();
            const postImageInput = document.querySelector('#postImage');

            if (postAuthor && postContent) {
                if (postImageInput.files && postImageInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const postImage = e.target.result;
                        createPost(postAuthor, postTags, postContent, postImage);
                        clearPostForm();
                    };
                    reader.readAsDataURL(postImageInput.files[0]);
                } else {
                    createPost(postAuthor, postTags, postContent);
                    clearPostForm();
                }
            } else {
                alert('Author and content cannot be empty.');
            }
        });
    }

    // Event listener to load all posts
    if (loadPostsButton) {
        loadPostsButton.addEventListener('click', () => {
            postContainer.innerHTML = '';
            loadPosts();
        });
    }

    // Function to clear the post form
    function clearPostForm() {
        document.querySelector('#postAuthor').value = '';
        document.querySelector('#postTags').value = '';
        document.querySelector('#postContent').value = '';
        document.querySelector('#postImage').value = '';
        $(newPostModal).modal('hide');
    }

    // Function to create a new post
    function createPost(author, tags, content, image = null) {
        const postId = Date.now();
        const postDate = new Date().toLocaleString();

        const post = {
            id: postId,
            author,
            tags: tags || [], // Ensure tags is an array
            content,
            date: postDate,
            likes: 0,
            image: image || null,
        };

        console.log('Creating post:', post); // Log post details

        savePost(post);
        renderPost(post);
        updateMostLikedTags();
    }

    // Function to save a post to localStorage
    function savePost(post) {
        const posts = getPosts();
        posts.push(post);
        localStorage.setItem('posts', JSON.stringify(posts));
    }

    // Function to load posts from localStorage
    function loadPosts() {
        const posts = getPosts();
        posts.forEach(post => {
            console.log('Loading post:', post); // Log post details
            renderPost(post);
        });
        updateMostLikedTags();
    }

    // Function to get posts from localStorage
    function getPosts() {
        const posts = JSON.parse(localStorage.getItem('posts'));
        return Array.isArray(posts) ? posts : [];
    }

    // Function to render a post
    function renderPost(post) {
        const postCard = document.createElement('div');
        postCard.className = 'card post-card';
        postCard.dataset.id = post.id;
        postCard.innerHTML = `
            <div class="card-body position-relative">
                <div class="d-flex justify-content-between">
                    <span class="post-username">${post.author}</span>
                    <span class="post-tags">${Array.isArray(post.tags) ? post.tags.map(tag => `#${tag}`).join(', ') : ''}</span>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-outline-dark btn-sm hide-button" aria-label="Hide">
                            <span aria-hidden="true">Hide</span>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm delete-button" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
                <div class="text-center post-date">${post.date}</div>
                <p class="card-text mt-2">${post.content}</p>
                <div class="d-flex justify-content-between mt-3">
                    <div>
                        <span class="like-counter">Likes: ${post.likes}</span>
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
        if (post.image) {
            const postImage = document.createElement('img');
            postImage.src = post.image;
            postImage.className = 'card-img-top';
            postCard.insertBefore(postImage, postCard.firstChild);
        }

        // Append the new post card to the post container
        postContainer.appendChild(postCard);

        // Add event listeners for the new post buttons
        postCard.querySelector('.edit-button').addEventListener('click', () => editPost(post.id));
        postCard.querySelector('.comment-button').addEventListener('click', () => addComment(post.id));
        postCard.querySelector('.like-button').addEventListener('click', () => likePost(post.id));
        postCard.querySelector('.delete-button').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this post?')) {
                deletePostFromLocalStorage(post.id);
            }
        });

        postCard.querySelector('.hide-button').addEventListener('click', () => hidePost(post.id));
    }

    // Function to delete a post from local storage and view
    function deletePostFromLocalStorage(id) {
        let posts = getPosts();
        posts = posts.filter(post => post.id !== id);
        localStorage.setItem('posts', JSON.stringify(posts));
        deletePost(id);
    }

    // Function to delete a post from the view only
    function deletePost(id) {
        document.querySelector(`[data-id="${id}"]`).remove();
        updateMostLikedTags();
    }

    // Function to hide a post
    function hidePost(id) {
        document.querySelector(`[data-id="${id}"]`).style.display = 'none';
    }

    // Function to edit a post
    function editPost(id) {
        const postCard = document.querySelector(`[data-id="${id}"]`);
        const postContent = postCard.querySelector('.card-text').innerText;
        const newContent = prompt('Edit your post:', postContent);
        if (newContent) {
            let posts = getPosts();
            const post = posts.find(post => post.id === id);
            post.content = newContent;
            localStorage.setItem('posts', JSON.stringify(posts));
            postCard.querySelector('.card-text').innerText = newContent;
        }
    }

    // Function to add a comment (for simplicity, it just alerts in this example)
    function addComment(id) {
        const comment = prompt('Enter your comment:');
        if (comment) {
            alert('Comment added: ' + comment);
        }
    }

    // Function to like a post
    function likePost(id) {
        let posts = getPosts();
        const post = posts.find(post => post.id === id);
        post.likes += 1;
        localStorage.setItem('posts', JSON.stringify(posts));
        document.querySelector(`[data-id="${id}"] .like-counter`).innerText = `Likes: ${post.likes}`;
        updateMostLikedTags();
    }

    // Function to update the "Most Liked" tags
    function updateMostLikedTags() {
        const posts = getPosts();
        const tagLikes = {};

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

        const sortedTags = Object.entries(tagLikes).sort((a, b) => b[1] - a[1]);

        mostLikedContainer.innerHTML = 'Trending Tags';
        sortedTags.forEach(([tag, likes]) => {
            const tagElement = document.createElement('div');
            tagElement.innerText = `${tag}: ${likes} likes`;
            tagElement.className = 'trending-tag';
            tagElement.addEventListener('click', () => filterPostsByTag(tag));
            mostLikedContainer.appendChild(tagElement);
        });
    }
    
    // Function to filter posts by a specific tag
    function filterPostsByTag(tag) {
        const posts = getPosts();
        postContainer.innerHTML = '';
        posts.filter(post => post.tags.includes(tag)).forEach(post => renderPost(post));
    }
    // Event listener for the search button
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchBar.value.toLowerCase();
            const posts = getPosts();
            postContainer.innerHTML = '';
            posts
                .filter(post => post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) || post.content.toLowerCase().includes(searchTerm))
                .forEach(post => renderPost(post));
        });
    }

    // Event listener for pressing "Enter" key in the search bar
    if (searchBar) {
        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
});
