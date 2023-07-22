// Get the button and dropdown content elements
const button = document.getElementById('dropbutton');
const dropdownContent = document.querySelector('.dropdown-content');

// add event lister
dropdownContent.querySelectorAll('a').forEach(item => {
    item.addEventListener('click', (event) => {
        // Prevent the default link behavior
        event.preventDefault();

        // Get  text from the clicked item's data-text attribute
        const newText = event.target.getAttribute('data-text');

        // Update the button's text
        button.textContent = newText;
<<<<<<< HEAD
=======
        button.value = newText;

        
>>>>>>> 14825560c5d15965309792bbd8eee00f982c4179
    });
});
