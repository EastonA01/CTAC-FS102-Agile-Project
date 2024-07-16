document.addEventListener('DOMContentLoaded', function() {
    // Initialize a counter to assign unique IDs to each post
    let postIdCounter = 2;

    // Get references to the submit button and the textarea for the new post content
    const submitButton = document.querySelector('.modal-footer .btn-primary');
    const postContent = document.getElementById('postContent');

    // Add an event listener to the submit button to handle the click event
    submitButton.addEventListener('click', function() {
        handleSubmit();
    });

    // Function to handle the submission of a new post
    function handleSubmit() {
        // Get the trimmed text from the textarea
        const postText = postContent.value.trim();

        // If the text is not empty, proceed to add the post
        if (postText) {
            // Add the post to the post container
            addPost(postText, postIdCounter);

            // Clear the textarea
            postContent.value = '';

            // Hide the modal
            $('#newPostModal').modal('hide');

            // Increment the counter for the next post
            postIdCounter++;
        }
    }

    // Function to add a new post to the post container
    function addPost(content, id) {
        console.log("Adding post:", content);

        // Get the post container where posts will be appended
        const postContainer = document.querySelector('.col-md-6');

        // Create a new div element for the post card
        const postCard = document.createElement('div');
        postCard.className = 'card post-card';

        // Set the inner HTML of the post card with the content and buttons
        postCard.innerHTML = `
            <div class="card-body position-relative">
                <div class="d-flex justify-content-between">
                    <span class="post-username">Username</span>
                    <button type="button" class="close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <p class="card-text mt-2">${content}</p>
                <div class="d-flex justify-content-between mt-3">
                    <div class="d-flex align-items-center">
                        <span class="like-counter mr-3" id="like-counter-${id}">Likes: 0</span>
                        <button type="button" class="btn btn-secondary btn-sm" data-toggle="collapse" data-target="#comments-section-${id}" aria-expanded="false" aria-controls="comments-section-${id}">Comments</button>
                    </div>
                    <div class="btn-group" role="group">
                        <button type="button" id="edit-button-${id}" class="btn btn-secondary btn-sm edit-button">Edit</button>
                        <button type="button" id="comment-button-${id}" class="btn btn-secondary btn-sm comment-button">Comment</button>
                        <button type="button" id="like-button-${id}" class="btn btn-secondary btn-sm like-button">Like</button>
                    </div>
                </div>
                <div class="collapse mt-3" id="comments-section-${id}">
                    <div class="card card-body">
                        <!-- Comments will be dynamically added here -->
                        <p class="card-text">No comments yet.</p>
                    </div>
                </div>
            </div>
        `;

        // Append the new post card to the post container
        postContainer.appendChild(postCard);

        // Add event listeners for the like, edit, comment, and delete buttons
        addEventListeners(postCard, id, content);
    }

    // Function to add event listeners to the buttons in a post card
    function addEventListeners(postCard, id, content) {
        const likeButton = postCard.querySelector(`#like-button-${id}`);
        const likeCounter = postCard.querySelector(`#like-counter-${id}`);
        const deleteButton = postCard.querySelector('.close');
        const editButton = postCard.querySelector(`#edit-button-${id}`);
        const commentButton = postCard.querySelector(`#comment-button-${id}`);

        // Event listener for the like button
        likeButton.addEventListener('click', function() {
            const currentLikes = parseInt(likeCounter.textContent.split(': ')[1]);
            likeCounter.textContent = `Likes: ${currentLikes + 1}`;
        });

        // Event listener for the edit button
        editButton.addEventListener('click', function() {
            const newContent = prompt("Edit your post:", content);
            if (newContent !== null) {
                postCard.querySelector('.card-text').textContent = newContent;
            }
        });

        // Event listener for the comment button
        commentButton.addEventListener('click', function() {
            alert("Comment feature coming soon!");
        });

        // Event listener for the delete button
        deleteButton.addEventListener('click', function() {
            postCard.remove();
        });
    }
});
