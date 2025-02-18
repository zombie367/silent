document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    const scrollbarTrack = document.querySelector('.custom-scrollbar');
    const menuItems = document.querySelectorAll('.menu > ul > li');
    let currentIndex = 0;
    
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
    function updateActiveItem(index) {
        menuItems.forEach(item => {
            item.classList.remove('active');
        });
        
        if (menuItems[index]) {
            menuItems[index].classList.add('active');
            menuItems[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    // Handle messages from Lua
    window.addEventListener('message', function(event) {
        const data = event.data;
        console.log('Received message:', data);

        if (data.type === 'forceUpdate') {
            currentIndex = data.index;
            updateActiveItem(currentIndex);
        } else if (data.type === 'setActive') {
            currentIndex = data.index;
            updateActiveItem(currentIndex);
        } else if (data.type === 'updateToggle') {
            const toggle = document.querySelector(`[data-action="${data.action}"] .toggle-switch`);
            if (toggle) {
                toggle.setAttribute('data-state', data.state ? 'on' : 'off');
            }
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
}); 