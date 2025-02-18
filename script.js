document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    const scrollbarTrack = document.querySelector('.custom-scrollbar');
    const menuItems = document.querySelectorAll('.menu > ul > li');
    let currentIndex = 0;
    
    console.log('Menu items found:', menuItems.length); // Debug log
    menuItems.forEach((item, i) => {
        console.log('Menu item', i, ':', item.textContent.trim());
    });

    // Function to send messages to Lua
    function sendToGame(action, data) {
        if (window.invokeNative) {
            fetch(`https://${GetParentResourceName()}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
    }

    // Function to update active menu item
    function updateActiveItem(index) {
        console.log('Updating active item to index:', index); // Debug log
        
        // Remove active class from all items
        const previousActive = document.querySelector('.menu li.active');
        if (previousActive) {
            console.log('Removing active from:', previousActive.textContent.trim());
            previousActive.classList.remove('active');
        }
        
        // Add active class to the selected item
        const targetItem = menuItems[index];
        if (targetItem) {
            console.log('Setting active to:', targetItem.textContent.trim());
            targetItem.classList.add('active');
            targetItem.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        } else {
            console.log('Target item not found for index:', index);
        }
        
        // Update scrollbar
        updateScrollbar();
    }

    // Scrollbar update function
    function updateScrollbar() {
        const scrollPercentage = menu.scrollTop / (menu.scrollHeight - menu.clientHeight);
        const maxThumbHeight = scrollbarTrack.clientHeight - 20;
        const thumbHeight = Math.min(
            maxThumbHeight,
            Math.max(40, (menu.clientHeight / menu.scrollHeight) * scrollbarTrack.clientHeight)
        );
        const maxPosition = scrollbarTrack.clientHeight - thumbHeight;
        const thumbPosition = Math.min(maxPosition, (maxPosition) * scrollPercentage);
        
        scrollbarThumb.style.height = `${thumbHeight}px`;
        scrollbarThumb.style.top = `${thumbPosition}px`;
    }

    // Handle messages from Lua with better logging
    window.addEventListener('message', function(event) {
        const data = event.data;
        console.log('Received message from Lua:', data);

        if (data.type === 'forceUpdate' || data.type === 'setActive') {
            console.log('Handling navigation. Current index:', currentIndex, 'New index:', data.index);
            currentIndex = data.index;
            updateActiveItem(currentIndex);
        }
    });

    // Handle toggle switches
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            
            sendToGame('menuActivate', {
                item: action
            });
        });
    });

    // Handle menu item clicks
    menuItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            updateActiveItem(index);
            sendToGame('menuSelect', {
                index: index,
                item: item.querySelector('a').textContent.trim()
            });
        });
    });

    // Update scrollbar if needed
    if (menu.scrollHeight > menu.clientHeight) {
        menu.classList.add('scrollable');
    }

    // Initial setup
    updateScrollbar();
    menu.addEventListener('scroll', updateScrollbar);

    // Debug helper
    window.debugMenu = {
        moveUp: () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateActiveItem(currentIndex);
                console.log('Moving up to index:', currentIndex);
            }
        },
        moveDown: () => {
            if (currentIndex < menuItems.length - 1) {
                currentIndex++;
                updateActiveItem(currentIndex);
                console.log('Moving down to index:', currentIndex);
            }
        },
        getCurrentIndex: () => currentIndex
    };
}); 