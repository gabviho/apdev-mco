const profileImg = document.getElementById("img");
const imgInput = document.getElementById("picture-input-btn");

imgInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        // Check if the file is an image
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function () {
                // Set the selected image as the profile image source
                profileImg.src = reader.result;
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please select an image file.");
        }
    }
});