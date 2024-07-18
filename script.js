document.addEventListener('DOMContentLoaded', (event) => {
    // Select key elements from the DOM
    const newPostModal = document.querySelector('#newPostModal');
    const submitPostButton = document.querySelector('#submitPostButton');
    const postContainer = document.querySelector('#post-container');
    const searchButton = document.querySelector('#search-button');
    const searchBar = document.querySelector('#search-bar');
    const mostLikedContainer = document.querySelector('.most-liked-card .card-body');
    const loadPostsButton = document.querySelector('#load-posts-button');
    const loginButton = document.querySelector('#login-button');
    const loginSubmitButton = document.querySelector('#loginSubmitButton');
    const loginModal = document.querySelector('#loginModal');
    const postAuthorField = document.querySelector('#postAuthor');

    let loggedInUser = localStorage.getItem('loggedInUser') || '';

    // Update the author field in the new post modal
    if (loggedInUser) {
        postAuthorField.value = loggedInUser;
    }
    // Load posts from localStorage when the page is loaded
    loadPosts();

    // Event listener to create a new post when the submit button is clicked
    if (submitPostButton) {
        submitPostButton.addEventListener('click', async () => {
            const postAuthor = loggedInUser;
            const postTags = document.querySelector('#postTags').value.trim().split(',').map(tag => tag.trim());
            const postContent = document.querySelector('#postContent').value.trim();
            const postImage = document.querySelector('#postImage').files[0];

            if (postAuthor && postContent) {
                let imageBase64 = null;
                if (postImage) {
                    if (!['image/png', 'image/jpeg'].includes(postImage.type)) {
                        alert('Please select a valid image file (PNG or JPG).');
                        return;
                    }
                    imageBase64 = await toBase64(postImage);
                }
                createPost(postAuthor, postTags, postContent, imageBase64);
                // Clear the form inputs
                document.querySelector('#postAuthor').value = '';
                document.querySelector('#postTags').value = '';
                document.querySelector('#postContent').value = '';
                document.querySelector('#postImage').value = '';
                // Hide the modal after submitting
                $(newPostModal).modal('hide');
            } else {
                alert('Author and content cannot be empty.');
            }
        });
    }

    // Event listener for login button
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            $(loginModal).modal('show');
        });
    }

    // Event listener for login submit button
    if (loginSubmitButton) {
        loginSubmitButton.addEventListener('click', () => {
            const username = document.querySelector('#loginUsername').value.trim();
            if (username) {
                loggedInUser = username;
                localStorage.setItem('loggedInUser', loggedInUser);
                postAuthorField.value = loggedInUser;
                $(loginModal).modal('hide');
            } else {
                alert('Username cannot be empty.');
            }
        });
    }

    // Function to convert file to Base64
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxWidth = 800; // Max width for the image
                    const maxHeight = 600; // Max height for the image

                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7); // Adjust the quality (0.7 for 70% quality)
                    resolve(resizedBase64);
                };
            };
            reader.onerror = error => reject(error);
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
    function createPost(author, tags, content, imageBase64) {
        const postId = Date.now(); // Unique ID based on current timestamp
        const postDate = new Date().toLocaleString(); // Human-readable date

        const post = {
            id: postId,
            author,
            tags: tags || [], // Ensure tags is an array
            content,
            image: imageBase64, // Add image to post
            date: postDate,
            likes: 0, // Initialize likes to 0
            comments: [] // Initialize comments to an empty array
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
                ${post.image ? `<img src="${post.image}" class="img-fluid mt-2" alt="Post Image">` : ''}
                <p class="card-text mt-2">${post.content}</p>
                <div class="d-flex justify-content-between mt-3">
                    <div>
                        <span class="like-counter">Likes: ${post.likes}</span>
                        <button type="button" class="btn btn-secondary btn-sm comments-button" data-toggle="collapse" data-target="#comments-section-${post.id}" aria-expanded="false" aria-controls="comments-section-${post.id}">Comments (${post.comments.length})</button>
                    </div>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-secondary btn-sm edit-button">Edit</button>
                        <button type="button" class="btn btn-secondary btn-sm comment-button">Comment</button>
                        <button type="button" class="btn btn-secondary btn-sm like-button">Like</button>
                    </div>
                </div>
                <div class="collapse mt-3" id="comments-section-${post.id}">
                    <div class="card card-body">
                        ${renderComments(post.comments)}
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
        postCard.querySelector('.edit-button').addEventListener('click', () => editPost(post.id));
        postCard.querySelector('.comment-button').addEventListener('click', () => addComment(post.id));
        postCard.querySelector('.like-button').addEventListener('click', () => likePost(post.id));
        postCard.querySelector('.delete-button').addEventListener('click', () => deletePost(post.id));
        postCard.querySelector('.hide-button').addEventListener('click', () => hidePost(post.id));
    }

    // Function to render comments
    function renderComments(comments) {
        return comments.map(comment => `
            <div class="comment">
                <p><strong>${comment.author}</strong> <span class="text-muted">${comment.date}</span></p>
                <p>${comment.content}</p>
            </div>
        `).join('');
    }

    // Function to add a comment to a post
    function addComment(postId) {
        const commentContent = prompt('Enter your comment:');
        if (commentContent) {
            const posts = getPosts();
            const post = posts.find(p => p.id === postId);
            if (post) {
                const comment = {
                    author: loggedInUser,
                    content: commentContent,
                    date: new Date().toLocaleString()
                };
                post.comments.push(comment);
                localStorage.setItem('posts', JSON.stringify(posts));
                const postCard = document.querySelector(`.post-card[data-id="${postId}"]`);
                if (postCard) {
                    const commentsSection = postCard.querySelector(`#comments-section-${postId} .card-body`);
                    if (commentsSection) {
                        commentsSection.innerHTML = renderComments(post.comments);
                    }
                    // Update the comments button text
                    const commentsButton = postCard.querySelector('.comments-button');
                    commentsButton.innerText = `Comments (${post.comments.length})`;
                }
            }
        }
    }

    // Function to like a post
    function likePost(postId) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.likes++;
            localStorage.setItem('posts', JSON.stringify(posts));
            const postCard = document.querySelector(`.post-card[data-id="${postId}"]`);
            if (postCard) {
                const likeCounter = postCard.querySelector('.like-counter');
                likeCounter.innerText = `Likes: ${post.likes}`;
            }
        }
    }

    // Function to delete a post
    function deletePost(postId) {
        let posts = getPosts();
        posts = posts.filter(p => p.id !== postId);
        localStorage.setItem('posts', JSON.stringify(posts));
        const postCard = document.querySelector(`.post-card[data-id="${postId}"]`);
        if (postCard) {
            postCard.remove();
        }
    }

    // Function to hide a post
    function hidePost(postId) {
        const postCard = document.querySelector(`.post-card[data-id="${postId}"]`);
        if (postCard) {
            postCard.style.display = 'none';
        }
    }

    // Function to edit a post
    function editPost(postId) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (post) {
            const newContent = prompt('Edit your post content:', post.content);
            if (newContent) {
                post.content = newContent;
                localStorage.setItem('posts', JSON.stringify(posts));
                const postCard = document.querySelector(`.post-card[data-id="${postId}"]`);
                if (postCard) {
                    const cardText = postCard.querySelector('.card-text');
                    cardText.innerText = post.content;
                }
            }
        }
    }

    // Function to update the most liked tags section
    function updateMostLikedTags() {
        const posts = getPosts();
        const tagCount = {};
        posts.forEach(post => {
            post.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + post.likes;
            });
        });
        const sortedTags = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);
        mostLikedContainer.innerHTML = sortedTags.map(tag => `<span class="badge badge-primary">${tag}</span>`).join(' ');
    }
});
