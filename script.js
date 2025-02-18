document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    const scrollbarTrack = document.querySelector('.custom-scrollbar');
    const menuItems = document.querySelectorAll('.menu li');
    let currentIndex = Array.from(menuItems).findIndex(item => item.classList.contains('active'));
    
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

    // Function to update active menu item
    function setActiveItem(index) {
        // Send update to Lua first
        sendToGame('menuSelect', {
            item: menuItems[index].querySelector('a').textContent.trim(),
            index: index
        });

        // Then force UI update through the same path
        const event = {
            data: {
                type: 'forceUpdate',
                index: index
            }
        };
        window.dispatchEvent(new MessageEvent('message', event));
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                setActiveItem(currentIndex);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < menuItems.length - 1) {
                currentIndex++;
                setActiveItem(currentIndex);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // Send selection confirmation to game
            sendToGame('menuActivate', {
                item: menuItems[currentIndex].querySelector('a').textContent.trim(),
                index: currentIndex
            });
        }
    });

    // Handle messages from game with improved reliability
    window.addEventListener('message', function(event) {
        console.log('Received message:', event.data);
        
        if (event.data.type === 'forceUpdate') {
            // Remove active class from all items
            document.querySelectorAll('.menu li').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to selected item
            const menuItems = document.querySelectorAll('.menu > ul > li');
            if (menuItems[event.data.index]) {
                menuItems[event.data.index].classList.add('active');
            }
            
            // Update scrollbar position
            updateScrollbar();
        } else if (event.data.type === 'menuActivate') {
            // Handle menu activation
            sendToGame('menuActivate', {
                item: menuItems[currentIndex].querySelector('a').textContent.trim(),
                index: currentIndex
            });
        }
    });

    // Handle toggle switches
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            
            // Send to Lua
            fetch(`https://${GetParentResourceName()}/menuActivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item: action
                })
            });
        });
    });

    // Initial setup
    updateScrollbar();
    menu.addEventListener('scroll', updateScrollbar);
});

// Listen for messages from Lua
window.addEventListener('message', function(event) {
    const data = event.data;
    
    if (data.type === 'updateToggle') {
        const toggle = document.querySelector(`[data-action="${data.action}"] .toggle-switch`);
        if (toggle) {
            toggle.setAttribute('data-state', data.state ? 'on' : 'off');
        }
    }
}); 