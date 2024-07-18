document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    initializeEventListeners();
    loadPosts();
});

// Function to initialize event listeners
function initializeEventListeners() {
    // Select key elements from the DOM
    const newPostModal = document.querySelector('#newPostModal');
    const submitPostButton = document.querySelector('#submitPostButton');
    const loadPostsButton = document.querySelector('#load-posts-button');
    const showNavCardButton = document.querySelector('#show-nav-card');
    const searchButton = document.querySelector('#search-button');
    const searchBar = document.querySelector('#search-bar');

    // Event listener to create a new post when the submit button is clicked
    if (submitPostButton) {
        submitPostButton.addEventListener('click', async () => {
            const postAuthor = document.querySelector('#postAuthor').value.trim();
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
                    try {
                        imageBase64 = await toBase64(postImage);
                    } catch (error) {
                        console.error('Error converting image to Base64:', error);
                        alert('Failed to upload image.');
                        return;
                    }
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

    // Event listener to reload all posts when the load posts button is clicked or tapped
    if (loadPostsButton) {
        loadPostsButton.addEventListener('click', handleLoadPosts);
        loadPostsButton.addEventListener('touchstart', handleLoadPosts);
    }

    // Event listener for showing the nav card on small screens
    if (showNavCardButton) {
        showNavCardButton.addEventListener('click', handleShowNavCard);
        showNavCardButton.addEventListener('touchstart', handleShowNavCard);
    }

    // Event listener for the search button
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }

    // Event listener for pressing "Enter" key in the search bar
    if (searchBar) {
        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(e);
            }
        });
    }
}

// Function to handle loading posts
function handleLoadPosts(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Load posts button clicked or tapped');
    document.querySelector('#post-container').innerHTML = ''; // Clear existing posts
    loadPosts(); // Load posts from localStorage
}

// Function to handle showing the nav card
function handleShowNavCard(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Show nav card button clicked or tapped');
    $('#navCardModal').modal('show');
}

// Function to handle searching posts
function handleSearch(event) {
    event.preventDefault();
    event.stopPropagation();
    const searchTerm = document.querySelector('#search-bar').value.toLowerCase();
    const posts = getPosts(); // Retrieve posts from localStorage
    document.querySelector('#post-container').innerHTML = ''; // Clear existing posts
    posts
        .filter(post => post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) || post.content.toLowerCase().includes(searchTerm))
        .forEach(post => renderPost(post)); // Render filtered posts
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

    // Function to clear the post form
    function clearPostForm() {
        document.querySelector('#postAuthor').value = '';
        document.querySelector('#postTags').value = '';
        document.querySelector('#postContent').value = '';
        document.querySelector('#postImage').value = '';
        $(newPostModal).modal('hide');
    }

    // Function to clear the post form
    function clearPostForm() {
        document.querySelector('#postAuthor').value = '';
        document.querySelector('#postTags').value = '';
        document.querySelector('#postContent').value = '';
        document.querySelector('#postImage').value = '';
        $(newPostModal).modal('hide');
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
            likes: 0,
            image: image || null,
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
    console.log('Loading posts from localStorage');
    const posts = getPosts(); // Retrieve posts from localStorage
    console.log('Retrieved posts:', posts);
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
        const postContainer = document.querySelector('#post-container');
        const postCard = document.createElement('div');
        postCard.className = 'card post-card';
        postCard.dataset.id = post.id;
        postCard.innerHTML = `
            <div class="card-body position-relative">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="post-username">${post.author}</span>
                        <span class="post-date">${post.date}</span>
                    </div>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-outline-dark btn-sm hide-button" aria-label="Hide">
                            <span aria-hidden="true">Hide</span>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm delete-button" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
                <div class="post-tags">${Array.isArray(post.tags) ? post.tags.map(tag => `#${tag}`).join(', ') : ''}</div>
                ${post.image ? `<img src="${post.image}" class="img-fluid mt-2" alt="Post Image">` : ''}
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
                        ${post.comments && post.comments.length > 0 ? post.comments.map(comment => `
                            <p class="card-text"><strong>${comment.author}</strong> (${comment.date}): ${comment.content}</p>
                        `).join('') : '<p class="card-text">No comments yet.</p>'}
                    </div>
                </div>
            </div>
        `;

        // Append the new post card to the post container
        postContainer.appendChild(postCard);

    
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

// Function to delete a post from the view and update the tags
function deletePost(id) {
    document.querySelector(`[data-id="${id}"]`).remove(); // Remove post from the DOM
    updateMostLikedTags(); // Update trending tags section
}

// Function to hide a post
function hidePost(id) {
    document.querySelector(`[data-id="${id}"]`).style.display = 'none';
}

// Function to edit a post (placeholder for actual functionality)
function editPost(id) {
    const postCard = document.querySelector(`[data-id="${id}"]`);
    const postAuthor = postCard.querySelector('.post-username').innerText;
    const postTags = postCard.querySelector('.post-tags').innerText.split(', ').map(tag => tag.replace('#', '')).join(', ');
    const postContent = postCard.querySelector('.card-text').innerText;

    document.querySelector('#editPostAuthor').value = postAuthor;
    document.querySelector('#editPostTags').value = postTags;
    document.querySelector('#editPostContent').value = postContent;

    $('#editPostModal').modal('show');

    const submitEditPostButton = document.querySelector('#submitEditPostButton');
    submitEditPostButton.onclick = function() {
        const updatedTags = document.querySelector('#editPostTags').value.trim().split(',').map(tag => tag.trim());
        const updatedContent = document.querySelector('#editPostContent').value.trim();

        if (updatedContent) {
            let posts = getPosts();
            const post = posts.find(post => post.id === id);
            post.tags = updatedTags;
            post.content = updatedContent;
            localStorage.setItem('posts', JSON.stringify(posts));
            postCard.querySelector('.post-tags').innerText = updatedTags.map(tag => `#${tag}`).join(', ');
            postCard.querySelector('.card-text').innerText = updatedContent;
            $('#editPostModal').modal('hide');
        } else {
            alert('Content cannot be empty.');
        }
    };
}

// Function to add a comment
function addComment(id) {
    $('#commentModal').modal('show');

    const submitCommentButton = document.querySelector('#submitCommentButton');
    submitCommentButton.onclick = function() {
        const commentAuthor = document.querySelector('#commentAuthor').value.trim();
        const commentContent = document.querySelector('#commentContent').value.trim();

        if (commentAuthor && commentContent) {
            let posts = getPosts();
            const post = posts.find(post => post.id === id);
            if (!post.comments) {
                post.comments = [];
            }
            post.comments.push({
                author: commentAuthor,
                content: commentContent,
                date: new Date().toLocaleString()
            });
            localStorage.setItem('posts', JSON.stringify(posts));

            const commentsSection = document.querySelector(`#comments-section-${id} .card-body`);
            commentsSection.innerHTML = '';
            post.comments.forEach(comment => {
                commentsSection.innerHTML += `
                    <p class="card-text"><strong>${comment.author}</strong> (${comment.date}): ${comment.content}</p>
                `;
            });

            document.querySelector('#commentAuthor').value = '';
            document.querySelector('#commentContent').value = '';
            $('#commentModal').modal('hide');
        } else {
            alert('Author and content cannot be empty.');
        }
    };
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
        mostLikedContainer.innerHTML = '<span style="font-weight: bold">Trending Tags</span>';
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
