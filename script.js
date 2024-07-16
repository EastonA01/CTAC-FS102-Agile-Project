document.addEventListener('DOMContentLoaded', function() {
    let postIdCounter = 1; // Initialize the counter at 1 to start with unique IDs
    
    const submitButton = document.querySelector('.modal-footer .btn-primary');
    const postContent = document.getElementById('postContent');

    submitButton.addEventListener('click', function() {
        handleSubmit();
    });

    function handleSubmit() {
        const postText = postContent.value.trim();
        if (postText) {
            console.log("Submit button clicked");
            addPost(postText, postIdCounter);
            postContent.value = '';
            $('#newPostModal').modal('hide');
            postIdCounter++; // Increment the counter for the next post
        }
    }

    function addPost(content, id) {
        console.log("Adding post:", content);
        const postContainer = document.querySelector('.col-md-6');
        const postCard = document.createElement('div');
        postCard.className = 'card post-card';
        postCard.innerHTML = `
            <div class="card-body position-relative">
                <button type="button" class="close position-absolute" style="top: 10px; right: 10px;" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <p class="card-text">${content}</p>
                <div class="d-flex justify-content-between mt-3">
                    <span class="like-counter" id="like-counter-${id}">Likes: 0</span>
                    <div class="btn-group" role="group">
                        <button type="button" id="edit-button-${id}" class="btn btn-secondary btn-sm edit-button">Edit</button>
                        <button type="button" id="comment-button-${id}" class="btn btn-secondary btn-sm comment-button">Comment</button>
                        <button type="button" id="like-button-${id}" class="btn btn-secondary btn-sm like-button">Like</button>
                    </div>
                </div>
            </div>
        `;
        postContainer.appendChild(postCard);

        const likeButton = postCard.querySelector(`#like-button-${id}`);
        const likeCounter = postCard.querySelector(`#like-counter-${id}`);
        const deleteButton = postCard.querySelector('.close');

        likeButton.addEventListener('click', function() {
            const currentLikes = parseInt(likeCounter.textContent.split(': ')[1]);
            likeCounter.textContent = `Likes: ${currentLikes + 1}`;
        });

        const editButton = postCard.querySelector(`#edit-button-${id}`);
        editButton.addEventListener('click', function() {
            const newContent = prompt("Edit your post:", content);
            if (newContent !== null) {
                postCard.querySelector('.card-text').textContent = newContent;
            }
        });

        const commentButton = postCard.querySelector(`#comment-button-${id}`);
        commentButton.addEventListener('click', function() {
            alert("Comment feature coming soon!");
        });

        deleteButton.addEventListener('click', function() {
            postCard.remove();
        });
    }
});
