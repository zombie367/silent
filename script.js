document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const menuItems = document.querySelectorAll('.menu > ul > li');
    let currentIndex = 0;

    // Disable browser controls
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    // Disable mouse interaction
    menuItems.forEach(item => {
        item.style.pointerEvents = 'none';
        item.querySelector('a').style.pointerEvents = 'none';
    });

    // Function to update menu item highlight
    function updateMenuHighlight(index) {
        console.log('Updating highlight to index:', index);
        
        // Remove highlight from all items
        menuItems.forEach(item => {
            item.classList.remove('active');
            item.style.backgroundColor = '';
            item.style.boxShadow = '';
        });

        // Add highlight to selected item
        const selectedItem = menuItems[index];
        if (selectedItem) {
            selectedItem.classList.add('active');
            selectedItem.style.backgroundColor = 'rgba(0, 102, 255, 0.2)';
            selectedItem.style.boxShadow = '0 0 15px rgba(0, 102, 255, 0.3)';
            
            // Scroll into view if needed
            selectedItem.scrollIntoView({
                behavior: 'auto',
                block: 'nearest'
            });
        }
    }

    // Handle messages from FiveM
    window.addEventListener('message', function(event) {
        const data = event.data;
        console.log('Received message:', data);

        if (data.type === 'forceUpdate') {
            currentIndex = data.index;
            updateMenuHighlight(currentIndex);
        }
    });
}); 